"use strict";

const fs = require( 'fs' );

const fields = JSON.parse( fs.readFileSync( __dirname + '/../service/validate/src/fields.json', 'utf-8' ) );

let out = {
  front: {
    fields: {},
    content: '"use strict";// script-generated file. See src/fields.json\n\nmodule.exports = ',
    file: __dirname + '/../service/validate/frontFields.js'
  },
  server: {
    fields: {},
    content: '"use strict";// script-generated file. See src/fields.json\n\nmodule.exports = ',
    file: __dirname + '/../service/validate/serverFields.js'
  }
};

Object.keys( fields ).forEach( k => {

  let outKey = fields[ k ].server ? 'server' : 'front';

  let field = fields[ k ];

  fields[ k ].private = undefined;

  out[ outKey ].fields[ k ] = fields[ k ];

} );

[ 'server', 'front' ].forEach( outKey => {

  out[ outKey ].content += JSON.stringify( out[ outKey ].fields ) + ';';

  fs.writeFileSync( out[ outKey ].file, out[ outKey ].content );

} );