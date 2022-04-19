'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const glob = require('glob');
const { extract } = require('@formatjs/cli');
const getMessages = require('./utils/getMessages');
const createIndex = require('./utils/createIndex');

// Functions

function getDefaults({
  defaultMessages,
  lang,
  defaultLang,
  definedDefault,
}) {
  if (lang === defaultLang) {
    return defaultMessages;
  }

  if (definedDefault.includes(lang)) {
    return _.mapValues(defaultMessages, () => '');
  }

  return {};
}

async function extractLang({
  output,
  defaultMessages,
  lang,
  defaultLang,
  definedDefault,
}) {
  const localesPath = path.join(process.cwd(), output.replace('%lang%', lang));
  const existingMessages = getMessages(localesPath);

  const defaults = getDefaults({
    defaultMessages,
    lang,
    defaultLang,
    definedDefault,
  });
  const messages = _.pickBy(
    existingMessages,
    (value, key) => key in defaultMessages && value,
  );

  const result = _.merge(defaults, messages);

  fs.writeFileSync(localesPath, `${JSON.stringify(result, null, 2)}\n`);
}

// Command

module.exports.command = 'extract [files]';

module.exports.describe = 'Extract messages.';

module.exports.builder = yargs => {
  yargs.positional('files', {
    default: 'src/**/*.js',
    desc: 'Glob path to extract translations from, the source files.',
  });

  yargs.options({
    output: {
      alias: 'o',
      default: 'src/locales/%lang%.json',
      desc: 'The target path where the script will output an aggregated'
        + ' `.json` file per lang of all the translations from the `files` supplied.',
    },
    defaultLang: {
      default: 'en',
      desc: 'Default language, the one that is filled in for the default messages in the files.',
    },
    langs: {
      default: 'en,fr,de,it,es,br,ca,eu,oc,io',
      coerce: arg => arg.split(','),
      desc: 'The target languages of the translations.',
    },
    definedDefault: {
      default: 'fr',
      coerce: arg => arg.split(','),
      desc: 'Languages that are populated with messages set to "" for ease of translation.',
    },
    idInterpolationPattern: {
      default: '[sha512:contenthash:base64:6]',
      desc: 'If certain message descriptors don\'t have id,'
        + ' this `pattern` will be used to automatically generate IDs for them,\n'
        + 'where `contenthash` is the hash of `defaultMessage` and `description`.',
    },
    skipIndex: {
      type: 'boolean',
      desc: 'Does not create index js file.',
    }
  });
};

module.exports.handler = async argv => {
  const {
    files,
    output,
    idInterpolationPattern,
    defaultLang,
    langs,
    definedDefault,
    skipIndex,
  } = argv;

  const format = 'simple';

  // Extract
  const defaultMessages = JSON.parse(
    await extract(glob.sync(files), {
      idInterpolationPattern,
      extractFromFormatMessageCall: true,
      format,
    }),
  );

  const extractResults = await Promise.allSettled(
    langs.map(lang => extractLang({
      output,
      defaultMessages,
      lang,
      defaultLang,
      definedDefault,
    })),
  );

  extractResults.forEach(result => {
    if (result.status === 'rejected') {
      console.log('Extract error:', result.reason);
    }
  });

  if (!skipIndex && path.basename(output) === '%lang%.json' && !output.includes('**')) {
    await createIndex(output, langs);
  }
};