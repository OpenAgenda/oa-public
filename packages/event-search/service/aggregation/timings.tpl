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
      }
    }
  }
}