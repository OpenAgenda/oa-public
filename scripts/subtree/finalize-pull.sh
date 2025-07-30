#!/bin/bash
set -e

# --- CONFIGURATION ---
PUBLIC_REMOTE_NAME="oa-public"
SUBTREE_PREFIX="public"
MAIN_BRANCH_NAME="main"
# --- FIN CONFIGURATION ---

echo "--- Finalisation du PULL avec conflit ---"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH_NAME" ]; then
    echo "❌ Erreur : Ce script doit être lancé depuis la branche '$MAIN_BRANCH_NAME'."
    echo "   Branche actuelle : '$CURRENT_BRANCH'"
    exit 1
fi


if ! git diff --quiet HEAD; then
    echo "❌ Erreur : Votre répertoire de travail n'est pas propre."
    echo "   Après avoir résolu les conflits, vous devez commiter vos changements avant de lancer ce script."
    exit 1
fi

# Le commit de résolution est le commit actuel (HEAD)
RESOLUTION_OA_SHA=$(git rev-parse HEAD)
echo "🔬 Commit de résolution détecté : ${RESOLUTION_OA_SHA:0:7}"

git fetch ${PUBLIC_REMOTE_NAME}

# --- Étape 1 : Préparer la réplication ---
TEMP_BRANCH="finalize-pull-$$"
PUBLIC_MAIN_BRANCH="remotes/${PUBLIC_REMOTE_NAME}/main"
echo "🧬 Préparation de la branche temporaire '${TEMP_BRANCH}' depuis '${PUBLIC_MAIN_BRANCH}'..."

# On crée une branche temporaire basée sur l'état actuel de oa-public.
# C'est sur cette base que notre résolution sera appliquée.
git checkout -b ${TEMP_BRANCH} ${PUBLIC_MAIN_BRANCH}

# --- Étape 2 : Remplacer le contenu par celui de notre résolution ---
echo "🔄 Remplacement du contenu avec la version résolue..."

# On récupère l'identifiant de l'arbre (le contenu) de notre sous-dossier
SUBTREE_TREE_SHA=$(git rev-parse "${RESOLUTION_OA_SHA}:${SUBTREE_PREFIX}")

# On vide la branche temporaire...
git rm -rfq .

# ...et on la remplit avec le contenu de notre sous-dossier.
# C'est la méthode la plus propre pour copier l'état exact des fichiers.
git read-tree --prefix '' -u "${SUBTREE_TREE_SHA}"

# --- Étape 3 : Commiter et Pousser la résolution ---
echo "✍️  Création du commit de résolution sur la branche publique..."
COMMIT_MSG_BODY=$(git log -1 --pretty=%B ${RESOLUTION_OA_SHA})
git commit -m "fix: merge and resolve conflict from downstream" -m "${COMMIT_MSG_BODY}" --no-verify

echo "🛰️  Poussée de la résolution vers ${PUBLIC_REMOTE_NAME}..."
git push ${PUBLIC_REMOTE_NAME} "${TEMP_BRANCH}:main"
NEW_PUBLIC_HEAD_SHA=$(git rev-parse ${TEMP_BRANCH})

# --- Étape 4 : Créer l'ancrage final ---
echo "🏠 Retour sur la branche d'origine et nettoyage..."
git checkout -
git branch -D ${TEMP_BRANCH}

echo "⚓ Création du nouveau commit d'ancrage..."
COMMIT_MESSAGE=$(printf "chore: sync from %s after conflict\n\nAligns oa commit %s with %s commit %s" "${PUBLIC_REMOTE_NAME}" "${RESOLUTION_OA_SHA}" "${PUBLIC_REMOTE_NAME}" "${NEW_PUBLIC_HEAD_SHA}")
git commit --allow-empty -m "${COMMIT_MESSAGE}" --no-verify

echo "✅ Ancrage de résolution créé (${RESOLUTION_OA_SHA:0:7} <-> ${NEW_PUBLIC_HEAD_SHA:0:7})."
echo "✨ Finalisation du pull terminée avec succès."
