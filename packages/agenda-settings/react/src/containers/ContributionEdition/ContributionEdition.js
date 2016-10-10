import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import get from 'lodash.get';
import * as agendaActions from '../../redux/modules/agenda';
import { renderTextarea } from '../../utils/inputs';

const valuesSelector = formValueSelector( 'contributionEdition' );

@connect(
  state => ({
    initialValues: { settings: { contribution: state.agenda.data.settings.contribution } },
    contributionType: valuesSelector( state, 'settings.contribution.type' )
  }),
  { onSubmit: agendaActions.edit }
)
@reduxForm( {
  form: 'contributionEdition',
  enableReinitialize: true
} )
@connect(
  state => ({
    errors: state.form.contributionEdition.syncErrors,
    fields: state.form.contributionEdition.fields,
  })
)
export default class ContributionEdition extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  constructor() {
    super();
    this.renderTextarea = renderTextarea.bind( this );
  }

  renderSubmitBtn() {
    const { dirty, submitting, submitSucceeded, valid } = this.props;
    const { getLabel } = this.context;

    if ( !dirty && submitSucceeded ) {
      return <button type="submit" className="btn btn-success" disabled>Saved</button>;
    } else if ( submitting ) {
      return <button type="submit" className="btn btn-primary" disabled>Saving</button>;
    } else {
      return <button type="submit" className="btn btn-primary" {...{ disabled: dirty && valid ? undefined : true }}>
        {getLabel( 'saveModifications' )}
      </button>;
    }
  }

  render() {
    const { handleSubmit, fields, errors, contributionType } = this.props;
    const { getLabel } = this.context;

    const getError = fieldname => {
      return get( fields, fieldname ) && get( fields, fieldname, {} ).touched && errors && errors[ fieldname ];
    };

    return (
      <div className="contribution">
        <h2 className="margin-bottom-md">{getLabel( 'contribution' )}</h2>
        <div className="row">
          <div className="col-md-7">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className={`radio ${getError( 'settings.contribution.type' ) ? 'has-error' : ''}`}>
                  <p><b>{getLabel( 'contribType' )}</b></p>
                  <label>
                    <Field
                      name="settings.contribution.type"
                      component="input"
                      type="radio"
                      value="0"
                      format={v => v.toString()}
                    />
                    {getLabel( 'contribTypeChoosen' )}
                  </label><br />
                  <label>
                    <Field
                      name="settings.contribution.type"
                      component="input"
                      type="radio"
                      value="1"
                      format={v => v.toString()}
                    />
                    {getLabel( 'contribTypeAll' )}
                  </label>
                </div>
              </div>
              <Field
                name="settings.contribution.message"
                component={this.renderTextarea}
                rows={6}
                className="form-control"
                label={getLabel( 'consigne' )}
                subLabel={<p>{getLabel( 'consigneSubLabel' )}</p>}
              />
              {contributionType == 1 && <div className="form-group">
                <div className={`radio ${getError( 'settings.contribution.useFields' ) ? 'has-error' : ''}`}>
                  <p><b>{getLabel( 'contribUseFields' )}</b></p>
                  <label>
                    <Field
                      name="settings.contribution.useFields"
                      component="input"
                      type="radio"
                      value="1"
                      format={v => (v ? '1' : '0')}
                      parse={v => Boolean( parseInt( v ) )}
                    />
                    {getLabel( 'yes' )}
                  </label><br />
                  <label>
                    <Field
                      name="settings.contribution.useFields"
                      component="input"
                      type="radio"
                      value="0"
                      format={v => (v ? '1' : '0')}
                      parse={v => Boolean( parseInt( v ) )}
                    />
                    {getLabel( 'no' )}
                  </label>
                </div>
              </div>}
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
                    />
                    {getLabel( 'contribDefaultStatePublished' )}{' '}
                    <span className="text-muted">({getLabel( 'contribDefaultStatePublishedText' )})</span>
                  </label><br />
                  <label>
                    <Field
                      name="settings.contribution.defaultState"
                      component="input"
                      type="radio"
                      value="0"
                      format={v => v.toString()}
                    />
                    {getLabel( 'contribDefaultStateUnpublished' )}{' '}
                    <span className="text-muted">({getLabel( 'contribDefaultStateUnpublishedText' )})</span>
                  </label>
                </div>
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
