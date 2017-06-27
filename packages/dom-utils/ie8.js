'use strict';

if ( !Object.assign ) {
  Object.assign = function ( target, sources ) {
    if ( target === null || target === undefined ) {
      throw new TypeError( 'Object.assign target cannot be null or undefined' );
    }

    var to = Object( target );
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    for ( var nextIndex = 1; nextIndex < arguments.length; nextIndex++ ) {
      var nextSource = arguments[ nextIndex ];
      if ( nextSource === null || nextSource === undefined ) {
        continue;
      }

      var from = Object( nextSource );

      // We don't currently support accessors nor proxies. Therefore this
      // copy cannot throw. If we ever supported this then we must handle
      // exceptions and side-effects.

      for ( var key in from ) {
        if ( hasOwnProperty.call( from, key ) ) {
          to[ key ] = from[ key ];
        }
      }
    }

    return to;
  };
}

// Add ECMA262-5 method binding if not supported natively
if ( !( 'bind' in Function.prototype ) ) {

  Function.prototype.bind = function ( owner ) {

    var that = this;

    if ( arguments.length <= 1 ) {
      return function () {
        return that.apply( owner, arguments );
      };
    } else {
      var args = Array.prototype.slice.call( arguments, 1 );
      return function () {
        return that.apply( owner, arguments.length === 0 ? args : args.concat( Array.prototype.slice.call( arguments ) ) );
      };
    }

  };
}

// Add ECMA262-5 string trim if not supported natively
//
if ( !('trim' in String.prototype) ) {
  String.prototype.trim = function () {
    return this.replace( /^\s+/, '' ).replace( /\s+$/, '' );
  };
}

if ( !('trimLeft' in String.prototype) ) {

  String.prototype.trimLeft = function () {

    return this.replace( /^\s+/, "" );

  }

}

// Add ECMA262-5 Array methods if not supported natively
//
if ( !('indexOf' in Array.prototype) ) {
  Array.prototype.indexOf = function ( find, i /*opt*/ ) {
    if ( i === undefined ) i = 0;
    if ( i < 0 ) i += this.length;
    if ( i < 0 ) i = 0;
    for ( var n = this.length; i < n; i++ )
      if ( i in this && this[ i ] === find )
        return i;
    return -1;
  };
}

if ( !('lastIndexOf' in Array.prototype) ) {
  Array.prototype.lastIndexOf = function ( find, i /*opt*/ ) {
    if ( i === undefined ) i = this.length - 1;
    if ( i < 0 ) i += this.length;
    if ( i > this.length - 1 ) i = this.length - 1;
    for ( i++; i-- > 0; ) /* i++ because from-argument is sadly inclusive */
      if ( i in this && this[ i ] === find )
        return i;
    return -1;
  };
}

if ( !('forEach' in Array.prototype) ) {
  Array.prototype.forEach = function ( action, that /*opt*/ ) {
    for ( var i = 0, n = this.length; i < n; i++ )
      if ( i in this )
        action.call( that, this[ i ], i, this );
  };
}

if ( !('map' in Array.prototype) ) {
  Array.prototype.map = function ( mapper, that /*opt*/ ) {
    var other = new Array( this.length );
    for ( var i = 0, n = this.length; i < n; i++ )
      if ( i in this )
        other[ i ] = mapper.call( that, this[ i ], i, this );
    return other;
  };
}

if ( !('filter' in Array.prototype) ) {
  Array.prototype.filter = function ( filter, that /*opt*/ ) {
    var other = [], v;
    for ( var i = 0, n = this.length; i < n; i++ )
      if ( i in this && filter.call( that, v = this[ i ], i, this ) )
        other.push( v );
    return other;
  };
}

if ( !('every' in Array.prototype) ) {
  Array.prototype.every = function ( tester, that /*opt*/ ) {
    for ( var i = 0, n = this.length; i < n; i++ )
      if ( i in this && !tester.call( that, this[ i ], i, this ) )
        return false;
    return true;
  };
}

if ( !('some' in Array.prototype) ) {
  Array.prototype.some = function ( tester, that /*opt*/ ) {
    for ( var i = 0, n = this.length; i < n; i++ )
      if ( i in this && tester.call( that, this[ i ], i, this ) )
        return true;
    return false;
  };
}

if ( !Array.prototype.includes ) {
  Object.defineProperty( Array.prototype, 'includes', {
    value: function ( searchElement, fromIndex ) {

      // 1. Let O be ? ToObject(this value).
      if ( this == null ) {
        throw new TypeError( '"this" is null or not defined' );
      }

      var o = Object( this );

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if ( len === 0 ) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max( n >= 0 ? n : len - Math.abs( n ), 0 );

      // 7. Repeat, while k < len
      while ( k < len ) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1.
        // NOTE: === provides the correct "SameValueZero" comparison needed here.
        if ( o[ k ] === searchElement ) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    }
  } );
}

if ( !String.prototype.includes ) {
  String.prototype.includes = function () {
    'use strict';
    return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}

if ( !('remove' in Element.prototype) ) {
  Element.prototype.remove = function () {
    if ( this.parentNode ) {
      this.parentNode.removeChild( this );
    }
  };
}
