var deepExtend = require( 'deep-extend' ),

config = {
  all: {
    partialOptions: {}
  },
  tpl : {
    partialOptions: {
      raw: true,
      decorate: {
        page: 1,
        count: 20, 
        total: 65
      }
    }
  }
},

currentConfig = ( typeof config[ window.env ] == 'undefined' ) ? {} : config[ window.env ];

module.exports = deepExtend( config.all, currentConfig );