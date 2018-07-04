#!/usr/bin/env node

const path = require( 'path' );
const { spawn } = require( 'child_process' );

const args = process.argv.splice( 2 );
const templateDirPath = process.env.MAILS_TEMPLATES_DIR || path.join( process.cwd(), args[ 0 ] || '' );
const serverDevPath = path.join( __dirname, '..', 'server.dev.js' );

spawn( 'nodemon', [ serverDevPath, '-w', templateDirPath ], {
  stdio: 'inherit',
  env: {
    ...process.env,
    MAILS_TEMPLATES_DIR: templateDirPath
  }
} );
