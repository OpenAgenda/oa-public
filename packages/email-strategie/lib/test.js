var m = require( 'mysql' );

con = m.createConnection( {
  host: 'localhost',
  user: 'root',
  password: 'grut',
  database: 'emailstrategie'
});

con.query( 'show tables', function( err, result ) {

    con.query( 'create table ')

} );

