import { useEffect, useMemo } from 'react';
import * as ReactIs from 'react-is';
import { useIntl } from 'react-intl';
import { useFormState, Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

import messages from './messages.js';

import ActionsFormPart from './ActionsFormPart.js';
import ChoiceFieldFormPart from './ChoiceFieldFormPart.js';
import LocationFormPart from './LocationFormPart.js';
import TextFormPart from './TextFormPart.js';
import Radio from './Radio.js';
import TagsFormPart from './TagsFormPart.js';
import LanguagesFormPart from './LanguagesFormPart.js';
import TimingsFormPart from './TimingsFormPart.js';
import FeaturedFormPart from './FeaturedFormPart.js';

export default function RuleForm({
  SubmitButton,
  handleSubmit,
  onCancel,
  values,
  options,
  disabledChoice,
  isAggregator,
  aggregatorAgendaSchema,
  sourceSchema,
  sourceAgenda,
  displayTagFilter,
  isRequiredFilter,
}) {
  const res = useSelector((state) => state.res);
  const intl = useIntl();
  const formState = useFormState();

  useEffect(() => {
    if (!isRequiredFilter) {
      values.required = false;
    } else {
      values.withFilter = true;
      values.withActions = false;
      values.required = true;
    }
  });

  const error = !formState.dirtySinceLastSubmit && formState.submitError
    ? formState.submitError
    : null;

  const submitElement = useMemo(
    () =>
      (ReactIs.isValidElementType(SubmitButton) ? (
        <SubmitButton
          handleSubmit={handleSubmit}
          onCancel={onCancel}
          options={options}
        />
      ) : null),
    [SubmitButton, handleSubmit, onCancel, options],
  );

  return (
    <form onSubmit={handleSubmit}>
      {!values.required ? (
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
      ) : null}

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
            </div>
          ) : null}

          {!isAggregator ? (
            <Field
              component={Radio}
              name="type"
              type="radio"
              label={intl.formatMessage(messages.choiceFilter)}
              value="choice"
              classNameGroup={classNames('radio', {
                disabled: disabledChoice,
              })}
              disabled={disabledChoice}
              helpBlock={(
                <div className="radio-sub-block text-muted">
                  {intl.formatMessage(messages.helpFilterChoice)}
                </div>
              )}
            />
          ) : null}

          {values.type === 'choice' ? (
            <div className="radio-sub-block">
              <ChoiceFieldFormPart
                aggregatorAgendaSchema={aggregatorAgendaSchema}
                sourceSchema={sourceSchema}
              />
            </div>
          ) : null}

          <Field
            component={Radio}
            name="type"
            type="radio"
            label={intl.formatMessage(messages.textFilter)}
            value="text"
            classNameGroup={classNames('radio')}
            helpBlock={(
              <div className="radio-sub-block text-muted">
                {intl.formatMessage(messages.helpFilterText)}
              </div>
            )}
          />

          {values.type === 'text' ? (
            <div className="radio-sub-block">
              <TextFormPart
                aggregatorAgendaSchema={aggregatorAgendaSchema}
                sourceSchema={sourceSchema}
              />
            </div>
          ) : null}

          <Field
            component={Radio}
            name="type"
            type="radio"
            label={intl.formatMessage(messages.languagesFilter)}
            value="languages"
            classNameGroup={classNames('radio')}
            helpBlock={(
              <div className="radio-sub-block text-muted">
                {intl.formatMessage(messages.helpFilterLanguages)}
              </div>
            )}
          />
          {values.type === 'languages' ? (
            <div className="radio-sub-block">
              <LanguagesFormPart
                aggregatorAgendaSchema={aggregatorAgendaSchema}
                sourceSchema={sourceSchema}
                sourceAgendaUid={sourceAgenda.uid}
                res={res.getSourceLang}
              />
            </div>
          ) : null}

          <Field
            component={Radio}
            name="type"
            type="radio"
            label={intl.formatMessage(messages.timingsFilter)}
            value="timings"
            classNameGroup={classNames('radio')}
            helpBlock={(
              <div className="radio-sub-block text-muted">
                {intl.formatMessage(messages.helpFilterTimings)}
              </div>
            )}
          />
          {values.type === 'timings' ? (
            <div className="radio-sub-block">
              <TimingsFormPart />
            </div>
          ) : null}

          <Field
            component={Radio}
            name="type"
            type="radio"
            label={intl.formatMessage(messages.featuredFilter)}
            value="featured"
            classNameGroup={classNames('radio')}
            helpBlock={(
              <div className="radio-sub-block text-muted">
                {intl.formatMessage(messages.helpFilterFeatured)}
              </div>
            )}
          />
          {values.type === 'featured' ? (
            <div className="radio-sub-block">
              <FeaturedFormPart />
            </div>
          ) : null}

          {displayTagFilter ? (
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
          ) : null}

          {values.type === 'tags' ? (
            <div className="radio-sub-block">
              <TagsFormPart schema={sourceSchema} />
            </div>
          ) : null}

          {!formState.dirtySinceLastSubmit && formState.submitErrors?.type ? (
            <div className="margin-top-xs margin-bottom-md text-danger">
              {formState.submitErrors.type}
            </div>
          ) : null}
        </div>
      ) : null}

      {!isRequiredFilter ? (
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
      ) : null}

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
