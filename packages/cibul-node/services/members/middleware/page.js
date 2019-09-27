"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );

const createApp = require( '@openagenda/member-apps/dist/app' );

const layout = require( '../../lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'members' }
);

const { getRoleSlug } = require( '@openagenda/members' ).utils;

module.exports = async ( { port }, req, res, next ) => {
  const prefix = `/${req.agenda.slug}/admin/members`;
  const lang = req.lang || 'fr';

  const { element, triggerHooks, store, staticContext, history } = createApp( {
    req,
    initialState: {
      settings: {
        prefix,
        lang,
        apiRoot: `http://localhost:${port}`,
        perPageLimit: 20
      },
      res: {
        app: `/${req.agenda.slug}/admin/members`,
        list: `/${req.agenda.slug}/admin/members.json`,
        update: `/${req.agenda.slug}/admin/members/:id`,
        remove: `/${req.agenda.slug}/admin/members/:id`,
        invite: `/${req.agenda.slug}/admin/members/invite`,
        resend: `/${req.agenda.slug}/admin/members/:id/invite/resend`,
        stats: `/${req.agenda.slug}/admin/members/stats`,
        showContributor: `/${req.agenda.slug}/admin?contributorId=:contributorId`,
        writeToMember: '/messages/new?uuid=:uid&redirect=:redirect',
        exportToCsv: `/${req.agenda.slug}/admin/members.csv`,
        exportToXlsx: `/${req.agenda.slug}/admin/members.xlsx`,
        sendMessage: `/${req.agenda.slug}/admin/members/send-message`
      },
      agenda: {
        uid: req.agenda.uid,
        slug: req.agenda.slug,
        title: req.agenda.title,
        ownerId: req.agenda.ownerId,
        credentials: req.agenda.credentials,
        roles: req.agendaRoles
      },
      member: req.member
    }
  } );

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString( element );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( staticContext.status === 404 ) {
      return next();
    }

    if ( staticContext.url ) {
      return res.redirect( 301, staticContext.url );
    }

    const { pathname } = history.location;
    if ( decodeURIComponent( req.baseUrl + req.path ) !== decodeURIComponent( pathname ) ) {
      return res.redirect( 301, pathname );
    }

    return res.send( layout( `<div class="js_canvas">${content}</div>`, {
      role: getRoleSlug( req.member.role ),
      lang: req.lang,
      agenda: req.agenda,
      bodyAttributes: [ {
        name: 'data-options',
        value: JSON.stringify( { initialState: state } )
      } ],
      scripts: {
        bottom: [ { src: '/js/membersIndex.js' } ]
      }
    } ) );

  } catch ( e ) {
    next( e );
  }
}
