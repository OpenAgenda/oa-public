'use strict';

const extract = require('./extract');
const compile = require('./compile');

// Command

module.exports.command = '$0 [files]';

module.exports.describe = 'Extract and compile locales.';

module.exports.builder = yargsBuilder => {
  yargsBuilder.positional('files', {
    default: 'src/**/*.js',
    desc: 'Glob path to extract translations from, the source files.',
  });

  yargsBuilder.options({
    output: {
      alias: 'o',
      default: 'src/locales/%lang%.json',
      desc: 'The target path where the script will output an aggregated'
        + ' `.json` file per lang of all the translations from the `files` supplied.',
    },
    compiled: {
      default: 'src/locales-compiled/%lang%.json',
      desc: 'The target path where the script will output the compiled version of the translation files,'
        + ' completed with the fallback langs.',
    },
    compileOnly: {
      type: 'boolean',
      alias: 'c',
      desc: 'Compile only, skip extraction.',
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
    },
  });
};

module.exports.handler = async argv => {
  if (!argv.compileOnly) {
    await extract.handler({
      files: argv.files,
      output: argv.output,
      idInterpolationPattern: argv.idInterpolationPattern,
      defaultLang: argv.defaultLang,
      langs: argv.langs,
      definedDefault: argv.definedDefault,
      skipIndex: argv.skipIndex,
    });
  }

  await compile.handler({
    locales: argv.output,
    output: argv.compiled,
    defaultLang: argv.defaultLang,
    langs: argv.langs,
    fallbackMap: argv.fallbackMap,
    skipIndex: argv.skipIndex,
    ast: argv.ast,
  });
};
