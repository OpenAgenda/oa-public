import ih from 'immutability-helper';

export default (schema, field) => ih(schema, { fields: { $splice: [[0, 0, field]] } });
