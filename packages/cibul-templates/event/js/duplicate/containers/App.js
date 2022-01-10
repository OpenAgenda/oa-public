import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/event/duplicate'; // TODO changes to event/duplicate.js
import { Modal, Spinner } from '@openagenda/react-shared';
import AgendasSearch from './AgendasSearch';
import * as modalsActions from '../redux/modules/modals';

@connect(
  state => ({
    loading: state.agendas.selectAgendasForDuplicate.loading,
    modals: state.modals,
    eventUid: state.eventUid,
    agendaUid: state.agendaUid,
    initialized: state.agendas.initialized
  }),
  modalsActions
)
export default class App extends Component {
  static childContextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  getChildContext() {
    const { lang } = this.props;

    return {
      lang,
      getLabel: label => makeGetterLabel( labels )( label, lang )
    };
  }

  getDuplicateLink = agenda => {
    const { agendaUid, eventUid } = this.props;

    return `/${agenda.slug}/contribute?agendaUid=${agendaUid}&eventUid=${eventUid}`;
  };

  render() {
    const { loading, modals, closeModal, agendaUid, agendaSlug, agendaTitle, agendaImage, initialized } = this.props;
    const { getLabel } = this.getChildContext();

    const selectAgendasModal = modals.selectAgendasForDuplicate || {};
    const sameAgendaLink = this.getDuplicateLink( { uid: agendaUid, slug: agendaSlug } );

    return (
      selectAgendasModal.visible && initialized ? (
        <Modal
          title="Sélectionner un agenda"
          onClose={() => closeModal( 'selectAgendasForDuplicate' )}
          classNames={{ overlay: 'popup-overlay big' }}
          disableBodyScroll
        >
          {loading ? (
            <div className="padding-v-lg" style={{ position: 'relative' }}>
              <Spinner />
            </div>
          ) : (
            <>
              <h3>{getLabel( 'modalBigSentence' )}</h3>
              <div className="margin-v-sm text-muted">{getLabel( 'modalReminder' )}</div>
              <p>{getLabel( 'createNewEventIn' )}</p>

              <div className="agenda-item media">
                <div className="media-left">
                  <a href={sameAgendaLink}>
                    <img
                      src={agendaImage}
                      className="media-object ill avatar"
                      alt={agendaTitle}
                    />
                  </a>
                </div>
                <div className="media-body">
                  <div className="title media-heading">
                    <a href={sameAgendaLink}>
                      <strong>{agendaTitle}</strong>
                    </a>
                  </div>
                </div>
              </div>

              <div className="hr margin-v-md">{getLabel( 'or' )}</div>

              <AgendasSearch
                id="selectAgendasForDuplicate"
                getTitleLink={this.getDuplicateLink}
                createButtonIfEmpty
              />
            </>
          )}
        </Modal>
      ) : null
    );
  }
}
