'use strict';

module.exports = (client, alias) => {
  return client.indices.getAlias({ name: alias })
    .then(r => Object.keys(r.body));
}
