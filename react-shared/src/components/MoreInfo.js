import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

export default class MoreInfo extends Component {
  static propTypes = {
    children: PropTypes.node,
    id: PropTypes.string.isRequired,
    title: PropTypes.node,
    content: PropTypes.node,
    link: PropTypes.string,
    placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
    className: PropTypes.string,
    style: PropTypes.objectOf(PropTypes.any)
  };

  static defaultProps = {
    children: null,
    title: null,
    content: null,
    link: null,
    placement: 'right',
    className: '',
    style: null,
  };

  renderIcon = () => {
    const { className, link, style } = this.props;

    const iconStyle = {
      color: '#41acdd',
      fontSize: '1.3em',
      ...style
    };

    const icon = <i className={`fa fa-question-circle ${className}`} aria-hidden="true" style={iconStyle} />;

    return link ? <a href={link} rel="noopener noreferrer" target="_blank">{icon}</a> : icon;
  }

  render() {
    const {
      children,
      id,
      title,
      content,
      placement
    } = this.props;

    if (!content && !children) {
      return this.renderIcon();
    }

    if (!content) return children;

    const popover = (
      <Popover id={id} title={title}>
        {content}
      </Popover>
    );

    return (
      <OverlayTrigger trigger={['hover', 'focus']} placement={placement} overlay={popover}>
        {children || this.renderIcon()}
      </OverlayTrigger>
    );
  }
}
