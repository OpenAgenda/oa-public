"use strict";

const homeMw = require('@openagenda/home/dist/middleware');
const agendasSvc = require('@openagenda/agendas');
const eventsSvc = require('@openagenda/events');
const membersSvc = require('./members');
const cmn = require('../lib/commons-app');


module.exports.init = config => {
  homeMw.init({
    mysql: config.db,
    schemas: config.schemas,
    image: {
      path: config.aws.imageBucketPath.replace('cibuldev', 'cibul'),
      default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    mw: {
      limit: 20
    },
    interfaces: {
      agendaMailTo: cmn.agendaMailTo,
      agendas: {
        list: agendasSvc.list
      },
      members: {
        list: membersSvc.list
      },
      events: {
        list: eventsSvc.list
      }
    }
  });
};
