import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

@connect( state => ({
  res: state.res
}) )
export default class Welcome extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {
    const { res } = this.props;
    const { getLabel } = this.context;

    return (
      <div className="content">
        <div className="row">
          <div className="text-center new-user padding-v-md">
            <h2 className="margin-v-md">{getLabel( 'welcome' )}</h2>
            <a href={res.agendas.create} className="btn btn-primary margin-v-sm">{getLabel( 'createAgenda' )}</a>
            <p className="margin-v-sm">{getLabel( 'orContributeToExisting' )}</p>
            <form action={res.search} method="GET" className="margin-top-sm">
              <div className="form-group input-icon-right search center-block">
                <div className="input-icon-right">
                  <input type="text" name="search" className="form-control" />
                  <button type="submit" className="btn">
                    <i className="fa fa-search" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

}
