import React, { useContext, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Field, useForm } from 'react-final-form';
import { ImageInput, Modal, useLayoutData } from '@openagenda/react-shared';
import { edit } from '../../reducers/agenda';
import * as modalsActions from '../../reducers/modals';
import validate, { schema as agendaSchema } from '../../utils/validateProfile';
import { BasicInput, BasicTextarea, InputGroup } from '../../utils/inputs';
import I18nContext from '../../contexts/I18nContext';
import catchFormErrors from '../../utils/catchFormErrors';

const MAX_SIZE = 1024 * 1024 * 20; // 20MB

// TODO si le slug change au submit, déplacer à la bonne page
// if (this.props.agenda.slug !== prevProps.agenda.slug) {
//   window.location.replace(window.location.pathname.replace(prevProps.agenda.slug, this.props.agenda.slug));
// }

function SubmitButton() {
  const { getLabel } = useContext(I18nContext);
  const form = useForm();

  const { dirty, submitting, submitSucceeded, hasValidationError } = form.getState();

  if (!dirty && submitSucceeded) {
    return <button type="submit" className="btn btn-success" disabled>{getLabel('saved')}</button>;
  } else if (submitting) {
    return <button type="submit" className="btn btn-primary" disabled>{getLabel('saving')}</button>;
  } else {
    return (
      <button type="submit" className="btn btn-primary" disable={dirty && !hasValidationError ? undefined : true}>
        {getLabel('saveModifications')}
      </button>
    );
  }
}

export default function ProfileEdition() {
  const { agenda: { title, description, url, slug, image } } = useLayoutData();

  const { getLabel, lang } = useContext(I18nContext);

  const modals = useSelector(state => state.modals);

  const dispatch = useDispatch();

  const showModal = useCallback((name, options = {}) => dispatch(modalsActions.showModal(name, options)), [dispatch]);
  const closeModal = useCallback(name => dispatch(modalsActions.closeModal(name)), [dispatch]);

  const initialValues = useMemo(
    () => ({ title, description, url, slug, image }),
    [title, description, url, slug, image]
  );

  const onSubmit = useCallback(values => dispatch(edit(values)).then(() => {
    if (values.slug !== slug) {
      console.log('SLUG changed');
      // window.location.replace(window.location.pathname.replace(prevProps.agenda.slug, this.props.agenda.slug));
    }
  }).catch(catchFormErrors), [dispatch]);

  return (
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
                  before={<div className="input-group-addon">openagenda.com/</div>}
                  spellCheck={false}
                />
                <a role="button" className="text-danger" onClick={() => showModal('removeAgenda')}>
                  {getLabel('removeAgenda')}
                </a>
                <div className="pull-right">
                  <SubmitButton />
                </div>
              </form>
            )}
          </Form>
        </div>
      </div>

      <Modal
        visible={modals['removeAgenda'] ? modals['removeAgenda'].visible : false}
        onClose={() => closeModal('removeAgenda')}
        title={getLabel('removeAgenda')}
      >
        <p>{getLabel('removeAgendaWarning')}</p>
        <button className="btn btn-primary" onClick={() => closeModal('removeAgenda')}>
          {getLabel('close')}
        </button>
        <button
          className="btn btn-danger pull-right"
          onClick={() => remove().then(result => window.location.href = result.data.redirectTo || '/')}
        >
          {getLabel('remove')}
        </button>
      </Modal>
    </div>
  );
}
