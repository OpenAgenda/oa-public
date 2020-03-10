import React, { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useMemoOne } from '@openagenda/react-shared/dist/hooks/useMemoOne';
import getMultiLanguageLabel from '../../utils/getMultiLanguageLabel';
import messages from './messages';

export default function RuleItem({
  rule, onUpdate, onRemove, sourceSchema
}) {
  const intl = useIntl();

  const handleUpdate = useCallback(() => onUpdate(rule.id), [
    onUpdate,
    rule.id
  ]);
  const handleRemove = useCallback(() => onRemove(rule.id), [
    onRemove,
    rule.id
  ]);

  const queryKey = useMemo(() => {
    const keys = Object.keys(rule.query || {});

    if (!keys.length) {
      return null;
    }

    return keys[0];
  }, [rule.query]);

  const queryType = useMemo(() => {
    if (!queryKey) {
      return 'all';
    }

    return ['location', 'tags'].includes(queryKey) ? queryKey : 'extended';
  }, [queryKey]);

  const ruleValue = useMemoOne(() => {
    switch (queryType) {
      case 'all':
        return intl.formatMessage(messages.noFilter);
      case 'location':
        return [].concat(Object.values(rule.query.location)[0]).join(', ');
      case 'tags':
        return []
          .concat(rule.query.tags)
          .map(getMultiLanguageLabel)
          .join(', ');
      case 'extended': {
        const key = Object.keys(rule.query)[0];
        const fieldSchema = sourceSchema.fields.find(
          _fieldSchema => _fieldSchema.field === key
        );
        const labels = []
          .concat(rule.query[key])
          .map(
            id => fieldSchema?.options?.find(option => option.id === id) || id
          )
          .map(v => getMultiLanguageLabel(v?.label));

        return intl.formatList(labels);
      }
      default:
        return null;
    }
  }, [intl, queryType, rule, sourceSchema]);

  const typeMessage = useMemoOne(() => {
    switch (queryType) {
      case 'all':
        return intl.formatMessage(messages.allEvents);
      case 'location':
        return intl.formatMessage(messages.locationFilter, {
          required: rule.required
        });
      case 'tags':
        return intl.formatMessage(messages.tagFilter, {
          required: rule.required
        });
      case 'extended':
        return intl.formatMessage(messages.extendedFilter, {
          required: rule.required
        });
      default:
        return null;
    }
  }, [intl, queryType, rule.required]);

  return (
    <div className="row padding-bottom-sm">
      <div className="col-md-6">
        <div className="rule-value">{ruleValue}</div>

        <span className="text-muted">
          {typeMessage}

          {(rule.transform || rule.actions)?.length ? (
            <>
              {' '}
              {intl.formatMessage(messages.withActions, {
                actionCount: (rule.transform || rule.actions).length
              })}
            </>
          ) : null}
        </span>
      </div>

      <div className="col-md-3 text-center">
        <button type="button" className="btn btn-link" onClick={handleUpdate}>
          {intl.formatMessage(messages.update)}
        </button>
      </div>

      <div className="col-md-3 text-center">
        <button
          type="button"
          className="btn btn-link text-danger"
          onClick={handleRemove}
        >
          {intl.formatMessage(messages.remove)}
        </button>
      </div>
    </div>
  );
}
