import { useIntl } from 'react-intl';
import { hasFilter, hasValues } from '../../../utils/rules';
import messages from './messages';
import FilterPart from './FilterPart';
import ActionsPart from './ActionsPart';

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
          aggregatorAgenda={aggregatorAgenda}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
        />
      ) : null}
      <div className="list-item-actions padding-left-md">
        <div className="padding-left-xs">
          <button
            type="button"
            className="btn btn-link padding-v-z"
            onClick={() => onUpdate(rule.id)}
          >
            {intl.formatMessage(messages.update)}
          </button>
          <button
            type="button"
            className="btn btn-link padding-v-z"
            onClick={() => onRemove(rule.id)}
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
