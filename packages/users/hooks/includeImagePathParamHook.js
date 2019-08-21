const { alterItems } = require( 'feathers-hooks-common' );

module.exports = function includeImagePathParamHook() {
  return context => {
    const { config } = context.service;

    if ( !context.params.includeImagePath || context.result === null ) {
      return context;
    }

    return alterItems( record => ({
      ...record,
      image: record.image && config.imagePath ? config.imagePath + record.image : record.image
    }) )( context );
  };
}
