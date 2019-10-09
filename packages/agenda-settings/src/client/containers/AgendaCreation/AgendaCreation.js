import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CreationFirstStep, CreationSecondStep } from '../../components';
import * as agendaActions from '../../reducers/agenda';

@connect(
  state => ({
    res: state.res
  }),
  { ...agendaActions }
)
export default class AgendaCreation extends Component {

  static propTypes = {
    create: PropTypes.func
  };

  static contextTypes = {
    getLabel: PropTypes.func
  };

  constructor( props ) {
    super( props );
    this.nextPage = this.nextPage.bind( this );
    this.previousPage = this.previousPage.bind( this );
    this.handleSubmit = this.handleSubmit.bind( this );
    this.state = {
      page: 1
    };
  }

  nextPage() {
    this.setState( { page: this.state.page + 1 } );
  }

  previousPage() {
    this.setState( { page: this.state.page - 1 } );
  }

  handleSubmit( values ) {
    const { create, res: { onCreated } } = this.props;
    create( values )
      .then( result => {
        window.location.assign( window.location.origin + onCreated.replace( ':slug', result.agenda.slug ) );
      } );
  }

  render() {
    const { page } = this.state;
    const { getLabel } = this.context;

    return (
      <div className="row">
        <div className="col-md-offset-3 col-md-6">
          <div className="top-margined wsq">
            <div className="content clearfix">
              <div className="stepper-container">
                <div className="stepper">
                  <div className={`step ${page == 1 ? 'active' : 'passed'}`}>{getLabel( 'description' )}</div>
                  <div className={`step ${page == 2 && 'active'}`}>{getLabel( 'parameters' )}</div>
                </div>
              </div>
              {page === 1 && <CreationFirstStep onSubmit={this.nextPage} />}
              {page === 2 && <CreationSecondStep previousPage={this.previousPage} onSubmit={this.handleSubmit} />}
            </div>
          </div>
        </div>
      </div>
    );
  }

}
