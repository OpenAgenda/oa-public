# Installation

## Overview

The OpenAgenda project was not originally designed to be installed on client premises. It is a platform in evolution, finishing a codebase transition from php to nodejs. This installation procedure is marked by notes regarding these ongoing changes and how they will impact the procedure.

## Requirements

Needed to complete the installation.

### System

 1. ubuntu 14.04 LTS ( clean install with ubuntu as user with sudo access, 16GB storage available ) with an internet access
 2. A bitbucket account with access to OA repos ( accessible on a laptop connected to the internet )
 3. Access to npm account - required as long as repositories are not opensourced
 4. Have signed certificates handy. OR, an account on cacert.org - only required if certificates need to be signed during installation procedure
 5. A domain that points to the IP address of the server. The configuration of an http server is part of the procedure. If none is provided, the server should at least be accessible from the internet.

A note: Items 2, 3, 4 will be provided by OpenAgenda for test installation in client premises.

Installation procedure describes installation of mysql, redis, php, nodejs, elasticsearch 1.3 & 5.3 on an ubuntu 14.04 lts machine


### Third-party service accounts

#### Required services

Thes services are necessary for the platform to function

 * **AWS S3** : ( Monthly cost ~ 10€ ) - Static file/website hosting service. Images uploaded on the platform are stored on an s3 bucket.
 * **geocode farm** : ( Monthly cost ~ 100€ ) - Geocoding service. Used for localising locations when users type in their addresses during a location edit / create operation .
 * **mailgun** : an account key is required
 * **Google captcha**: ( Basic usage. Free ) Used for account creation. Prevents bots from creating accounts

#### Secondary services

These are not necessary but provide useful features to the platform users and administrators

 * **Iframely** : ( Monthly cost: ~ 20€ ) Service that provides a unified api to fetch oembed codes matching given multimedia content urls. Used for links placed in the description texts of events. [https://iframely.com/](website)
 * **Mapbox**: ( Low usage. Free ) Used for rendering static map images that are added to event email renders. [website](https://www.mapbox.com/)
 * **Logentries**: ( Monthly cost: ~ 40€ ) For logs. Provides a powerful logs search engine. [website](https://docs.logentries.com/docs/security)
 * **Sentry**: ( Low usage. Free ) For client logs. [website](https://sentry.io/privacy/)
 * **Pipedrive**: ( N/A ) For sales.
 * **Google analytics**: ( Basic usage. Free ) Site traffic statistics
 * **Google apps**: ( Basic usage. Free ) Used for authentication through a google account.
 * **Facebook app**: ( Basic usage. Free ) Used for authentication through a facebook account.
 * **Sendinblue**: ( 19€/month ) Tool for sending newsletters. Integration allows the integration of a newsletter input field for new subscribers
 * **Twitter account**: ( Free ) Used for authentication through a twitter account
 * **Bitbucket**: Free. ( with an access to the openagenda repo ): Git repo hosting service where all OpenAgenda repositories are stored. [website](https://bitbucket.org)
 * **Zendesk**: Helpdesk platform used for user support. Use is deprecated.
 * **Npm**: ( 7€ monthly ) An access to the [openagenda](https://www.npmjs.com/org/openagenda) organization is required in the event repos are not publicly available.

Account identifiers for thes services are to be set in the configuration files associated with this installation procedure.

### Data

A dump of the mysql database.

Script de récup pour les données
Script de récup des images

## Procedure

The procedure here is written to work for a user named 'ubuntu' with his home folder located under /home/ubuntu.

### Server configuration

Connect to the server with ssh using a sudoed account

Refresh registries and upgrade

    sudo apt-get update

Install php 5.5, nginx, mysql, redis, git, imagemagick

    sudo apt-get install nginx mysql-client php5-fpm php5-mysql php5-cli php5-imagick php5-gd php5-curl imagemagick redis-tools mysql-server git imagemagick redis-server

Install utilities

    sudo apt-get install unzip htop

Configure php 1: make the following changes to /etc/php5/fpm/php.ini

 * change memory limit: `memory_limit = 512M`
 * change max upload file size: `upload_max_filesize = 12M`

Configure php 2: make the following changes to /etc/php5/fpm/pool.d/www.conf

 * change listen: `listen = 127.0.0.1:9000`

Install [nvm](https://github.com/creationix/nvm)

    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

You will have to refresh your terminal environment

Install node

    nvm install 8 --lts

Install [yarn](https://yarnpkg.com/en/docs/install)

    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update && sudo apt-get install yarn

Install forever

    npm install -g forever

Install java

    sudo apt-add-repository ppa:webupd8team/java
    sudo apt-get update
    sudo apt-get install oracle-java8-installer

**Note (13/06/2019)**: the ppa has been discontinued following an oracle licensing change. OpenJDK install instructions are here: https://docs.datastax.com/en/archived/cassandra/3.0/cassandra/install/installOpenJdkDeb.html

    sudo add-apt-repository ppa:openjdk-r/ppa
    sudo apt-get update
    sudo apt-get install openjdk-8-jdk

    java -version


### Database

Load the database on the server

For this install, the database is hosted on the same server than the application. First load the dump onto the server.

Assuming the path of the dump is /home/ubuntu/oa.dump

Connect to mysql and create the database. We'll name it oa_geneve.

    mysql -uroot -p

    mysql> create database oa_geneve;
    mysql> exit

    mysql -uroot -p oa_geneve < oa.dump

### Elasticsearch 1.3

This is the legacy search index

Download and install Elasticsearch 1.3.4

    cd ~
    wget https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.3.4.deb
    sudo dpkg -i elasticsearch-1.3.4.deb
    sudo update-rc.d elasticsearch defaults 95 10
    sudo /etc/init.d/elasticsearch start
    rm elasticsearch-1.3.4.deb

Check if elasticsearch is running

    sudo /etc/init.d/elasticsearch status

Tweak configuration by following the [official documentation](https://www.elastic.co/guide/en/elasticsearch/reference/1.3/setup-configuration.html)

1. Change the heap size. On a dedicated ES server, half of available memory is recommended:

  Edit `/etc/init.d/elasticsearch`, uncomment the ES_HEAP_SIZE and adjust the value

2. Reduce swappiness

  Add `vm.swappiness=1` in `/etc/sysctl.conf`

When data is already loaded in Elasticsearch, the service may take a while to boot up before being operational ( particularly for write operations )


### Elasticsearch 5.3

Download the library:

    cd
    wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.3.0.tar.gz
    tar xvzf elasticsearch-5.3.0.tar.gz
    sudo mv elasticsearch-5.3.0 /usr/share
    rm elasticsearch-5.3.0.tar.gz
    sudo chown -R ubuntu:elasticsearch /usr/share/elasticsearch-5.3.0

Edit the configuration file:

    sudo chmod -R 554 /usr/share/elasticsearch-5.3.0/config
    sudo vi /usr/share/elasticsearch-5.3.0/config/elasticsearch.yml

To set the values:

```
path.data: /var/lib/elasticsearch-5.3.0
path.logs: /var/log/elasticsearch-5.3.0

http.port: 9205
transport.tcp.port: 9305

action.auto_create_index: false

http.cors.enabled: true
http.cors.allow-origin: "*"
```

Create log&lib folders:

    sudo mkdir /var/log/elasticsearch-5.3.0
    sudo chown ubuntu:elasticsearch /var/log/elasticsearch-5.3.0
    sudo chmod 775 /var/log/elasticsearch-5.3.0
    sudo mkdir /var/lib/elasticsearch-5.3.0
    sudo chown ubuntu:elasticsearch /var/lib/elasticsearch-5.3.0
    sudo chmod 775 /var/lib/elasticsearch-5.3.0


And phantom config folder, for some reason elasticsearch needs it but does not include it:

    cd /usr/share/elasticsearch-5.3.0/config
    sudo mkdir scripts && sudo chown elasticsearch:ubuntu scripts && sudo chmod 754 scripts

Run ES 5.3 as a process

    cd /usr/share/elasticsearch-5.3.0 && sudo -H -u elasticsearch bash -c './bin/elasticsearch -d -p /tmp/pid'



### Redis server

In case redis server is installed on a server different from the web servers, ensure it is configured to receive remote connections:

In `/etc/redis/redis.conf`

Replace

    bind 127.0.0.1

With

    bind 0.0.0.0

### OpenAgenda applications installation

Connect to [bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html#SetupanSSHkey-ssh2).
At this stage it is assumed that the account has access to OpenAgenda repositories.

    ssh-keygen
    cat ~/.ssh/id_rsa.pub

Add the key to your bitbucket account

Log on to npm and configure yarn

Ensure you are logged on to npm through the terminal.

    npm login --scope=openagenda

Username and password of npm account should be used at this stage

Yarn [does not integrate well with npm private repos yet](https://github.com/yarnpkg/yarn/issues/4157). We have to force it to use them with a command:

    yarn config set registry https://registry.npmjs.org/

Create a www directory

    mkdir www
    cd www

>> access bitbucket

Clone cibul-node, cibul-symfony and cibul-templates repos

    git clone git@bitbucket.org:openagenda/cibul-symfony.git
    git clone git@bitbucket.org:openagenda/cibulapi-symfony.git
    git clone git@bitbucket.org:openagenda/build.git
    git clone git@bitbucket.org:openagenda/oa.git

    mkdir tmp
    mv oa/packages/cibul-node ./
    mkdir tmp/front && mv oa/packages/cibul-templates tmp/front/cibul-templates
    rm -rf oa


Install node projects dependencies

    cd ~/www/tmp/front/cibul-templates && yarn && cd ~/www/cibul-node && yarn

Setup nginx links. These need to be absolute, adapt according to the current user home path.

    cp -r ~/www/build/nginx ~/www/nginx

    sudo ln -s /home/ubuntu/www/nginx/openagenda.com /etc/nginx/sites-enabled/openagenda.com
    sudo ln -s /home/ubuntu/www/nginx/api.openagenda.com /etc/nginx/sites-enabled/api.openagenda.com
    sudo ln -s /home/ubuntu/www/nginx /etc/nginx/cibul

Configure certificates: For the purpose of this install, we assume the name of the site will be "geneve.openagenda.com"
and we create a self-signed certificate.

    cd ~/.ssh
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout geneve.openagenda.com.key -out geneve.openagenda.com.crt

If CACert.org is to be used for signing the request, make sure you have registered your domain.

Create the certificate sign request ( csr )

    sudo openssl req -new -key geneve.openagenda.com.key -out geneve.openagenda.com.csr

Log on to CACert and post the csr. The signed certificate will be given to you on submission of the csr. Place it in the crt file in the .ssh folder.


Edit ~/www/nginx/openagenda.com and set the new certificate path

Update domain entries in the file.

Remove the final 301 section.

Restart the nginx process

    sudo service nginx restart



### OpenAgenda applications configuration

#### node.js application

Build frontend scripts

First edit the domain.js file in `www/tmp/front/cibul-templates` at the root of the project to specify the domain to be used. Then:

    mkdir ~/www/cibul-symfony/web/js/event
    sudo chown -R www-data:ubuntu ~/www/cibul-symfony
    cd ~/www/tmp/front/cibul-templates
    yarn && yarn build:prod
    rm -r ~/tmp

Copy the production configuration file: set all production values in the file `config/cibul-node.config.js` associated with this guide and place the file here `www/cibul-node/config/prod.js`


#### php application

The php application is being deprecated. It is built on top the symfony 1.4 framework and requires a functional node app to be running. The php legacy app relies on the nodejs app for authorization, logging and access to an increasing number of data configurations.

 * Copy the production configuration file: set all production values in the file `config/cibul-symfony.config.yml` associated with this guide and place the file here `www/cibul-symfony/config/app.yml`
 * Copy database configuration file: set db parameters in the file `config/symfony.db.yml` and place the file here: `www/cibul-symfony/config/databases.yml`
 * A cache folder must be write-accessible to the php user ( www-data ) at the path `/home/ubuntu/tmp/cibul-cache`. Likewise for logs, the path is `/home/ubuntu/tmp/cibul-log`. The path can be changed in the file `/config/ProjectConfiguration.class.php`.

#### php api application

 * Copy the production configuration file: set all production values in the file `config/cibulapi-symfony.config.yml` associated with this guide and place the file here `www/cibulapi-symfony/apps/frontend/config/app.yml`
 * Copy database configuration file: set db parameters in the file `config/symfony.db.yml` ( same file as before ) and place the file here: `www/cibulapi-symfony/config/databases.yml`
 * Cache and logs folders must be ready at the paths `/home/ubuntu/tmp/cibulapi-cache` and `/home/ubuntu/tmp/cibulapi-log` respectively


### Launch the application

Test the application by launching the following node command:

    cd ~/www/cibul-node
    DEBUG=oa:* NODE_ENV=production node --max_old_space_size=3072 server.js web admin task

Start the application using forever:

    cd ~/www/cibul-node
    NODE_ENV=production forever start -c "node --max_old_space_size=3072" server.js web admin task

Prepend with `DEBUG=oa:*` if you wish to see logs in the forever log file

Check that the process launched properly:

    forever list

### Initialisation of search indices

There are currently 3 different index types used: a unique legacy index, the agendas index and agenda location indices. The agendas rebuilds itself daily through a background task when the task part of the node app is left running, the other two need to be manually indexed.

##### Legacy Elasticsearch index

Currently, agenda events are all referenced in a unique elasticsearch index ( ES v1.3 ). This index must be rebuilt from scratch at first. This operation takes a while and is a task that is launched when the node application is started if the following line of the app.js file is uncommented in the section dedicated to tasks:

    require( './services/elasticsearch' ).resync( { reset: true }, ( err, res ) => { ... } );

Uncomment the line and launch the process as described in the previous section - make sure the 'task' argument is explicited

##### Location indices

There is one index per agenda. Existing agendas need their location index rebuilt before they can be used. These are used on the event form for loading up location suggestions. These need to be initialized for each agenda:

If the location admin page of the agenda is {agenda}/admin/locations, add /resync at the end: {agenda}/admin/locations/resync

At this stage configure your dns zone file so that they point to the IP of the server.


### Defining super-administrators

Superadministrators are users that can do management operations from a specific administration UI, found at /admin/agendas and /admin/users

To change them, pick the id references in the user table of the database, set them in the `lib/common-apps.js` file, in the requireAdmin function.

### Troubleshooting

#### Elasticsearch

Check the status of your elasticsearch cluster with:

    curl -XGET localhost:9200/_cluster/health

The following returns high level aggregation and index level stats for all indices:

    curl localhost:9200/_stats

Specific index stats can be retrieved using:

    curl localhost:9200/index1,index2/_stats

Make it prettier with `sudo apt-get install httpie`:

    http localhost:9200/cibul/_stats/docs

https://www.elastic.co/guide/en/elasticsearch/reference/1.3/indices-stats.html

#### PHP

The legacy php app may be causing trouble or throwing 500 errors. In production symfony 1.4 does not by default produce log files. These are helpful in these cases. They can be enabled like so:

In frontend/config/factories.yml:

replace:

      prod:
        logger:
          class:   sfNoLogger
          param:
            level:   err
            loggers: ~

with

      logger:
        class: sfAggregateLogger
        param:
          level: debug
          loggers:
            sf_web_debug:
              class: sfWebDebugLogger
              param:
                level: debug
                condition:       %SF_WEB_DEBUG%
                xdebug_logging:  true
                web_debug_class: sfWebDebug
            sf_file_debug:
              class: sfFileLogger
              param:
                level: debug
                file: %SF_LOG_DIR%/%SF_APP%_%SF_ENVIRONMENT%.log

and set `debug_enabled` to true in `frontend/config/settings.yml`

In the root of the sf project, run `php symfony cc` to clear the cache. The app will now generate logs in `~/tmp/cibul-logs` as php-run pages are loaded

Otherwise, the nginx log can provide useful information: `/var/logs/nginx/errors.log`

### Guidelines for fetching images from S3

Images displayed on event, agenda and user pages are stored in S3. Their names are stored in the respective object tables:

 * agenda -> review table, image field
 * user -> user table, image field
 * event -> event table, image field

Agenda images have 2 variant. One for the main image, the other for thumbails: these keep the same name and are prefixed with 'rwtb'

Event images have 3 variants: the original is prefixed with evf, the standard display has the name as specified in the 'event.image' field, the thumbnail is prefixed with evtb.

An example:

    https://cibul.s3.amazonaws.com/event_manege-allee-sainte-lucie_108_483345.jpg

Thumbnail and full:

    https://cibul.s3.amazonaws.com/evtbevent_manege-allee-sainte-lucie_108_483345.jpg
    https://cibul.s3.amazonaws.com/evfevent_manege-allee-sainte-lucie_108_483345.jpg

3 loops ( review, user and event ), with 2 fetches for agendas, 1 for users and 3 for events. Images are optional and fields are at null when no image is associated.


### Tweaking the email application

If mails cannot be sent with smtp, a configuration change can be brought in config/prod.js for the mails service of the node app:

    mails: {
      transport: {
        pool: true,
        host: 'smtp.mailgun.org',
        port: 465,
        secure: true,
        auth: {
          user: 'username',
          pass: 'password'
        },
        maxMessages: Infinity,
        maxConnections: 1,
        rateLimit: 14,
        rateDelta: 1000
      }
    }

The mails service provides a detailed documentation to change the configuration: [https://github.com/Oagenda/mails#configuration](https://github.com/Oagenda/mails#configuration)


## References

 * Elasticsearch installation: https://www.elastic.co/guide/en/elasticsearch/reference/1.3/setup.html


## Changelog

 * 24/08 - details on initialisation of search indices after install, troubleshoot tips for php app, superadmin definition, guidelines for writing a thorough download script for event, agenda and user images, changing the email service, this changelog
 * 05/08 - redis server configuration details in case of remote, troubleshoot info for elasticsearch 1.3
