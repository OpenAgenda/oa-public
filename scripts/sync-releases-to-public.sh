#!/bin/bash

# Arrête le script si une commande échoue
set -e

# --- CONFIGURATION ---
PRIVATE_RELEASE_COMMIT_MSG="chore: version packages"
PUBLIC_REMOTE_NAME="oa-public"
PUBLIC_REPO_OWNER_NAME="openagenda/oa-public"
PUBLIC_REPO_BRANCH="main"
SUBTREE_PREFIX="public"
# --- FIN CONFIGURATION ---

if ! git remote | grep -q "^${PUBLIC_REMOTE_NAME}$"; then
  echo "🔗 Ajout du remote '${PUBLIC_REMOTE_NAME}'..."
  git remote add ${PUBLIC_REMOTE_NAME} https://github.com/${PUBLIC_REPO_OWNER_NAME}.git
fi

echo "🚀 Démarrage de la synchronisation des releases vers le repo public (${PUBLIC_REPO_OWNER_NAME})..."

# 1. S'assurer que le remote public est à jour localement
echo "🔍 Mise à jour du remote '${PUBLIC_REMOTE_NAME}'..."
git fetch ${PUBLIC_REMOTE_NAME}

# 2. Trouver le SHA du dernier commit de release dans le repo privé
echo "🔍 Recherche du dernier commit de release..."
RELEASE_COMMIT_SHA=$(git log --grep="^${PRIVATE_RELEASE_COMMIT_MSG}$" -n 1 --format=%H)

if [ -z "$RELEASE_COMMIT_SHA" ]; then
  echo "✅ Aucune nouvelle release trouvée. Rien à faire."
  exit 0
fi
echo "✅ Commit de release trouvé : ${RELEASE_COMMIT_SHA}"

# 3. Trouver tous les tags associés à ce commit
echo "🏷️  Recherche des tags associés à ce commit..."
TAGS=$(git tag --points-at ${RELEASE_COMMIT_SHA})

if [ -z "$TAGS" ]; {
  echo "⚠️ Aucun tag trouvé pour le commit de release. Il y a peut-être un problème. Arrêt."
  exit 1
}

# 4. Récupérer les notes de release complètes depuis le corps du commit
echo "📝 Extraction des notes de release depuis le corps du commit..."
# git show -s --format=%B retourne le sujet ET le corps du commit
RELEASE_NOTES=$(git show -s --format=%B "${RELEASE_COMMIT_SHA}")

# Boucle sur chaque tag trouvé
for TAG_NAME in $TAGS; do
  echo "---"
  echo "🔄 Traitement du tag : ${TAG_NAME}"

  # Extrait le nom du package du tag (ex: my-package@1.2.3 -> my-package)
  PACKAGE_NAME=$(echo ${TAG_NAME} | sed -E 's/@([0-9]+\.?){3}//')
  PACKAGE_SUBTREE_PATH="${SUBTREE_PREFIX}/${PACKAGE_NAME}"

  if [ ! -d "$PACKAGE_SUBTREE_PATH" ]; then
    echo "⚠️ Le dossier ${PACKAGE_SUBTREE_PATH} n'existe pas, tag ignoré."
    continue
  fi

  echo "📦 Nom du package : ${PACKAGE_NAME}"
  echo "📁 Chemin du subtree : ${PACKAGE_SUBTREE_PATH}"

  # 5. Pousser le subtree vers le remote public
  # C'est l'équivalent de votre commande, mais pour un seul package à la fois
  echo "🛰️  Poussée du subtree pour ${PACKAGE_NAME} vers ${PUBLIC_REMOTE_NAME}/${PUBLIC_REPO_BRANCH}..."
  # 'git subtree push' retourne le SHA du commit créé sur la branche distante
  SUBTREE_PUSH_OUTPUT=$(git subtree push --rejoin --prefix=${PACKAGE_SUBTREE_PATH} ${PUBLIC_REMOTE_NAME} ${PUBLIC_REPO_BRANCH})

  # 6. Trouver le SHA du commit créé dans le repo public
  # L'astuce est que `git subtree push` retourne "remote: ... new_sha..old_sha"
  # On extrait ce nouveau SHA. C'est beaucoup plus fiable que de chercher par message.
  PUBLIC_COMMIT_SHA=$(echo "${SUBTREE_PUSH_OUTPUT}" | grep -oE '[a-f0-9]{40}\.\.[a-f0-9]{40}' | cut -d'.' -f1)

  # Fallback si l'extraction échoue (messages de git peuvent changer)
  if [ -z "$PUBLIC_COMMIT_SHA" ]; then
    echo "⚠️ Impossible d'extraire le SHA depuis la sortie de subtree push. Tentative de récupération via fetch..."
    git fetch ${PUBLIC_REMOTE_NAME}
    PUBLIC_COMMIT_SHA=$(git rev-parse "${PUBLIC_REMOTE_NAME}/${PUBLIC_REPO_BRANCH}")
  fi

  echo "🎯 Commit correspondant trouvé sur ${PUBLIC_REMOTE_NAME}: ${PUBLIC_COMMIT_SHA}"

  # 7. Créer la release GitHub sur le repo public en utilisant `gh`
  # `gh` va créer le tag et la release en une seule commande.
  echo "🎉 Création de la release et du tag GitHub sur ${PUBLIC_REPO_OWNER_NAME}..."
  gh release create "${TAG_NAME}" \
    --repo "${PUBLIC_REPO_OWNER_NAME}" \
    --title "${TAG_NAME}" \
    --notes "${RELEASE_NOTES}" \
    --target "${PUBLIC_COMMIT_SHA}" # Crée le tag directement sur le bon commit du repo public

  echo "✅ Synchronisation terminée pour ${TAG_NAME} !"
done

echo "---"
echo "✨ Toutes les releases ont été synchronisées avec succès !"
