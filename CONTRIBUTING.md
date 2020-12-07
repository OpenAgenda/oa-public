## Set up git

OA contains a git submodule with the public packages.
The following commands are useful for working with submodules, in OA:

```bash
# Override the URL, so as not to put your user/password on each commit:
git config submodule.public.url git@github.com:OpenAgenda/oa-public.git
# Add --recurse-submodules option to all supported git calls (except clone):
git config submodule.recurse true
# To see submodule changes with a `git status`:
git config status.submodulesummary 1
# To see submodule diff with a `git diff`:
git config diff.submodule log
# Practical aliases:
git config alias.sstatus '!'"git status -sb && git submodule foreach 'git status -sb'"
git config alias.sdiff '!'"git diff && git submodule foreach 'git diff'"
git config alias.spush 'push --recurse-submodules=on-demand'
git config alias.supdate 'submodule update --remote --merge'
```

For more details about git submodules see https://git-scm.com/book/en/v2/Git-Tools-Submodules

> Note: If you use `oh-my-zsh` you can add this line in your `.zshrc`:
> ```bash
> export GIT_STATUS_IGNORE_SUBMODULES=none
> ```

## Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate the change log**.

### Commit Message Format

> For use the changelog generator, you need to publish with the command `yarn release` or `yarn lerna publish`

Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

The footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.

Samples: (even more [samples](https://github.com/angular/angular/commits/master))

```
docs(changelog): update changelog to beta.5
```
```
fix(release): need to depend on latest rxjs and zone.js

The version in our package.json gets copied to the one we publish, and users need the latest of these.
```

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type
Must be one of the following:

* **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* **chore**: Other changes that don't modify src or test files
* **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **revert**: Reverts a previous commit
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **test**: Adding missing tests or correcting existing tests

### Scope
The scope should be the name of the npm package affected (as perceived by the person reading the changelog generated from commit messages.

There are currently a few exceptions to the "use package name" rule:

* **packaging**: used for changes that change the npm package layout in all of our packages, e.g. public path changes, package.json changes done to all packages, d.ts file/format changes, changes to bundles, etc.
* **changelog**: used for updating the release notes in CHANGELOG.md
* none/empty string: useful for `style`, `test` and `refactor` changes that are done across all packages (e.g. `style: add missing semicolons`)

### Subject
The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

A detailed explanation can be found in this [document](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit).

## commitlint

[commitlint](http://marionebl.github.io/commitlint/) helps your team adhering to a commit convention. By supporting npm-installed configurations it makes sharing of commit conventions easy.

## Release workflow

There are two possibilities, when it comes to a feature or a small fix it is possible to bump a version immediately.

For larger jobs it is better to defer the version bump and apply them all at the same time.

In both cases the release must be done from a clean and up to date git branch.

### Deferred versioning

This is the default strategy in this project.

For the example we modified mails, which is used by cibul-node and mails-editor as a peerDep.
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
yarn version apply --all
```

Every other workspace that depend on the first one through a basic semver ranges (`^x.y.z`, `~x.y.z`, ...) will get auto-updated to reference the new version. For example, let's say we have the following workspaces:

```
/public/mails (3.0.0)
/packages/cibul-node (depends on common@^3.0.0)
/packages/cibul-node (depends on common@^3.0.0)
```

After `yarn version apply` the following changes will be applied:

```
/public/mails (3.1.0)
/packages/cibul-node (depends on common@^3.1.0)
```

To ensure that versions are changed in all modified workspaces, all relevant dependent workspaces, run:

```bash
yarn version check -i
```

Yarn will print you checkboxes for each entry allowing you to pick the release strategies you want to set for each workspace. Version checking should be done right after an apply, otherwise yarn is not able to detect updated packages.

More details on [Yarn doc (Release Workflow)](https://yarnpkg.com/features/release-workflow).

### Immediate versioning

The immediate versioning just calls `yarn version apply` for you. To bump a version immediately you can add the `-i` option:

```bash
yarn version minor -i
```

If this involves updating dependent workspaces you can run `yarn version check -i`.
