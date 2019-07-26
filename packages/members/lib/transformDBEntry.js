"use strict";

const _ = require( 'lodash' );
const slug = require( 'slug' );

const map = {
  id: 'id',
  credential: 'role',
  agenda_uid: 'agendaUid',
  user_uid: 'userUid',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  deleted_user: 'deletedUser',
  slug: 'slug',
  actions_counter: 'actionsCounter',
  store: 'store'
};

const legacyFieldsMap = {
  review_id: 'agendaId',
  user_id: 'userId',
  credential: 'credential'
};

const dbFields = Object.keys( map );
const legacyDbFields = Object.keys( legacyFieldsMap );

module.exports.fromDB = ( { includeLegacyFields, orderField }, entry ) => {

  if ( !entry ) return null;

  return Object.keys( entry )
    .filter( field => dbFields.concat( includeLegacyFields ? legacyDbFields : [] ).includes( field ) )
    .reduce( ( mapped, field ) => {

      if ( field === 'store' ) {
        mapped.custom = _legacyCustomFromDB( entry.store );
      } else if ( dbFields.includes( field ) ) {
        _.set( mapped, map[ field ], entry[ field ] );
      }

      if ( includeLegacyFields && legacyDbFields.includes( field ) ) {
        _.set( mapped, legacyFieldsMap[ field ], entry[ field ] );
      }

      if ( field === _.snakeCase( orderField ) ) {
        mapped.order = field === 'id' ? entry[ field ] : [ entry[ field ], entry.id ];
      }

      return Object.assign( mapped, {
        deletedUser: !!mapped.deletedUser,
        invited: !mapped.deletedUser && !mapped.userId && !mapped.userUid
      } );

    }, {} );

}

module.exports.toDB = member => {

  const entry = _.uniq( dbFields.concat( legacyDbFields ) )
    .filter( f => member[ _.camelCase( f ) ] !== undefined )
    .reduce( ( entry, field ) => _.set( entry, field, member[ _.camelCase( field ) ] ), {} );

  if ( member.role ) {
    entry.credential = member.role;
  }

  if ( member.custom ) {
    Object.assign( entry, _legacyCustomToDB( member.custom ) );
  }

  return entry;
}

function _legacyCustomToDB( custom ) {

  const organization = custom.organization ? {
    slug: slug( custom.organization, { lower: true } ),
    label: custom.organization
  } : null;

  return {
    store: JSON.stringify( { custom_fields: {
      organization: organization ? organization.label : null,
      contact_name: custom.contactName || null,
      contact_number: custom.contactNumber || null,
      email: custom.email || null
    } } ),
    organization: organization ? organization.slug : null
  }

}

function _legacyCustomFromDB( store ) {

  if ( !_.isString( store ) ) return {};

  const data = _.get( JSON.parse( store ), 'custom_fields', '{}' );

  if ( !data ) return {};

  if ( _.isObject( data.organization ) ) {
    data.organization = _.get( data, 'organization.label' );
  }

  return _.mapKeys( data, ( v, k ) => _.camelCase( k ) );
}
