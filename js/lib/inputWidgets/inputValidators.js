var inputValidators = {

  isFloat: function(label) {

    return this.regex(label?label:'Input should be a float', /^-?\d*(\.\d+)?$/);

  },

  isTime: function(label) {

    return this.regex(label?label:'Input should be a valid time written as such: hh:ss', /^([0-9]|0[0-9]|1[0-9]|2[0-3])(:|h)[0-5][0-9]$/);

  },

  regex: function(label, regex) {

    if (typeof label == 'undefined') label = 'Input is wrong';

    return function(value) {

      if (typeof value == 'undefined') value = '';

      if (!value.match(regex)) throw label;

    }

  }
}

if ( typeof module !== 'undefined' ) module.exports = inputValidators;