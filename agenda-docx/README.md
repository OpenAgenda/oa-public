# Overview

This app allows the generation of a Microsoft word docx document listing the events referenced in an OpenAgenda calendar. It relies on OpenAgenda calendars for content and the wonderful docxtemplater for docx generation.

It provides the following functionality:

- Front app for configuring and launching new jobs
- Backend app for processing a job queue

# Getting started

Requirements:

- nodejs
- An amazon bucket

Install the things:

    yarn

Put the following config in a config.dev.js file:

    "use strict";

    module.exports = {
      s3: {
        region: 'eu-west-3',
        accessKeyId: 'yourawsaccesskeyid',
        secretAccessKey: 'yourawssecretaccesskeyid',
        bucket: 'someawsbucketname'
      },
      onProcessGenerateRequest: (jobData) => {},
      localTmpPath: '/var/tmp'
    }

... and you should be good to go.

    yarn start

Check `localhost:3000` and click on the link to open the modal. The agenda used as basis for the generation of the document is this one: https://openagenda.com/ndm-2018-nouvelle-aquitaine

It can be changed on the `index.html` file of this repo.

Alternatively, a basic cli tool can be used to run a docx generation from a terminal:

    yarn cli

# Bits and pieces

This repo implements every functionality required to have a working docx generation mechanism

      React UI Component
            |
            v
      Express app -> [ queue ] -> block pop task
            |                                |
         updates                           updates,
            |                                |   generates docx,
            |                                |        uploads docx on s3
            --->state of docx export         |                |
                of one agenda on S3  <-------- <---------------

Here are the different parts:

- **UI Component**: Allows users to see the state of the export, download a file when available, and queue requests to generate updated exports
- **Express app**: Provides all endpoints required to interface with the UI. It enqueues any new request to generate a new export on a queue (optional).
- **Task**: Monitors the queue using a blocking pop. Processes docx generation request and uploads resulting documents on S3
