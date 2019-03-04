import _ from 'lodash';
import slug from 'slug';

export default ( label, preferredLang ) => {

  const str = _.isString( label ) ? label : _.get( label, preferredLang, _.get( label, _.first( _.keys( label ) ) ) )

  return slug( str, { lower: true } );

}
