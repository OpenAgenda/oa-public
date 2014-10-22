/**
 * task that extracts from db campaigns that are due ( scheduled for now-ish )
 * renders their newsletter and sends to the mailer through coms
 */

var log = require( '../lib/logger' )( 'newsletter task' ),

lib = require( '../lib/lib' ),

coms = require( '../lib/coms' ),

cmn = require( '../lib/commons-task' ),

model = cmn.getCibulModel(),

config = require( '../config' ),

async = require('async'),

w = require( 'when' ),

wn = require( 'when/node' ),

builder = require('./build'),

templater = require('cibulTemplates/server/templater'), // this renders the template layout

running = false,

_onComplete,

_onStart;


/**
 * exported function list
 */

exports.load = cmn.makeLoad( run );     // load task using offset and period
exports.run = run;                      // run task

// for testing
exports.setOnStart = setOnStart;        // task is running
exports.setOnComplete = setOnComplete;  // task has completed a run
exports.setComs = setComs;              // set coms module


/**
 * execute the task
 */

function run() {

  var nextMinute;

  if ( running ) {

    log( 'already running' );

    return;

  }

  log( 'running' );

  if ( _onStart ) _onStart();

  running = true;

  nextMinute = _getNextMinute();


  log( 'loading campaigns scheduled before %s', nextMinute );

  wn.call( model.campaigns().list, { scheduledAt: [ '<=', nextMinute ]  })

  .then( function( campaigns ) {

    log( 'campaigns to be processed: %s', campaigns.length );

    async.each( campaigns, _processCampaign, function( err ) {

      log( 'campaigns processed' );
      
      if ( err ) log( 'something went awry.' );

      running = false;

      if ( _onComplete ) _onComplete();

    });

  })

  .catch( _error );

}


function setOnStart( cb ) {

  _onStart = cb;

}


function setOnComplete( cb ) {

  _onComplete = cb;

}


function setComs( c ) {

  coms = c;

}


/**
 * render and queue campaign mails
 */

function _processCampaign( campaign, cb ) {

  log( 'processing campaign %s', campaign.uid );

  var inst = model.campaigns().instance( campaign );

  wn.call( async.series, [

    async.apply( _getNewsletterBodies, inst ),

    async.apply( _getCampaignContacts, inst )

  ])

  .spread( function( content, recipient ) {

    console.log( recipient );

    log( 'campaign %s content generated and recipients fetched', campaign.uid );

    return wn.call( coms.queue, 'mailer', {
      subject: inst.title,
      html: content.html,
      text: content.text,
      recipient: recipient
    });

  })

  .then( function() {

    inst.refreshAfterSend( true, cb );

  })

  .catch( _error );

}


function _getCampaignContacts( campaign, cb ) {

  wn.call( campaign.getContactList )

  .then( function( contactList ) {

    return wn.call( model.contactLists().instance( contactList ).contacts.list );

  } )

  .then( function( contacts ) {

    cb( null, contacts.map(function( contact ) {

      return contact.email;

    }) );

  })

  .catch( _error );

}


function _getNewsletterBodies( campaign, cb ) {

  log( 'generating newsletter bodies' );

  var agenda;

  wn.call( campaign.getAgenda )

  .then( function( a ) {

    agenda = model.agendas().instance( a );

    return wn.call( builder, model, agenda, campaign );

  } )

  .then( function( data ) {

      data.genUrl = cmn.makeGenUrl({
        root: config.root,
        base: { path: '', values: { slug: agenda.slug } }
      });

      return wn.call(async.series, [

        async.apply( templater,  'newsletter/show', lib.extend({ type: 'html' }, data ) ),
        async.apply( templater,  'newsletter/show', lib.extend({ type: 'text' }, data ) )

      ]);

  } )

  .spread( function( html, text ) {

    cb( null, { html: html, text: text });

  } )

  .catch( _error );

}



function _getNextMinute() {

  var nm = new Date();

  nm.setMilliseconds( 0 );

  nm.setSeconds( 60 );

  return nm;

}

function _error( e ) {

  log( 'newsletter task error' );

  throw e;

}