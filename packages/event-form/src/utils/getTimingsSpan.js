export default ( ranges = [] ) => {

  if ( !ranges || !ranges.length ) return null;

  const extremities = ranges.reduce( ( { first, last }, range ) => ( {
    first: first && ( first < new Date( range.begin ) )  ? first : new Date( range.begin ),
    last: last && ( last > new Date( range.end ) ) ? last : new Date( range.end )
  } ), { first: null, last: null } );

  return extremities.last.getTime() - extremities.first.getTime();

}
