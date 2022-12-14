import _ from 'lodash';

import { useEffect } from 'react';

import { useIntl } from 'react-intl';
import { useForm } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { usePrevious } from 'react-use';

import { useMemoOne, useCallbackOne } from '@openagenda/react-shared';
import ActionFormPart from './ActionFormPart';
import messages from './messages';

export default ({ aggregatorAgendaSchema }) => {
  const intl = useIntl();
  const form = useForm();
  const { values } = form.getState();

  const leftFieldsToDefine = useMemoOne(
    () =>
      aggregatorAgendaSchema.fields
        .filter(
          v => ['radio', 'checkbox'].includes(v.fieldType) && v.options?.length,
        )
        .concat({ field: 'state' })
        .filter(v => !values.actions?.find(w => w && v.field === w.field))
        .length,
    [aggregatorAgendaSchema.fields, values.actions],
  );

  const lastAction = useMemoOne(
    () => (values.actions ? values.actions[values.actions.length - 1] : null),
    [values.actions],
  );

  const pushAction = useCallbackOne(() => {
    if (
      leftFieldsToDefine
      && (!values.actions?.length || (lastAction && lastAction.field))
    ) {
      form.mutators.push('actions', { id: _.uniqueId(), field: null });
    }
  }, [form.mutators, lastAction, leftFieldsToDefine, values.actions]);

  const prevWithActions = usePrevious(!!values.withActions);

  useEffect(() => {
    // useLayoutEffect/useIsomorphicLayoutEffect not working with pushAction
    if (
      values.withActions !== prevWithActions
      && values.withActions
      && !values.actions?.length
    ) {
      pushAction();
    }
  }, [values.withActions, prevWithActions, pushAction, values.actions]);

  return (
    <div className="form-group">
      <FieldArray name="actions">
        {({ fields }) =>
          fields.map((name, index) => (
            <div
              key={values.actions[index].id}
              className="margin-top-sm actions-container"
            >
              <div className="form-group">
                <ActionFormPart
                  id={values.actions[index].id}
                  name={name}
                  aggregatorAgendaSchema={aggregatorAgendaSchema}
                />
              </div>

              <div className="remove-action">
                <button
                  type="button"
                  className="btn btn-link-inline"
                  onClick={() => fields.remove(index, undefined)}
                  title={intl.formatMessage(messages.removeAction)}
                >
                  <i className="fa fa-times text-danger" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
      </FieldArray>

      <button
        type="button"
        className="btn btn-link-inline"
        onClick={pushAction}
      >
        {intl.formatMessage(messages.addAnAction)}
      </button>
    </div>
  );
};
