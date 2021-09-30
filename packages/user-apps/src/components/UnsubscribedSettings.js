import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import AbilitiesEditor from '@openagenda/abilities/build/client/AbilitiesEditor';
import I18nContext from '../contexts/I18nContext';


@connect( state => ({
  prefix: state.settings.prefix
}) )
@withRouter
export default class UnsubscribedSettings extends Component {
  static contextType = I18nContext;

  render() {
    const { getLabel, lang } = this.context;
    const { activeTab, history, prefix, user } = this.props;

    return (
      <tr
        onClick={!activeTab ? () => history.push( prefix + '/emails', { fromUserApps: true } ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => history.push( prefix + '/', { fromUserApps: true } ) : null}
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
