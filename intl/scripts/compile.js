'use strict';

const fs = require('node:fs');
const path = require('node:path');
const _ = require('lodash');
const glob = require('glob');
const { mkdirp } = require('mkdirp');
const tmp = require('tmp');
const { compile } = require('@formatjs/cli');
const {
  DEFAULT_LANG,
  DEFAULT_LANGS,
  DEFAULT_FALLBACK_MAP,
} = require('../dist/constants');
const getFallbackChain = require('../dist/getFallbackChain').default;
const completeMessages = require('../dist/utils/completeMessages').default;
const createIndex = require('./utils/createIndex');
const getMessages = require('./utils/getMessages');
const inputToOuputPath = require('./utils/inputToOuputPath');

const defaults = {
  locales: 'src/locales/%lang%.json',
  output: 'src/locales-compiled/%lang%.json',
  defaultLang: DEFAULT_LANG,
  langs: DEFAULT_LANGS,
  fallbackMap: DEFAULT_FALLBACK_MAP,
  skipIndex: false,
  ast: true,
  esm: false,
};

// Functions

function getFallbackedMessages({ inputPath, fallbackMap, lang, defaultLang }) {
  const fallbacks = getFallbackChain(lang, fallbackMap, defaultLang);
  let result = {};

  for (const fallback of fallbacks) {
    const localesPath = path.join(
      process.cwd(),
      inputPath.replace('%lang%', fallback),
    );
    const messages = getMessages(localesPath);

    result = completeMessages(result, messages);
  }

  return result;
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
    const { result: compiledLocalesPath, inputPath } = inputToOuputPath(
      locales,
      localesPath,
      output,
      lang,
    );

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

      compiledLocales = _.mapValues(compiledLocales, (item) =>
        (Array.isArray(item) && item.length === 0 ? null : item));
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

module.exports.builder = (yargs) => {
  yargs.positional('locales', {
    default: defaults.locales,
    desc: 'Glob path to compile locales from.',
  });

  yargs.options({
    output: {
      alias: 'o',
      default: defaults.output,
      desc:
        'The target path where the script will output the compiled version of the translation files,'
        + ' completed with the fallback langs.',
    },
    defaultLang: {
      default: defaults.defaultLang,
      desc: 'Default language, the one that is filled in for the default messages in the files.',
    },
    langs: {
      default: defaults.langs.join(','),
      coerce: (arg) => arg.split(','),
      desc: 'The target languages of the translations.',
    },
    fallbackMap: {
      default: JSON.stringify(defaults.fallbackMap),
      coerce: JSON.parse,
      desc: 'A fallback object (json) to complete each key language with the value language. For `{ "br": "fr" }`, the French will complement the Breton.',
    },
    skipIndex: {
      default: defaults.skipIndex,
      type: 'boolean',
      desc: 'Does not create index js file.',
    },
    ast: {
      default: defaults.ast,
      type: 'boolean',
      desc: 'Whether to compile message into AST instead of just string.',
    },
    esm: {
      type: 'boolean',
      default: false,
      desc: 'Create ESM index.',
    },
  });
};

module.exports.handler = async (argv) => {
  const {
    locales = defaults.locales,
    output = defaults.output,
    defaultLang = defaults.defaultLang,
    langs = defaults.langs,
    fallbackMap = defaults.fallbackMap,
    skipIndex = defaults.skipIndex,
    ast = defaults.ast,
    esm = defaults.esm,
  } = argv;

  const format = 'simple';

  // Compile
  const compileResults = await Promise.allSettled(
    langs.map((lang) =>
      compileLang({
        locales,
        output,
        lang,
        fallbackMap,
        defaultLang,
        format,
        ast,
      })),
  );

  compileResults.forEach((result) => {
    if (result.status === 'rejected') {
      console.log('Compile error:', result.reason);
    }
  });

  if (
    !skipIndex
    && path.basename(output) === '%lang%.json'
    && !output.includes('**')
  ) {
    await createIndex(output, langs, esm);
  }
};
