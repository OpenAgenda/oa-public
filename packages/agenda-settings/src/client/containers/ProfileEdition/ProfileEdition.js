import { useContext, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Field, useForm } from 'react-final-form';
import { useHistory, useLocation } from 'react-router';
import { getSupportedLocale } from '@openagenda/intl';
import { IntlProvider } from 'react-intl';
import {
  ImageInput,
  Modal,
  useLayoutData,
  AuthenticateAndConfirm,
  locales as sharedLocales,
} from '@openagenda/react-shared';
import { edit } from '../../reducers/agenda';
import * as modalsActions from '../../reducers/modals';
import validate, { schema as agendaSchema } from '../../utils/validateProfile';
import { BasicInput, BasicTextarea, InputGroup } from '../../utils/inputs';
import I18nContext from '../../contexts/I18nContext';
import catchFormErrors from '../../utils/catchFormErrors';

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

  const modals = useSelector((state) => state.modals);
  const removeRes = useSelector((state) =>
    state.res.remove.replace(':slug', slug));
  const dispatch = useDispatch();

  const showModal = useCallback(
    (name, options = {}) => dispatch(modalsActions.showModal(name, options)),
    [dispatch],
  );
  const closeModal = useCallback(
    (name) => dispatch(modalsActions.closeModal(name)),
    [dispatch],
  );

  const initialValues = useMemo(
    () => ({ title, description, url, slug, image }),
    [title, description, url, slug, image],
  );

  const onSubmit = useCallback(
    (values, form) =>
      dispatch(edit(values))
        .then((result) => {
          const newSlug = result.data.agenda.slug;

          if (newSlug !== slug) {
            history.push(location.pathname.replace(slug, newSlug));
            return;
          }

          form.reset(result.data.agenda);
        })
        .catch(catchFormErrors),
    [dispatch, history, location.pathname, slug],
  );

  return (
    <IntlProvider
      key={lang}
      locale={lang}
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
                  <button
                    type="button"
                    className="btn btn-link btn-link-inline text-danger"
                    onClick={() => showModal('removeAgenda')}
                  >
                    {getLabel('removeAgenda')}
                  </button>
                  <div className="pull-right">
                    <SubmitButton />
                  </div>
                </form>
              )}
            </Form>
          </div>
        </div>

        <Modal
          visible={modals.removeAgenda ? modals.removeAgenda.visible : false}
          onClose={() => closeModal('removeAgenda')}
          title={getLabel('removeAgenda')}
        >
          <AuthenticateAndConfirm
            message={getLabel('removeAgendaWarning')}
            res={removeRes}
            onSuccess={() => {
              console.log('Success!');
              window.location.href = '/';
            }}
          />
        </Modal>
      </div>
    </IntlProvider>
  );
}
