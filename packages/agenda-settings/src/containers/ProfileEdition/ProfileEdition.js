import { useContext, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Field, useForm } from 'react-final-form';
import { useHistory, useLocation } from 'react-router';
import { getSupportedLocale } from '@openagenda/intl';
import { IntlProvider } from 'react-intl';
import {
  ImageInput,
  useLayoutData,
  locales as sharedLocales,
} from '@openagenda/react-shared';
import { edit } from '../../reducers/agenda.js';
import validate, {
  schema as agendaSchema,
} from '../../utils/validateProfile.js';
import { BasicInput, BasicTextarea, InputGroup } from '../../utils/inputs.js';
import I18nContext from '../../contexts/I18nContext.js';
import catchFormErrors from '../../utils/catchFormErrors.js';

const MAX_SIZE = 1024 * 1024 * 20; // 20MB

function SubmitButton() {
  const { getLabel } = useContext(I18nContext);
  const form = useForm();

  const { dirty, submitting, submitSucceeded, hasValidationError } = form.getState();

  if (!dirty && submitSucceeded) {
    return (
      <button type="submit" className="btn btn-success" disabled>
        {getLabel('saved')}
      </button>
    );
  }
  if (submitting) {
    return (
      <button type="submit" className="btn btn-primary" disabled>
        {getLabel('saving')}
      </button>
    );
  }
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={dirty && !hasValidationError ? undefined : true}
    >
      {getLabel('saveModifications')}
    </button>
  );
}

export default function ProfileEdition() {
  const {
    agenda: { title, description, url, slug, image },
  } = useLayoutData();
  const history = useHistory();
  const location = useLocation();

  const { getLabel, lang } = useContext(I18nContext);

  const dispatch = useDispatch();

  const initialValues = useMemo(
    () => ({ title, description, url, slug, image }),
    [title, description, url, slug, image],
  );

  const onSubmit = useCallback(
    (values, form) =>
      dispatch(edit(values))
        .then((result) => {
          const newSlug = result.agenda.slug;

          if (newSlug !== slug) {
            history.push(location.pathname.replace(slug, newSlug));
            return;
          }

          form.reset(result.agenda);
        })
        .catch(catchFormErrors),
    [dispatch, history, location.pathname, slug],
  );

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      // eslint-disable-next-line import/namespace
      messages={sharedLocales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div className="profile">
        <div className="row">
          <div className="col-md-7">
            <Form
              onSubmit={onSubmit}
              validate={validate}
              validateOnBlur
              initialValues={initialValues}
            >
              {({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="title">{getLabel('image')}</label>
                    <Field
                      name="image"
                      component={ImageInput}
                      type="file"
                      locale={lang}
                      maxSize={MAX_SIZE}
                      width="300px"
                      height="300px"
                      rounded
                    />
                  </div>
                  <Field
                    name="title"
                    component={BasicInput}
                    type="text"
                    placeholder={getLabel('titlePlaceholder')}
                    className="form-control"
                    label={`${getLabel('title')} *`}
                    max={agendaSchema.title.max}
                  />
                  <Field
                    name="description"
                    component={BasicTextarea}
                    rows={6}
                    className="form-control"
                    label={`${getLabel('description')} *`}
                    max={agendaSchema.description.max}
                  />
                  <Field
                    type="text"
                    name="url"
                    component={BasicInput}
                    className="form-control"
                    placeholder={getLabel('websitePlaceholder')}
                    label={getLabel('website')}
                  />
                  <Field
                    type="text"
                    name="slug"
                    component={InputGroup}
                    className="form-control"
                    placeholder="URL"
                    label={getLabel('personalizedSlug')}
                    before={
                      <div className="input-group-addon">openagenda.com/</div>
                    }
                    spellCheck={false}
                  />
                  <div className="pull-right">
                    <SubmitButton />
                  </div>
                </form>
              )}
            </Form>
          </div>
        </div>
      </div>
    </IntlProvider>
  );
}
