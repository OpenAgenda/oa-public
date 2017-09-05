"use strict";

module.exports = result => {
  
  return result.timings.buckets.map( b => ( {
    key: b.key_as_string,
    count: b.doc_count,
    sampleEvents: b.timing_to_event.top.hits.hits.map( h => h._source )
  } ) );

}