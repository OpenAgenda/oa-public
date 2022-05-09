'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const glob = require('glob');
const mkdirp = require('mkdirp');
const tmp = require('tmp');
const { compile } = require('@formatjs/cli');
const createIndex = require('./utils/createIndex');
const getMessages = require('./utils/getMessages');
const inputToOuputPath = require('./utils/inputToOuputPath');

// Functions

function getFallbackedMessages({
  inputPath,
  fallbackMap,
  lang,
  defaultLang,
}) {
  const fallbackLang = fallbackMap[lang] || defaultLang;
  const localesPath = path.join(process.cwd(), inputPath.replace('%lang%', lang));

  if (fallbackLang !== lang) {
    const fallbackMessages = getFallbackedMessages({
      inputPath,
      fallbackMap,
      lang: fallbackLang,
      defaultLang,
    });
    const messages = getMessages(localesPath);

    return _.reduce(
      messages,
      (accu, value, key) => {
        if (value && value !== '') {
          accu[key] = value;
        }

        return accu;
      },
      fallbackMessages,
    );
  }

  return getMessages(localesPath);
}

async function compileLang({
  locales,
  output,
  lang,
  fallbackMap,
  defaultLang,
  format,
  ast,
}) {
  const localesGlobPath = locales.replace('%lang%', lang);
  const localesPaths = glob.sync(localesGlobPath);

  for (const localesPath of localesPaths) {
    const {
      result: compiledLocalesPath,
      inputPath,
    } = inputToOuputPath(locales, localesPath, output, lang);

    const messages = getFallbackedMessages({
      inputPath,
      fallbackMap,
      lang,
      defaultLang,
    });

    const tmpFile = tmp.fileSync();
    let compiledLocales = {};

    fs.writeFileSync(tmpFile.name, `${JSON.stringify(messages, null, 2)}\n`);

    // local translations
    try {
      compiledLocales = JSON.parse(
        await compile([tmpFile.name], {
          ast,
          format,
        }),
      );

      compiledLocales = _.mapValues(compiledLocales, item => (Array.isArray(item) && item.length === 0 ? null : item));
    } catch (e) {
      console.log(`Error while compiling ${lang}`, e);
    } finally {
      tmpFile.removeCallback();
    }

    await mkdirp(path.dirname(compiledLocalesPath));

    fs.writeFileSync(
      compiledLocalesPath,
      `${JSON.stringify(compiledLocales, null, 2)}\n`,
    );
  }
}

// Command

module.exports.command = 'compile [locales]';

module.exports.describe = 'Compile locales.';

module.exports.builder = yargs => {
  yargs.positional('locales', {
    default: 'src/locales/%lang%.json',
    desc: 'Glob path to compile locales from.',
  });

  yargs.options({
    output: {
      alias: 'o',
      default: 'src/locales-compiled/%lang%.json',
      desc: 'The target path where the script will output the compiled version of the translation files,'
        + ' completed with the fallback langs.',
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
    fallbackMap: {
      default: '{ "br": "fr" }',
      coerce: JSON.parse,
      desc: 'A fallback object (json) to complete each key language with the value language. For `{ "br": "fr" }`, the French will complement the Breton.',
    },
    skipIndex: {
      type: 'boolean',
      desc: 'Does not create index js file.',
    },
    ast: {
      type: 'boolean',
      default: true,
      desc: 'Whether to compile message into AST instead of just string.',
    }
  });
};

module.exports.handler = async argv => {
  const {
    locales,
    output,
    defaultLang,
    langs,
    fallbackMap,
    skipIndex,
    ast,
  } = argv;

  const format = 'simple';

  // Compile
  const compileResults = await Promise.allSettled(
    langs.map(lang => compileLang({
      locales,
      output,
      lang,
      fallbackMap,
      defaultLang,
      format,
      ast,
    })),
  );

  compileResults.forEach(result => {
    if (result.status === 'rejected') {
      console.log('Compile error:', result.reason);
    }
  });

  if (!skipIndex && path.basename(output) === '%lang%.json' && !output.includes('**')) {
    await createIndex(output, langs);
  }
};
