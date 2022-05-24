## Set up Yarn

The `public` submodule must work independently of the main repo, for that you have to tell Yarn that it must use the same `yarn.lock` for the submodule when working on `public` from OA.
For that add the following line to your `.profile`, `.bashrc` or `.zshrc`:

```bash
export OA_PUBLIC_LOCKFILE="yarn.lock"
```

> If you want to install both oa and oa-public separately, you must install [`direnv`](https://direnv.net/) and add an `.envrc` with the following content in your `oa-public` repo (outside of oa):
> 
> ```bash
> export OA_PUBLIC_LOCKFILE="yarn.lock-workspace"
> ```

## Set up git

Start by installing jq: `sudo apt install jq`

OA contains a git submodule with the public packages.
The following commands are useful for working with submodules, in OA:

```bash
# Override the URL, so as not to put your user/password on each commit:
git config submodule.public.url ssh://git@github.com/OpenAgenda/oa-public.git
# Add --recurse-submodules option to all supported git calls (except clone):
git config submodule.recurse true
# To see submodule changes with a `git status`:
git config status.submodulesummary 1
# To see submodule diff with a `git diff`:
git config diff.submodule log
# Practical aliases:
git config alias.sstatus '!'"git status -sb && git submodule foreach 'git status -sb'"
git config alias.sdiff '!'"git diff && git submodule foreach 'git diff'"
git config alias.spush '!'"git submodule foreach --recursive 'git push' && git push --no-recurse-submodule"
git config alias.spull '!'"git pull --no-recurse-submodule && git submodule update --merge"
git config alias.supdate 'submodule update --remote --merge'
```

For more details about git submodules see https://git-scm.com/book/en/v2/Git-Tools-Submodules

> Note: If you use `oh-my-zsh` you can add this line in your `.zshrc`:
> ```bash
> export GIT_STATUS_IGNORE_SUBMODULES=none
> ```

`git sstatus` is not accessible from the public submodule, for that you can replace the `gss` alias in your `.zshrc` with these lines:

```bash
unalias gss
gss() {
  local dir=$(git rev-parse --show-superproject-working-tree --show-toplevel | head -1)

  [ -z "$dir" ] && return

  git -C "$dir" status -sb && git -C "$dir" submodule foreach "git status -sb"
}
```

## Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  ~~But also,
we use the git commit messages to **generate the change log**~~.

[commitlint](https://github.com/conventional-changelog/commitlint) checks if your commit messages meet the [conventional commit format](https://www.conventionalcommits.org/).

## Release workflow

The publication can be summarized in three steps:
- we mark the versions to create during the next release (`yarn version <strategy>`)
- `yarn release` to prepare and publish everything
- `git push && git push --tags`


For the example we modified mails, which is used by cibul-node.
Once you've made your commits and you're on a clean branch you will want to create the necessary versions.

```bash
cd public/mails
yarn version minor
```

Will not cause the `package.json` file to change! Instead, Yarn will create (or reuse, if you're inside a branch) a file within the `.yarn/versions` directory. This file will record the requested upgrade:

```yaml
releases:
  @openagenda/mails@3.0.0: minor
```

The `.yarn/versions` directory must not contain more than one file, if this is the case you must manually merge the contents of the files.

Yarn will then locate all the upgrade records it previously saved, and apply them all at once (including by taking care of upgrading inter-dependencies as we saw), for that just run:

```bash
yarn release
```

Every other workspace that depend on the first one through a basic semver ranges (`^x.y.z`, `~x.y.z`, ...) will get auto-updated to reference the new version. For example, let's say we have the following workspaces:

```
/public/mails (3.0.0)
/packages/cibul-node (depends on mails@^3.0.0)
```

After `yarn release` the following changes will be applied:

```
/public/mails (3.1.0)
/packages/cibul-node (depends on mails@^3.1.0)
```

`yarn release` will print you checkboxes for each entry allowing you to pick the release strategies you want to set for each dependent workspace.

After that the release script will create a commit in `oa` (and a second commit in `public` if needed), a Git tag for each new version, a release tag including the date and finally it will push the new versions to NPM.

The script doesn't push the changes to Git for you, if all goes well you just have to do:

```bash
git push && git push --tags
# git push does not push tags recursively, so:
cd public && git push --tags
```

More details on [Yarn doc (Release Workflow)](https://yarnpkg.com/features/release-workflow).

## Troubleshoot

### Updating public submodule reference

It may occure that the reference to the submodule commit in the monorepo has not been automatically updated. When this happens, a git diff on the root of the monorepo hints that there have been commits on the submodule that have not been accounted for. Commiting the public submodule on the monorepo updates the submodule reference.

```bash
git commit -m 'chore: update submodule public' -- public
```
