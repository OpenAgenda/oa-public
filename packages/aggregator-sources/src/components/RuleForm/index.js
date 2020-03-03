import React, { useMemo } from 'react';
import * as ReactIs from 'react-is';
import { useIntl } from 'react-intl';
import { useFormState, Field } from 'react-final-form';
import classNames from 'classnames';

import messages from './messages';

import ActionsFormPart from './ActionsFormPart';
import ExtendedFormPart from './ExtendedFormPart';
import LocationFormPart from './LocationFormPart';
import Radio from './Radio';
import RequiredFieldPart from './RequiredFieldPart';
import TagsFormPart from './TagsFormPart';

export default function RuleForm({
  SubmitButton,
  handleSubmit,
  onCancel,
  values,
  options,
  disabledExtended,
  isAggregator,
  aggregatorAgendaSchema,
  sourceSchema
}) {
  const intl = useIntl();
  const formState = useFormState();

  const error = !formState.dirtySinceLastSubmit && formState.submitError
    ? formState.submitError
    : null;

  const submitElement = useMemo(
    () => (ReactIs.isValidElementType(SubmitButton) ? (
      <SubmitButton
        handleSubmit={handleSubmit}
        onCancel={onCancel}
        options={options}
      />
    ) : null),
    [SubmitButton, handleSubmit, onCancel, options]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="checkbox">
        <div className="form-group">
          <Field
            component={Radio}
            name="withFilter"
            type="checkbox"
            label={<b>{intl.formatMessage(messages.useFilter)}</b>}
            helpBlock={(
              <div className="radio-sub-block">
                {intl.formatMessage(messages.useFilterDesc)}
              </div>
            )}
          />
        </div>
      </div>

      {values.withFilter ? (
        <div className="radio-sub-block">
          <Field
            component={Radio}
            name="type"
            type="radio"
            label={intl.formatMessage(messages.locationFilter)}
            value="location"
            classNameGroup="radio"
            helpBlock={(
              <div className="radio-sub-block text-muted">
                {intl.formatMessage(messages.helpFilterLocation)}
              </div>
            )}
          />

          {values.type === 'location' ? (
            <div className="radio-sub-block">
              <LocationFormPart />
              <RequiredFieldPart />
            </div>
          ) : null}

          {!isAggregator ? (
            <Field
              component={Radio}
              name="type"
              type="radio"
              label={intl.formatMessage(messages.extendedFilter)}
              value="extended"
              classNameGroup={classNames('radio', {
                disabled: disabledExtended
              })}
              disabled={disabledExtended}
              helpBlock={(
                <div className="radio-sub-block text-muted">
                  {intl.formatMessage(messages.helpFilterExtended)}
                </div>
              )}
            />
          ) : null}

          {values.type === 'extended' ? (
            <div className="radio-sub-block">
              <ExtendedFormPart
                aggregatorAgendaSchema={aggregatorAgendaSchema}
                sourceSchema={sourceSchema}
              />
              <RequiredFieldPart />
            </div>
          ) : null}

          <Field
            component={Radio}
            name="type"
            type="radio"
            label={intl.formatMessage(messages.tagFilter)}
            value="tags"
            classNameGroup="radio"
            helpBlock={(
              <div className="radio-sub-block text-muted">
                {intl.formatMessage(messages.helpFilterTag)}
              </div>
            )}
          />

          {values.type === 'tags' ? (
            <div className="radio-sub-block">
              <TagsFormPart schema={sourceSchema} />
              <RequiredFieldPart />
            </div>
          ) : null}

          {!formState.dirtySinceLastSubmit && formState.submitErrors?.type ? (
            <div className="margin-top-xs margin-bottom-md text-danger">
              {formState.submitErrors.type}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="checkbox">
        <div className="form-group">
          <Field
            component={Radio}
            name="withActions"
            type="checkbox"
            label={<b>{intl.formatMessage(messages.useActions)}</b>}
            helpBlock={(
              <div className="radio-sub-block">
                {intl.formatMessage(messages.useActionsDesc)}
              </div>
            )}
          />
        </div>
      </div>

      {values.withActions ? (
        <div className="radio-sub-block">
          <ActionsFormPart
            aggregatorAgendaSchema={aggregatorAgendaSchema}
            sourceSchema={sourceSchema}
          />
        </div>
      ) : null}

      {error ? <p className="text-danger">{error}</p> : null}

      {submitElement}
    </form>
  );
}
