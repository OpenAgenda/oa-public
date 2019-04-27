const networks = require( '../../services/networks' );

module.exports = networkUid => networks.get( networkUid );
