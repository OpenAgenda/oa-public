#!/bin/bash
set -e

# --- CONFIGURATION ---
PUBLIC_REMOTE_NAME="oa-public"
SUBTREE_PREFIX="public"
# --- FIN CONFIGURATION ---

echo "--- Démarrage du PULL ---"

if ! git diff --quiet HEAD; then
    echo "❌ Erreur : Modifications non commitées. Commitez ou rangez ('stash') vos changements."
    exit 1
fi

git remote update --prune origin ${PUBLIC_REMOTE_NAME}

# --- Vérification de l'état de la branche locale ---
LOCAL_SHA=$(git rev-parse @)
REMOTE_SHA=$(git rev-parse @{u})
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

# --- Étape 1 : Analyse de la synchronisation ---
PUBLIC_MAIN_BRANCH="remotes/${PUBLIC_REMOTE_NAME}/main"
PUBLIC_HEAD_SHA=$(git rev-parse "${PUBLIC_MAIN_BRANCH}")

echo "🧠 Recherche du dernier commit d'ancrage..."
LAST_SYNC_COMMIT=$(git log -n 1 --grep="Aligns oa commit" --pretty=format:%H)
if [ -z "$LAST_SYNC_COMMIT" ]; then
    echo "❌ Aucun commit d'ancrage trouvé. La synchronisation doit être initialisée."
    echo "   Veuillez lancer : ./scripts/subtree/init-subtree.sh"
    exit 1
fi
SYNC_INFO=$(git log -1 --pretty=format:%B "${LAST_SYNC_COMMIT}")
LAST_SYNC_PUBLIC_SHA=$(echo "$SYNC_INFO" | grep "with ${PUBLIC_REMOTE_NAME} commit" | awk '{print $NF}')

if [ "${PUBLIC_HEAD_SHA}" == "${LAST_SYNC_PUBLIC_SHA}" ]; then
    echo "✔️ Rien à tirer. Le dépôt est déjà synchronisé."
    exit 0
fi

# --- Étape 2 : Création et application du patch ---
echo "📄 Création d'un patch depuis ${LAST_SYNC_PUBLIC_SHA:0:7}..."
git diff "${LAST_SYNC_PUBLIC_SHA}" "${PUBLIC_HEAD_SHA}" --binary > /tmp/public-changes.patch

echo "🩹 Application du patch sur le dossier local '${SUBTREE_PREFIX}'..."
sed -i.bak "s| a/| a/${SUBTREE_PREFIX}/|g; s| b/| b/${SUBTREE_PREFIX}/|g" /tmp/public-changes.patch

if ! git apply -3 --unidiff-zero /tmp/public-changes.patch; then
    # --- GESTION DU CONFLIT ---
    echo ""
    echo "🔴 CONFLIT DÉTECTÉ ! Intervention manuelle requise."
    echo "------------------------------------------------------------"
    echo "Actions à effectuer :"
    echo "1. Résolvez les conflits dans '${SUBTREE_PREFIX}' (fichiers .rej ou marqueurs de conflit)."
    echo "2. Une fois les conflits résolus, créez UN SEUL commit avec TOUS vos changements :"
    echo "   git add ${SUBTREE_PREFIX}"
    echo "   git commit -m \"chore: resolve pull conflict from ${PUBLIC_REMOTE_NAME}\""
    echo ""
    echo "3. APRÈS votre commit, lancez le script de finalisation :"
    echo "   ./scripts/subtree/finalize-pull.sh"
    echo "------------------------------------------------------------"

    rm -f /tmp/public-changes.patch*
    exit 1
fi
rm -f /tmp/public-changes.patch*

# --- Étape 3 : Commit du contenu et de l'ancrage (cas sans conflit) ---
echo "✍️ Création des commits de synchronisation..."
git add "${SUBTREE_PREFIX}"

if git diff --staged --quiet; then
    echo "✅ Pull terminé, aucun changement de code. Seul un ancrage est nécessaire."
else
    git commit -m "chore: pull from ${PUBLIC_REMOTE_NAME}" --no-verify
fi

# Création directe de l'ancrage
OA_HEAD_SHA_FOR_ANCHOR=$(git rev-parse HEAD)
COMMIT_MESSAGE=$(printf "chore: sync from %s\n\nAligns oa commit %s with %s commit %s" "${PUBLIC_REMOTE_NAME}" "${OA_HEAD_SHA_FOR_ANCHOR}" "${PUBLIC_REMOTE_NAME}" "${PUBLIC_HEAD_SHA}")
git commit --allow-empty -m "${COMMIT_MESSAGE}" --no-verify

echo "✅ Ancrage créé (${OA_HEAD_SHA_FOR_ANCHOR:0:7} <-> ${PUBLIC_HEAD_SHA:0:7})."
echo "✨ Pull terminé avec succès."
