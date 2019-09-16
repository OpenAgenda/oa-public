# Overview

Find your way in the OpenAgenda code


# Table of Contents

This document is a work in progress. Here are the main sections:

 * Integrating application
 * Symfony legacy
 * Services ( common crud, testing )
 * Agenda
 * Aggregation
 * Integration
 * Coding Rules
 * Repositories & build processes
 * Production servers
 * Locations
 * Files & Images
 * Error handling
 * Projects
 * Installation


# Launch ssh of an ec2 instance

## Installation

  1. Install `aws` with `pip` (python)
  2. Create an user and/or keys on https://aws.amazon.com/fr/iam/
  3. Run `aws configure`
  4. Add this script in your home directory (`ssh-ec2`):

```js
#!/usr/bin/env node
'use strict';

const spawn = require( 'child_process' ).spawn;
const { exec, execSync } = require( 'child_process' );
const options = {
  encoding: 'utf8'
};
const instanceName = process.argv[2];

const cmd = `aws ec2 describe-instances --filters "Name=tag-value,Values=${instanceName}" --query "Reservations[*].Instances[*].[PublicIpAddress,KeyName]"`;

const ipResult = JSON.parse( execSync( cmd, options ) );

if ( !ipResult.length ) process.exit();

const [ ip, key ] = ipResult[ 0 ][ 0 ];

/*************/

console.log( `ssh -i ${require('os').homedir()}/.ssh/${key}.pem ubuntu@${ip}` );
```

  5. Add this alias in your `.bashrc` or `.zshrc`: `alias ec2='f() { eval $($HOME/ssh-ec2 $1) };f'`
  6. Use `ec2 janine` for lauch a ssh terminal on janine instance


# Integrating application


## A little bit of context

Originally, the first version of the project ( before the spinoff Cibul/OpenAgenda ) was written in php symfony 1.4. Since then symfony has moved on, php has moved on too, but some functional blocks are still handled by the symfony project. These are:

 * the events list view in the connected user's home
 * the events list view in an agenda administration page
 * the creation, edition and deletion of events
 * in-app messaging
 * the 'notifications' tab in the connected user's home
 * the integrated agenda configuration pages

A technological shift was made in 2014 to start using node.js for new features. Since then webservers host both a php app and a nodejs one. A first level routing is ensured by a local nginx configuration. The nodejs project started of with 3 transverse blocks, each tested and maintained in their own repository:

 * cibul-model: an interface library to the primary db
 * cibul-templates: a templates library to facilitate templating independently from other functional blocks
 * cibul-node: The integrating application containing the web application ( express-based ) and controller logic ( with authentication, authorization )

'Servicification' happened first within cibul-node later in 2014, and then externally starting in mid 2015


## Integration of services

The cibul-node project integrates the OpenAgenda project on the node-js side and provides logging and support features to the legacy php application. The configuration of the app is distributed to all service modules at the app launch using their ```.init``` endpoints.

This initialization, together with any service interfacing logic is explicited in the flat files and folder structure in the services/ root folder of ```cibul-node```.

### Details on the service initialization process

The ```services/init.js``` script will list all files and folders found in the ```services``` folder and will require each one of them ( folders in ```services/``` must contain an index.js file ), calling in every case an optional ```.init``` function to give them the app configuration object. These initialization functions can either be syncronous - in which case they take one argument for the config, or asyncronous, where they need 2 arguments: the configuration and a callback.

Legacy in-app services do not have an .init function and are explicitly marked as .initless. These will progressively be deprecated.

For other services, initialization and interfacing can be defined in a single file as long as interfacing is light. As interfacing becomes heavier, it is easy to break files within a folder with one main index.js file for passing configuration and one file per interface. See ```services/members/index.js``` for an example of a complete initialization/interface configuration of an external service.



# Symfony legacy

The php app sends system events to the node app through 2 channels:

 * redis
 * /legacy node app endpoint

## /legacy endpoint

Important reminder: in order to avoid having the php app hang and wait for a response from nodejs, the  first thing any controller should do in /legacy is to send back a response. Unless of course some processing result is needed by the legacy php app.

    ( req, res, next ) => {

      res.send( 'ok' );

      // do more stuff here.

    }

Importanter reminder: if node does not respond to php request, it will progressively hog php processes leading to 502 errors on php web apps


## Controllers

#### Redirection to authentication

Authentication menus are served by node process. A method can be used to verify if user is authenticated and redirect to signin screen with return redirect if the user is not signed in. In the controller where this must be done, just add the following:

    $this->nodeAuth( $request );

This is illustrated in `conversation/actions.class.php` in the `executeNew` action.



# Services

A Service is a library that has a well-defined and easy to understand functional role in the platform. It is responsible over its own storage, business logic and test suite.

## Common CRUD operations

### List

List operations are used to fetch a list of objects handled by a given service. By default, data retrieved through a list operation should be lightweight and public. A list function should have the following arguments:

    service.list( query, offset, limit, [ options ], [ cb ] )

 * **query**: used to return a subset of objects
 * **limit & offset**: used to get a segment of the result set. These are not systematically offset and limits but can depend on the data model used. The key requirement is to limit the size of results
 * **options**: optional options object ( details about this given below )
 * **cb**: callback for result of list. If list returns a promise, no callback is required.


## Testing

In a repository, test files are to be located in a test folder.

The following tools are commonly used for testing: mocha ( or jest ) & should.

Naming test files:

Tests should be distributed among files depending on their focus. File names should describe the tested functions / features.

A file name stares with a double digit number, uses underscore as a separator;

Name example: test/03_update.js

Both jest & mocha test suites group tests by describe statements. These are labeled according to the feature/function tested, wether the test is a unit test or functional and wether the tested feature is iso, server-run, or client run:

    {serviceName} - {unitOrFunctional} ({runEnv}): {nameOfFeature}

Example: 'images - unit (server): resize'


## Initialization of a service development environment




# Agenda

## Configuration

### Contact link

By default, the contact link on the agenda page addresses a OA message to administrators and moderators. This can be reconfigured by specifying a list of roles in the agenda store field:

```
{
    ...
    "contact" : [ "administrator", "moderator" }
    ...
}
```


### Contribution

 * **moderators**: set moderators.canPublish to false in agenda store to remove right of moderators to publish events. Example: `{"moderators":{"canPublish":false}}`


### Customizing the event form

Some discrete configurations can be brought to the event form through a json configuration located in the agenda store. That configuration takes the form of a list set under the "form.fields" key of the store with each item of the list specifying the configuration of a specific field.

Example:

```js
{
  "form": {
    "fields": [
      {
        "name": "timings",
        "defaultWeek": "2017-03-13T00:00:00Z"
      },
      {
        "name": "longDescription",
        "placeholder": {
          "fr": "du texte qui va dans le champ",
          "en": "some text that goes inside the field"
        }
      }
    ]
  }
}
```

#### Possible field configurations:

 * timings, "defaultWeek" key: sets the default displayed week. Set a day of the week to display. Does not prevent the user to define timings outside that week.
 * timings, "activeDays" key: defines which days can take timing inputs. Several periods of days can be defined. Example: `{"name":"timings","activeDays":[{"startDate":"2016-09-16","endDate":"2016-09-23"}]}`
 * ( keywords, age ) - display: set to false to hide the field
 * keywords: label, placeholder - multilingual text
 * longDescription, placeholder or label: multilingual text to change the placeholder or label
 * description, label: multilingual text to change the label of the description field
 * description, **fixed**: preset a value and hide the field. Must be multilingual.
 * title, label: multilingul text to change the label of the title field
 * title, placeholder: same for the placeholder
 * image, info: multilingual text
 * conditions, label: multilingul text to change the label of the title field
 * conditions, placeholder: multilingul text to change the placeholder of the title field


### Agenda location settings

Agenda location have their own settings record in a table named 'location-agenda-settings'

#### Setting a default country code

By default, the country code displayed in a location form is Metropolitan France. This can be changed by setting a value in the location settings store: `defaultCountryCode` will take a 2 letter country code ( example: CH for switzerland ).


### Custom fields ( legacy )

Custom fields can be defined in the `customFields` key of the agenda store.

Possible types are: integer, text, textarea, number, url, email, image, multichoice, select, radio, checkbox
 
The configuration is a list of field definitions, each with the following key:

 * **name**: the name of the field as it will appear in keyed data representation ( like the json export for example )
 * **fieldType**: the type of the field. One of the possible types given above
 * **type**: public (default) or private. Public fields will be viewable to all users, private fields will be visible to agenda administrators and moderators only
 * **optional**: true or false. true by default.
 * **max**: the maximum size when it is applicable
 * **label**: language code keyed object for the label displayed above the field. Keys should be at least 'fr' and 'en'.
 * **placeholder**: same as label, but for the placeholder
 * **options**: for select, multichoice, radio field types. A list with each item being an object with label ( multilingual ) and value keys.

 An example:

```js
{
  "customFields": [
    {
      "name": "organizertype",
      "fieldType": "multichoice",
      "type": "public",
      "optional": false,
      "label": {
        "fr": "Type d'organisateurs",
        "en": "Organizers type"
      },
      "options": [
        {
          "label": {
            "fr": "Association / Fondation",
            "en": "Association / Foundation"
          },
          "value": "association"
        },
        {
          "label": {
            "fr": "CCI / Chambre des Métiers et de l'Artisanat",
            "en": "Chamber of professions and craftsmanship"
          },
          "value": "cci"
        },
        {
          "label": {
            "fr": "Centre de recherche",
            "en": "Research center"
          },
          "value": "recherche"
        }
      ]
    }
  ]
}
```

Available types include:

 * **file**: pdf only.

     {
        "name": "somepdf",
        "fieldType": "file",
        "extension": "pdf",
        "type": "public",
        "label": {
          "fr": "Charger un pdf, n'importe",
          "en": "Load a pdf, any pdf"
        },
        "info": {
          "fr": "Parce qu'on peut charger des fichiers maintenant",
          "en": "Because we can load files now"
        }
      }


# Aggregation

## Aggregation rules

These can be set either at the level of the aggregator ( aggregator.store json, rules key ) or at the level of the source ( aggregator_source.store json, rules key )

When they exist at both levels, they are concatenated. Aggregator rules first, source rules second

Rules come as lists and define wether an event evaluated for aggregation should be aggregated or not. If all evaluations of a list of rules pass, the event is aggregated.

Each item ( a rule ) is an object comprising of a query key and value key.

 * **query**: an object that is tested against the event values to define wether the event passes or not. If no query is defined in the rule, it automatically passes
 * **value**: the rule evaluation returns the list of passing rule values. If no value is specified, null will be returned for the passing rule. Returning values can impact how the event is aggregated. For the time being, only state key is considered and define what state the event should take at the moment of the aggregation.

### Examples

Say an aggregator has the following rules

    [ {
      query: {
        tags: [ 'Tag1' ]
      }
    }, {
      value: {
        state: 0
      }
    } ]

And one of its source has the following rule:

    [ {
      query: {
        customFieldOne: true
      }
    } ]

If the following event is evaluated for aggregation:

    {
      tags: [ 'Tag2' ]
      customFieldOne: false
    }    

It will not pass as the first rule of the aggregator is not matched

The following event..

    {
      tags: [ 'Tag1' ],
      customFieldOne: true
    }

... on the other hand will pass and be aggregated. As the second rule of the aggregator specifies a state 0 ( to be completed ), the event will be added to the aggregator with that state.



# Integration

## Customizing an integrated agenda

Web integration views can be fully customized using a template engine inspired from the tumblr template language. [See the repo](https://bitbucket.org/openagenda/tumblr-parser)

To enable this, a feature needs to be activated: 'Customize embed templates'

Two views can be customized:

 * the agenda view: the customizable part is the event item as it appears in the iframe
 * the event view: when an event item from the list is clicked

Each view has its base template and base data mapping, both of which can be found in the cibul-node project under the embeds in-app service.

Custom fields are not part of the default mapping so any requirement to embed custom fields in an embed view needs the default mapping of either the event view or event item view to be copied and extended. The extended version is to be placed in the embed db record.

See the agenda https://openagenda.com/equipauto for an example.


# Mailer

In development environment, [mailcatcher](https://mailcatcher.me/) is used to visualize mails. Once installed, run it with the command `mailcatcher start`. It is not compulsory to have it running when running the main node app in development. 


# Coding rules

When coding on a repository for OpenAgenda, the following rules apply: https://github.com/rwaldron/idiomatic.js/

With the following variations:

 * Unnamed functions take spaces before and after arg parenthesis: `function () { ... `
 * Indent with two spaces. Even in html.
 * promise flows are indented after the opening promise function
 * functions internal to a module have their names starting with and underscore: ```_internalFunction```
 * Build only client scripts. ISO scripts should be written to be used as is by node

## HTML

 * As a convention, anchors to attach javascript application on server-rendered are snake-cased, `js_` prefixed classes. For example: `<button class="btn btn-defaul js_do_stuff_here"></div>`

#Repositories & build processes

## Setting up a development environment

### About node-sass

The node-sass module includes a time-consuming build that slows down library installations significantly. To avoid having to wait too long everytime a repo with a node-sass dependency has to be upgraded, the module can be linked globally on the dev environment. Follow this: https://github.com/sass/node-sass#rebuilding-binaries

    

## Naming conventions

 * service repositories: plural.
 * repo grouping front applications which are focused on the presentation of a service: <singularnameoftheservice>-apps
 * names are smallcased, with dashes used for word separation. ex: member-apps or agenda-docx
 * requires are made at the beginning of a file, grouped by origin: first external references, second openagenda repos, third and last the current repo requires. Second degree order is alphabetical ( [reference](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md) )

## Building process

All repositories are stored on bitbucket and most are referenced in a private npm project.

### Referencing a repo on npm

See installation procedure section for logging on to npm and configuring yarn.  The oa account is for now a single account named 'gaetanlatouche', credentials are available in the technical keepass

Now for a repo: change the package name by pre-fixing it with the npm org name:

    {
      "name" : "@openagenda/yourbasereponame"
    }

Do not set private to true.

With npm comes a stricter version control mechanism. Minor and major versioning needs to be setup and the following scripts integrate version bumping in the usual git workflow. Add those scripts to the scripts section of the repo package.json file:

    "preversion": "npm test", # only for repose with tests
    "version": "npm run clean && npm run build && git add -A lib", # only for repos with builds
    "postversion": "git push origin && git push origin --tags",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish",
    "release:next": "npm version prerelease && npm publish --tag next" # very optional.

Commit your changes as usual and instead of pushing the changes to the bitbucket repo with a `git push` command, use the script matching the scope of the change. Most of the time, changes are patches and the command following the commit should be:

    yarn release:patch

Note: if the process fails during the publish step, do not relaunch the command but rather run ( avoid running the npm version command again to bump versions a second time ):

    yarn publish # sends the latest version on npm, npm publish works too
    git push

Not all files are useful on npm. Create an `.npmignore` file with the following content

```
.idea/

.npmignore

node_modules/

package-lock.json
yarn.lock

npm-debug.log
yarn-error.log

# sources are useless in npm package
src/
.babelrc
.tmp/
test/
!test/service/
!test/fixtures/
```

Add and commit all changes.

Do a first major release:

    yarn release:major # or npm run release:major


# Production servers

## Running the web node process

In production, the node process manager **forever** is used. The command requires an explicit environment and needs to take the list of application sections to be executed. These can be:

 * web: all parts of the application used by a web server are loaded
 * admin: all parts used by the super-administration are loaded
 * task: worker processes are launched.

Typically, before the process is launched, it is useful to check if there isn't one that is already running

    forever list

If there isn't, on a web server the commands would be:

    cd /home/ubuntu/www/cibul-node && NODE_ENV=production forever start -c "node --max_old_space_size=3072" server.js web admin

For a worker server, replace the 'web admin' part with 'task'



## Logging

Logentries is used for monitoring and querying logs.

## Troubleshooting

### Monitor processor usage

The following allows to generate a report giving statistics on processor cycle usage. This is very useful to find out what part of a node.js app is hogging resources. This proved useful at least twice in the history of OA to identify a Redos vulnerability in a validation library.

Here is an article laying out the procedure in a nutshell: https://nodejs.org/en/docs/guides/simple-profiling/

And in very short:

 * On a server, the app should be launched with a --prof option to start the profiler.
 * Once the app has run for a while, stop it ( and relaunch it normally if need be ). You'll see new log files added to the current directory.
 * Execute the prof process on any of the generated log files to get a recap: ```node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt```

### data exports over-usage

At the time this is written, json exports represent the main load on the servers. Cache is in place to optimize recurring queries, but this is not useful for scripts using the json exports to fetch the content of entire agendas in one go. These are easy to identify on logentries logs: loops will be seen on urls ending with /events.json with offset increasing progressively.

## Miscellaneous

 * node process ( max_old_space_size ) - avoid heap allocation overflows by specifying a larger memory size for nodejs: http://stackoverflow.com/questions/26094420/fatal-error-call-and-retry-last-allocation-failed-process-out-of-memory


# Locations

## Geocoding

Sometimes the geocoder service gives bad information. The following queries fix some of those errors by resetting values based on references.

    update location set region='Auvergne-Rhône-Alpes' where country = 'FR' and department='Ardèche';
    update location set region='Auvergne-Rhône-Alpes' where country = 'FR' and department='Métropole de Lyon';
    update location set region='Auvergne-Rhône-Alpes' where country = 'FR' and department='Drôme';
    update location set region='Auvergne-Rhône-Alpes' where country = 'FR' and department='Isère';
    update location set region='Auvergne-Rhône-Alpes' where binary region='Auvergne-Rhone-Alpes';
    update location set region='Auvergne-Rhône-Alpes' where country = 'FR' and department='Savoie';
    update location set region='Auvergne-Rhône-Alpes' where country = 'FR' and region='Auvergne';
    update location set region='Auvergne-Rhône-Alpes' where region = 'Rhone-Alpes';

    update location set region='Bourgogne-Franche-Comté' where region like '%Bourgogne%' and region <> 'Bourgogne-Franche-Comté';
    update location set region='Bourgogne-Franche-Comté' where region = 'Burgundy-Franche-Comte';
    update location set region='Bourgogne-Franche-Comté' where country = 'FR' and department='Yonne';
    update location set region='Bourgogne-Franche-Comté' where region = 'Franche-Comté';

    update location set region='Bretagne' where region='Brittany';
    update location set region='Bretagne' where region='Britanny';
    update location set region='Bretagne' where country = 'FR' and department='Finistère';

    update location set region='Centre-Val de Loire' where country='FR' and region='Center';
    update location set region='Centre-Val de Loire' where country='FR' and region='Centre';
    update location set region='Centre-Val de Loire' where country='FR' and region='Centre-Val deLoire';

    update location set region='Corse' where region='Corsica';

    update location set region='Grand Est' where region like '%Alsace%' or region like '%Champagne%' or region like '%Ardenne-Lorraine%';
    update location set region='Grand Est' where region = 'Lorraine';
    update location set region='Grand Est' where region = 'Picardy';
    update location set region='Grand Est' where country = 'FR' and department='Ardennes';
    update location set region='Grand Est' where country = 'FR' and department='Haute-Marne';

    update location set region='Guadeloupe', department='Guadeloupe' where country='GP' and ( region <> 'Guadeloupe' or department <> 'Guadeloupe' );
    update location set region='Guadeloupe' where country = 'FR' and department='Guadeloupe';

    update location set region='Hauts-de-France' where region like '%Picardie%' or region like '%Pas-de-Calais%';
    update location set region='Hauts-de-France' where country = 'FR' and department='Nord';
    update location set region='Hauts-de-France' where country = 'FR' and department='Pas-de-Calais';

    update location set region='Île-de-France' where region='Idf';
    update location set region='Île-de-France' where region='IdF';

    update location set region='La Réunion' where region='Réunion';
    update location set region='La Réunion', department='La Réunion' where country='RE' and ( region<>'La Réunion' or department <> 'La Réunion' );

    update location set region='Normandie' where country = 'FR' and department='Calvados';
    update location set region='Normandie' where country = 'FR' and department='Eure';
    update location set region='Normandie' where country = 'FR' and department='Seine-Maritime';
    update location set region='Normandie' where country = 'FR' and region='Lower Normandy';
    update location set region='Normandie' where country = 'FR' and region='Normandy';

    update location set region='Nouvelle-Aquitaine' where region like '%Aquitaine%' or region like '%Limousin%' or region like '%Poitou-Charentes%';
    update location set region='Nouvelle-Aquitaine' where country = 'FR' and department='Dordogne';
    update location set region='Nouvelle-Aquitaine' where country = 'FR' and department='Lot-et-Garonne';
    update location set region='Nouvelle-Aquitaine' where country = 'FR' and department='Pyrénées-Atlantiques';
    update location set region='Nouvelle-Aquitaine' where region = 'Aquitaine';

    update location set region='Occitanie' where country = 'FR' and department='Aveyron';
    update location set region='Occitanie' where region like '%Languedoc%' or region like '%Roussillon%' or region like '%Midi-Pyrénées%';

    update location set region='Pays de la Loire' where country='FR' and region='Loire Region';
    update location set region='Pays de la Loire' where region='Loire region';
    update location set region='Pays de la Loire' where country='FR' and region='Pays-de-la-Loire';

    update location set region='Provence-Alpes-Côte d\'Azur' where binary region='Provence-Alpes-Cote D\'Azur';
    update location set region='Provence-Alpes-Côte d\'Azur' where binary region='Provence-Alpes-Côte d\’Azur';
    update location set region='Provence-Alpes-Côte d\'Azur' where country = 'FR' and department='Alpes-Maritimes';
    update location set region='Provence-Alpes-Côte d\'Azur' where country = 'FR' and department='Bouches-du-Rhône';
    update location set region='Provence-Alpes-Côte d\'Azur' where region = 'PACA' and country='FR';


    update location set department='Ardèche' where department='Ardeche';
    update location set department='Isère' where department='Isere';
    update location set department='Corrèze' where department='Correze';
    update location set department='Côte-d\'Armor' where department='Cote-d\'Armor';
    update location set department='Finistère' where department='Finistere';
    update location set department='Alpes-Maritimes' where department='Maritime Alps';
    update location set address = replace( address, 'Nord-Pas-de-Calais-Picardie', 'Hauts-de-France' ) where address like '%Nord-Pas-de-Calais-Picardie%';
    update location set address = replace( address, 'Languedoc-Roussillon-Midi-Pyrénées', 'Occitanie' ) where address like '%Languedoc-Roussillon-Midi-Pyrénées%';
    update location set address = replace( address, 'Aquitaine-Limousin-Poitou-Charentes', 'Nouvelle-Aquitaine' ) where address like '%Aquitaine-Limousin-Poitou-Charentes%';
    update location set country='FR' where country <> 'FR' AND region = 'Auvergne-Rhône-Alpes';
    update location set country='FR' where country <> 'FR' AND region = 'Provence-Alpes-Côte d\'Azur';
    update location set city='Saint-Malo' where country='FR' and city in ( 'St-Malo', 'Saint Malo' );
    update location set country='MQ' where region='Martinique' and ( country is null or country='' );
    update location set country='RE' where region='La Réunion' and ( country is null or country='' );
    update location set country='FR' where region in ( 'Bourgogne-Franche-Comté', 'Bretagne', 'Grand Est', 'Île-de-France', 'Normandie', 'Occitanie', 'Hauts-de-France', 'Centre-Val de Loire', 'Pays de la Loire', 'Nouvelle-Aquitaine' ) and ( country is null or country = '' );
    update location set city='Bruxelles' where city='Brussels' and country='BE';
    update location set city='Bruxelles' where city='Brussel' and country='BE';


# Files and Images

Files and images are stored in buckets hosted by amazon aws.

## Naming

This depends on the type of object the image is associated with.

The first method consists in generating a name that can be generated based on the related object. The advantage of this method is that given an object data, the name of the image can be directly guessed. The limitation is that upon creation, a temporary version of the image must be generated as the object is not yet existing when the data is being input.

The second method consists in generating a random name with elements that depend on the object typology and the image variant. Name of images need to be stored in objects and cannot be guessed based on object data. On the other hand, the iamge can be directly stored in its final destination when an object is being created. Garbage images will occasionnally be stored ( images that are not associated with any object ), but this should a minimal occurrence.

### Events

Naming is done based on the type of object, the image variant and the slug of the object.

    {variant}{type}_{slug}.jpg

An example: 

    https://cibul.s3.amazonaws.com/event_alison-sykes-gardens_747125.jpg

The same, thumbnailed, then in full:

    https://cibul.s3.amazonaws.com/evtbevent_alison-sykes-gardens_747125.jpg
    https://cibul.s3.amazonaws.com/evfevent_alison-sykes-gardens_747125.jpg

### Agendas, Users

Naming is based on the type of object and its unique identifier:

    {variant}{type}{uid}.jpg

Note: for users ( profile ), there is no variant of the image.

An example:

    https://cibul.s3.amazonaws.com/profile7339049.jpg
    https://cibul.s3.amazonaws.com/agenda71517239.jpg
    https://cibul.s3.amazonaws.com/rwtbagenda71517239.jpg

### Custom images

For custom images, the variant is simply the name of the custom field. Here a random hash is used to avoid having to store the image in a temporary location.

    {randomhash}.{variant}.{objecttype}.jpg

### Random hash generation

v4 of this, stripping out dashes: https://www.npmjs.com/package/uuid


# Error handling

Some random guidelines:

 * use verror when passing on errors

Each service is subject to errors. When these occur, three scenarios arrise:

1/ The error is not handled by the service. In that case, the integrating app catches it through the in-app service `errors`. The error will be visible in logentries

2/ The error is handled by the service. A service interface can be used to pass on the error to the integrating app: `.onError`, defined at service initialization. The in-app errors service exposes a function taking a namespace and the error to log it in the proper place ( logentries ).

3/ The error is asynchronously passed to a queue from the queue repository. This queue can be initialized with an onError callback which can be plugged to the in-app error service.


# Projects

## Ministry of culture

At the end of projects, they ask for a report distributing contribution over regions and cities, often over several agendas. The following request fetches that:

    select r.slug as agenda, l.city as 'commune', count( el.id ) as contributions
    from location as l
    left join event_location as el on el.location_id=l.id
    left join review_article as ra on el.event_id=ra.event_id
    left join review as r on r.id=ra.review_id
    where ra.review_id in ( 8939 )
    group by r.slug, l.city
    having contributions > 0
    order by contributions desc


# Installation

See installation.md file
