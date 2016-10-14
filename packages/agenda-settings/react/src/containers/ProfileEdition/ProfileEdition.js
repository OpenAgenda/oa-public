import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import ImageUpload from 'image-upload';
import Modal from 'react-components/build/Modal';
import * as agendaActions from '../../redux/modules/agenda';
import * as modalActions from '../../redux/modules/modal';
import { validate, asyncValidate, schema as agendaSchema } from './validate';
import { renderInput, renderTextarea, renderInputGroup } from '../../utils/inputs';

@connect(
  state => {
    const { uid, title, description, url, slug } = state.agenda.data;
    return {
      initialValues: { uid, title, description, url, slug },
      res: state.res,
      agenda: state.agenda.data,
      modal: state.modal
    };
  },
  { ...agendaActions, ...modalActions, onSubmit: agendaActions.edit }
)
@reduxForm( {
  form: 'profileEdition',
  validate,
  asyncValidate,
  asyncBlurFields: [ 'slug' ],
  enableReinitialize: true
} )
export default class ProfileEdition extends Component {

  static contextTypes = {
    getLabel: React.PropTypes.func,
    lang: React.PropTypes.string
  };

  constructor() {
    super();
    this.renderInput = renderInput.bind( this );
    this.renderTextarea = renderTextarea.bind( this );
    this.renderInputGroup = renderInputGroup.bind( this );
  }

  renderSubmitBtn() {
    const { dirty, submitting, submitSucceeded, valid } = this.props;
    const { getLabel } = this.context;

    if ( !dirty && submitSucceeded ) {
      return <button type="submit" className="btn btn-success" disabled>{getLabel( 'saved' )}</button>;
    } else if ( submitting ) {
      return <button type="submit" className="btn btn-primary" disabled>{getLabel( 'saving' )}</button>;
    } else {
      return <button type="submit" className="btn btn-primary" {...{ disabled: dirty && valid ? undefined : true }}>
        {getLabel( 'saveModifications' )}
      </button>;
    }
  }

  render() {
    const { handleSubmit, agenda, modal, imageUploaded, res, setModal, remove } = this.props;
    const { getLabel, lang } = this.context;

    const removeModal = {
      visible: true,
      title: getLabel( 'removeAgenda' ),
      content: <div>
        <p>{getLabel( 'removeAgendaWarning' )}</p>
        <button className="btn btn-primary" onClick={() => setModal( { visible: false } )}>
          {getLabel( 'close' )}
        </button>
        <button className="btn btn-danger pull-right"
                onClick={() => remove().then( ( { result } ) => window.location.href = result.redirectTo || '/' )}
        >
          {getLabel( 'remove' )}
        </button>
      </div>
    };

    return (
      <div className="profile">
        <h2 className="margin-bottom-md">{getLabel( 'agendaProfile' )}</h2>
        <div className="row">
          <div className="col-md-7">
            <ImageUpload
              frameName="profileAgendaEdition"
              lang={lang}
              value={agenda.image}
              handleUpdate={imageUploaded}
              upload={res.uploadImage.replace( ':slug', agenda.slug )}
              remove={res.clearImage.replace( ':slug', agenda.slug )}
              rand={false}
            />
            <form onSubmit={handleSubmit}>
              <Field
                name="title"
                component={this.renderInput}
                type="text"
                placeholder={getLabel( 'namePlaceholder' )}
                className="form-control"
                label={`${getLabel( 'name' )} *`}
                max={agendaSchema.title.max}
              />
              <Field
                name="description"
                component={this.renderTextarea}
                rows={6}
                className="form-control"
                label={`${getLabel( 'description' )} *`}
                max={agendaSchema.description.max}
              />
              <Field
                type="text"
                name="url"
                component={this.renderInput}
                className="form-control"
                placeholder={getLabel( 'websitePlaceholder' )}
                label={getLabel( 'website' )}
              />
              <Field
                type="text"
                name="slug"
                component={this.renderInputGroup}
                className="form-control"
                placeholder="URL"
                label={getLabel( 'personalizedSlug' )}
                before={<div className="input-group-addon">openagenda.com/</div>}
                errorOnDirty={true}
                spellCheck={false}
              />
              <a role="button" className="text-danger" onClick={() => setModal( removeModal )}>
                {getLabel( 'removeAgenda' )}
              </a>
              <div className="pull-right">
                {this.renderSubmitBtn()}
              </div>
            </form>
          </div>
        </div>

        <Modal visible={modal.visible || false}
               onClose={() => setModal( { visible: false } )}
               title={modal.title || ''}>
          {modal.content || ''}
        </Modal>
      </div>
    );
  }

}
