const _ = require( 'lodash' );
const { alterItems } = require( 'feathers-hooks-common' );
const config = require( '../config' );

module.exports = function parseStore() {
  return context => {
    if ( !context.params.includeImagePath || context.result === null ) {
      return context;
    }

    alterItems( record => ({
      ...record,
      image: record.image ? config.imagePath + record.image : record.image
    }) )( context );
  };
}
