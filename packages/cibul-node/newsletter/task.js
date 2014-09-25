/**
 * task that extracts from db campaigns that are due ( scheduled for now-ish )
 * renders their newsletter and sends to the mailer through coms
 */

var log = require( '../lib/logger' )( 'newsletter task' ),

lib = require('../lib/lib'),

cmn = require( '../lib/commons-task' ),

model = cmn.getCibulModel(),

async = require('async'),

builder = require('./build'),

templater = require('cibulTemplates/server/templater'), // this renders the template layout

running = false;


/**
 * exported function list
 */

exports.load = cmn.makeLoad( run );  // load task using offset and period
exports.run = run;                   // run task



/**
 * execute the task
 */

function run( cb ) {

  var nextMinute;

  if ( running ) {

    log( 'already running' );

    return;

  }

  log( 'running' );

  running = true;

  nextMinute = _getNextMinute();

  log( 'loading campaigns scheduled before %s', nextMinute );

  model.campaigns().list({ scheduledAt: [ '<=', nextMinute ]  }, _e('campaigns fetched', function( campaigns ) {

    log( 'campaigns to be processed: %s', campaigns.length );

    async.each( campaigns, _processCampaign, _e( 'campaigns processed', function() {

      running = false;

      if ( cb ) cb();

    }, function() {

      running = false;

      if ( cb ) cb();

    }));

  }));

}


/**
 * render and queue campaign mails
 */

function _processCampaign( campaign, cb ) {

  var inst = model.campaigns().instance( campaign );

  async.parallel([

    async.apply( _getNewsletterBodies, inst ),

    async.apply( _getCampaignContacts, inst )

  ], _e( 'campaign content generated and contacts retrieved', function( results ) {

    coms.queue('mailer', {
      subject: 'Here is your newsletter',
      html: results[0].html,
      text: results[0].text,
      recipient: results[1]
    }, _e( function() {

      inst.refreshAfterSend( true, cb );

    }, cb));

  }, cb));

}


function _getCampaignContacts( campaign, cb ) {

  campaign.getContactList( _e('contact list retrieved', function( contactList ) {

    model.contactLists().instance( contactList ).contacts.list( _e('contacts retrieved', function( contacts ) {

      cb( null, contacts.map(function( contact ) {

        return contact.email;

      }) );

    }, cb ));

  }, cb));

}


function _getNewsletterBodies( campaign, cb ) {

  campaign.getAgenda( _e( 'agenda retrieved', function( agenda ) {

    builder( model, model.agendas().instance( agenda ), campaign, _e( function( data ){

      data.genUrl = cmn.makeGenUrl({
        root: '//cibul.net',
        base: { path: '', values: { slug: agenda.slug } }
      });

      async.series([

        async.apply( templater,  'newsletter/show', lib.extend({ type: 'html' }, data ) ),
        async.apply( templater,  'newsletter/show', lib.extend({ type: 'text' }, data ) )

      ], _e( 'campaign html and text content generated', function( results ) {

        cb( null, {
          html: results[0],
          text: results[1]
        });

      }, cb ));

    }, cb));

  }, cb));

}



function _getNextMinute() {

  var nm = new Date();

  nm.setMilliseconds( 0 );

  nm.setSeconds( 60 );

  return nm;

}


/**
 * handle error. deprecate this and use promises
 */

function _e( handler ) {

  return function( label, f, cb ) {

    if ( arguments.length == 2 ) {

      if ( typeof arguments[0] == 'function' ) {

        f = label;

        cb = f;

        label = false;

      }

    } else if ( arguments.length == 1 ) {

      f = label;

      label = false;

    }

    return function() {

      // run by caller when is calling back with err and remaining args

      if ( label ) log( label );

      var args = Array.prototype.slice.call(arguments, 0);

      err = args.splice( 0, 1 )[0];

      if ( err ) {

        if ( cb ) cb( err );
        
        handler( err );

        return;

      }

      f.apply(null, args);

    };

  };

}