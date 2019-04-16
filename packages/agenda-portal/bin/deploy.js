#! /usr/bin/env node

const { promisify } = require( 'util' );
const fs = require( 'fs' );
const ncp = promisify( require( 'ncp' ).ncp );

const { term, confirm } = require( '../lib/prompt' );

( async () => {

  const confirmed = await confirm( `
In order to proceed, you will need:

 * An OpenAgenda agenda uid
 * An OpenAgenda account public key

Continue?`);

  if ( !confirmed ) return;

  const agendaUid = await term( 'What is the uid of your agenda?' );
  const lang = await term( 'Which is the main language of the portal?' );
  const key = await term( 'OpenAgenda account public key' );

  fs.writeFileSync( process.cwd() + '/oa.key', key );

  await ncp( `${__dirname}/../dev`, process.cwd() );

  await _insertStartScript();

  _insertLangAndUid( agendaUid, lang );

  _adjustSASSRelativePath();

} )();

function _adjustSASSRelativePath() {

  fs.writeFileSync(
    process.cwd() + '/sass/main.scss',
    fs.readFileSync( process.cwd() + '/sass/main.scss', 'utf-8' )
      .replace(
        `@import "../../node_modules/bootstrap/scss/bootstrap";`,
        `@import "../node_modules/bootstrap/scss/bootstrap";`
      )
  );

}


function _insertLangAndUid( agendaUid, lang ) {

  const content = fs.readFileSync( process.cwd() + '/server.js', 'utf-8' )
    .replace( /uid\:(\s|[0-9])+,/, `uid: ${agendaUid},` )
    .replace( /lang\:(\s|\'|[a-z])+,/, `lang: '${lang}',` )
    .replace(
      `const Portal = require( '../' );`,
      `const Portal = require( '@openagenda/agenda-portal' );`
    )
    .replace(
      `require( '../lib/Log' )`,
      `require( '@openagenda/agenda-portal/lib/Log' )`
    );

  fs.writeFileSync( process.cwd() + '/server.js', content );

}



function _insertStartScript() {

  const fileStr = process.cwd() + '/package.json';

  const packageStr = fs.readFileSync( fileStr, 'utf-8' );

  fs.writeFileSync(
    fileStr,
    packageStr.replace( '"dependencies": {',
`"scripts" : {
    "start": "NODE_ENV=development browser-refresh server"
  },
  "dependencies": {` ) );

}
