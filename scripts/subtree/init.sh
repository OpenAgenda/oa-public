#!/bin/bash
set -e

# --- CONFIGURATION ---
PUBLIC_REMOTE_NAME="oa-public"
MAIN_BRANCH_NAME="main"
# --- FIN CONFIGURATION ---

echo "--- Initialisation de la synchronisation de subtree ---"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH_NAME" ]; then
    echo "❌ Erreur : Ce script doit être lancé depuis la branche '$MAIN_BRANCH_NAME'."
    echo "   Branche actuelle : '$CURRENT_BRANCH'"
    exit 1
fi


if ! git diff --quiet HEAD; then
    echo "❌ Erreur : Le répertoire de travail doit être propre avant l'initialisation."
    exit 1
fi

# Vérifier si un ancrage existe déjà pour éviter de le faire deux fois
if git log -n 1 --grep="Aligns oa commit" --pretty=format:%H > /dev/null; then
    echo "⚠️  Un commit d'ancrage existe déjà. L'initialisation n'est probablement pas nécessaire."
    read -p "Voulez-vous vraiment créer un nouvel ancrage initial ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Opération annulée."
        exit 1
    fi
fi

echo "🔄 Mise à jour des informations du remote '${PUBLIC_REMOTE_NAME}'..."
git fetch ${PUBLIC_REMOTE_NAME}

# --- Récupérer les états actuels ---
OA_HEAD_SHA=$(git rev-parse HEAD)
PUBLIC_HEAD_SHA=$(git rev-parse "remotes/${PUBLIC_REMOTE_NAME}/main")

echo "   -> État local (oa) : ${OA_HEAD_SHA:0:7}"
echo "   -> État public (oa-public) : ${PUBLIC_HEAD_SHA:0:7}"

# --- Créer le commit d'ancrage initial ---
echo "⚓ Création du commit d'ancrage initial..."
COMMIT_MESSAGE=$(printf "chore: initialize subtree sync\n\nAligns oa commit %s with %s commit %s" "${OA_HEAD_SHA}" "${PUBLIC_REMOTE_NAME}" "${PUBLIC_HEAD_SHA}")

git commit --allow-empty -m "${COMMIT_MESSAGE}" --no-verify

echo "✅ Succès ! Le premier commit d'ancrage a été créé."
echo "Vous pouvez maintenant utiliser les scripts 'pull.sh' et 'push.sh'."
