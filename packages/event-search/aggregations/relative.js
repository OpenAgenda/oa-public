'use strict';

module.exports.formatDSL = (query, options = {}) => ({
  filters: {
    filters: {
      upcoming: {
        bool: {
          filter: [{
            range: {
              _search_first_timing: {
                gt: 'now'
              }
            }
          }]
        }
      },
      passed: {
        bool: {
          filter: [{
            range: {
              _search_last_timing: {
                lt: 'now'
              }
            }
          }]
        }
      },
      current: {
        bool: {
          filter: [{
            range: {
              _search_last_timing: {
                gt: 'now'
              }
            }
          }, {
            range: {
              _search_first_timing: {
                lt: 'now'
              }
            }
          }]
        }
      }
    }
  }
});

module.exports.formatResult = ({
  buckets
}) => Object.keys(buckets)
  .map(key => ({
    key,
    eventCount: buckets[key].doc_count
  }));