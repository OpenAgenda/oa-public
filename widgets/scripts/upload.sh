#!/bin/bash

# --- Configuration ---
LOCAL_SOURCE_DIR="dist"
SWIFT_CONTAINER_NAME="js"
SWIFT_SEGMENT_SIZE=1073741824
SWIFT_UPLOAD_OPTIONS="--verbose --changed"

KEYCDN_API_KEY_REF="op://Devs Core/KeyCDN api key/password"
KEYCDN_ZONE_ID="238526" # assets
KEYCDN_ZONE_URL="assets-1cb1b.kxcdn.com"
# Configuration de la purge
PURGE_BATCH_SIZE=20
PURGE_SLEEP_INTERVAL=1 # en secondes

# Clé API KeyCDN : déjà fournie par l'environnement (CI, via le secret
# KEYCDN_API_KEY) ? on l'utilise telle quelle. Sinon, en local, on la lit
# depuis 1Password.
if [ -n "$KEYCDN_API_KEY" ]; then
  echo "🔐 Clé API KeyCDN fournie par l'environnement."
else
  echo "🔐 Récupération de la clé API KeyCDN depuis 1Password..."

  # Vérification que la commande 'op' existe
  if ! command -v op &> /dev/null; then
    echo "Erreur : Le CLI 1Password ('op') n'est pas installé ou non trouvé dans le PATH."
    echo "Veuillez suivre les instructions sur https://developer.1password.com/docs/cli"
    echo "(En CI, fournissez plutôt la variable d'environnement KEYCDN_API_KEY.)"
    exit 1
  fi

  # Syntax: op://<nom_du_coffre>/<nom_de_l'élément>/<nom_du_champ>
  KEYCDN_API_KEY=$(op read --account openagenda.1password.eu "$KEYCDN_API_KEY_REF" 2>/dev/null)

  if [ -z "$KEYCDN_API_KEY" ]; then
      echo "❌ Erreur : Impossible de récupérer la clé API KeyCDN depuis 1Password."
      echo "   Veuillez vérifier les points suivants :"
      echo "   1. Êtes-vous connecté à 1Password ? (essayez 'op signin')"
      echo "   2. La référence '$KEYCDN_API_KEY_REF' est-elle correcte ?"
      exit 1
  fi

  echo "   Clé API récupérée avec succès."
fi

echo "📁 Configuration de l'upload:"
echo "  Dossier local: $LOCAL_SOURCE_DIR"
echo "  Conteneur Swift: $SWIFT_CONTAINER_NAME"
echo ""

# --- Vérifications Préliminaires ---
if [ ! -d "$LOCAL_SOURCE_DIR" ]; then
  echo "Erreur : Le répertoire source local '$LOCAL_SOURCE_DIR' n'existe pas."
  exit 1
fi
if ! command -v swift &> /dev/null; then
  echo "Erreur : La commande 'swift' n'a pas été trouvée."
  exit 1
fi

echo "Vérification de la connexion à OpenStack Swift..."
# La sortie n'est affichée qu'en cas d'échec : un `swift stat` réussi expose le
# `Meta Temp-Url-Key` du compte, qui n'a rien à faire dans des logs CI. On liste
# les variables OS_* par nom seulement, jamais par valeur — un secret openrc
# vide ou tronqué se voit alors immédiatement.
if ! SWIFT_STAT_OUTPUT=$(swift stat 2>&1); then
  echo "Erreur : Impossible de se connecter à OpenStack Swift."
  echo "  Variables OpenStack chargées : $(env | grep -o '^OS_[A-Z_]*' | sort | tr '\n' ' ')"
  echo "  Sortie de 'swift stat' :"
  echo "$SWIFT_STAT_OUTPUT" | sed 's/^/    /'
  exit 1
fi
echo "Connexion à Swift réussie."

echo "Vérification du conteneur '$SWIFT_CONTAINER_NAME'..."
if ! swift stat "$SWIFT_CONTAINER_NAME" > /dev/null 2>&1; then
  echo "Le conteneur '$SWIFT_CONTAINER_NAME' n'existe pas. Tentative de création..."
  if swift post "$SWIFT_CONTAINER_NAME"; then
    echo "Conteneur '$SWIFT_CONTAINER_NAME' créé avec succès."
  else
    echo "Erreur : Impossible de créer le conteneur '$SWIFT_CONTAINER_NAME'."
    exit 1
  fi
else
  echo "Le conteneur '$SWIFT_CONTAINER_NAME' existe."
fi

# --- Exécution de l'Upload ---
echo ""
echo "Début de l'upload du contenu de '$LOCAL_SOURCE_DIR' vers :"
echo "  Conteneur Swift : $SWIFT_CONTAINER_NAME"
echo ""

# Utilisation d'une sous-shell pour que le 'cd' n'affecte pas le script principal
#(
#  cd "$LOCAL_SOURCE_DIR" || { echo "Erreur: Impossible d'accéder au répertoire '$LOCAL_SOURCE_DIR'"; exit 1; }

  echo "Upload en cours du répertoire : $LOCAL_SOURCE_DIR"

  # Construction des arguments pour swift upload
  # L'ordre est important : options globales, conteneur, répertoire_source
  ARGS=()

  if [ -n "$SWIFT_UPLOAD_OPTIONS" ]; then
    # shellcheck disable=SC2086
    ARGS+=($SWIFT_UPLOAD_OPTIONS)
  fi

  if [ "$SWIFT_SEGMENT_SIZE" -gt 0 ]; then
    ARGS+=("--segment-size" "$SWIFT_SEGMENT_SIZE")
  fi

  # Ajouter le nom du conteneur
  ARGS+=("$SWIFT_CONTAINER_NAME")

  # Ajouter le répertoire source local comme dernier argument
  ARGS+=(".")

  # Afficher la commande pour le débogage
  COMMAND_STRING="swift upload"
  for arg in "${ARGS[@]}"; do
    COMMAND_STRING+=" $(printf "%q" "$arg")"
  done
  echo "Commande exécutée (formattée) : $COMMAND_STRING"

  # Exécution de la commande swift upload avec les arguments construits
  # On capture la liste des objets uploadés tout en l'affichant. `tee /dev/tty`
  # échoue hors d'un terminal (CI) : on n'écho en direct que si un tty existe,
  # sinon on laisse simplement passer la sortie dans la variable.
  OBJECT_LIST=$(
    cd "$LOCAL_SOURCE_DIR" || exit 1
    if [ -t 1 ]; then
      swift upload "${ARGS[@]}" | tee /dev/tty
    else
      swift upload "${ARGS[@]}"
    fi
  )

  if [ $? -eq 0 ]; then
    echo ""
    echo "Upload terminé avec succès."
  else
    echo ""
    echo "Erreur : L'upload a échoué."
    exit 1
  fi
#) # Fin de la sous-shell (plus nécessaire)

# --- Purge de KeyCDN ---
echo ""
echo "🚀 Début de la purge du cache KeyCDN..."

# Vérification des dépendances pour la purge
if ! command -v curl &> /dev/null || ! command -v jq &> /dev/null; then
  echo "Erreur : Les commandes 'curl' et 'jq' sont requises pour la purge KeyCDN."
  echo "Veuillez les installer (ex: sudo apt-get install curl jq)."
  exit 1
fi

# echo "Récupération de la liste des objets uploadés pour la purge..."
# OBJECT_LIST=$(swift list "$SWIFT_CONTAINER_NAME")

if [ -z "$OBJECT_LIST" ]; then
  echo "Aucun objet trouvé. Aucune purge nécessaire."
else
  # En CI (pas de tty) la sortie de `swift upload` n'a pas été affichée en
  # direct : on la trace ici pour garder une trace des objets uploadés.
  if [ ! -t 1 ]; then
    echo "Objets uploadés :"
    echo "$OBJECT_LIST"
    echo ""
  fi

  echo "Construction de la liste des URLs à purger..."
  URLS_TO_PURGE=()

  while IFS= read -r object_name; do
    if [ -n "$object_name" ]; then
      FULL_URL="$KEYCDN_ZONE_URL/$SWIFT_CONTAINER_NAME/$object_name"
      URLS_TO_PURGE+=("$FULL_URL")
      URLS_TO_PURGE+=("${FULL_URL}br") # Brotli
    fi
  done <<< "$OBJECT_LIST"

  TOTAL_URLS=${#URLS_TO_PURGE[@]}

  if [ $TOTAL_URLS -eq 0 ]; then
    echo "Aucune URL à purger."
  else
    echo "Total de $TOTAL_URLS URLs à purger en lots de $PURGE_BATCH_SIZE."

    # Indicateur pour le statut final de la purge
    ALL_PURGES_SUCCEEDED=true

    # Calcul du nombre total de lots (arrondi à l'entier supérieur)
    TOTAL_BATCHES=$(( (TOTAL_URLS + PURGE_BATCH_SIZE - 1) / PURGE_BATCH_SIZE ))

    # Boucle pour traiter les URLs par lots
    for (( i=0; i < TOTAL_URLS; i += PURGE_BATCH_SIZE )); do
      CURRENT_BATCH_NUM=$(( (i / PURGE_BATCH_SIZE) + 1 ))

      echo ""
      echo "--- Traitement du lot $CURRENT_BATCH_NUM / $TOTAL_BATCHES ---"

      # Extraction du lot actuel en utilisant le "slicing" de tableau Bash
      # Syntaxe: ${array[@]:offset:length}
      CURRENT_BATCH=("${URLS_TO_PURGE[@]:i:PURGE_BATCH_SIZE}")

      echo "  Nombre d'URLs dans ce lot : ${#CURRENT_BATCH[@]}"

      # Création de la charge utile JSON avec jq pour le lot actuel
      JSON_PAYLOAD=$(printf "%s\n" "${CURRENT_BATCH[@]}" | jq -R . | jq -s '{"urls": .}')

      echo "  Envoi de la requête de purge à l'API KeyCDN..."
      API_ENDPOINT="https://api.keycdn.com/zones/purgeurl/${KEYCDN_ZONE_ID}.json"

      API_RESPONSE=$(curl -s -u "${KEYCDN_API_KEY}:" \
        -X DELETE \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD" \
        "$API_ENDPOINT")

      # Vérification de la réponse de l'API pour ce lot
      if echo "$API_RESPONSE" | jq -e '.status == "success"' > /dev/null; then
        DESCRIPTION=$(echo "$API_RESPONSE" | jq -r '.description')
        echo "  ✅ Lot purgé avec succès. ($DESCRIPTION)"
      else
        echo "  ❌ ERREUR lors de la purge du lot $CURRENT_BATCH_NUM."
        echo "     Réponse de l'API : $API_RESPONSE"
        ALL_PURGES_SUCCEEDED=false
      fi

      # Pause entre les requêtes, sauf pour le dernier lot
      if (( i + PURGE_BATCH_SIZE < TOTAL_URLS )); then
        echo "  Pause de $PURGE_SLEEP_INTERVAL seconde(s) avant le prochain lot..."
        sleep "$PURGE_SLEEP_INTERVAL"
      fi
    done

    # Message final basé sur le succès de toutes les opérations de purge
    echo ""
    if [ "$ALL_PURGES_SUCCEEDED" = true ]; then
      echo "✅ Toutes les purges par lot ont été effectuées avec succès."
    else
      echo "⚠️ Au moins un lot de purge a échoué. Veuillez vérifier les logs ci-dessus."
    fi
  fi
fi

echo ""
echo "Script terminé."
exit 0
