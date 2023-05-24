import messages from './messages';
import extract from './extractFilterDisplayValues';

const extractTextField = textRule => {
  if (!textRule) return null;
  const unwantedKeys = ['caseSensitive', 'wholeValue', 'required'];
  const keys = Object.keys(textRule).filter(k => !unwantedKeys.includes(k));
  return keys[0];
};

export default ({ rule, intl, sourceAgendaSchema, sourceAgenda }) => {
  const { label, value, detail, casse, broken } = extract({
    intl,
    rule,
    sourceAgendaSchema,
    sourceAgenda,
  });
  const textField = extractTextField(rule.query.text);
  const labelClass = `margin-right-xs ${broken ? 'text-danger' : ''}`;
  return (
    <div className="padding-v-xs">
      <span
        title={intl.formatMessage(
          rule.required ? messages.requiredFilterDetail : messages.filterDetail,
        )}
        className={`pull-left badge badge-pill badge-${
          rule.required ? 'danger' : 'default'
        }`}
      >
        <i className="fa fa-filter" />
      </span>
      <div className="padding-left-md">
        <div className="padding-left-xs" title={detail}>
          <label className={labelClass} htmlFor={rule.id}>
            {label}:
          </label>
          {value}
          {rule.query.text && rule.query.text[textField] ? (
            <span
              className={`badge badge-pill margin-right-xs badge-${
                casse ? 'info' : 'default'
              }`}
              title={intl.formatMessage(
                casse ? messages.caseSensitive : messages.caseInsensitive,
              )}
            >
              aA
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
