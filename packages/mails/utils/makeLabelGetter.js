module.exports = function makeLabelGetter( labels, defaultLang ) {
  return ( name, values, lang ) => {
    if ( lang === undefined && typeof values === 'string' ) {
      lang = values;
      values = {};
    }

    if ( !lang ) {
      lang = defaultLang;
    }

    let label = labels[ name ] && labels[ name ][ lang ] ? labels[ name ][ lang ] : name;

    for ( const key in values ) {
      if ( Object.prototype.hasOwnProperty.call( values, key ) ) {
        label = label.replace( new RegExp( `%${key}%`, 'g' ), values[ key ] );
      }
    }

    return label;
  };
};
