"use strict";

var React = require( "react" ),

  List = require( 'react-components/build/List' ),

  Switch = require( 'rc-switch' );


module.exports = React.createClass( {

  displayName: 'Details',

  propTypes: {
    agenda: React.PropTypes.object,
    stakeholders: React.PropTypes.array,
    pageRange: React.PropTypes.array,
    total: React.PropTypes.number,
    getStakeholdersPage: React.PropTypes.func,
    setAgenda: React.PropTypes.func,
    limit: React.PropTypes.number
  },

  getDefaultProps() {

    return {
      limit: 20
    };

  },

  getInitialState() {

    const query = this.props.getQuery();

    return {
      tab: (query && query.tab) || 'stakeholders'
    };

  },

  setOfficial( checked ){

    this.props.setAgenda( { official: checked } );

  },

  setPrivate( checked ){

    this.props.setAgenda( { private: checked } );

  },

  renderAgendaHeader () {
    const { setAgenda } = this.props;

    return (
      <header className="agenda-header">
        <div className="container-fluid profile notheme">
          <div className="row">
            { this.props.agenda.image ?
              <div className="col-sm-2 avatar-container">
                <a href={'/' + this.props.agenda.slug}> <img className="avatar"
                  src={'https://cibul.s3.amazonaws.com/' + this.props.agenda.image}
                  alt={this.props.agenda.title} /> </a>
              </div> : null }

            <div className={ this.props.agenda.image ? 'col-sm-7 title-container' : 'title-container' }>
              <a href={'/' + this.props.agenda.slug}>
                <h1>{this.props.agenda.title}</h1>
                <p>{this.props.agenda.description}</p>
              </a> { this.props.agenda.url ?
              <p><a target="_blank" href={this.props.agenda.url}>{this.props.agenda.url}</a></p> : null }
              {this.props.agenda.uid ? <div>
                <div>Agenda officiel <Switch
                  ref="switch"
                  className="rc-switch"
                  checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
                  unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
                  onChange={this.setOfficial}
                  checked={!!this.props.agenda.official}
                /></div>
                <div>Agenda privé <Switch
                  ref="switch"
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

  renderStakeholdersTable() {

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
          items={this.props.stakeholders || []}
          renderItem={this.renderStakeholderItem}
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

  renderStakeholderItem( stakeholder ) {

    if (!stakeholder.user) {
      return (
        <tr key={stakeholder.id}>
          <td className="text-danger" colspan="7">User deleted</td>
        </tr>
      );
    }

    return (
      <tr key={stakeholder.id}>
        <td className="text-primary">{stakeholder.user.uid}</td>
        <td>{credentialsToString( stakeholder.credential )}</td>
        <td>{stakeholder.user.full_name}</td>
        <td>{stakeholder.user.username}</td>
        <td>{stakeholder.user.email}</td>
        <td>le {stakeholder.user.created_at}</td>
        <td>
          <a href={'/admin/users/signin?uid=' + stakeholder.user.uid}>
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
              onClick={this.props.getStakeholdersPage.bind( null, false )}>Précédent
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
              onClick={this.props.getStakeholdersPage.bind( null, true )}>Suivant
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

    return (
      agenda.credentials && <div>
        <p></p>

        <p>
          <Switch
            className="rc-switch"
            checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
            unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
            onChange={checked => setAgenda( { credentials: { moderators: checked } } )}
            checked={!!agenda.credentials.moderators}
          /> Moderators
        </p>

        <p>
          <Switch
            className="rc-switch"
            checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
            unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
            onChange={checked => setAgenda( { credentials: { aggregator: checked } } )}
            checked={!!agenda.credentials.aggregator}
          /> Aggregator
        </p>

        <p>
          <Switch
            className="rc-switch"
            checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
            unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
            onChange={checked => setAgenda( { credentials: { tags: checked } } )}
            checked={!!agenda.credentials.tags}
          /> Agenda tags
        </p>

        <p>
          <Switch
            className="rc-switch"
            checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
            unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
            onChange={checked => setAgenda( { credentials: { embedsHead: checked } } )}
            checked={!!agenda.credentials.embedsHead}
          /> Add lines inside embed {'<head>'}
        </p>

        <p>
          <Switch
            className="rc-switch"
            checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
            unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
            onChange={checked => setAgenda( { credentials: { embedsTemplates: checked } } )}
            checked={!!agenda.credentials.embedsTemplates}
          /> Customize embed templates
        </p>

        <p>
          <Switch
            className="rc-switch"
            checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
            unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
            onChange={checked => setAgenda( { credentials: { indesign: checked } } )}
            checked={!!agenda.credentials.indesign}
          /> Old indesign tab
        </p>

        <p>
          <Switch
            className="rc-switch"
            checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
            unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
            onChange={checked => setAgenda( { credentials: { activatingInvitations: checked } } )}
            checked={!!agenda.credentials.activatingInvitations}
          /> Invitations that trigger instant account verification ( no activation email required )
        </p>

        <p>
          <Switch
            className="rc-switch"
            checkedChildren={<i className="fa fa-check" aria-hidden="true"></i>}
            unCheckedChildren={<i className="fa fa-times" aria-hidden="true"></i>}
            onChange={checked => setAgenda( { credentials: { emailstrategie: checked } } )}
            checked={!!agenda.credentials.emailstrategie}
          /> Emailstrategie tab
        </p>
      </div>
    );
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
          <li role="presentation" className={tab == 'stakeholders' ? 'active' : ''}
            onClick={() => this.setTab( 'stakeholders' )}>
            <a href="#">Stakeholders</a>
          </li>
          <li role="presentation" className={tab == 'features' ? 'active' : ''}
            onClick={() => this.setTab( 'features' )}>
            <a href="#">Features</a>
          </li>
        </div>

        {tab == 'stakeholders' && this.renderStakeholdersTable()}
        {tab == 'features' && this.renderFeaturesTab()}
      </div>
    </div>;

  }

} );

function credentialsToString( type ) {
  switch ( type ) {
    case 1:
      return 'Contributeur';
    case 2:
      return 'Administrateur';
    case 3:
      return 'Modérateur';
    default:
      'Inconnu'
  }
}