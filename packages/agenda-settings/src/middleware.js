const logs = require( '@openagenda/logs' );

let service, config;
let agendasSvc;

const defaultFields = [
  { 'field': 'image', 'fieldType': 'abstract' },
  { 'field': 'imageCredits', 'fieldType': 'abstract' },
  { 'field': 'languages', 'fieldType': 'abstract' },
  { 'field': 'title', 'fieldType': 'abstract' },
  { 'field': 'description', 'fieldType': 'abstract' },
  { 'field': 'keywords', 'fieldType': 'abstract' },
  { 'field': 'longDescription', 'fieldType': 'abstract' },
  { 'field': 'conditions', 'fieldType': 'abstract' },
  { 'field': 'age', 'fieldType': 'abstract' },
  { 'field': 'registration', 'fieldType': 'abstract' },
  { 'field': 'accessibility', 'fieldType': 'abstract' },
  { 'field': 'attendanceMode', 'fieldType': 'abstract' },
  { 'field': 'location', 'fieldType': 'abstract' },
  { 'field': 'onlineAccessLink', 'fieldType': 'abstract' },
  { 'field': 'status', 'fieldType': 'abstract' },
  { 'field': 'timings', 'fieldType': 'abstract' }
];

module.exports = {
  init,
  create,
  get,
  set,
  slugs: {
    available: slugAvailable
  }
};

function init( s, c ) {

  service = s;
  config = c;

  if ( c.logger ) {

    logs.setModuleConfig( c.logger );

  }

  agendasSvc = config.services.agendas;

}

function create( req, res, next ) {

  agendasSvc.set( Object.assign( req.body, { ownerId: req.user.id } ), { private: null }, async ( err, result ) => {

    if ( err ) return next( err );

    if ( result.errors.length ) res.status( 400 );

    const { core } = req.app.services;

    if (core) { // skip for testing
      const { onlineEvents, statusField } = req.body;

      if (onlineEvents || statusField) {
        const fields = defaultFields.map(v => {
          if (onlineEvents && (v.field === 'onlineAccessLink' || v.field === 'attendanceMode')) {
            return { ...v, display: true };
          }

          if (statusField && v.field === 'status') {
            return { ...v, display: true };
          }

          return v;
        });

        try {
          await core.agendas(result.agenda.uid).settings.schema.updateFields(fields);
        } catch (e) {
          return next(e);
        }
      }
    }

    return res.json( result );

  } );

}

function get( req, res, next ) {

  agendasSvc.get( { uid: req.params.uid }, { includeImagePath: true, private: null, internal: true }, ( err, result ) => {

    if ( err ) return next( err );

    return res.json( result );

  } );

}

function set( req, res, next ) {
  agendasSvc.set(
    { slug: req.params.slug },
    req.body,
    {
      includeImagePath: true,
      private: null,
      context: req.context || null,
      internal: true
    }, ( err, result ) => {

      if ( err ) return next( err );

      if ( result.errors.length ) res.status( 400 );

      return res.json( result );

    } );

}

function slugAvailable( req, res, next ) {

  agendasSvc.slugs.isTaken( req.body.slug, { excludeUid: req.body.excludeUid || false }, ( err, result ) => {

    if ( err ) return next( err );

    if ( result.taken ) {

      result.errors.push( {
        field: 'slug',
        code: 'duplicate',
        message: 'duplicate value found',
        origin: req.body.slug
      } );

    }

    if ( result.errors.length ) res.status( 400 );

    return res.json( result );

  } );

}
