'use strict';

const { produce } = require('immer');

module.exports = produce(formSchema => {
  formSchema.fields.forEach(field => {
    if (Array.isArray(field.read) && !field.read.includes('internal')) {
      field.read.push('internal');
    }
  });
});
