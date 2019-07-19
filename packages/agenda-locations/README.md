# Overview

App for editing locations of an agenda

Also hosts a picker for selecting a location in a form

run on localhost:3000 with: node test/app

That will load up fixture data and show the location admin menu and the location selector

# Testing

run tests with mocha

    mocha

## Test configuration

Edit a testconfig.js at the root of this project with configuration to your db, elasticsearch, paths. Example of content:

    module.exports = {
      elasticsearch: {
        host: 'localhost:9200',
        log: [ {
          type: 'stdio',
          level: [ 'error', 'warning' ]
        } ],
        index: 'location_test',
        apiVersion: '1.3',
        timeout: 30000
      },
      mysql: {
        host: 'localhost',
        user: 'root',
        password: 'grut',
        database: 'location_test',
        table: 'location',
        agendaSettingsTableName: 'location_agenda_settings'
      },
      files: {
        tmpPath: __dirname + '/test/tmp',
        bucket: 'openagendatst',
        accessKeyId: 'dqsdsqfdsqfds',
        secretAccessKey: 'dsqfdqfds/Kkqgz1+fdsqf'
      }
    }


# Service methods

## Get

get a location

    get( { uid: 12345}, options, ( err, locationData ) => {

      // locationData

    } );

options:

Options can be omitted entirely. They are:

* fromDb: gets from database. If false gets from search index. Defaults to true
* instanciate: makes an instance with getters. Defaults to true
* decorate: adds agenda-specific data ( tags ) to location. Defaults to false
* fullImagePath: adds full image path ( to https store ); Defaults to false


# React Components

## LocationForm

### Overview

Displays a form for creating, editing or merging locations

the res prop is an object containing server endpoints

* res.geocode: tap in the geocode service
* res.set: create or update a location either when save is pressed or when state is changed
* res.image.upload: upload image of existing location
* res.image.newUpload: upload image of new location
* res.image.remove: remove image of existing location
* res.image.newRemove: remove image of new location


### Alternatives

These are alternative values displayed under each form field that when click replace the input content. They are used when multiple locations are loaded in a form to give the user choices to choose from when editing his location. This arises in two use cases

* Location merge: several locations are picked from a location list and are loaded in the form with the objective to define which values are to be retained in the final merged value

Alternatives manifest as an array props, with each value consisting of a label and a location:

    [ {
      ...
    }, {
      label: 'Your mama suggested',
      location: { ... }
    }, {
      ...
    } ]

When existing, labels prefix the listed alternative under the input field.

#### Associated props

* hideCurrentAlternative: When an alternative is loaded in an input, it is either removed from the list of alternatives or remains, depending on this prop 


## TermSelector

Displays a selector of location 'terms'. That is a list of values of any of the
following fields:

* city
* department
* region

I did not tackle yet different db name so bare with me on that.

The term selector needs the server endpoint where it will fetch that list and
will then display it in an editable select field.

When a selection is made, it is given by an onChange function from props.




# Features

 * it is possible to disable location creation on the location selector through the prop allowCreate ( default at true )

