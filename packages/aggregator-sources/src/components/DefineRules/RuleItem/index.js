import { useIntl } from 'react-intl';
import { hasFilter, hasValues } from '../../../utils/rules.js';
import messages from './messages.js';
import FilterPart from './FilterPart.js';
import ActionsPart from './ActionsPart.js';

export default function RuleItem({
  rule,
  onUpdate,
  onRemove,
  sourceAgenda,
  sourceAgendaSchema,
  aggregatorAgenda,
  aggregatorAgendaSchema,
}) {
  const intl = useIntl();

  return (
    <>
      {hasFilter(rule) ? (
        <FilterPart
          rule={rule}
          intl={intl}
          sourceAgenda={sourceAgenda}
          sourceAgendaSchema={sourceAgendaSchema}
        />
      ) : null}
      {hasValues(rule) ? (
        <ActionsPart
          rule={rule}
          intl={intl}
          sourceAgenda={sourceAgenda}
          sourceAgendaSchema={sourceAgendaSchema}
          aggregatorAgenda={aggregatorAgenda}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
        />
      ) : null}
      <div className="list-item-actions padding-left-md">
        <div className="padding-left-xs">
          <button
            type="button"
            className="btn btn-link padding-v-z"
            onClick={() => onUpdate(rule.id, rule.required)}
          >
            {intl.formatMessage(messages.update)}
          </button>
          <button
            type="button"
            className="btn btn-link padding-v-z"
            onClick={() => onRemove(rule.id, rule.required)}
          >
            <span className="text text-danger">
              {intl.formatMessage(messages.remove)}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
