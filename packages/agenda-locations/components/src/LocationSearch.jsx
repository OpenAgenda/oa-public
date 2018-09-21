"use strict";

var React = require( 'react' ),

  PropTypes = require( 'prop-types' ),

  createReactClass = require( 'create-react-class' ),

  Spinner = require( '@openagenda/react-components/build/Spinner' ),

  SearchField = require( './List/SearchField' ),

  List = require( './List/List' );

module.exports = createReactClass( {

  propTypes: {

    lang: PropTypes.string,

    onCreateRequest: PropTypes.func,

    onSelect: PropTypes.func,

    getLabel: PropTypes.func,

    allowCreate: PropTypes.bool

  },

  getInitialState: function() {

    return {
      query: this.props.init ? { search: this.props.init } : {},
      showDropdown: false,
      loading: false,
      page: 1,
      total: null,
      locations: []
    }

  },

  /**
   * click outside the component means the dropdown
   * should close
   */
  componentDidMount: function() {

    var bodyElem = document.getElementsByTagName( 'body' )[ 0 ];

    this[ 'location-search' ].addEventListener( 'click', this.preemptClose );

    bodyElem.addEventListener( 'click', this.triggerClose );

  },

  componentWillUnmount: function() {

    var bodyElem = document.getElementsByTagName( 'body' )[ 0 ];

    bodyElem.removeEventListener( 'click', this.triggerClose );

    this[ 'location-search' ].removeEventListener( 'click', this.preemptClose );

  },

  triggerClose: function() {

    if ( !this.closePreempted ) {

      this.setState( { showDropdown: false } );

    }

    this.closePreempted = false;

  },

  preemptClose: function() {

    this.closePreempted = true;

  },

  onSearchChange: function( value ) {

    this.setState( {
      query: { search: value }
    } );

  },

  onFocus: function( value ) {

    this.setState( {
      query: { search: value },
      showDropdown: true
    } );

  },

  onListLoading: function() {

    this.setState( {
      loading: true,
      showDropdown: false
    } );

  },

  onListLoaded: function( total ) {

    this.setState( {
      loading: false,
      showDropdown: true
    } );

  },

  renderItem: function( l ) {

    return <li onClick={this.props.onSelect.bind( null, l )} className="search-item" key={l.uid}>
      <div className="name">{l.name}</div>
      <div className="address">{l.address}</div>
    </li>

  },

  renderCreateItem: function() {

    return <li className="search-item" onClick={this.props.onCreateRequest.bind( null, this.state.query.search )}>
      <a>{this.props.getLabel( 'create' )}</a>
    </li>

  },

  renderEmpty: function() {

    return <li className="no-search-result">
      {this.props.getLabel( 'noresult' )}
    </li>

  },

  render: function() {

    var self = this;

    return <div
      ref={r => this['location-search'] = r}
      className={ this.state.showDropdown ? 'dropdown open' : 'dropdown' }
    >
      <SearchField
        name="name"
        loading={this.state.loading}
        value={this.state.query.search}
        onFocus={this.onFocus}
        placeholder={this.props.getLabel( 'namePlaceholder' )}
        onChange={this.onSearchChange} />
      { this.state.loading ? <Spinner mode='inline' loading={true} message={this.props.getLabel( 'searching' )} />  : null }
      <List
        items={this.state.locations}
        page={this.state.page}
        total={this.state.total}
        onItemsUpdate={( locations, total, page ) => { this.setState( { locations, total, page } ) }}
        limit={10}
        dropdownMode={true}
        res={this.props.res.index}
        query={this.state.query}
        renderItem={this.renderItem}
        renderHead={this.renderHead}
        renderEmpty={this.renderEmpty}
        renderBottom={this.props.allowCreate ? this.renderCreateItem : () => {}}
        onLoaded={this.onListLoaded}
        onLoading={this.onListLoading} />
    </div>

  }

} );
