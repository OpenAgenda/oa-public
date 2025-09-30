import { useIntl } from 'react-intl';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  index: _index,
  isDragging: _isDragging,
}) {
  const intl = useIntl();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      className="list-group-item"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
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
    </div>
  );
}
