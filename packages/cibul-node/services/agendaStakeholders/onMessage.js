"use strict";

const { callbackify } = require( 'util' );
const agendas = require( '@openagenda/agendas' );
const invitations = require( '@openagenda/invitations' );
const mails = require( '@openagenda/mails' );
const users = require( '@openagenda/users' );
const genUrl = require( '../genUrl' );
const config = require( '../../config' );

let log = console.log;

module.exports = ( stakeholder, message, context, cb ) => {

  if ( stakeholder.deletedUser ) return cb();

  agendas.get( stakeholder.agendaId, { includeImagePath: true, private: null }, ( err, agenda ) => {

    if ( err ) log( 'error', err );

    if ( stakeholder.userId && stakeholder.custom.email ) {

      // Member
      users.findOne( {
        query: {
          id: stakeholder.userId
        },
        detailed: true
      } )
        .then( () => {

          const lang = context.lang || 'fr';

          _sendMessageEmail(
            {
              agenda,
              url: genUrl( 'agendaShow', { slug: agenda.slug }, {
                abs: true,
                protocol: 'https://'
              } ),
              message,
              recipient: stakeholder.custom.email,
              replyTo: context.replyTo,
              member: stakeholder,
              lang
            },
            cb
          );
        } );

    } else if ( stakeholder.userId ) {

      // Member without custom.email
      users.findOne( {
        query: {
          id: stakeholder.userId
        },
        detailed: true
      } )
        .then( user => {

          if ( !user ) return cb();

          const lang = context.lang || 'fr';

          _sendMessageEmail(
            {
              agenda,
              url: genUrl( 'agendaShow', { slug: agenda.slug }, { abs: true, protocol: 'https://' } ),
              message,
              recipient: user.email,
              replyTo: context.replyTo,
              member: stakeholder,
              lang
            },
            cb
          );

        } )
        .catch( () => {

          cb();

        } );

    } else if ( stakeholder.custom.email ) {

      // Invited
      invitations.get( { email: stakeholder.custom.email } )
        .then( ( { invitation } ) => {

          if ( !invitation ) {

            return cb();

          }

          const action = invitation.data.actions.find( v => v.name === 'linkStakeholder' );
          const contextInvitation = action.params[ 1 ] || context;

          const lang = ( contextInvitation && contextInvitation.lang ) || 'fr';

          const url = genUrl( 'signup', {
            invitation: invitation.token,
            email: stakeholder.custom.email,
            lang
          }, {
            abs: true,
            protocol: 'https://'
          } );

          _sendMessageEmail(
            {
              agenda,
              url,
              message,
              recipient: stakeholder.custom.email,
              replyTo: context.replyTo,
              lang
            },
            cb
          );

        } );

    }

  } );

};

module.exports.setLog = l => log = l;


function _sendMessageEmail( { agenda, url, message, recipient, lang, replyTo, member }, cb ) {

  const logo = agenda.image
    ? {
      src: agenda.image.replace( '.com/', '.com/rwtb' ),
      width: '100px'
    }
    : {
      src: `${config.root}/images/openagenda.png`,
      width: '300px'
    };

  callbackify( mails ).call( mails, {
    template: 'stakeholderMessage',
    to: {
      address: recipient,
      unsubscriptions: [ {
        rule: [ 'receive', 'memberMessage' ],
        dataPath: 'unsubscribeLink'
      } ].concat( member && member.id ? [ {
        memberId: member.id,
        rule: [ 'receive', 'memberMessage' ],
        dataPath: 'memberUnsubscribeLink'
      } ] : [] ),
      memberId: member && member.id
    },
    data: {
      logo,
      agenda: agenda.title,
      link: url,
      message
    },
    lang
  }, cb );

}
