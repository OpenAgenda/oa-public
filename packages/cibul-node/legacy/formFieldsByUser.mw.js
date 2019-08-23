"use strict";

const _ = require( 'lodash' );

const agendaTags = require( '@openagenda/agenda-tags' );
const agendaCategories = require( '@openagenda/agenda-categories' );

const members = require( '../services/members' );
const getRoleSlug = members.utils.getRoleSlug;

const { promisify } = require( 'util' );

const getAgendaTags = promisify( agendaTags.get );
const getAgendaCategories = promisify( agendaCategories.get );

module.exports = async ( req, res, next ) => {

  const user = await req.app.service( '/users' ).get( req.params.userUid );

  if ( !user ) return res.sendStatus( 404 );

  const member = await members.get( {
    agendaUid: req.agenda.uid,
    userUid: user.uid
  } );

  const role = getRoleSlug( _.get( member, 'role', 1 ) );

  res.json( {
    custom: req.agenda.getCustomFieldsConfig().filter( _filterFieldByRole.bind( null, role ) ),
    tagSet: _filterTagGroupsByRole( role, await getAgendaTags( req.agenda.id ) ),
    categorySet: await getAgendaCategories( req.agenda.id )
  } );
}

function _filterTagGroupsByRole( role, tagSet = null ) {

  if ( !tagSet ) return null;

  return _.extend( tagSet, { groups: tagSet.groups.filter( g => {

    if ( role === 'administrator' ) return true;

    if ( role === 'moderator' ) return true;

    if ( g.access === 'administrator' ) return false;

    return true;

  } ) } );

}

function _filterFieldByRole( role, field ) {

  if ( role === 'administrator' ) return true;

  if ( role === 'moderator' ) return true;

  return [ 'private', 'public', undefined ].includes( field.type );

}
