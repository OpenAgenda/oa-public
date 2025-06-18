#!/bin/bash

# Script pour uploader le contenu d'un répertoire local vers OpenStack Swift
# en utilisant --object-name comme préfixe pour le contenu du répertoire.

# Vérification de l'argument
if [ $# -ne 1 ]; then
    echo "Usage: $0 <nom_dossier_swift>"
    echo "Exemple: $0 my-video-folder"
    echo ""
    echo "L'argument sera utilisé dans le chemin Swift: videos/<nom_dossier_swift>"
    exit 1
fi

SWIFT_FOLDER_NAME="$1"

# Validation de l'argument (pas de caractères spéciaux)
if [[ ! "$SWIFT_FOLDER_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "Erreur: Le nom du dossier Swift ne doit contenir que des lettres, chiffres, tirets et underscores"
    echo "Fourni: '$SWIFT_FOLDER_NAME'"
    exit 1
fi

# --- Configuration ---
LOCAL_SOURCE_DIR="streaming_output"
SWIFT_CONTAINER_NAME="assets"
# Pour --object-name utilisé comme préfixe, il doit se terminer par un slash
# pour simuler un dossier.
SWIFT_OBJECT_PREFIX="videos/$SWIFT_FOLDER_NAME/"
SWIFT_SEGMENT_SIZE=1073741824
SWIFT_UPLOAD_OPTIONS="--verbose --changed"

echo "📁 Configuration de l'upload:"
echo "  Dossier local: $LOCAL_SOURCE_DIR"
echo "  Conteneur Swift: $SWIFT_CONTAINER_NAME"
echo "  Préfixe Swift: $SWIFT_OBJECT_PREFIX"
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
if ! swift stat > /dev/null 2>&1; then
  echo "Erreur : Impossible de se connecter à OpenStack Swift."
  exit 1
else
  echo "Connexion à Swift réussie."
fi

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
echo "  Préfixe Objet  : $SWIFT_OBJECT_PREFIX"
echo ""

# Utilisation d'une sous-shell pour que le 'cd' n'affecte pas le script principal
# PAS BESOIN DE CD ici, on donne le chemin du répertoire directement
# (
#   cd "$LOCAL_SOURCE_DIR" || { echo "Erreur: Impossible d'accéder au répertoire '$LOCAL_SOURCE_DIR'"; exit 1; }
  
  echo "Upload en cours du répertoire : $LOCAL_SOURCE_DIR"
  
  # Construction des arguments pour swift upload
  # L'ordre est important : options globales, --object-name <prefix>, conteneur, répertoire_source
  ARGS=()
  
  if [ -n "$SWIFT_UPLOAD_OPTIONS" ]; then
    # shellcheck disable=SC2086
    ARGS+=($SWIFT_UPLOAD_OPTIONS)
  fi
  
  if [ "$SWIFT_SEGMENT_SIZE" -gt 0 ]; then
    ARGS+=("--segment-size" "$SWIFT_SEGMENT_SIZE")
  fi
  
  # L'option --object-name est utilisée ici comme préfixe pour le répertoire
  ARGS+=("--object-name" "$SWIFT_OBJECT_PREFIX")
  
  # Ajouter le nom du conteneur
  ARGS+=("$SWIFT_CONTAINER_NAME")
  
  # Ajouter le répertoire source local comme dernier argument
  ARGS+=("$LOCAL_SOURCE_DIR") # On ne se met plus dans le répertoire, on donne son nom
  
  # Afficher la commande pour le débogage
  COMMAND_STRING="swift upload"
  for arg in "${ARGS[@]}"; do
    COMMAND_STRING+=" $(printf "%q" "$arg")"
  done
  echo "Commande exécutée (formattée) : $COMMAND_STRING"
  
  # Exécution de la commande swift upload avec les arguments construits
  swift upload "${ARGS[@]}"

  if [ $? -eq 0 ]; then
    echo ""
    echo "Upload terminé avec succès."
  else
    echo ""
    echo "Erreur : L'upload a échoué."
    exit 1
  fi
# ) # Fin de la sous-shell (plus nécessaire)

# --- Vérification Post-Upload (Optionnel) ---
echo ""
# Utiliser le même préfixe pour lister que celui utilisé pour l'upload
echo "Vérification des objets uploadés (5 premiers objets sous le préfixe $SWIFT_OBJECT_PREFIX) :"
swift list "$SWIFT_CONTAINER_NAME" --prefix "$SWIFT_OBJECT_PREFIX" | head -n 5

echo ""
echo "Script terminé."
exit 0
