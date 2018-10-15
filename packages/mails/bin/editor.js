#!/usr/bin/env node

const path = require( 'path' );
const fs = require( 'fs' );
const { spawn } = require( 'child_process' );

const mailsRoot = path.join( __dirname, '..' );
const serverDevPath = path.join( mailsRoot, 'server.dev.js' );

const args = process.argv.splice( 2 );
const directoryAsArgument = fs.lstatSync( args[ 0 ] ).isDirectory();

const templateDirPath = process.env.MAILS_TEMPLATES_DIR || path.join( process.cwd(), directoryAsArgument ? args[ 0 ] : '' );

const additionalArgs = args.splice( directoryAsArgument ? 1 : 0 );

const nodemonArgs = [
  serverDevPath,
  '-w',
  mailsRoot,
  '-w',
  templateDirPath,
  '-e',
  'js,json,mjml,ejs',
  ...additionalArgs
];

spawn( 'nodemon', nodemonArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    MAILS_TEMPLATES_DIR: templateDirPath
  }
} );
