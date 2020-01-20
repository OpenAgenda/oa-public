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
                "size" : ${ size },
                "_source" : {
                  "excludes" : [
                    "_*",
                    "timings._*"
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
