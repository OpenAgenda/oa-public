import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';
import hooksCommon from 'feathers-hooks-common';
// import fields from '../service/fields';

const { alterItems } = hooksCommon;

export default function validate(_schema) {
  return (context) => {
    const _coerce = schema(
      _schema,
      // !context.params.detailed
      //   ? _.pick( _schema, fields.basic )
      //   : _schema
    );

    return alterItems((rec) => {
      if (rec) {
        return Object.assign(rec, _.pick(_coerce(rec), Object.keys(rec)));
      }

      return rec;
    })(context);
  };
}
