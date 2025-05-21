# OpenAgenda Monorepo – **public** subtree

Welcome to the **`public`** portion of the OpenAgenda (`oa`) monorepo.  
Here you’ll find all the open-source packages we publish on npm along with their documentation.

---

## ⚠️ Contributor notice (Yarn v4)

This project uses **Yarn v4 / Berry**, which stores its workspace lockfile as `yarn.lock-workspace`.  
To avoid dependency conflicts and keep the Git history clean, **always rename the lockfile**:

```bash
# Before you start working
mv yarn.lock-workspace yarn.lock

# …do your usual work: yarn install, yarn prepack, tests, etc.

# Just before committing / pushing
mv yarn.lock yarn.lock-workspace
```

## Quick start

```bash
yarn
yarn prepack
```

Thanks for contributing! ✨
