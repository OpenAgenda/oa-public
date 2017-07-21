import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import openFormRequest from 'call-to-action/react/dist/openRequestForm';
import { KeysManager } from '../../components';

const zendeskRes = {
  official: 'https://openagenda.zendesk.com/hc/articles/115001581185',
  private: 'https://openagenda.zendesk.com/hc/fr/articles/115001584389'
};

@connect(
  state => ({
    agenda: state.agenda.data
  })
)
export default class ContributionEdition extends Component {

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  state = {
    activeTab: null
  }

  setTab( tab ) {

    this.setState( { activeTab: tab } );

  }

  renderTableRow( tabName, description, closedComponent, openedComponent ) {

    const { activeTab } = this.state;

    return (
      <tr
        className={classNames( { inactive: activeTab !== tabName } )}
        onClick={activeTab !== tabName ? () => this.setTab( tabName ) : null}
      >
        <td
          className="col-md-3"
          style={{ cursor: 'pointer' }}
          onClick={activeTab === tabName ? () => this.setTab( null ) : null}
        >
          {description}
        </td>
        {activeTab === tabName ?
          <td>
            <div
              className="margin-bottom-sm"
              style={{ cursor: 'pointer' }}
              onClick={() => this.setTab( null )}
            >
              {closedComponent}
            </div>
            {openedComponent}
          </td> :
          <td style={{ cursor: 'pointer' }}>{closedComponent}</td>}
      </tr>
    );

  }

  render() {
    const { agenda } = this.props;
    const { getLabel, lang } = this.context;

    return (
      <div className="advanced">
        <h2 className="margin-bottom-lg">{getLabel( 'advanced' )}</h2>

        <div className="table-responsive">
          <table className="table">
            <tbody>

            {this.renderTableRow(
              'keys',
              <b>{getLabel( 'accessKeys' )}</b>,
              getLabel( 'manageKeys' ),
              <KeysManager />
            )}

            {this.renderTableRow(
              'official',
              <b>{getLabel( 'labeling' )}</b>,
              getLabel( agenda.official ? 'officialAgenda' : 'nonOfficialAgenda' ),
              <div>
                {agenda.official
                  ? <a href={zendeskRes.official} target="_blank">{getLabel( 'learnMore' )}</a>
                  : <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openFormRequest( { lang, agenda: agenda.slug, subject: 'officialAgenda' } )}
                    >
                      {getLabel( 'requestOfficialAgenda' )}
                    </a>
                    <a
                      href={zendeskRes.official}
                      target="_blank"
                    >
                      {getLabel( 'learnMore' )}
                    </a>
                  </div>}
              </div>
            )}

            {this.renderTableRow(
              'private',
              <b>{getLabel( 'visibility' )}</b>,
              getLabel( agenda.private ? 'privateAgenda' : 'publicAgenda' ),
              <div>
                {agenda.private
                  ? <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openFormRequest( { lang, agenda: agenda.slug, subject: 'publicAgenda' } )}
                    >
                      {getLabel( 'requestPublicAgenda' )}
                    </a>
                    <a
                      href={zendeskRes.private}
                      target="_blank"
                    >
                      {getLabel( 'learnMore' )}
                    </a>
                  </div>
                  : <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openFormRequest( { lang, agenda: agenda.slug, subject: 'privateAgenda' } )}
                    >
                      {getLabel( 'requestPrivateAgenda' )}
                    </a>
                    <a
                      href={zendeskRes.private}
                      target="_blank"
                    >
                      {getLabel( 'learnMore' )}
                    </a>
                  </div>}
              </div>
            )}

            {this.renderTableRow(
              'personalization',
              <b>{getLabel( 'personalization' )}</b>,
              getLabel( 'editEventsDescription' ),
              <div>
                <a
                  className="margin-right-sm"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openFormRequest( { lang, agenda: agenda.slug, subject: 'bottomDescription' } )}
                >
                  {getLabel( 'requestBottomDescription' )}
                </a>
              </div>
            )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}
