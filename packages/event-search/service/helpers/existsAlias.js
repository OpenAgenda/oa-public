'use strict';

module.exports = (client, alias) => {
  return client.indices.existsAlias({ name: alias }).then(r => r.body);
}
