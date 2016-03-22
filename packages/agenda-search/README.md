# Overview

This projects offers search for agendas. It uses server side react rendering for the first page load ( for SEO as this is a public page ), then the frontend react app takes over once things are running.

Before anything, make sure you have npm -g installed the following:
  
  * https://www.npmjs.com/package/babel-cli
  * https://www.npmjs.com/package/babel-preset-es2015
  * https://www.npmjs.com/package/babel-preset-react

Configure your testconfig.js file and save it at the root of the project - it will be used by the test app - a sample is provided at the bottom of this readme.

Check you have elasticsearch installed. The tested version for this app is 1.3.4

Then, install:

    npm install

And launch:

    npm start

check http://localhost:3000


npm start will launch a watch script that will babelify scripts as you save your changes

# Structure

services/index exposes the lib features:

  * init: init the configuration of the service ( see details below )
  * list: list agendas indexed in elasticsearch ( reference for reads )
  * rebuild: rebuilds elasticsearch index from db data
  * mw: exposes middleware
    * init: inits middleware lib with service config
    * list: agenda list middleware; if not xhr, generates react html content and puts it in req.content. If xhr, returns agenda data in json form

components contains src jsx files and regular ES5 built files. Plus a couple of helpers.


# Writing rules

As always: https://github.com/rwaldron/idiomatic.js/


# Init

for testing the app, you need to save testconfig.js at the root of the project. Here is a sample:

"use strict";

module.exports = {
  mysql : {
    host : '127.0.0.1',
    database : 'atestdb',
    password : 'thetestdbpassword',
    user : 'testdbuser'
  },
  schemas : {
    agenda: 'agenda',
    occurrence: 'occurrence',
    agendaEvent: 'agenda_event'
  },
  elasticsearch: {
    host: 'localhost:9200',
    log: [ {
      type: 'stdio',
      level: [ 'error', 'warning' ]
    } ],
    apiVersion: '1.3',
    timeout: 30000
  },
  mw: {
    limit: {
      default: 20,
      max: 100
    }
  },
  image: {
    path: '//cibul.s3.amazonaws.com/',
    default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  }
}