import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import _ from 'lodash';
import update from 'immutability-helper';
import openFormRequest from '@openagenda/call-to-action/dist/client/openRequestForm';
import * as agendaActions from '../../redux/modules/agenda';
import { renderTextarea, renderMarkdownInput } from '../../utils/inputs';

const FORM_NAME = 'contributionEdition';

/* selectors */
const getFormState = state => state.form;
const getNamedFormState = formName => createSelector(
  [ getFormState ],
  ( formState = {} ) => formState[ formName ],
);
const registeredFieldsSelector = formName => createSelector(
  [ getNamedFormState( formName ) ],
  ( namedFormState = {} ) => namedFormState.registeredFields,
);

const getRegisteredFields = registeredFieldsSelector( FORM_NAME );
const getFormValues = formValueSelector( FORM_NAME );

@connect(
  state => {
    const registeredFields = getRegisteredFields( state );
    const registeredFieldNames = Object.values( registeredFields || {} )
      .map( rf => rf.name );
    const registeredValues = registeredFieldNames.length
      ? getFormValues( state, ...registeredFieldNames )
      : {};

    return {
      initialValues: { settings: { contribution: state.agenda.data.settings.contribution } },
      agenda: state.agenda.data,
      registeredValues
    };
  },
  {
    onSubmit: ( values, dispatch, { registeredValues } ) => {
      const messageKey = 'settings.contribution.messages';
      const messagesValues = _.mapValues(
        _.pick( values, [
          `${messageKey}.instructions`,
          `${messageKey}.complete`,
          `${messageKey}.publication`
        ] ).settings.contribution.messages,
        ( v, k ) => _.get( registeredValues, `${messageKey}.${k}`, null )
      );

      _.set( values, messageKey, messagesValues );

      return agendaActions.edit( values );
    },
  },
)
@reduxForm( {
  form: FORM_NAME,
  enableReinitialize: true,
} )
@connect(
  state => ( {
    errors: state.form.contributionEdition.syncErrors,
    fields: state.form.contributionEdition.fields,
  } ),
)
export default class ContributionEdition extends Component {

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string,
  };

  constructor( props ) {
    super( props );
    this.renderTextarea = renderTextarea.bind( this );
    this.renderMarkdownInput = renderMarkdownInput.bind( this );

    const messageKey = 'settings.contribution.messages';
    const state = {
      contributionInstructions: !!_.get( props.initialValues, `${messageKey}.instructions`, false ),
      contributionComplete: !!_.get( props.initialValues, `${messageKey}.complete`, false ),
      contributionPublication: !!_.get( props.initialValues, `${messageKey}.publication`, false )
    };

    this.state = {
      ...state,
      initialMessagesState: state
    };
  }

  renderSubmitBtn() {
    const { dirty, submitting, submitSucceeded, valid } = this.props;
    const { getLabel } = this.context;
    const dirtyState = !_.isEqual(
      this.state.initialMessagesState,
      _.pick( this.state, [ 'contributionInstructions', 'contributionComplete', 'contributionPublication' ] )
    );

    if ( !(dirty || dirtyState) && submitSucceeded ) {
      return <button type="submit" className="btn btn-success" disabled>{getLabel( 'saved' )}</button>;
    } else if ( submitting ) {
      return <button type="submit" className="btn btn-primary" disabled>{getLabel( 'saving' )}</button>;
    } else {
      return <button type="submit" className="btn btn-primary" disabled={(dirty || dirtyState) && valid ? undefined : true}>
        {getLabel( 'saveModifications' )}
      </button>;
    }
  }

  render() {
    const { handleSubmit, onSubmit, fields, errors, agenda } = this.props;
    const { getLabel, lang } = this.context;

    const getError = fieldname => {
      return _.get( fields, fieldname ) && _.get( fields, fieldname, {} ).touched && errors && errors[ fieldname ];
    };

    return (
      <div className="contribution">
        <h2 className="margin-bottom-md">{getLabel( 'contribution' )}</h2>
        <div className="row">
          <div className="col-md-7">
            <form onSubmit={handleSubmit( ( data, ...args ) => {
              return onSubmit( data, ...args )
                .then( () => this.setState( update( this.state, {
                  initialMessagesState: { $set: _.pick( this.state, [
                    'contributionInstructions',
                    'contributionComplete',
                    'contributionPublication'
                  ] ) }
                } ) ) );
            } )}>
              <div className="form-group">
                <div className={`radio ${getError( 'settings.contribution.type' ) ? 'has-error' : ''}`}>
                  <p><b>{getLabel( 'contribType' )}</b></p>
                  <label>
                    <Field
                      name="settings.contribution.type"
                      component="input"
                      type="radio"
                      value="2"
                      format={v => v.toString()}
                      parse={value => value === undefined ? undefined : parseInt( value )}
                    />
                    {getLabel( 'contribTypeChoosen' )}
                  </label><br/>
                  <label>
                    <Field
                      name="settings.contribution.type"
                      component="input"
                      type="radio"
                      value="1"
                      format={v => v.toString()}
                      parse={value => value === undefined ? undefined : parseInt( value )}
                    />
                    {getLabel( 'contribTypeAll' )}
                  </label>
                </div>
              </div>

              <p><b>{getLabel( 'contributorsMessages' )}</b></p>

              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    onChange={() => this.setState( update( this.state, {
                      contributionInstructions: { $set: !this.state.contributionInstructions },
                    } ) )}
                    defaultChecked={this.state.contributionInstructions}
                  />
                  <p>
                    <b>{getLabel( 'consigne' )}</b><br/>
                    {getLabel( 'consigneSubLabel' )}
                  </p>
                </label>
                {this.state.contributionInstructions && <div style={{ paddingLeft: '20px' }}>
                  <Field
                    name="settings.contribution.messages.instructions"
                    component={this.renderMarkdownInput}
                    lang={this.context.lang}
                  />
                </div>}
              </div>

              {agenda.credentials.invitationMessage && <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    onChange={() => this.setState( update( this.state, {
                      contributionComplete: { $set: !this.state.contributionComplete },
                    } ) )}
                    defaultChecked={this.state.contributionComplete}
                  />
                  <p>
                    <b>{getLabel( 'contributionMessageComplete' )}</b><br/>
                    {getLabel( 'contributionMessageCompleteSubLabel' )}
                  </p>
                </label>
                {this.state.contributionComplete && <Fragment>
                  <div style={{ paddingLeft: '20px' }}>
                    <Field
                      name="settings.contribution.messages.complete"
                      component={this.renderMarkdownInput}
                      lang={this.context.lang}
                    />
                  </div>
                </Fragment>}
              </div>}

              {agenda.credentials.invitationMessage && <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    onChange={() => this.setState( update( this.state, {
                      contributionPublication: { $set: !this.state.contributionPublication },
                    } ) )}
                    defaultChecked={this.state.contributionPublication}
                  />
                  <p>
                    <b>{getLabel( 'contributionMessagePublication' )}</b><br/>
                    {getLabel( 'contributionMessagePublicationSubLabel' )}
                  </p>
                </label>
                {this.state.contributionPublication && <Fragment>
                  <br/>
                  <div style={{ paddingLeft: '20px' }}>
                    <Field
                      name="settings.contribution.messages.publication"
                      component={this.renderMarkdownInput}
                      lang={this.context.lang}
                    />
                  </div>
                </Fragment>}
              </div>}

              <div className="form-group">
                <div className={`radio ${getError( 'settings.contribution.useFields' ) ? 'has-error' : ''}`}>
                  <p><b>{getLabel( 'contribUseFields' )}</b></p>
                  <label>
                    <Field
                      name="settings.contribution.useFields"
                      component="input"
                      type="radio"
                      value="1"
                      format={v => ( v ? '1' : '0' )}
                      parse={v => Boolean( parseInt( v ) )}
                    />
                    {getLabel( 'yes' )}
                  </label><br/>
                  <label>
                    <Field
                      name="settings.contribution.useFields"
                      component="input"
                      type="radio"
                      value="0"
                      format={v => ( v ? '1' : '0' )}
                      parse={v => Boolean( parseInt( v ) )}
                    />
                    {getLabel( 'no' )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <div className={`radio ${getError( 'settings.contribution.defaultState' ) ? 'has-error' : ''}`}>
                  <p><b>{getLabel( 'contribDefaultState' )}</b></p>
                  <label>
                    <Field
                      name="settings.contribution.defaultState"
                      component="input"
                      type="radio"
                      value="2"
                      format={v => v.toString()}
                      parse={value => value === undefined ? undefined : parseInt( value )}
                    />
                    {getLabel( 'contribDefaultStatePublished' )}{' '}
                    <span className="text-muted">({getLabel( 'contribDefaultStatePublishedText' )})</span>
                  </label><br/>
                  <label>
                    <Field
                      name="settings.contribution.defaultState"
                      component="input"
                      type="radio"
                      value="0"
                      format={v => v.toString()}
                      parse={value => value === undefined ? undefined : parseInt( value )}
                    />
                    {getLabel( 'contribDefaultStateUnpublished' )}{' '}
                    <span className="text-muted">({getLabel( 'contribDefaultStateUnpublishedText' )})</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <div
                  className={`checkbox ${getError( 'settings.contribution.moderateOnChangeBy' ) ? 'has-error' : ''}`}>
                  <p><b>{getLabel( 'contribModerateOnChangeBy' )}</b></p>
                  <label>
                    <Field
                      name="settings.contribution.moderateOnChangeBy"
                      component="input"
                      type="checkbox"
                      format={v => Array.isArray( v ) ? v.includes( 'contributors' ) : false}
                      parse={value => value ? [ 'contributors' ] : []}
                    />
                    {getLabel( 'contribModerateOnChangeByUnpublish' )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <p><b>{getLabel( 'limitDates' )}</b></p>
                <a
                  className="margin-right-sm"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openFormRequest( {
                    lang,
                    agenda: agenda.slug,
                    subject: 'limitDates',
                  } )}
                >
                  {getLabel( 'requestLimitDates' )}
                </a>
              </div>

              <div className="text-right">
                {this.renderSubmitBtn()}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

}
