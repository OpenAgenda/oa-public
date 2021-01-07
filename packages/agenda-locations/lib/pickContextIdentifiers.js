'use strict';

module.exports = (context = {}, fields = []) => fields
  .filter(field => context[field] !== null)
  .reduce(
    (identifiers, field) => ({ ...identifiers, [field]: context[field] }),
    {}
  );
