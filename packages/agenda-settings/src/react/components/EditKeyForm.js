import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';
import { renderField, renderInput, renderTextarea, renderInputGroup } from '../utils/inputs';

@reduxForm( {} )
export default class EditKeyForm extends Component {

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  constructor( props ) {
    super( props );
    this.renderField = renderField.bind( this );
    this.renderInput = renderInput.bind( this );
    this.renderTextarea = renderTextarea.bind( this );
    this.renderInputGroup = renderInputGroup.bind( this );
  }

  render() {
    const { handleSubmit, index, item, cancel } = this.props;
    const { getLabel } = this.context;

    return (
      <form className="form-inline" onSubmit={handleSubmit}>
        <div className="input-group">
          <Field
            name="label"
            placeholder={getLabel( 'keyNbr', { nbr: index + 1 } )}
            component={this.renderInputGroup}
            className="form-control"
            formGroupClass={false}
            after={
              <span className="input-group-btn">
                <MoreInfo
                  id={`cancel-edit-key-${item.id}`}
                  content={getLabel( 'cancel' )}
                >
                  <button className="btn btn-default" type="button" onClick={() => cancel()}>
                    <i className="fa fa-ban text-danger" aria-hidden="true"></i>
                  </button>
                </MoreInfo>
                <MoreInfo
                  id={`save-edit-key-${item.id}`}
                  content={getLabel( 'save' )}
                >
                  <button className="btn btn-default" type="submit">
                    <i className="fa fa-check text-primary" aria-hidden="true"></i>
                  </button>
                </MoreInfo>
              </span>
            }
          />
        </div>
      </form>
    );
  }

}
