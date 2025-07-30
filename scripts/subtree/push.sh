#!/bin/bash
set -e

# --- CONFIGURATION ---
PUBLIC_REMOTE_NAME="oa-public"
SUBTREE_PREFIX="public"
MAIN_BRANCH_NAME="main"
# --- FIN CONFIGURATION ---

echo "--- Démarrage du PUSH par réplication ---"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH_NAME" ]; then
    echo "❌ Erreur : Ce script doit être lancé depuis la branche '$MAIN_BRANCH_NAME'."
    echo "   Branche actuelle : '$CURRENT_BRANCH'"
    exit 1
fi

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
    echo "❌ Erreur : Votre branche locale est en avance sur le remote."
    echo "Veuillez d'abord faire 'git push' pour vous mettre à jour."
    exit 1
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
WORKTREE_PATH="../subtree-worktree-$$"
FINAL_BRANCH="subtree-replicated-$$"

# Piège pour garantir le nettoyage même si le script échoue
# `trap` s'exécutera à la sortie du script (EXIT), quoi qu'il arrive.
trap 'echo "🧹 Nettoyage du worktree temporaire..."; git worktree remove --force "${WORKTREE_PATH}";' EXIT

echo "🌳 Création d'un worktree sécurisé dans '${WORKTREE_PATH}'..."
git worktree add -b ${FINAL_BRANCH} "${WORKTREE_PATH}" "remotes/${PUBLIC_REMOTE_NAME}/main"

for commit_sha in $COMMIT_LIST; do
    echo "  -> Réplication : $(git log -1 --oneline ${commit_sha})"

    # Méthode de détection de fusion la plus robuste : compter les parents
    parent_count=$(git cat-file -p ${commit_sha} | grep -c '^parent ')

    if [ "$parent_count" -gt 1 ]; then
        echo "     (Commit de fusion détecté : imposition de l'état final)"
        # Pour un merge, on ne patche pas. On impose l'état exact du sous-dossier.
        # C'est la seule méthode fiable pour gérer les résolutions de conflits.
        SUBTREE_TREE_SHA=$(git rev-parse "${commit_sha}:${SUBTREE_PREFIX}")
        git -C "${WORKTREE_PATH}" rm -rfq .
        git -C "${WORKTREE_PATH}" read-tree --prefix '' -u "${SUBTREE_TREE_SHA}"
    else
        # Pour un commit normal, la méthode du patch est efficace.
        # On exécute diff-tree ici (répertoire principal) et on pipe le résultat vers apply dans le worktree
        git diff-tree -p --binary ${commit_sha}^ ${commit_sha} -- "${SUBTREE_PREFIX}" | sed "s| a/${SUBTREE_PREFIX}/| a/|g; s| b/${SUBTREE_PREFIX}/| b/|g" | git -C "${WORKTREE_PATH}" apply -3
    fi

    git -C "${WORKTREE_PATH}" add .

    if ! git -C "${WORKTREE_PATH}" diff --staged --quiet; then
        # Recréer le commit avec l'auteur et le message d'origine
        export GIT_AUTHOR_NAME=$(git show -s --format='%an' "${commit_sha}")
        export GIT_AUTHOR_EMAIL=$(git show -s --format='%ae' "${commit_sha}")
        export GIT_AUTHOR_DATE=$(git show -s --format='%ad' "${commit_sha}")
        export GIT_COMMITTER_NAME=$(git show -s --format='%cn' "${commit_sha}")
        export GIT_COMMITTER_EMAIL=$(git show -s --format='%ce' "${commit_sha}")
        export GIT_COMMITTER_DATE=$(git show -s --format='%cd' "${commit_sha}")
        COMMIT_MESSAGE=$(git show -s --format=%B "${commit_sha}")

        git -C "${WORKTREE_PATH}" commit -m "${COMMIT_MESSAGE}" --no-verify

        unset GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_AUTHOR_DATE
        unset GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL GIT_COMMITTER_DATE
    else
        echo "     (Aucun changement net pour ce commit, ignoré)"
    fi
done

# Étape 4 : Pousser le résultat
echo "🛰️ Poussée vers ${PUBLIC_REMOTE_NAME} depuis le worktree..."
git -C "${WORKTREE_PATH}" push ${PUBLIC_REMOTE_NAME} "${FINAL_BRANCH}:main"
NEW_PUBLIC_HEAD_SHA=$(git -C "${WORKTREE_PATH}" rev-parse ${FINAL_BRANCH})

# Étape 5 : Création du nouveau commit d'ancrage dans `oa`
echo "✍️ Création du nouveau commit d'ancrage..."

COMMIT_MESSAGE=$(printf "chore: sync with %s\n\nAligns oa commit %s with %s commit %s" "${PUBLIC_REMOTE_NAME}" "${OA_HEAD_SHA}" "${PUBLIC_REMOTE_NAME}" "${NEW_PUBLIC_HEAD_SHA}")
git commit --allow-empty -m "${COMMIT_MESSAGE}" --no-verify

echo "🛰️ Poussée finale du commit d'ancrage vers 'origin'..."
git push
echo "✨ Push terminé"
