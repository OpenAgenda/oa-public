import _ from 'lodash';
import React, { useCallback, useMemo, useReducer } from 'react';
import * as ReactIs from 'react-is';
import { Form, Field } from 'react-final-form';
import ReactTagsInput from 'react-tagsinput';
import BsField from '../components/BsField';

function getInitialState(initialRules) {
  return {
    ruleAdditionMode: false,
    rules: initialRules || []
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'toggleRuleAdditionMode': {
      return {
        ...state,
        ruleAdditionMode: !state.ruleAdditionMode
      };
    }
    case 'addRule': {
      return {
        ...state,
        rules: [
          ...state.rules,
          {
            ...action.payload.data,
            id: _.uniqueId() // for react key prop
          }
        ]
      };
    }
    default:
      return state;
  }
}

// function Input({
//   input,
//   placeholder,
//   className,
//   spellCheck,
//   autoFocus,
//   ...props
// }) {
//   const inputAttrs = {
//     className,
//     placeholder,
//     spellCheck,
//     autoFocus
//   };
//
//   return (
//     <BsField input={input} {...props}>
//       <input {...input} {...inputAttrs} />
//     </BsField>
//   );
// }

function TagsInput({
  input, placeholder, className, spellCheck, autoFocus
}) {
  const inputAttrs = {
    className,
    spellCheck,
    autoFocus
  };

  const inputProps = useMemo(
    () => ({
      placeholder
    }),
    [placeholder]
  );

  return <ReactTagsInput {...input} {...inputAttrs} inputProps={inputProps} />;
}

function Select({
  input,
  placeholder,
  className,
  spellCheck,
  autoFocus,
  children,
  ...props
}) {
  const inputAttrs = {
    placeholder,
    className,
    spellCheck,
    autoFocus
  };

  return (
    <BsField input={input} {...props}>
      <select {...input} {...inputAttrs}>
        {children}
      </select>
    </BsField>
  );
}

function Radio({
  id,
  input,
  label,
  placeholder,
  className,
  spellCheck,
  autoFocus,
  ...props
}) {
  const inputAttrs = {
    id,
    placeholder,
    className,
    spellCheck,
    autoFocus
  };

  return (
    <BsField input={input} {...props}>
      <label htmlFor={id}>
        <input {...input} {...inputAttrs} /> {label}
      </label>
    </BsField>
  );
}

function RuleItem({ rule }) {
  return (
    <div className="row margin-v-sm">
      <div className="col-md-6">
        {rule.query.location
          ? Object.values(rule.query.location)[0].join(', ')
          : null}

        {rule.query.tags ? rule.query.tags.join(', ') : null}

        <br />

        <span className="text-muted">
          {rule.query.location ? 'Filtre géographique' : null}

          {rule.query.tags ? 'Filtre labels' : null}
        </span>
      </div>

      <div className="col-md-3 text-center">
        <button type="button" className="btn btn-link">
          Modifer
        </button>
      </div>

      <div className="col-md-3 text-center">
        <button type="button" className="btn btn-link text-danger">
          Supprimer
        </button>
      </div>
    </div>
  );
}

function DefineRules({ initialRules, SubmitButton, onSubmit }) {
  const initialState = useMemo(() => getInitialState(initialRules), [
    initialRules
  ]);
  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleRuleAdditionMode = useCallback(
    () => dispatch({
      type: 'toggleRuleAdditionMode'
    }),
    [dispatch]
  );

  const addRule = useCallback(
    values => {
      const query = values.type === 'location'
        ? {
          location: {
            [values.subDivision]: values.values
          }
        }
        : {
          tags: values.values
        };

      dispatch({
        type: 'addRule',
        payload: {
          data: { query }
        }
      });

      toggleRuleAdditionMode();
    },
    [dispatch, toggleRuleAdditionMode]
  );

  const submitElement = useMemo(
    () => (ReactIs.isValidElementType(SubmitButton) ? (
      <SubmitButton
        handleSubmit={() => onSubmit(state.rules.map(rule => _.omit(rule, 'id')))}
        rules={state.rules}
        ruleAdditionMode={state.ruleAdditionMode}
      />
    ) : null),
    [SubmitButton, onSubmit, state.rules, state.ruleAdditionMode]
  );

  const locationFormPart = (
    <>
      <Field
        component={Select}
        name="subDivision"
        defaultValue="city"
        label="Subdivision géographique:"
        subLabel=" "
        className="form-control"
        classNameGroup="form-group form-inline"
      >
        <option value="city">Commune</option>
        <option value="department">Département</option>
        <option value="region">Région</option>
      </Field>

      <div className="form-group form-group-values">
        <div className="row">
          <label className="control-label col-sm-2" htmlFor="type">
            Valeurs:
          </label>

          <div className="col-sm-10">
            <Field
              component={TagsInput}
              name="values"
              className="form-control react-tagsinput"
              classNameGroup="form-inline"
              placeholder="Ajouter une valeur"
              format={v => (v === undefined ? [] : v)}
              parse={v => (v.length ? v : undefined)}
            />
          </div>
        </div>
      </div>
    </>
  );

  const tagsFormPart = (
    <>
      {/* <div className="form-group form-group-type">
        <div className="row">
          <label className="control-label col-sm-2" htmlFor="type">Clé:</label>

          <Field
            component={Input}
            name="key"
            type="text"
            placeholder="Thémathique(s)"
            className="form-control"
            classNameGroup="col-sm-10"
          />
        </div>
      </div> */}

      <div className="form-group form-group-values">
        <div className="row">
          <label className="control-label col-sm-2" htmlFor="type">
            Valeurs:
          </label>

          <div className="col-sm-10">
            <Field
              component={TagsInput}
              name="values"
              className="form-control react-tagsinput"
              classNameGroup="form-inline"
              placeholder="Ajouter une valeur"
              format={v => (v === undefined ? [] : v)}
              parse={v => (v.length ? v : undefined)}
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderForm = useCallback(
    ({ handleSubmit, values }) => (
      <form onSubmit={handleSubmit}>
        <div className="form-group form-group-type">
          <div className="row">
            <label className="control-label col-sm-2" htmlFor="type">
              Type:
            </label>

            <div className="col-sm-10">
              <Field
                component={Radio}
                name="type"
                type="radio"
                label="Filtre géographique"
                value="location"
                classNameGroup="radio"
              />
              <Field
                component={Radio}
                name="type"
                type="radio"
                label="Filtre labels"
                value="tags"
                classNameGroup="radio"
              />
            </div>
          </div>
        </div>

        {values.type === 'location' ? locationFormPart : null}
        {values.type === 'tags' ? tagsFormPart : null}

        <div>
          <div className="pull-left">
            <button
              type="button"
              className="btn btn-link text-danger cancel-button-left"
              onClick={toggleRuleAdditionMode}
            >
              Annuler
            </button>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Ajouter
            </button>
          </div>
        </div>
      </form>
    ),
    [locationFormPart, tagsFormPart, toggleRuleAdditionMode]
  );

  const content = state.ruleAdditionMode ? (
    <div className="margin-v-md">
      <h4 className="text-center margin-bottom-sm">Nouvelle règle</h4>

      <Form onSubmit={addRule} render={renderForm} />
    </div>
  ) : (
    <div className="margin-v-md">
      {!state.rules || !state.rules.length ? (
        <div className="text-center">Ancune règle n&apos;est défini</div>
      ) : null}

      {state.rules.map(rule => (
        <RuleItem key={rule.id} rule={rule} />
      ))}

      <button
        type="button"
        className="btn-link-inline"
        onClick={toggleRuleAdditionMode}
      >
        Ajouter une règle
      </button>
    </div>
  );

  return (
    <>
      {content}

      {submitElement}
    </>
  );
}

export default React.forwardRef(DefineRules);
