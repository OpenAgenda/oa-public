import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';
import integer from '@openagenda/validators/integer';
import text from '@openagenda/validators/text';
import link from '@openagenda/validators/link';
import VError from '@openagenda/verror';

schema.register({
  integer,
  text,
  link,
});

const validate = schema({
  title: {
    type: 'text',
  },
  description: {
    type: 'text',
    optional: true,
  },
  feedURL: {
    type: 'link',
    optional: false,
  },
  siteURL: {
    type: 'link',
    optional: false,
  },
  generator: {
    type: 'text',
    default: 'OpenAgenda',
  },
  imageURL: {
    type: 'link',
    optional: true,
  },
  language: {
    type: 'text',
    optional: false,
  },
  ttl: {
    type: 'integer',
    default: 120,
  },
});

export default (head) => {
  try {
    return _.extend(validate(head), {
      custom_namespaces: {
        ev: 'http://purl.org/rss/1.0/modules/event/',
      },
    });
  } catch (e) {
    throw new VError(
      {
        name: 'ValidationError',
        info: {
          errors: e,
        },
      },
      'Validation failed',
    );
  }
};
