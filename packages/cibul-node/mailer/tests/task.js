/**
 * test mailer task
 */

var debug = require('debug'),

lib = require('../../lib'),

config = require('../../config'),

async = require('async');

debug.enable('*');

var coms = require('../../coms')( config ),

log = debug('mailer tests'),

task = require('../task');

async.series([

  function( wcb ) {

    log('launch mailer task');

    config.bogus = true; // do not send requests to service

    task( config, coms )();

    wcb();

  },

  function( wcb ) {

    log('queue a mail');

    coms.queue( 'mailer' , {
      recipient: 'kaore@cibul.net',
      subject: 'Youzbedarealdeal',
      html: '<p>AbdelYvesAgatheFly</p>',
      text: 'AbdelYvesAgatheToutchedeSkaye'
    }, wcb);

  },

  function( wcb ) {

    log('queuing a mail request for a couple of mails');

    coms.queue( 'mailer', {
      recipient: [ 'fennec@cibul.net', 'belette@cibul.net', 'tatou@cibul.net', 'rat@cibul.net', 'lapin@cibul.net', 'stegosaure@cibul.net' ],
      subject: 'Oh kisskissimignon cte ptite beete',
      html: '<p>Gnap.</p>',
      text: 'Aïe'
    });

  }

], function( err ) {

  if ( err ) return log('error: %s', JSON.stringify( err ));

  log( 'done.' );

});