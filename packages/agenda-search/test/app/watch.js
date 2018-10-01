require( 'shelljs/global' );

// should watch components src only ...

exec( 'npm run-script babelify' );

exec( 'node test/app' );