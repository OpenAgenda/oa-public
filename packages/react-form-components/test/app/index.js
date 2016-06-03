"use strict";

var app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  /*styles: [ 
    __dirname + '/../../sass/variables.scss', 
    __dirname + '/../../sass/test.scss',
    __dirname + '/../../node_modules/react-select/dist/react-select.css',
    __dirname + '/../../sass/language-bar.scss',
    __dirname + '/../../sass/multilingual-input-field.scss',
    __dirname + '/../../sass/group-tag-selector.scss',
    __dirname + '/../../sass/multi-input-field.scss',
    __dirname + '/../../sass/spinner.scss'
  ] */ // deprecated
} );

app.getAndListen();