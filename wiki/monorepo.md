## Import external repo

The OA javascript mono repo.

To add a repo from any other place to here, one must:

 * run `lerna import <local-path-to-external-repository> --flatten`
 * if that doesn't work, just move the folder and delete the .git file
   - or: `git subtree add -P packages/<package> ../OpenAgenda/<package> master`
 * in the repo of the imported lib, set as title and commit "LAST COMMIT, lib moved to oa repo"
 * remove `yarn release:<type>` scripts
 * remove test script from preversion script if exist
 * move build (if exist) on prepublish script
 * add dist (or output build) directory to .gitignore
 * remove yarn.lock files in packages/*
 * fix `repository` and `homepage` in package.json

 * Update .babelrc and add openagenda preset

 ## Lerna tips

 If you need to launch a command in all package modified since the last publishing:
 `lerna exec --since -- <command> [..args]`
 `\$LERNA_PACKAGE_NAME` variable can be used in the command or args (escaped with `\ `).

 Add `--concurrency 1` argument for run the command in one package after another.

 `--parallel` is the preferred flag for long-running processes such as `yarn build -w` run over many packages.
 (e.g. `lerna run --parallel build -- -w`)

 If buffer pb, use --max-buffer option. For example:

     lerna import ../custom --flatten --max-buffer=524288000

 ref: https://github.com/lerna/lerna/issues/479

