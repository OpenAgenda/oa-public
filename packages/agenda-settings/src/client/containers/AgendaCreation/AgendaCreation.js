import React, { useCallback, useContext, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { Form, useForm } from 'react-final-form';
import { OnChange, OnBlur } from 'react-final-form-listeners';
import slugify from 'slugify';
import { create } from '../../reducers/agenda';
import { CreationFirstStep, CreationSecondStep } from '../../components';
import I18nContext from '../../contexts/I18nContext';
import validate, { schema as agendaSchema } from '../../utils/validateProfile';
import catchFormErrors from '../../utils/catchFormErrors';

const mutators = {
  setFieldTouched: (args, state) => {
    const [name, touched] = args;
    const field = state.fields[name];
    if (field) {
      field.touched = !!touched;
    }
  }
};

function SlugUpdater() {
  const form = useForm();
  const [slugModified, setSlugModified] = useState(false);

  return (
    <>
      <OnChange name="title">
        {value => {
          if (!slugModified) {
            form.change('slug', slugify(value, { lower: true, strict: true }));
          }
        }}
      </OnChange>
      <OnBlur name="title">
        {() => {
          const slugState = form.getFieldState('slug');
          if (!slugState.touched) {
            form.mutators.setFieldTouched('slug', true);
          }
        }}
      </OnBlur>
      <OnChange name="slug">
        {value => {
          const slugState = form.getFieldState('slug');

          setSlugModified(slugState.active && value !== '');
        }}
      </OnChange>
    </>
  );
}

export default function AgendaCreation() {
  const res = useSelector(state => state.res);
  const dispatch = useDispatch();
  const history = useHistory();

  const { getLabel } = useContext(I18nContext);

  const [page, setPage] = useState(1);
  const [initialValues] = useState(() => ({
    settings: {
      contribution: {
        type: agendaSchema.settings.fields.contribution.fields.type.default,
        defaultState: agendaSchema.settings.fields.contribution.fields.defaultState.default
      }
    }
  }));

  const nextPage = useCallback(() => setPage(prev => prev + 1), []);
  const previousPage = useCallback(() => setPage(prev => prev - 1), []);

  const onSubmit = useCallback(async values => {
    if (page < 2) {
      nextPage();
      return;
    }

    try {
      const result = await dispatch(create(values));

      history.push(res.onCreated.replace(':slug', result.data.agenda.slug));
    } catch (e) {
      catchFormErrors(e);
    }
  }, [page, nextPage, dispatch, res, history]);

  return (
    <div className="row">
      <div className="col-md-offset-3 col-md-6">
        <div className="top-margined wsq">
          <div className="content clearfix">
            <div className="stepper-container">
              <div className="stepper">
                <div className={`step ${page === 1 ? 'active' : 'passed'}`}>{getLabel( 'description' )}</div>
                <div className={`step ${page === 2 && 'active'}`}>{getLabel( 'parameters' )}</div>
              </div>
            </div>
            <Form
              onSubmit={onSubmit}
              validate={validate}
              validateOnBlur
              initialValues={initialValues}
              mutators={mutators}
            >
              {({ handleSubmit, values, submitting, form }) => (
                <form onSubmit={handleSubmit}>
                  {page === 1 && <CreationFirstStep />}
                  {page === 2 && <CreationSecondStep
                    previousPage={previousPage}
                    title={values.title}
                    form={form}
                    submitting={submitting}
                  />}
                  <SlugUpdater />
                </form>
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
