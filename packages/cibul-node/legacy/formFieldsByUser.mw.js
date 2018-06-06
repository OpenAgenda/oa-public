"use strict";

const _ = require( 'lodash' );

const agendaTags = require( '@openagenda/agenda-tags' );
const agendaCategories = require( '@openagenda/agenda-categories' );
const members = require( '@openagenda/agenda-stakeholders' );
const users = require( '@openagenda/users' );

const getRole = members.types.codes.get;

const { promisify } = require( 'util' );

const getAgendaTags = promisify( agendaTags.get );
const getAgendaCategories = promisify( agendaCategories.get );

module.exports = async ( req, res, next ) => {

  const user = await users().get( req.params.userUid );

  if ( !user ) return res.sendStatus( 404 );

  const member = await promisify( members( req.agenda.id ).get )( { userId: user.id } );

  const role = getRole( _.get( member, 'credential', 1 ) );

  // get custom fields, tags and categories

  const sets = {
    custom: req.agenda.getCustomFieldsConfig().filter( _filterFieldByRole.bind( null, role ) ),
    tagSet: _filterTagGroupsByRole( role, await getAgendaTags( req.agenda.id ) ),
    categorySet: await getAgendaCategories( req.agenda.id )
  };

  res.json( sets );

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