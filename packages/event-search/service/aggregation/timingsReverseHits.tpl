{
  "nested" : {
    "path" : "timings"
  },
  "aggregations" : {
    "timings" : {
      "date_histogram" : {
        "field" : "timings.begin",
        "interval" : "${ interval }",
        "format" : "${ format }"
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
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
}