import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { updateSyncErrors } from 'redux-form/lib/actions';
import ImageUpload from '@openagenda/image-upload';
import Modal from '@openagenda/react-components/build/Modal';
import * as agendaActions from '../../redux/modules/agenda';
import * as modalsActions from '../../redux/modules/modals';
import { validate, asyncValidate, schema as agendaSchema } from './validate';
import { renderInput, renderTextarea, renderInputGroup } from '../../utils/inputs';

const displayInputError = ( { dirty, touched } ) => touched && dirty;

@connect(
  state => {
    const { uid, title, description, url, slug } = state.agenda.data;
    return {
      initialValues: { uid, title, description, url, slug },
      res: state.res,
      agenda: state.agenda.data,
      modals: state.modals,
      imageChanged: state.agenda.imageChanged
    };
  },
  { ...agendaActions, ...modalsActions, onSubmit: agendaActions.edit }
)
@reduxForm( {
  form: 'profileEdition',
  validate,
  asyncValidate,
  asyncBlurFields: [ 'slug' ],
  enableReinitialize: true
} )
@connect(
  () => ({}),
  { updateSyncErrors }
)
export default class ProfileEdition extends Component {

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  constructor() {
    super();
    this.renderInput = renderInput.bind( this );
    this.renderTextarea = renderTextarea.bind( this );
    this.renderInputGroup = renderInputGroup.bind( this );
  }

  componentDidMount() {

    /*
      @kevin: le updateSyncErrors n'est pas défini lors du chargement de l'app en prod
      ce qui rend une page blanche et empêche les users d'update leur profil.
      2 modifs: la condition + changement de WillMount à DidMount.
    */
    if ( this.props.updateSyncErrors ) {

      this.props.updateSyncErrors( 'profileEdition' );

    }

  }

  renderSubmitBtn() {
    const { dirty, submitting, submitSucceeded, valid, imageChanged } = this.props;
    const { getLabel } = this.context;

    if ( !dirty && !imageChanged && submitSucceeded ) {
      return <button type="submit" className="btn btn-success" disabled>{getLabel( 'saved' )}</button>;
    } else if ( submitting ) {
      return <button type="submit" className="btn btn-primary" disabled>{getLabel( 'saving' )}</button>;
    } else {
      const disabled = (dirty && valid) || (imageChanged && !dirty) || (imageChanged && dirty && valid);
      return (
        <button type="submit" className="btn btn-primary"{...{ disabled: disabled ? undefined : true }}>
          {getLabel( 'saveModifications' )}
        </button>
      );
    }
  }

  render() {
    const {
      handleSubmit, agenda, modals, imageUploaded,
      imageChanged, res, showModal, closeModal, remove
    } = this.props;
    const { getLabel, lang } = this.context;

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
              rand={!!imageChanged}
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
                displayError={displayInputError}
              />
              <Field
                name="description"
                component={this.renderTextarea}
                rows={6}
                className="form-control"
                label={`${getLabel( 'description' )} *`}
                max={agendaSchema.description.max}
                displayError={displayInputError}
              />
              <Field
                type="text"
                name="url"
                component={this.renderInput}
                className="form-control"
                placeholder={getLabel( 'websitePlaceholder' )}
                label={getLabel( 'website' )}
                displayError={displayInputError}
              />
              <Field
                type="text"
                name="slug"
                component={this.renderInputGroup}
                className="form-control"
                placeholder="URL"
                label={getLabel( 'personalizedSlug' )}
                before={<div className="input-group-addon">openagenda.com/</div>}
                displayError={displayInputError}
                spellCheck={false}
              />
              <a role="button" className="text-danger" onClick={() => showModal( 'removeAgenda' )}>
                {getLabel( 'removeAgenda' )}
              </a>
              <div className="pull-right">
                {this.renderSubmitBtn()}
              </div>
            </form>
          </div>
        </div>

        <Modal
          visible={modals[ 'removeAgenda' ] ? modals[ 'removeAgenda' ].visible : false}
          onClose={() => closeModal( 'removeAgenda' )}
          title={getLabel( 'removeAgenda' )}
        >
          <p>{getLabel( 'removeAgendaWarning' )}</p>
          <button className="btn btn-primary" onClick={() => closeModal( 'removeAgenda' )}>
            {getLabel( 'close' )}
          </button>
          <button
            className="btn btn-danger pull-right"
            onClick={() => remove().then( ( { result } ) => window.location.href = result.redirectTo || '/' )}
          >
            {getLabel( 'remove' )}
          </button>
        </Modal>
      </div>
    );
  }

}
