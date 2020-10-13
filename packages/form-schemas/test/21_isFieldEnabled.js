'use strict';

const assert = require('assert');
const isFieldEnabled = require('../client/src/lib/isFieldEnabled');

describe('isFieldEnabled', () => {

  it('if enableWith specifies value and value is in form values, returns true', () => {
    const enabled = isFieldEnabled({
      "label": "Write in that",
      "field": "textfield",
      "fieldType": "text",
      "enableWith": {
        "field": "checkboxes",
        "value": 2
      },
      "related": [
        "checkboxes"
      ]
    }, {"checkboxes":[2] })

    assert.equal(enabled, true);
  });

  it('if enableWith specifies value and value is not in form values, returns false', () => {
    const enabled = isFieldEnabled({
      "label": "Write in that",
      "field": "textfield",
      "fieldType": "text",
      "enableWith": {
        "field": "checkboxes",
        "value": 2
      },
      "related": [
        "checkboxes"
      ]
    }, {"checkboxes":[1] })

    assert.equal(enabled, false);
  });
});
