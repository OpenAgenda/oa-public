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

## Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted. This leads to **more
readable messages** that are easy to follow when looking through the **project history**. ~~But also,
we use the git commit messages to **generate the change log**~~.

[commitlint](https://github.com/conventional-changelog/commitlint) checks if your commit messages meet the [conventional commit format](https://www.conventionalcommits.org/).

## Release workflow

The publication can be summarized in three steps:

- We create a changeset to mark the versions to create during the next release with `yarn changeset` ([Adding a changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md))
- Changesets create a Pull Request with changes
- We accept the PR to publish packages on NPM and create Github releases

More details on [Changesets documentation](https://github.com/changesets/changesets/tree/main?tab=readme-ov-file#documentation) fro the release workflow.
