"use strict";

var app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  styles: [ 
    __dirname + '/../../sass/variables.scss', 
    __dirname + '/../../sass/test.scss',
    __dirname + '/../../sass/language-bar.scss',
    __dirname + '/../../sass/multilingual-input-field.scss',
    __dirname + '/../../sass/group-tag-selector.scss'
  ]
} );

app.getAndListen();