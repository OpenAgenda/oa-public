import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, updateSyncErrors } from 'redux-form';
import { ImageInput, Modal, withLayoutData } from '@openagenda/react-shared';
import * as agendaActions from '../../reducers/agenda';
import * as modalsActions from '../../reducers/modals';
import { validate, asyncValidate, schema as agendaSchema } from './validate';
import { renderInput, renderTextarea, renderInputGroup } from '../../utils/inputs';
import I18nContext from '../../contexts/I18nContext';

const MAX_SIZE = 1024 * 1024 * 20; // 20MB

@withLayoutData('agenda')
@connect(
  (state, props) => {
    const { title, description, url, slug, image } = props.agenda;

    return {
      initialValues: { title, description, url, slug, image },
      res: state.res,
      modals: state.modals
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

  static contextType = I18nContext;

  constructor( props ) {
    super( props );
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

  componentDidUpdate( prevProps ) {
    // Typical usage (don't forget to compare props):
    if ( this.props.agenda.slug !== prevProps.agenda.slug ) {
      window.location.replace( window.location.pathname.replace( prevProps.agenda.slug, this.props.agenda.slug ) );
    }
  }

  renderSubmitBtn = () => {
    const { dirty, submitting, submitSucceeded, valid } = this.props;
    const { getLabel } = this.context;

    if ( !dirty && submitSucceeded ) {
      return <button type="submit" className="btn btn-success" disabled>{getLabel( 'saved' )}</button>;
    } else if ( submitting ) {
      return <button type="submit" className="btn btn-primary" disabled>{getLabel( 'saving' )}</button>;
    } else {
      return (
        <button type="submit" className="btn btn-primary"{...{ disabled: dirty && valid ? undefined : true }}>
          {getLabel( 'saveModifications' )}
        </button>
      );
    }
  }

  render() {
    const {
      handleSubmit, modals, showModal, closeModal, remove
    } = this.props;
    const { getLabel, lang } = this.context;

    return (
      <div className="profile">
        <div className="row">
          <div className="col-md-7">
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
                component={this.renderInput}
                type="text"
                placeholder={getLabel( 'titlePlaceholder' )}
                className="form-control"
                label={`${getLabel( 'title' )} *`}
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
            onClick={() => remove().then( result => window.location.href = result.redirectTo || '/' )}
          >
            {getLabel( 'remove' )}
          </button>
        </Modal>
      </div>
    );
  }

}
