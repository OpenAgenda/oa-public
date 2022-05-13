'use strict';

const decorateOptionedFieldsWithLabels = require("../boot/utils/decorateOptionedFieldsWithLabels");

const event = {'type-devenement': 11};
const fields = [{field: 'type-devenement', options: [ {id: 11, value: 'atelier-stage', label: {en: 'Atelier - Stage'}, display: true} ]}];

describe('25 - decorateOptionedFieldsWithLabels',() => {
    test('type-devenement is now equal to corresponding label', () => {
        expect(
            decorateOptionedFieldsWithLabels(event, { agenda:{schema: {fields}}, lang:'en' })
        ).toEqual({'type-devenement': ["Atelier - Stage"]})
    });

    test('type-devenement is no longer equal to 11', () => {
        expect(
            decorateOptionedFieldsWithLabels(event, { agenda:{schema: {fields}}, lang:'en' })
        ).not.toEqual({'type-devenement': 11})
    });
});
