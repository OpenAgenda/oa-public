# MEP (Mise En Production)
## Overview

This package deploys OpenAgenda on Jelastic PAAS

The App is deployed accross two environments: one for the cibul-node application in "task" mode, the second for the internet-accessible apps. That second environment comprises of 4 sub-groups: 

1. nginx: forwards requests to one of the remaining 3 subgroups, depending on the accessed url
2. web: runs the cibul-node app in "web" and "admin" modes
3. api: runs the cibul-node app in "api" mode
4. next: runs the next app, which connects to the web app for data

## Configuration

The following environment variables are required for the run to work:

 * **JOB_DIR**: where the rendered config files and the built app files are to be placed prior to them being loaded in the target environments
 * **JELASTIC_SSH_KEY**: required to SSH to jelastic environments to transfer files and run ssh commands
 * **JELASTIC_ACCESS_TOKEN**: required to query the Jelastic API to get node names, group names, etc...
 * **ENV_FILE_PATH**: location of the JSON file containing all values required for the app to run
 * **NPM_TOKEN**: required for downloading @openagenda node_modules
 * **OA_PUBLIC_LOCKFILE**: set to yarn.lock
 * **CLOUDFRONT_DISTRIBUTION_ID**: required to push assets to cloudfront
 * **FONTAWESOME_NPM_AUTH_TOKEN**: required to fetch Fontawesome assets
 * **WEB_ENV_NAME**: name of the web apps environment
 * **TASK_ENV_NAME**: name of the task app environment

Make sure you have the rights to git clone the main oa repo. The jelastic ssh key can also be used for that purpose. Load it by running the following commands:

    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/thejelasticprivatekey

Source: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

Create a `.yarnrc.yml` file in the home folder containing the following:

```
npmRegistries:
  //registry.npmjs.org:
    npmAuthToken: "${NPM_TOKEN}"
```

The current working directory should be the one where the run script is located:

```
cd pathtothispackage
RUN_ALL=1 node run.mjs
```

## Steps

There are three.

### Build

Can be singled out by setting **RUN_BUILD** to 1.

Downloads the project and builds it in the job directory (in an "oa" subfolder)

### Upload

Rsyncs the built project in the 3 web subgroups and the task environment and restarts pm2. Each rsync operation can be targetted by setting either of the following environment variables to 1: **RUN_UPLOAD_TO_WEB**, **RUN_UPLOAD_TO_API**, **RUN_UPLOAD_TO_NEXT**, **RUN_UPLOAD_TO_TASK**

### Nginx

Prepares the Nginx files taking into account the environment state, uploads them and reloads the nginx process in each of the node-groups nodes.