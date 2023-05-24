import { hasFilter } from '../../../utils/rules';
import extract from './extractActionsDisplayValues';
import messages from './messages';

export default ({ intl, rule, aggregatorAgendaSchema, aggregatorAgenda }) => (
  <div>
    {hasFilter(rule) ? (
      <span
        title={intl.formatMessage(messages.actionsAfterFilterDetail)}
        className="pull-left actions-icon"
      >
        ↳
      </span>
    ) : (
      <span
        className="badge badge-pill badge-default pull-left"
        title={intl.formatMessage(messages.actionsDetail)}
      >
        <i className="fa fa-arrow-right" />
      </span>
    )}
    <ul className="padding-left-md margin-bottom-z list-unstyled">
      {rule.actions.map(action => {
        const { label, value, detail, key, set } = extract({
          intl,
          aggregatorAgendaSchema,
          aggregatorAgenda,
          action,
        });

        return (
          <li
            key={key}
            title={detail}
            className="padding-left-xs padding-bottom-xs"
          >
            <label htmlFor={key} className="margin-right-xs">
              {label}:
            </label>
            {set ? (
              <span
                className="badge badge-pill badge-default margin-right-xs"
                title={intl.formatMessage(messages.replacingActionDetail)}
              >
                ↦
              </span>
            ) : null}
            {value}
          </li>
        );
      })}
    </ul>
  </div>
);
