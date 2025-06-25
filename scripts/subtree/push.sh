#!/bin/bash
set -e

# --- CONFIGURATION ---
PUBLIC_REMOTE_NAME="oa-public"
SUBTREE_PREFIX="public"
# --- FIN CONFIGURATION ---

echo "--- Démarrage du PUSH par réplication ---"

git remote update origin --prune # Met à jour toutes les références de 'origin'

LOCAL_SHA=$(git rev-parse @)
REMOTE_SHA=$(git rev-parse @{u}) # '@{u}' est un raccourci pour la branche "upstream" suivie
BASE_SHA=$(git merge-base @ @{u})

if [ "$LOCAL_SHA" == "$REMOTE_SHA" ]; then
    echo "✔️  La branche locale est à jour avec le remote."
elif [ "$LOCAL_SHA" == "$BASE_SHA" ]; then
    echo "❌ Erreur : Votre branche locale est en retard sur le remote."
    echo "Veuillez d'abord faire 'git pull' pour vous mettre à jour."
    exit 1
elif [ "$REMOTE_SHA" == "$BASE_SHA" ]; then
    echo "⚠️  Avertissement : Votre branche locale a des commits qui n'ont pas été poussés sur 'origin'."
    echo "L'opération continuera, mais assurez-vous que c'est bien ce que vous voulez."
else
    echo "❌ Erreur : Votre branche locale a divergé du remote."
    echo "Veuillez faire 'git pull --rebase' ou une autre stratégie de fusion pour résoudre la divergence."
    exit 1
fi

# Étape 1 : Préparation et analyse de divergence
git fetch ${PUBLIC_REMOTE_NAME}
PUBLIC_MAIN_BRANCH="remotes/${PUBLIC_REMOTE_NAME}/main"
PUBLIC_HEAD_SHA=$(git rev-parse "${PUBLIC_MAIN_BRANCH}")
OA_HEAD_SHA=$(git rev-parse HEAD)

echo "🧠 Recherche du dernier commit d'ancrage..."
LAST_SYNC_COMMIT=$(git log -n 1 --grep="Aligns oa commit" --pretty=format:%H)
if [ -z "$LAST_SYNC_COMMIT" ]; then
    echo "❌ Aucun commit d'ancrage trouvé. La synchronisation doit être initialisée."
    echo "   Veuillez lancer : ./scripts/subtree/init-subtree.sh"
    exit 1
fi
SYNC_INFO=$(git log -1 --pretty=format:%B "${LAST_SYNC_COMMIT}")
#LAST_SYNC_OA_SHA=$(git rev-parse ${LAST_SYNC_COMMIT}^)
LAST_SYNC_OA_SHA=$(echo "$SYNC_INFO" | grep "Aligns oa commit" | awk '{print $4}')
LAST_SYNC_PUBLIC_SHA=$(echo "$SYNC_INFO" | grep "with oa-public commit" | awk '{print $NF}')

echo "✔️ Dernière synchro : oa@${LAST_SYNC_OA_SHA:0:7} <-> oa-public@${LAST_SYNC_PUBLIC_SHA:0:7}"

# Étape 2 : Vérification de sécurité
if [ "${PUBLIC_HEAD_SHA}" != "${LAST_SYNC_PUBLIC_SHA}" ]; then
    echo "🔴 DIVERGENCE DÉTECTÉE !"
    echo "La branche 'main' de 'oa-public' a de nouveaux commits."
    echo "Veuillez d'abord exécuter le script de PULL pour les intégrer."
    exit 1
fi

COMMIT_LIST=$(git rev-list --reverse ${LAST_SYNC_OA_SHA}..${OA_HEAD_SHA} -- "${SUBTREE_PREFIX}")
if [ -z "$COMMIT_LIST" ]; then
    echo "✔️ Rien de nouveau dans '${SUBTREE_PREFIX}' à pousser."
    exit 0
fi

# Étape 3 : Réplication
FINAL_BRANCH="subtree-replicated-$$"
echo "🧬 Préparation de la branche de réplication '${FINAL_BRANCH}'..."
git checkout -b ${FINAL_BRANCH} "remotes/${PUBLIC_REMOTE_NAME}/main"

for commit_sha in $COMMIT_LIST; do
    echo "  -> Réplication : $(git log -1 --oneline ${commit_sha})"

    # Méthode de détection de fusion la plus robuste : compter les parents
    parent_count=$(git cat-file -p ${commit_sha} | grep -c '^parent ')

    if [ "$parent_count" -gt 1 ]; then
        echo "     (Commit de fusion détecté : imposition de l'état final)"
        # Pour un merge, on ne patche pas. On impose l'état exact du sous-dossier.
        # C'est la seule méthode fiable pour gérer les résolutions de conflits.
        SUBTREE_TREE_SHA=$(git rev-parse "${commit_sha}:${SUBTREE_PREFIX}")
        git rm -rfq .
        git read-tree --prefix '' -u "${SUBTREE_TREE_SHA}"
    else
        # Pour un commit normal, la méthode du patch est efficace.
        git diff-tree -p --binary ${commit_sha}^ ${commit_sha} -- "${SUBTREE_PREFIX}" | sed "s| a/${SUBTREE_PREFIX}/| a/|g; s| b/${SUBTREE_PREFIX}/| b/|g" | git apply -3
    fi

    # Recréer le commit avec l'auteur et le message d'origine
    export GIT_AUTHOR_NAME=$(git show -s --format='%an' "${commit_sha}")
    export GIT_AUTHOR_EMAIL=$(git show -s --format='%ae' "${commit_sha}")
    export GIT_AUTHOR_DATE=$(git show -s --format='%ad' "${commit_sha}")
    export GIT_COMMITTER_NAME=$(git show -s --format='%cn' "${commit_sha}")
    export GIT_COMMITTER_EMAIL=$(git show -s --format='%ce' "${commit_sha}")
    export GIT_COMMITTER_DATE=$(git show -s --format='%cd' "${commit_sha}")
    COMMIT_MESSAGE=$(git show -s --format=%B "${commit_sha}")

    git add .
    git commit -m "${COMMIT_MESSAGE}" --no-verify

    unset GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_AUTHOR_DATE
    unset GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL GIT_COMMITTER_DATE
done

# Étape 4 : Pousser le résultat
echo "🛰️ Poussée vers oa-public..."
git push ${PUBLIC_REMOTE_NAME} "${FINAL_BRANCH}:main"
NEW_PUBLIC_HEAD_SHA=$(git rev-parse ${FINAL_BRANCH})

# Étape 5 : Création du nouveau commit d'ancrage dans `oa`
echo "✍️ Création du nouveau commit d'ancrage..."
git checkout -
git branch -D ${FINAL_BRANCH}
COMMIT_MESSAGE=$(printf "chore: sync with %s\n\nAligns oa commit %s with %s commit %s" "${PUBLIC_REMOTE_NAME}" "${OA_HEAD_SHA}" "${PUBLIC_REMOTE_NAME}" "${NEW_PUBLIC_HEAD_SHA}")

git commit --allow-empty -m "${COMMIT_MESSAGE}" --no-verify
echo "✨ Push terminé"
