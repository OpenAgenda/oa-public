import languages from 'languages';

export default languages.getAllLanguageCode()
  .map( c => ( { value: c, label: languages.getLanguageInfo( c ).nativeName } ) )
  .sort( ( a, b ) => a.label < b.label ? -1 : 1 );