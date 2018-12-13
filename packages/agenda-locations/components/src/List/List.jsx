"use strict";

var React = require( 'react' ),

PropTypes = require( 'prop-types' ),

createReactClass = require( 'create-react-class' ),

get = require( '@openagenda/utils/get' ),

monitorBottomHit = require( './lib/monitorBottomHit' ),

_ = require( 'lodash' ),

update = require( 'immutability-helper' ),

utils = require( '@openagenda/utils' );

module.exports = createReactClass( {

  propTypes: {
    items: PropTypes.array,
    total: PropTypes.number,
    page: PropTypes.number,
    dropdownMode: PropTypes.bool,
    onLoading: PropTypes.func,
    onLoaded: PropTypes.func,
    limit: PropTypes.number,
    renderHead: PropTypes.func,
    renderItem: PropTypes.func.isRequired,
    renderEmpty: PropTypes.func,
    renderNav: PropTypes.func,
    renderBottom: PropTypes.func
  },

  getDefaultProps() {

    return {
      dropdownMode: false,
      limit: 40,
      items: [],
      total: null,
      page: 1
    }

  },

  getInitialState() {

    return {
      loading: true,
      loadingNext: false,
      loadError: false,
      dropped: false,
      buffer: null
    }

  },

  componentWillUnmount() {

    monitorBottomHit.unregister();

  },

  componentDidMount() {

    if ( this.props.dropdownMode && !utils.size( this.props.query ) ) return;

    if ( this.props.items.length ) {

      return monitorBottomHit( this.getAdjacentPage );

    }

    this.getPage( 1, true, () => {

      if ( this.props.dropdownMode ) return;

      monitorBottomHit( this.getAdjacentPage );

    } );

  },

  /**
   * load anew if query changed
   */

  componentDidUpdate( prevProps, prevState ) {

    if ( JSON.stringify( prevProps.query ) == JSON.stringify( this.props.query ) ) return;

    this.bufferize();

  },

  bufferize() {

    if ( this.state.buffer ) clearTimeout( this.state.buffer );

    this.setState( { buffer: setTimeout( () => {

      this.getPage( 1, true, monitorBottomHit.assess );

    }, 500 ) } );

  },

  getAdjacentPage( prev, replace ) {

    var newPage = this.props.page + ( prev ? -1 : 1 );

    if ( this.state.loadingNext ) return;

    this.getPage( newPage, replace );

  },

  getPage( page, replace, cb ) {

    var offset;

    log( 'getting page %s with query %s', page, JSON.stringify( this.props.query ) );

    this.setState( {
      loading: page == 1,
      loadingNext: page !== 1
    } );

    if ( page == 1 && this.props.onLoading ) {

      this.props.onLoading();

    }

    get( this.props.res, _.merge( {
      offset: ( page - 1 ) * this.props.limit,
      limit: this.props.limit
    }, this.props.query ), ( err, result ) => {

      log( 'received page %s', page );

      var newState = {
        loading: false,
        loadingNext: false,
        page: err ? this.props.page : page,
        loadError: !!err,
      };

      if ( !err ) {

        newState.hasNext = result.total > page * this.props.limit;
        newState.hasPrev = page > 1;

      }

      this.setState( newState );

      this.props.onItemsUpdate(
        replace ? result.items : update( this.props.items, { $push: result.items } ),
        result.total,
        page
      );

      if ( !err && page == 1 && this.props.onLoaded ) {

        this.props.onLoaded( result.total );

      }

      if ( cb ) cb( err, result );

    } );

  },

  // remove this and do it where it is needed.
  removeItem( itemIndex ) {

    var updated = this.props.items.concat();

    updated.splice( itemIndex, 1 );

    this.props.onItemsUpdate( updated );

  },

  renderItem( item, i ) {

    return this.props.renderItem( item, {
      remove: this.removeItem.bind( null, i )
    }, i );

  },

  renderNav( type ) {

    // need some notion of where we stand...

    if ( type == 'next' ? this.state.hasNext : this.state.hasPrev ) {

      return <li className="nav-item" onClick={this.getAdjacentPage.bind( null, type == 'prev', true )}><i className="fa fa-ellipsis-h"></i></li>;

    } else {

      return '';

    }

  },

  renderEmpty() {

    if ( this.props.items.length || !this.props.renderEmpty) return '';

    return this.props.renderEmpty();

  },

  renderBottom() {

    if ( this.state.hasNext || !this.props.renderBottom ) return '';

    return this.props.renderBottom();

  },

  render() {

    if ( this.props.dropdownMode ) {

      return <ul className="dropdown-menu">
        {this.renderNav( 'prev' )}
        {this.props.items.map(this.renderItem)}
        {this.renderNav( 'next' )}
        {this.renderEmpty()}
        {this.renderBottom()}
      </ul>

    } else {

      return <div>
        {this.props.renderHead?<div>{this.props.renderHead()}</div>:''}
        <div>{this.props.items.map(this.renderItem)}{this.renderEmpty()}</div>
      </div>

    }

  }

} );

function log() {

  //console.log.apply( console, arguments );

}
