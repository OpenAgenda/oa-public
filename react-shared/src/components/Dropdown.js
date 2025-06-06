import React, { Component } from 'react';
import ClickListener from './lib/ClickListener.js';

const createClickListener = (ref, setState) =>
  ClickListener(ref.current, {
    onOutsideClick: () =>
      setState({
        isDisplayed: false,
      }),
  });

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();

    this.state = {
      isDisplayed: false,
    };
  }

  componentDidMount() {
    const { isDisplayed } = this.state;
    if (!isDisplayed) {
      return;
    }
    this.clickListener = createClickListener(
      this.ref,
      this.setState.bind(this),
    );
  }

  componentDidUpdate() {
    const { isDisplayed } = this.state;
    if (isDisplayed && !this.clickListener) {
      this.clickListener = createClickListener(
        this.ref,
        this.setState.bind(this),
      );
    }

    if (!isDisplayed && this.clickListener) {
      this.clickListener.shutdown();
      this.clickListener = null;
    }
  }

  componentWillUnmount() {
    if (!this.clickListener) {
      return;
    }
    this.clickListener.shutdown();
  }

  render() {
    const { isDisplayed } = this.state;

    const { children, Trigger, className } = this.props;

    return (
      <div className={className ?? 'dropdown open'}>
        <Trigger
          onClick={() =>
            this.setState({
              isDisplayed: !isDisplayed,
            })}
        />
        {isDisplayed ? (
          <div className="dropdown-menu" ref={this.ref}>
            {children}
          </div>
        ) : null}
      </div>
    );
  }
}

export default Dropdown;
