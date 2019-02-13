import ih from 'immutability-helper';

export default ( schema, languages ) => ih(
  schema,
  schema.fields.reduce( ( update, field, index ) => {

    if ( field.languages ) {

      _.set( update, `fields.${index}.languages`, { $set: languages } );

    }

    return update;

  }, {} )
);
