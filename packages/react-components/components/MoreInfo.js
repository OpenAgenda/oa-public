import React, { Component, PropTypes } from 'react';
import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

export default class MoreInfo extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.node,
    content: PropTypes.node,
    link: PropTypes.string,
    placement: PropTypes.oneOf( [ 'top', 'right', 'bottom', 'left' ] )
  };

  static defaultProps = {
    title: null,
    content: null,
    link: null,
    placement: 'right'
  };

  render() {

    const { id, title, content, link, placement } = this.props;

    const popover = (
      <Popover id={id} title={title}>
        {content}
      </Popover>
    );

    const iconStyle = {
      color: '#41acdd',
      fontSize: '1.3em'
    };
    const icon = <i className="fa fa-question-circle" aria-hidden="true" style={iconStyle}></i>;

    return (
      <OverlayTrigger trigger={[ 'hover', 'focus' ]} placement={placement} overlay={popover}>
        {link ? <a href={link} target="_blank">{icon}</a> : icon}
      </OverlayTrigger>
    );

  }

}
