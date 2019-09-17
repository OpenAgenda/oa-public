const roles = {
  2: 'administrator',
  administrator: 'administrator',
  3: 'moderator',
  moderator: 'moderator',
  1: 'contributor',
  contributor: 'contributor',
  4: 'reader',
  reader: 'reader'
}

const defaultGetRoleSlug = code => (roles[String(code).toLowerCase()]);

module.exports = defaultGetRoleSlug;
