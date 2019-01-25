import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import AbilitiesEditor from '@openagenda/abilities/build/client/AbilitiesEditor';


@connect( state => ({
  user: state.userSettings.user,
  prefix: state.settings.prefix
}) )
@withRouter
export default class UnsubscribedSettings extends Component {
  static contextTypes = {
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  render() {
    const { getLabel, lang } = this.context;
    const { activeTab, history, prefix, user } = this.props;

    return (
      <tr
        onClick={!activeTab ? () => history.push( prefix + '/emails' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => history.push( prefix + '/' ) : null}
          className="col-md-3"
          style={{ cursor: 'pointer' }}
        >
          {getLabel( 'emails' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <div>
              <AbilitiesEditor
                locale={lang}
                entityName="user"
                identifier={user.uid}
                res={{
                  // get + patch
                  formIndex: '/abilities/form-index'
                }}
                searchChildKey="entity.agendaTitle"
                filterInputPlaceholder={getLabel( 'filterInputPlaceholder' )}
                HeaderComponent={( { filterInput, saveButton } ) => (
                  <div className="clearfix margin-bottom-sm">
                    <div className="pull-right">
                      {saveButton}
                    </div>

                    <p>{getLabel( 'chooseEmailsSent' )}</p>

                    {/*<div className="margin-top-md">{filterInput}</div>*/}
                  </div>
                )}
              />
            </div>
          </div>
        </td> : <td style={{ cursor: 'pointer' }}>{getLabel( 'chooseEmailsSent' )}</td>}
      </tr>
    );
  }
}
