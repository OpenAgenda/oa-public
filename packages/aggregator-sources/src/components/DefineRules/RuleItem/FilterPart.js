import messages from './messages.js';
import extract from './extractFilterDisplayValues.js';

const extractTextField = (textRule) => {
  if (!textRule) return null;
  const unwantedKeys = ['caseSensitive', 'wholeValue', 'required'];
  const keys = Object.keys(textRule).filter((k) => !unwantedKeys.includes(k));
  return keys[0];
};

export default ({ rule, intl, sourceAgendaSchema, sourceAgenda }) => {
  const { label, value, detail, caseSensitive, allowOnlineEvent, broken } = extract({
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
                caseSensitive ? 'info' : 'default'
              }`}
              title={intl.formatMessage(
                caseSensitive
                  ? messages.caseSensitive
                  : messages.caseInsensitive,
              )}
            >
              aA
            </span>
          ) : null}
          {rule.query.location ? (
            <>
              {caseSensitive ? (
                <span
                  className="badge badge-pill margin-h-xs badge-default"
                  title={intl.formatMessage(messages.caseSensitive)}
                >
                  aA
                </span>
              ) : null}
              {allowOnlineEvent !== false ? (
                <span
                  className="badge badge-pill margin-h-xs badge-default"
                  title={intl.formatMessage(
                    allowOnlineEvent === 'all'
                      ? messages.allowOnlineEventAll
                      : messages.allowOnlineEventStrict,
                  )}
                >
                  @
                </span>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
