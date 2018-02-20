# Overview

The OA javascript mono repo.

To add a repo from any other place to here, one must:

 * run `lerna import <local-path-to-external-repository>`
 * if that doesn't work, just move the folder and delete the .git file
 * in the repo of the imported lib, set as title and commit "LAST COMMIT, lib moved to oa repo"
 * remove `yarn release:<type>` scripts
 * move test (if exist) on preversion script
 * move build (if exist) on prepublish script
 * add lib (or output build) directory to .gitignore

http://www.christianalfoni.com/articles/2015_04_19_The-ultimate-webpack-setup

https://github.com/glenjamin/webpack-hot-middleware


### Lerna tips

If you need to launch a command in all package modified since the last publishing:  
`lerna exec --since -- <command> [..args]`  
`\$LERNA_PACKAGE_NAME` variable can be used in the command or args (escaped with `\ `).

Add `--concurrency 1` argument for run the command in one package after another.

`--parallel` is the preferred flag for long-running processes such as `yarn build -w` run over many packages.  
(e.g. `lerna run --parallel build -- -w`)

### Troubleshooting

If publishing fails but bumping version works fine then you can run:  
`lerna exec --since -- yarn publish`
