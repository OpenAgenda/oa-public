import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import Switch from 'rc-switch';

import List from '@openagenda/react-components/build/List';


export default createReactClass( {

  displayName: 'Details',

  propTypes: {
    agenda: PropTypes.object,
    members: PropTypes.array,
    pageRange: PropTypes.array,
    total: PropTypes.number,
    getMembersPage: PropTypes.func,
    setAgenda: PropTypes.func,
    limit: PropTypes.number
  },

  getDefaultProps() {

    return {
      limit: 20
    };

  },

  getInitialState() {

    const query = this.props.getQuery();

    return {
      tab: (query && query.tab) || 'members'
    };

  },

  setOfficial( checked ) {

    this.props.setAgenda( { official: checked } );

  },

  setPrivate( checked ) {

    this.props.setAgenda( { private: checked } );

  },

  renderAgendaHeader() {
    const { setAgenda } = this.props;

    return (
      <header className="agenda-header">
        <div className="container-fluid profile notheme">
          <div className="row">
            {this.props.agenda.image ?
              <div className="col-sm-2 avatar-container">
                <a href={'/' + this.props.agenda.slug}> <img className="avatar"
                                                             src={'https://cibul.s3.amazonaws.com/' + this.props.agenda.image}
                                                             alt={this.props.agenda.title}/> </a>
              </div> : null}

            <div className={this.props.agenda.image ? 'col-sm-7 title-container' : 'title-container'}>
              <a href={'/' + this.props.agenda.slug}>
                <h1>{this.props.agenda.title}</h1>
                <p>{this.props.agenda.description}</p>
              </a> {this.props.agenda.url ?
              <p><a target="_blank" href={this.props.agenda.url}>{this.props.agenda.url}</a></p> : null}
              {this.props.agenda.uid ? <div>
                <div>Agenda officiel <Switch
                  className="rc-switch"
                  checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
                  unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
                  onChange={this.setOfficial}
                  checked={!!this.props.agenda.official}
                /></div>
                <div>Agenda privé <Switch
                  className="rc-switch"
                  checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
                  unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
                  onChange={this.setPrivate}
                  checked={!!this.props.agenda.private}
                /></div>
              </div> : null}
            </div>
          </div>
        </div>
      </header>
    );
  },

  renderMembersTable() {

    return (
      <table className="table table-striped table-hover">
        <thead>
        <tr>
          <th>#</th>
          <th>Type</th>
          <th>Nom complet</th>
          <th>Nom d'utilisateur</th>
          <th>Email</th>
          <th>Depuis</th>
          <th>Actions</th>
        </tr>
        </thead>
        <List
          items={this.props.members || []}
          renderItem={this.renderMemberItem}
          renderEmpty={() => <tr>
            <td colSpan="7" className="text-center">Y'a personne !</td>
          </tr>}
          renderPrev={this.renderPrev}
          renderNext={this.renderNext}
          getPage={() => null}
          wrapTag="tbody"
        />
      </table>
    );

  },

  renderMemberItem( member ) {

    if ( member.deletedUser ) {
      return (
        <tr key={member.id}>
          <td className="text-danger text-center" colSpan={7}>User deleted</td>
        </tr>
      );
    }

    if ( member.invited ) {
      return (
        <tr key={member.id}>
          <td className="text-info text-center" colSpan={7}>
            User invited (
            {member.custom.contactName ? <Fragment>{member.custom.contactName}: </Fragment> : null}
            {member.custom.email})
          </td>
        </tr>
      );
    }

    return (
      <tr key={member.id}>
        <td className="text-primary">{member.user.uid}</td>
        <td>{roleToString( member.role )}</td>
        <td>{member.user.fullName}</td>
        <td>{member.user.username}</td>
        <td>{member.user.email}</td>
        <td>le {member.user.createdAt}</td>
        <td>
          <a href={'/admin/users/signin?uid=' + member.user.uid}>
            <i className="fa fa-sign-in" aria-hidden="true"></i>
          </a>
        </td>
      </tr>
    );

  },

  renderPrev() {

    if ( this.hasPrevPage() ) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            <button className="btn btn-default"
                    onClick={this.props.getMembersPage.bind( null, false )}>Précédent
            </button>
          </td>
        </tr>
      );
    }

  },

  renderNext() {

    if ( this.hasNextPage() ) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            <button className="btn btn-default"
                    onClick={this.props.getMembersPage.bind( null, true )}>Suivant
            </button>
          </td>
        </tr>
      );
    }

  },

  hasNextPage() {

    var lastPage = this.props.pageRange[ 1 ];

    return lastPage * this.props.limit < this.props.total;

  },

  hasPrevPage() {

    return this.props.pageRange[ 0 ] > 1;

  },

  renderFeaturesTab() {

    const { agenda, setAgenda } = this.props;

    const credentials = _.get( agenda, 'config.credentials', {} );

    return <ul className="list-unstyled">{_.keys( credentials ).map( c =>
      <li key={c} className="margin-v-sm">
        <Switch
          className="rc-switch"
          checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
          unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
          onChange={checked => setAgenda( _.set( {}, [ 'credentials', c ], checked ) )}
          checked={!!agenda.credentials[ c ]}
        /> {credentials[ c ].description}
      </li>
    )}</ul>

  },

  setTab( name ) {
    this.setState( { tab: name } );
    this.props.updateHref( Object.assign( this.props.getQuery() || {}, { tab: name } ) );
  },

  render() {

    const { tab } = this.state;

    return <div className="col-md-9">
      <div className="row">
        {this.props.agenda ? this.renderAgendaHeader() : ''}

        <div className="nav nav-tabs">
          <li role="presentation" className={tab == 'members' ? 'active' : ''}
              onClick={() => this.setTab( 'members' )}>
            <a href="#">Member</a>
          </li>
          <li role="presentation" className={tab == 'features' ? 'active' : ''}
              onClick={() => this.setTab( 'features' )}>
            <a href="#">Features</a>
          </li>
        </div>

        {tab == 'members' && this.renderMembersTable()}
        {tab == 'features' && this.renderFeaturesTab()}
      </div>
    </div>;

  }

} );

function roleToString( type ) {
  switch ( type ) {
    case 1:
      return 'Contributeur';
    case 2:
      return 'Administrateur';
    case 3:
      return 'Modérateur';
    case 3:
      return 'Lecteur';
    default:
      return 'Inconnu';
  }
}
