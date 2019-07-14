# Overview

Open sourced packages are tracked in a separate repository that needs to be maintained and syncronised in parallel of the main OpenAgenda repository. This makes the OpenSource repository a subset of the main repository.

Packages can be maintained either on the main repository, either on the open source repository or the main one and be then syncronized to the other. These procedures are detailed in their respective sections:

 * Master -> Open Source: procedure to sync a package maintained on the main repo to the open source repo
 * Open Source -> Master: procedure to sync a package maintained on the open source repo to the main repo.

**Important note**: it is imperative that non-open sourced packages be gitignored in the opensource repo.

**Important note**: newly open-sourced package can be set to public on the oa npm account ( gaetanlatouche )

2 remote sur oa.

# Main repo to Open Source repo procedure

Prerequis: le repo ne doit rien avoir de pas tracké et pas commité

Le repo:

On part du root du repo

git remote add opensource git@github.com:Oagenda/oa.git

```bash
git fetch opensource
# on se met sur sur opensoure
git checkout opensource/master
git merge --no-commit --squash --allow-unrelated-histories origin/master
git checkout --ours -- .gitignore LICENSE
git add .gitignore LICENSE
git diff --name-only --diff-filter=U | xargs git checkout --theirs --
git diff --name-only --diff-filter=U | xargs git add
# (update .gitignore if needed)
git rm -rf --cached .
git add -A
# (git diff --cached)
git commit -am '<message>'
git push opensource HEAD:master
# Go back to non open source project
git checkout master
```

# Open Source repo to Main repo procedure
```bash
git checkout master
git fetch opensource
git merge opensource/master
# (git diff --name-only --diff-filter=U)
git checkout --ours -- .gitignore LICENSE
git add .gitignore LICENSE
git diff --name-only --diff-filter=U | xargs git checkout --theirs --
git diff --name-only --diff-filter=U | xargs git add
# (update .gitignore if needed)
git rm -rf --cached .
git add -A
# (git diff --cached)
git commit -am '<message>'
git push origin master
```

## Détails

La procédure se ressemble quelque soit le sens, c'est une sorte de merge manuel,
vu que les commits ne sont pas liés entre eux git n'arrive pas à savoir quelles
modifications garder de chaque côté.


Le début de la procédure nous place sur la bonne branche à jour (fetch + checkout),
on fait le merge, puis on doit ajouter tous les fichiers.

On ajoute d'abord les fichiers à garder de la branche actuelle (.gitignore et LICENSE avant tout),
et ensuite ceux de la branche à merger.

Pour sélectionner les fichiers ça se passe en 2 temps (`git checkout` + `git add`),
`git checkout --ours -- <...files>` pour garder les fichiers de la branche sur
laquelle on est, et `git checkout --theirs -- <...files>` pour garder les fichiers de
la branche qu'on souhaite merger. Puis on valide l'ajout de ces mêmes fichiers avec
`git add <...files>`.

Après avoir ajouté les fichiers prioritaires (.gitignore, LICENSE et les fichiers modifiés)
on peut vouloir ajouter tous les fichiers restants d'un coup avec:
```bash
git diff --name-only --diff-filter=U | xargs git checkout --theirs --
git diff --name-only --diff-filter=U | xargs git add
```

On met à jour le `.gitignore` si besoin, on enlève tout de git avec `git rm -rf --cached .`
pour tout ajouter avec `git add -A`, ca permet d'enlever les fichiers supprimés.

On commit et on push.


# Annex

## Creating the mirror repo

Useful to get a repo started. Already done for archival purposes:

```bash
git remote add opensource git@github.com:Oagenda/oa.git
git fetch opensource
git checkout --orphan opensource
# (update .gitignore if needed)
git rm -rf --cached .
git add -A
# (git diff --cached)
git commit -am '<message>'
git push opensource HEAD:master
```
