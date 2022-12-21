const textValidator = require('@openagenda/validators/text');
const choice = require('@openagenda/validators/choice');
const schema = require('@openagenda/validators/schema');
const multilingualValidator = require('@openagenda/validators/multilingual');
const areLabelsMultilingual = require('./areLabelsMultilingual');

schema.register({
  text: textValidator,
  multilingual: multilingualValidator,
  choice,
});

module.exports = function validateSection(s) {
  const validate = schema({
    label: {
      type: areLabelsMultilingual(s) ? 'multilingual' : 'text',
      optional: true,
      max: 255,
    },
    type: {
      type: 'choice',
      optional: false,
      unique: true,
      options: ['section'],
    },
    slug: {
      type: 'text',
    },
  });

  return validate(s);
};
