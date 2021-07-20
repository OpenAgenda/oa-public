import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

const messages = defineMessages({
  back: {
    id: 'AgendaLocations.createFormHeader.back',
    defaultMessage: 'Go back to the list',
  },
  title: {
    id: 'AgendaLocations.createFormHeader.title',
    defaultMessage: 'Create a location',
  },
  info: {
    id: 'AgendaLocations.createFormHeader.info',
    defaultMessage: 'Define the name, address and exact location of the place',
  },
});

const CreateFormHeader = ({ actions }) => (
  <div className="head">
    {actions && actions.closeForm ? (
      <button type="button" className="btn btn-default" onClick={actions.closeForm}>
        <i className="fa fa-angle-left margin-right-sm" />
        <span><FormattedMessage {...messages.back} /></span>
      </button>
    ) : null}
    <h2><FormattedMessage {...messages.title} /></h2>
    <span className="info"><FormattedMessage {...messages.info} /></span>
  </div>
);

CreateFormHeader.propTypes = {
  actions: PropTypes.object,
};

export default CreateFormHeader;
