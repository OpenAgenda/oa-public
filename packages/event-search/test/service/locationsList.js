import locations from './location.data.json' with { type: 'json' };

export default (uids, options, cb) => {
  // lazy test list func
  // if ( arguments.length === 3 ) return options( null, locations );

  cb(
    null,
    locations.filter((l) => uids.includes(l.uid)),
  );
};
