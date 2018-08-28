"use strict";

module.exports = schema => {

  return schema.fields.filter( f => f.languages ).map( f => f.field );

}
