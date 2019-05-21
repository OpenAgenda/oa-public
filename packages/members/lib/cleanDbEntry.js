"use strict";

const _ = require( 'lodash' );

const map = {
  id: 'id',
  credential: 'role',
  agenda_uid: 'agendaUid',
  user_uid: 'userUid',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  deleted_user: 'deletedUser',
  slug: 'slug',
  store: 'store'
};

const legacyFieldsMap = {
  review_id: 'agendaId',
  user_id: 'userId',
  actions_counter: 'actionsCounter',
  credential: 'credential',
};

const dbFields = Object.keys( map );
const legacyDbFields = Object.keys( legacyFieldsMap );

module.exports = ( { includeLegacyFields, orderField }, entry ) => {

  if ( !entry ) return null;

  return Object.keys( entry )
    .filter( field => dbFields.concat( includeLegacyFields ? legacyDbFields : [] ).includes( field ) )
    .reduce( ( mapped, field ) => {

      if ( field === 'store' ) {
        mapped.custom = _parseLegacyCustom( entry.store );
      } else if ( dbFields.includes( field ) ) {
        _.set( mapped, map[ field ], entry[ field ] );
      }

      if ( includeLegacyFields && legacyDbFields.includes( field ) ) {
        _.set( mapped, legacyFieldsMap[ field ], entry[ field ] );
      }

      if ( field === orderField ) {
        mapped.order = entry[ field ];
      }

      return Object.assign( mapped, {
        deletedUser: !!mapped.deletedUser
      } );

    }, {} );


}

function _parseLegacyCustom( store ) {

  if ( !_.isString( store ) ) return {};

  const data = _.get( JSON.parse( store ), 'custom_fields', '{}' );

  if ( !data ) return {};

  if ( _.isObject( data.organization ) ) {
    data.organization = _.get( data, 'organization.label' );
  }

  return _.mapKeys( data, ( v, k ) => _.camelCase( k ) );
}
