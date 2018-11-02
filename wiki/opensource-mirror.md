**Create**  
```bash
git remote add opensource git@github.com:bertho-zero/double-1.git
git fetch opensource
git checkout --orphan opensource
# (update .gitignore if needed)
git rm -rf --cached .
git add -A
# (git diff --cached)
git commit -am '<message>'
git push opensource HEAD:master
```

**master -> opensource**
```bash
git fetch opensource
git checkout opensource/master
git merge --no-commit --squash origin/master
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
```

**opensource -> master**
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
