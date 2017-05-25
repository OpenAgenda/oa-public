import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';

const componentPropTypes = PropTypes.oneOfType( [
  PropTypes.element,
  PropTypes.func,
  PropTypes.string
] );

export default class AgendasList extends Component {

  static propTypes = {
    WrapperComponent: componentPropTypes,
    ActionsComponent: componentPropTypes,
    agendas: PropTypes.array,
    getTitleLink: PropTypes.func
  };

  static contextTypes = {
    getLabel: PropTypes.func
  };

  static defaultProps = {
    WrapperComponent: 'div',
    ActionsComponent: () => null
  };

  render() {
    const { WrapperComponent, ActionsComponent, agendas, getTitleLink } = this.props;
    const { getLabel } = this.context;

    return createElement(
      WrapperComponent,
      {},
      agendas && agendas.map( ( agenda, i ) => (
        <div className="agenda-item media" key={i}>
          <div className="media-left">
            <a href={getTitleLink( agenda )}>
              <img className="media-object ill avatar" src={agenda.image} alt={agenda.title} />
            </a>
          </div>
          <div className="media-body">
            <div className="title media-heading">
              <a href={getTitleLink( agenda )}>
                <strong>{agenda.title}</strong>
              </a>
              {!!agenda.official && <div className="official">
                <i />
                <div className="tooltip right" role="tooltip">
                  <div className="tooltip-arrow" />
                  <div className="tooltip-inner">{getLabel( 'officialAgenda' )}</div>
                </div>
              </div>}
              {!!agenda.private && <div className="tooltip-icon">
                <i className="fa fa-unlock-alt"></i>
                <div className="tooltip right" role="tooltip">
                  <div className="tooltip-arrow"></div>
                  <div className="tooltip-inner">{getLabel( 'privateAgenda' )}</div>
                </div>
              </div>}
            </div>
            {createElement( ActionsComponent, { agenda } )}
          </div>
        </div>
      ) )
    );
  }

}
