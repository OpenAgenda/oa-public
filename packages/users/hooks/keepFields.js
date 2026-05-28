import hooksCommon from 'feathers-hooks-common';
import fields from '../service/fields.js';

const { keep } = hooksCommon;

export default function keepFields() {
  return (context) => {
    if (context.result === null || context.params.internal === true) {
      return context;
    }

    const socialFields = ['hasSocialAccount', 'hasLocalAccount'];

    return keep(
      ...context.params.detailed
        ? [...fields.basic, ...fields.detailed, ...socialFields]
        : [...fields.basic, ...socialFields],
    )(context);
  };
}
