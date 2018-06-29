const fs = require( 'fs' );
const path = require( 'path' );
const mjml2html = require( 'mjml' );
const ejs = require( 'ejs' );
const VError = require( 'verror' );
const config = require( './config' );

/* Compile */

function compileFromMjml( mjml, opts = {} ) {
  const compiled = ejs.compile( mjml, opts );

  return data => {
    const { html, errors } = mjml2html(
      compiled( {
        ...data,
        lang: data.lang || opts.lang,
        __: data.__ || opts.__
      } )
    );

    if ( errors && errors.length ) {
      throw new VError(
        {
          info: { errors }
        },
        'Invalid MJML'
      );
    }

    return html;
  };
}

function compileFromFile( filePath, opts = {} ) {
  const mjml = fs.readFileSync( filePath, 'utf8' );

  return compileFromMjml( mjml, opts );
}

function compile( templateName, opts = {} ) {
  const templatePath = path.join( config.templatesDir || '', templateName, 'index.mjml' );

  let { __ } = opts;
  if ( !__ ) {
    const labels = ( config.translations.labels || {} )[ templateName ] || {};
    __ = config.translations.makeLabelGetter( labels, opts.lang );
  }

  return compileFromFile( templatePath, { ...opts, __ } );
}

/* Render */

function renderFromMjml( mjml, data = {}, opts = {} ) {
  const template = ejs.render(
    mjml,
    {
      ...data,
      lang: data.lang || opts.lang,
      __: data.__ || opts.__
    },
    opts
  );
  const { html, errors } = mjml2html( template );

  if ( errors && errors.length ) {
    throw new VError(
      {
        info: { errors }
      },
      'Invalid MJML'
    );
  }

  return html;
}

function renderFromFile( filePath, data = {}, opts = {} ) {
  const mjml = fs.readFileSync( filePath, 'utf8' );

  return renderFromMjml( mjml, data, opts );
}

function render( templateName, data = {}, opts = {} ) {
  const templatePath = path.join( config.templatesDir || '', templateName, 'index.mjml' );
  const lang = data.lang || opts.lang;

  let __ = data.__ || opts.__;
  if ( !__ ) {
    const labels = ( config.translations.labels || {} )[ templateName ] || {};
    __ = config.translations.makeLabelGetter( labels, lang );
  }

  return renderFromFile( templatePath, data, { ...opts, lang, __ } );
}

module.exports = {
  compileFromMjml,
  compileFromFile,
  compile,
  renderFromMjml,
  renderFromFile,
  render
};
