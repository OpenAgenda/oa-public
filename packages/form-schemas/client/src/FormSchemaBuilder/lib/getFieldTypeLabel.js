import _ from 'lodash';

import labels from './labels';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

const getLabel = makeLabelGetter( labels );

export default ( field, preferredLang ) => {

  const { fieldType, languages } = field;

  let labelCode = [
    fieldType,
    languages ? 'Multilingual' : '',
    'FieldType'
  ].join( '' );

  if ( !labels[ labelCode ] ) labelCode = 'unknownFieldType';

  return getLabel( labelCode, preferredLang );

}
