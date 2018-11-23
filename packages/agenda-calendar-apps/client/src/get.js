import request from 'superagent';

export default ( res, agendaUid, query ) => {

  return new Promise( ( rs, rj ) => {

  request
    .get( res.replace( '{agendaUid}', agendaUid ) )
    .query( query )
    .end((err, res) => {

      if ( err ) return rj( err );

      rs( res.body );

    });


  } );

}
