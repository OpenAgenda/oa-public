import app from './app';
import getRoutes from './createRoutes';

export default function createApp( options ) {

  return app( options, getRoutes );

}
