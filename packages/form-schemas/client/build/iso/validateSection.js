import textValidator from '@openagenda/validators/text.js';
import choice from '@openagenda/validators/choice.js';
import schema from '@openagenda/validators/schema/index.js';
import multilingualValidator from '@openagenda/validators/multilingual.js';
import areLabelsMultilingual from './areLabelsMultilingual.js';
schema.register({
  text: textValidator,
  multilingual: multilingualValidator,
  choice
});
export default function validateSection(s) {
  const validate = schema({
    label: {
      type: areLabelsMultilingual(s) ? 'multilingual' : 'text',
      optional: true,
      max: 255
    },
    type: {
      type: 'choice',
      optional: false,
      unique: true,
      options: ['section']
    },
    slug: {
      type: 'text'
    },
    display: {
      type: 'boolean',
      default: true
    }
  });
  return validate(s);
}
//# sourceMappingURL=validateSection.js.map