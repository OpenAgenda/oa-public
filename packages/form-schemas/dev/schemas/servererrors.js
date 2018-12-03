"use strict";

module.exports = {
  schema: {
    fields : [ {
      field : 'anything',
      fieldType : 'text',
      label : 'Type something to have a server-side validation error'
    }, {
      field : 'timeout',
      fieldType : 'integer',
      label : 'Type a delay in seconds',
      default : 2
    } ]
  }
}
