const fs = require( 'fs' );
const path = require( 'path' );
const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const mjml2html = require( 'mjml' );
const ejs = require( 'ejs' );
const VError = require( 'verror' );
const LRU = require( 'lru-cache' );
const log = require( '@openagenda/logs' )( 'mails/templater' );
const config = require( './config' );

const cache = LRU();
const readFile = promisify( fs.readFile );

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

      return compiled[ type ]( templateData );
    };
}

async function compile( templateName, opts = {} ) {
  const cacheKeyCompiled = JSON.stringify( {
    compiled: true,
    templateName,
    ..._.pick( opts, 'lang', 'disableHtml', 'disableText', 'disableSubject' )
  } );
  const cachedCompiled = cache.get( cacheKeyCompiled );

  if ( cachedCompiled ) {
    return cachedCompiled;
  }

  const cacheKeyRaw = JSON.stringify( {
    raw: true,
    templateName,
    ..._.pick( opts, 'lang', 'disableHtml', 'disableText', 'disableSubject' )
  } );
  const cachedRaw = cache.get( cacheKeyRaw );

  const templateDir = path.join( config.templatesDir || '', templateName );
  const compiled = {};

  let rawHtml = cachedRaw && cachedRaw.html ? cachedRaw.html : null;
  let rawText = cachedRaw && cachedRaw.text ? cachedRaw.text : null;
  let rawSubject = cachedRaw && cachedRaw.subject ? cachedRaw.subject : null;

  if ( !opts.disableHtml ) {
    if ( rawHtml === null ) {
      try {
        rawHtml = await readFile( path.join( templateDir, 'index.mjml' ), 'utf8' );
      } catch ( e ) {
        log.error( new VError( e, `Error compiling html of the template '${templateName}'` ) );
      }
    }

    if ( rawHtml !== null ) {
      compiled.html = data => {
        const preHtml = ejs.render( rawHtml, data, opts );
        const { html, errors } = mjml2html( preHtml );

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
  }

  if ( !opts.disableText ) {
    if ( rawText === null ) {
      try {
        rawText = await readFile( path.join( templateDir, 'text.ejs' ), 'utf8' );
      } catch ( e ) {
        log.error( new VError( e, `Error compiling text of the template '${templateName}'` ) );
      }
    }

    if ( rawText !== null ) {
      compiled.text = ejs.compile( rawText, opts );
    }
  }

  if ( !opts.disableSubject ) {
    if ( rawSubject === null ) {
      try {
        rawSubject = await readFile( path.join( templateDir, 'subject.ejs' ), 'utf8' );
      } catch ( e ) {
        log.error( new VError( e, `Error compiling subject of the template '${templateName}'` ) );
      }
    }

    if ( rawSubject !== null ) {
      compiled.subject = ejs.compile( rawSubject, opts );
    }
  }

  const result = {
    html: opts.disableHtml || !compiled.html ? null : getCompiledRenderer( compiled, 'html', templateName, opts ),
    text: opts.disableText || !compiled.text ? null : getCompiledRenderer( compiled, 'text', templateName, opts ),
    subject:
      opts.disableSubject || !compiled.subject ? null : getCompiledRenderer( compiled, 'subject', templateName, opts )
  };

  cache.set( cacheKeyRaw, {
    html: rawHtml,
    text: rawText,
    subject: rawSubject
  } );
  cache.set( cacheKeyCompiled, result );

  return result;
}

async function render( templateName, data = {}, opts = {} ) {
  const cacheKey = JSON.stringify( {
    raw: true,
    templateName,
    ..._.pick( opts, 'lang', 'disableHtml', 'disableText', 'disableSubject' )
  } );
  const cached = cache.get( cacheKey );

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

  let rawHtml = cached && cached.html ? cached.html : null;
  let rawText = cached && cached.text ? cached.text : null;
  let rawSubject = cached && cached.subject ? cached.subject : null;
  let html = null;
  let text = null;
  let subject = null;

  // Html
  if ( !opts.disableHtml ) {
    if ( rawHtml === null ) {
      try {
        rawHtml = await readFile( path.join( templateDir, 'index.mjml' ), 'utf8' );
      } catch ( e ) {
        log.error( new VError( e, `Error rendering html of the template '${templateName}'` ) );
      }
    }

    if ( rawHtml !== null ) {
      const preHtml = ejs.render( rawHtml, templateData, opts );
      const { html: renderedHtml, errors } = mjml2html( preHtml );

      if ( errors && errors.length ) {
        throw new VError(
          {
            info: { errors }
          },
          'Invalid MJML'
        );
      }

      html = renderedHtml;
    }
  }

  // Text
  if ( !opts.disableText ) {
    if ( rawText === null ) {
      try {
        rawText = await readFile( path.join( templateDir, 'text.ejs' ), 'utf8' );
      } catch ( e ) {
        log.error( new VError( e, `Error rendering text of the template '${templateName}'` ) );
      }
    }

    if ( rawText !== null ) {
      text = ejs.render( rawText, templateData, opts );
    }
  }

  // Subject
  if ( !opts.disableSubject ) {
    if ( rawSubject === null ) {
      try {
        rawSubject = await readFile( path.join( templateDir, 'subject.ejs' ), 'utf8' );
      } catch ( e ) {
        log.error( new VError( e, `Error rendering subject of the template '${templateName}'` ) );
      }
    }

    if ( rawSubject !== null ) {
      subject = ejs.render( rawSubject, templateData, opts );
    }
  }

  cache.set( cacheKey, {
    html: rawHtml,
    text: rawText,
    subject: rawSubject
  } );

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
