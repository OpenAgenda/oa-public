{
  "nested" : {
    "path" : "timings"
  },
  "aggregations" : {
    "timings" : {
      "date_range" : {
        "field" : "timings.begin",
        "format" : "${ format }",
        "ranges" : ${ JSON.stringify( ranges ) },
        "time_zone": "Europe/Paris"
      },
      "aggregations" : {
        "timing_to_event" : {
          "reverse_nested" : {},
          "aggs" : {
            "top" : {
              "top_hits" : {
                "_source" : {
                  "excludes" : [
                    "search_internals_*",
                    "timings.search_internals_*"
                  ],
                  "includes" : ${ JSON.stringify( includes ) }
                }
              }
            }
          }
        }
      }
    }
  }
}