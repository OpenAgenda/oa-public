import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
export default function filterByAccess(formSchema, access) {
  if (!formSchema) {
    return formSchema;
  }
  formSchema.fields = formSchema.fields.filter(f => {
    var _f$read, _context;
    return !((_f$read = f.read) !== null && _f$read !== void 0 ? _f$read : []).length || _includesInstanceProperty(_context = f.read).call(_context, access);
  });
  return formSchema;
}
//# sourceMappingURL=filterByAccess.js.map