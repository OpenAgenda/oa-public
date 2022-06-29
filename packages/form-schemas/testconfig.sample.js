'use strict';

module.exports = {
  mysql: {
    database: 'oatest_aes',
    user: 'root',
    password: 'grut'
  },
  schemas: {
    network: 'network',
    formSchema: 'form_schema'
  },
  legacy: {
    database: 'oatest_aes',
    user: 'root',
    password: 'grut',
    schemas: {
      agenda: 'legacy_agenda',
      tagSet: 'legacy_tag_set',
      categorySet: 'legacy_category_set'
    }
  }
};
