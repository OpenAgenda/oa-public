const fs = require( 'fs' );
const path = require( 'path' );
const _ = require( 'lodash' );
const mjml2html = require( 'mjml' );
const ejs = require( 'ejs' );
const VError = require( 'verror' );
const log = require( '@openagenda/logs' )( 'mails/templater' );
const config = require( './config' );

function getCompiledRenderer( compiled, type, templateName, opts ) {
  let { __ } = opts;
  if ( !__ ) {
    const labels = ( config.translations.labels || {} )[ templateName ] || {};
    __ = config.translations.makeLabelGetter( labels, opts.lang );
  }

  return typeof compiled[ type ] !== 'function'
    ? null
    : data => {
      if ( opts[ `disable${_.capitalize( type )}` ] ) {
        return null;
      }

      const templateData = {
        ...data,
        lang: data.lang || opts.lang,
        __: data.__ || __
      };

      try {
        return compiled[ type ]( templateData );
      } catch ( e ) {
        log.debug( new VError( e, `Error rendering ${type} compiled of the template ${templateName}` ) );
        return null;
      }
    };
}

function compile( templateName, opts = {} ) {
  const templateDir = path.join( config.templatesDir || '', templateName );
  const compiled = {};

  if ( !opts.disableHtml ) {
    try {
      const rawHtml = fs.readFileSync( path.join( templateDir, 'index.mjml' ), 'utf8' );
      const { html: preHtml, errors } = mjml2html( rawHtml );

      if ( errors && errors.length ) {
        throw new VError(
          {
            info: { errors }
          },
          'Invalid MJML'
        );
      }

      compiled.html = ejs.compile( preHtml, opts );
    } catch ( e ) {
      log.debug( new VError( e, `Error compiling html of the template '${templateName}'` ) );
    }
  }

  if ( !opts.disableText ) {
    try {
      const rawText = fs.readFileSync( path.join( templateDir, 'text.ejs' ), 'utf8' );
      compiled.text = ejs.compile( rawText, opts );
    } catch ( e ) {
      log.debug( new VError( e, `Error compiling text of the template '${templateName}'` ) );
    }
  }

  if ( !opts.disableSubject ) {
    try {
      const rawSubject = fs.readFileSync( path.join( templateDir, 'subject.ejs' ), 'utf8' );
      compiled.subject = ejs.compile( rawSubject, opts );
    } catch ( e ) {
      log.debug( new VError( e, `Error compiling subject of the template '${templateName}'` ) );
    }
  }

  return {
    html: opts.disableHtml ? null : getCompiledRenderer( compiled, 'html', templateName, opts ),
    text: opts.disableText ? null : getCompiledRenderer( compiled, 'text', templateName, opts ),
    subject: opts.disableSubject ? null : getCompiledRenderer( compiled, 'subject', templateName, opts )
  };
}

function render( templateName, data = {}, opts = {} ) {
  const templateDir = path.join( config.templatesDir || '', templateName );
  const lang = data.lang || opts.lang;

  let __ = data.__ || opts.__;
  if ( !__ ) {
    const labels = ( config.translations.labels || {} )[ templateName ] || {};
    __ = config.translations.makeLabelGetter( labels, lang );
  }

  const templateData = {
    ...data,
    lang,
    __
  };

  let html = null;
  let text = null;
  let subject = null;

  if ( !opts.disableHtml ) {
    try {
      const rawHtml = fs.readFileSync( path.join( templateDir, 'index.mjml' ), 'utf8' );
      const { html: preHtml, errors } = mjml2html( rawHtml );

      if ( errors && errors.length ) {
        throw new VError(
          {
            info: { errors }
          },
          'Invalid MJML'
        );
      }

      html = ejs.render( preHtml, templateData, opts );
    } catch ( e ) {
      log.debug( new VError( e, `Error rendering html of the template '${templateName}'` ) );
    }
  }

  if ( !opts.disableText ) {
    try {
      const rawText = fs.readFileSync( path.join( templateDir, 'text.ejs' ), 'utf8' );
      text = ejs.render( rawText, templateData, opts );
    } catch ( e ) {
      log.debug( new VError( e, `Error rendering text of the template '${templateName}'` ) );
    }
  }

  if ( !opts.disableSubject ) {
    try {
      const rawSubject = fs.readFileSync( path.join( templateDir, 'subject.ejs' ), 'utf8' );
      subject = ejs.render( rawSubject, templateData, opts );
    } catch ( e ) {
      log.debug( new VError( e, `Error rendering subject of the template '${templateName}'` ) );
    }
  }

  return {
    html,
    text,
    subject
  };
}

module.exports = {
  compile,
  render
};
