import React, { Component } from 'react';

export default class Dashboard extends Component {

  render() {
    return (
      <div>
        <h2 className="hidden-xs">Mes agendas</h2>
        <form>
          <div className="form-group search">
            <input type="text" className="form-control" placeholder="Rechercher un agenda" />
            <button type="submit" className="btn"><i className="fa fa-search" aria-hidden="true"></i></button>
          </div>
        </form>
        <div className="row">
        </div>
      </div>
    );
  }

}
