import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// checks for svg if last 4 characters === '.svg'
function srcRepresentsSvgFile(src) {
  return src.endsWith('.svg');
}

class Image extends PureComponent {
  static propTypes = {
    src: PropTypes.string.isRequired,
    fallbackSrc: PropTypes.string,
    alt: PropTypes.string,
    onError: PropTypes.func,
  };

  static defaultProps = {
    fallbackSrc: null,
    alt: '',
    onError: () => {},
  };

  static getDerivedStateFromProps({ src }, state) {
    // if this Image components src changes, make sure we update origSrc and currentSrc
    if (src !== state.origSrc) {
      return {
        origSrc: src,
        currentSrc: src,
      };
    }

    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      origSrc: props.src,
      currentSrc: props.src,
    };
  }

  componentDidMount() {
    const { src } = this.props;

    if (!this._image.complete) {
      return;
    }

    // if image hasn't completed loading, then let react handle error
    /*
     * If an image has finished loading and has 'errored' (errored when naturalWidth === 0, or if svg check width)
     * Then run the onError callback
     * NOTE IF SVG: need to use width because firefox and IE assign naturalWidth from the svg elements width property,
     * but some svgs don't have that specified
     */
    const isInvalidSvg = srcRepresentsSvgFile(src) && !this._image.width;
    const imgFailedToLoad = this._image.naturalWidth === 0;

    if (isInvalidSvg || imgFailedToLoad) {
      this.onError();
    }
  }

  assignImageRef = r => {
    this._image = r;
  };

  onError = () => {
    const { fallbackSrc } = this.props;

    if (!fallbackSrc) {
      return;
    }

    this.setState(s => ({ ...s, currentSrc: fallbackSrc }));
  };

  render() {
    const {
      alt, onError, fallbackSrc, ...propsToPass
    } = this.props;
    const { currentSrc } = this.state;

    return (
      <img
        {...propsToPass}
        ref={this.assignImageRef}
        src={currentSrc}
        alt={alt}
        onError={this.onError}
      />
    );
  }
}

export default Image;
