"use strict";

module.exports = result => {

  return result.timings.buckets.map( b => ( {
    key: b.key_as_string,
    count: b.doc_count
  } ) );

}