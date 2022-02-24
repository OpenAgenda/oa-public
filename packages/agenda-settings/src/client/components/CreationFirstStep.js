import React, { useCallback, useContext, useRef, useState } from 'react';
import { Field, useForm } from 'react-final-form'
import { useSelector } from 'react-redux';
import { usePrevious } from 'react-use';
import { ImageInput, useApiClient } from '@openagenda/react-shared';
import { schema as agendaSchema } from '../utils/validateProfile';
import { BasicInput, BasicTextarea, InputGroup } from '../utils/inputs';
import I18nContext from '../contexts/I18nContext';
import { checkSlug } from '../utils/validateProfile';

const MAX_SIZE = 1024 * 1024 * 20; // 20MB

function SlugField() {
  const { getLabel } = useContext(I18nContext);
  const apiClient = useApiClient();
  const checkSlugRes = useSelector(state => state.res.slugAvailable);

  const error = useRef(null);

  const form = useForm();
  const prevActive = usePrevious(form.getState().active);

  const validate = useCallback(async value => {
    const formState = form.getState();
    const slugFieldState = form.getFieldState('slug');

    const titleBlurred = prevActive === 'title' && formState.active !== 'title';
    const slugBlurred = prevActive === 'slug' && formState.active !== 'slug';

    if (formState.touched.slug && (titleBlurred || slugBlurred)) {

      const newError = await checkSlug(apiClient, checkSlugRes, value);
      error.current = newError;
      return newError;
    }

    return error.current || slugFieldState.error;
  }, [apiClient, checkSlugRes, prevActive, form, error]);

  return (
    <Field
      type="text"
      name="slug"
      component={InputGroup}
      className="form-control"
      placeholder="URL"
      label={getLabel('personalizedSlug')}
      before={<div className="input-group-addon">openagenda.com/</div>}
      spellCheck={false}
      validate={validate}
    />
  );
}

export default function CreationFirstStep() {
  const { getLabel, lang } = useContext(I18nContext);

  return (
    <div>
      <h2>{getLabel( 'yourAgenda' )}</h2>
      <h4 className="text-muted">{getLabel( 'subtitle' )}</h4>
      <Field
        name="title"
        component={BasicInput}
        type="text"
        placeholder={getLabel( 'titlePlaceholder' )}
        className="form-control"
        label={`${getLabel( 'title' )} *`}
        max={agendaSchema.title.max}
      />
      <Field
        name="description"
        component={BasicTextarea}
        rows={6}
        className="form-control"
        label={`${getLabel( 'description' )} *`}
        max={agendaSchema.description.max}
      />
      <div className="form-group">
        <label htmlFor="image">{getLabel('image')}</label>
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
        type="text"
        name="url"
        component={BasicInput}
        className="form-control"
        placeholder={getLabel( 'websitePlaceholder' )}
        label={getLabel( 'website' )}
      />
      <SlugField />
      <div className="pull-right">
        <button type="submit" className="btn btn-primary">
          {getLabel( 'next' )}
        </button>
      </div>
    </div>
  );
}
