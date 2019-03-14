import _ from 'lodash';

export default function ( before, after ) {

  if ( !after ) return {
    removed: [],
    swapped: [],
    has: false
  };

  const changes = {
    added: _.difference( after, before ),
    removed: _.difference( before, after )
  };

  changes.swapped = ( before.length === after.length && changes.added.length ) ? changes.added : [];

  return _.assign( changes, {
    has: !!( changes.swapped.length || changes.added.length || changes.removed.length )
  } );

}
