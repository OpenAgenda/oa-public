import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { setPropTypes, withState, lifecycle, mapProps, compose, pure } from 'recompose';

// checks for svg if last 4 characters === '.svg'
function srcRepresentsSvgFile( src ) {
  return src && /\.svg$/.test( src );
}

@compose(
  pure,
  // make sure we recieved original image src prop
  setPropTypes( { src: PropTypes.string.isRequired, fallbackSrc: PropTypes.string } ),
  // track original image src and current image src
  withState( 'imgState', 'updateImgState', ( { src } ) => ({ origSrc: src, currentSrc: src }) ),
  lifecycle( {
    componentWillReceiveProps( nextProps ) {
      // if this Image components src changes, make sure we update origSrc and currentSrc
      if ( nextProps.src !== nextProps.imgState.origSrc ) {
        nextProps.updateImgState( { origSrc: nextProps.src, currentSrc: nextProps.src } );
      }
    },
  } ),
  mapProps( ( { fallbackSrc, imgState, updateImgState, ...propsToPass } ) => {
    return {
      ...propsToPass,
      src: imgState.currentSrc,
      // on image load error:
      // spread origSrc to remember it, and update new currentSrc to the fallback image
      onError: () => {
        if ( !fallbackSrc ) return;
        updateImgState( s => ({ ...s, currentSrc: fallbackSrc }) );
      }
    };
  } )
)
export default class Image extends Component {
  constructor( props ) {
    super( props );
    this.assignImageRef = this.assignImageRef.bind( this );
  }

  componentDidMount() {
    const { src } = this.props;
    // if image hasn't completed loading, then let react handle error
    if ( !this._image.complete ) return;
    /*
     * If an image has finished loading and has 'errored' (errored when naturalWidth === 0, or if svg check width)
     * Then run the onError callback
     * NOTE IF SVG: need to use width because firefox and IE assign naturalWidth from the svg elements width property,
     * but some svgs don't have that specified
     */
    const isInvalidSvg = srcRepresentsSvgFile( src ) && !this._image.width;
    const imgFailedToLoad = this._image.naturalWidth === 0;

    if ( isInvalidSvg || imgFailedToLoad ) {
      this.props.onError();
    }
  }

  assignImageRef( r ) {
    this._image = r;
  }

  render() {
    const { src, onError, ...propsToPass } = this.props;

    return <img ref={this.assignImageRef} src={src} onError={onError} {...propsToPass} />;
  }
};
