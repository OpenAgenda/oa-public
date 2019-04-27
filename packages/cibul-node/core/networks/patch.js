const networks = require( '../../services/networks' );

module.exports = ( networkUid, data ) => networks.patch( networkUid, data );
