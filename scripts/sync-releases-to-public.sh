#!/bin/bash
# Ce script synchronise les releases Changesets (tags et notes) d'un monorepo privé
# vers un repo public qui contient un subtree des packages publics.

# Arrête le script si une commande échoue pour éviter un état incohérent.
set -e

THIS_DIR=$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# --- CONFIGURATION ---
# Le scope NPM de vos packages. Utilisé pour trouver les tags pertinents.
PACKAGE_SCOPE="@openagenda"

# Configuration du remote et du repo public
PUBLIC_REMOTE_NAME="oa-public"
PUBLIC_REPO_OWNER_NAME="openagenda/oa-public"
PUBLIC_REPO_BRANCH="main"
SOURCE_REPO_OWNER_NAME="OpenAgenda/oa"
# --- FIN CONFIGURATION ---


# --- ÉTAPE 1 : PRÉPARATION DE L'ENVIRONNEMENT GIT ---
# S'assure que le remote utilise bien une URL HTTPS, compatible avec le PAT de GitHub Actions.
# C'est crucial pour que l'authentification fonctionne en CI.
PUBLIC_REPO_URL="https://github.com/${PUBLIC_REPO_OWNER_NAME}.git"
if git remote | grep -q "^${PUBLIC_REMOTE_NAME}$"; then
  echo "✔️ Remote '${PUBLIC_REMOTE_NAME}' déjà configuré."
else
  echo "🔗 Ajout du nouveau remote '${PUBLIC_REMOTE_NAME}' avec l'URL HTTPS..."
  git remote add ${PUBLIC_REMOTE_NAME} ${PUBLIC_REPO_URL}
fi

echo "---"
echo "🛰️ Poussée du subtree 'public' vers ${PUBLIC_REMOTE_NAME}/${PUBLIC_REPO_BRANCH}..."
${THIS_DIR}/subtree/push.sh
echo "---"

echo "🚀 Démarrage de la synchronisation des releases vers ${PUBLIC_REPO_OWNER_NAME}..."

# On s'assure d'avoir les dernières informations du remote public, notamment les tags existants.
echo "🔍 Mise à jour des informations du remote '${PUBLIC_REMOTE_NAME}'..."
git fetch ${PUBLIC_REMOTE_NAME}


# --- ÉTAPE 2 : DÉTECTION DU COMMIT DE RELEASE À TRAITER ---
# L'input `INPUT_RELEASE_COMMIT_SHA` vient de `workflow_dispatch` dans l'action GitHub.
RELEASE_COMMIT_SHA_INPUT="${INPUT_RELEASE_COMMIT_SHA}"

if [ -n "$RELEASE_COMMIT_SHA_INPUT" ]; then
  # Mode manuel : l'utilisateur a fourni un SHA, on l'utilise sans poser de questions.
  echo "🕹️  Mode manuel activé. Utilisation du SHA de commit fourni : $RELEASE_COMMIT_SHA_INPUT"
  RELEASE_COMMIT_SHA="$RELEASE_COMMIT_SHA_INPUT"
else
  # Mode automatique : on trouve la dernière release non synchronisée.
  echo "🤖 Mode automatique. Recherche de la dernière release non synchronisée..."

  # On parcourt les 10 derniers tags créés (du plus récent au plus ancien) pour trouver un candidat.
  for tag_name in $(git tag -l "${PACKAGE_SCOPE}/*" --sort=-creatordate | head -n 10); do
    echo "  - Vérification du tag : ${tag_name}"

    # On vérifie si ce tag existe DÉJÀ sur le remote public.
    # `git ls-remote` est la commande parfaite pour ça, elle n'affecte pas le repo local.
    if git ls-remote --exit-code --tags ${PUBLIC_REMOTE_NAME} "refs/tags/${tag_name}" >/dev/null; then
      echo "    -> ✔️ Le tag ${tag_name} existe déjà sur le remote. Release déjà synchronisée."
    else
      echo "    -> 🎯 Le tag ${tag_name} n'existe pas sur le remote. C'est notre candidat !"
      # On a trouvé notre release ! On récupère le SHA du commit sur lequel ce tag est placé.
      RELEASE_COMMIT_SHA=$(git rev-list -n 1 "${tag_name}")
      break
    fi
  done
fi

if [ -z "$RELEASE_COMMIT_SHA" ]; then
  echo "✔️ Aucune nouvelle release à synchroniser n'a été trouvée. Tout est à jour !"
  exit 0
fi

echo "✔️ Commit de release à traiter trouvé : ${RELEASE_COMMIT_SHA}"


# --- ÉTAPE 3 : SYNCHRONISATION ---
# On récupère les informations de la release UNE SEULE FOIS.
TAGS=$(git tag --points-at "${RELEASE_COMMIT_SHA}")
echo -e "🏷️ Tags à synchroniser trouvés sur ce commit:\n${TAGS}"

PUBLIC_COMMIT_SHA=$(git rev-parse "${PUBLIC_REMOTE_NAME}/${PUBLIC_REPO_BRANCH}")

echo "🎯 Commit unique créé sur ${PUBLIC_REPO_OWNER_NAME} : ${PUBLIC_COMMIT_SHA}"

# On boucle sur les tags UNIQUEMENT pour créer les releases GitHub.
echo -e "🏷️ Création des releases GitHub pour les tags suivants :\n${TAGS}"

# Boucle sur chaque tag pour effectuer la synchronisation.
for TAG_NAME in $TAGS; do
  echo "---"
  echo "🎉 Création de la release pour le tag : ${TAG_NAME}"

  echo "📝 Extraction des notes de release..."
  RELEASE_NOTES=$(gh release view "${TAG_NAME}" --repo "${SOURCE_REPO_OWNER_NAME}" --json body -q .body)

  if [ -z "$RELEASE_NOTES" ]; then
    echo "    ⚠️ Avertissement : Aucune note de release trouvée pour le tag ${TAG_NAME} sur le dépôt source. On utilisera un message par défaut."
    RELEASE_NOTES="Release ${TAG_NAME}"
  fi

  gh release create "${TAG_NAME}" \
    --repo "${PUBLIC_REPO_OWNER_NAME}" \
    --title "${TAG_NAME}" \
    --notes "${RELEASE_NOTES}" \
    --target "${PUBLIC_COMMIT_SHA}"

  echo "✔️ Release ${TAG_NAME} créée avec succès !"
done

echo "---"
echo "✨ Toutes les releases ont été synchronisées avec succès !"
