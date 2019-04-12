import _ from 'lodash';

export default schema => _.get( schema, 'fields', [] ).filter( f => f.fieldType !== 'abstract' ).length;
