{
  "nested" : {
    "path" : "timings"
  },
  "aggs" : {
    "first" : {
      "min" : {
        "field" : "timings.begin"
      }
    },
    "last" : {
      "max" : {
        "field" : "timings.begin"
      }
    }
  }
}