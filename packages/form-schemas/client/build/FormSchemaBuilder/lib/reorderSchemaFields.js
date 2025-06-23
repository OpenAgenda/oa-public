import _assign from "lodash/assign.js";
import _first from "lodash/first.js";
import ih from 'immutability-helper';
function applyOrder(schema, newOrder) {
  return ih(schema, {
    fields: {
      $set: newOrder.map(f => _first(schema.fields.filter(field => field.field === f)))
    }
  });
}

// this act as a swap, it should not be
export default _assign((schema, fromIndex, toIndex) => ih(schema, {
  fields: {
    $splice: [[toIndex + (toIndex > fromIndex ? 1 : 0), 0, schema.fields[fromIndex]], [fromIndex + (toIndex < fromIndex ? 1 : 0), 1]]
  }
}), {
  applyOrder
});
//# sourceMappingURL=reorderSchemaFields.js.map