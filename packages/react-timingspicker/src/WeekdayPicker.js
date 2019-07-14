import React, { Component } from 'react';

const keys = {
  LEFT: 37,
  RIGHT: 39,
  ENTER: 13,
  SPACE: 32
};

const WEEKDAYS_LONG = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
const WEEKDAYS_SHORT = [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ];

const localeUtils = {
  formatWeekdayLong: weekday => WEEKDAYS_LONG[ weekday ],
  formatWeekdayShort: weekday => WEEKDAYS_SHORT[ weekday ]
};

class WeekdayPicker extends Component {
  // static propTypes = {
  //   className: PropTypes.string,
  //   style: PropTypes.object,
  //   tabIndex: PropTypes.number,
  //
  //   ariaModifier: PropTypes.string,
  //   modifiers: PropTypes.object,
  //
  //   locale: PropTypes.string,
  //   localeUtils: PropTypes.shape( {
  //     formatWeekdayShort: PropTypes.func.isRequired,
  //     formatWeekdayLong: PropTypes.func.isRequired
  //   } ),
  //
  //   onWeekdayClick: PropTypes.func,
  //   onWeekdayMouseEnter: PropTypes.func,
  //   onWeekdayMouseLeave: PropTypes.func,
  //   onWeekdayTouchTap: PropTypes.func,
  // }

  static defaultProps = {
    classNamePrefix: '',
    ariaModifier: 'selected',
    locale: 'en',
    localeUtils: localeUtils,
    tabIndex: 0,
  };

  getModifiersForDay( weekday, modifierFunctions ) {
    const modifiers = [];
    if ( modifierFunctions ) {
      for ( const modifier in modifierFunctions ) {
        const func = modifierFunctions[ modifier ];
        if ( func( weekday ) ) {
          modifiers.push( modifier );
        }
      }
    }
    return modifiers;
  }

  render() {
    const { style, tabIndex, classNamePrefix } = this.props;
    let className = `${classNamePrefix}WeekdayPicker`;

    if ( !this.props.onWeekdayClick && !this.props.onWeekdayTouchTap ) {
      className = `${className} ${className}--InteractionDisabled`;
    }
    if ( this.props.className ) {
      className = `${className} ${this.props.className}`;
    }

    return (
      <div
        className={className}
        // role="widget"
        style={style}
        tabIndex={tabIndex}
      >
        {this.renderWeekDays()}
      </div>
    );
  }

  renderWeekDays() {
    const weekdays = [];

    for ( let i = 0; i < 7; i++ ) {
      weekdays.push( this.renderWeekday( i ) );
    }

    return weekdays;
  }

  renderWeekday( weekday ) {
    const { locale, localeUtils, modifiers: modifierFunctions, classNamePrefix } = this.props;

    let className = `${classNamePrefix}WeekdayPicker-Weekday`;
    let modifiers = [];

    if ( modifierFunctions ) {
      const customModifiers = this.getModifiersForDay( weekday, modifierFunctions );
      modifiers = [ ...modifiers, ...customModifiers ];
    }

    className += modifiers.map( modifier => ` ${className}--${modifier}` ).join( '' );

    const ariaSelected = modifiers.indexOf( this.props.ariaModifier ) > -1;

    const {
      onWeekdayClick,
      onWeekdayMouseEnter,
      onWeekdayMouseLeave,
      onWeekdayTouchTap,
    } = this.props;

    let tabIndex = null;
    if ( onWeekdayTouchTap || onWeekdayClick ) {
      tabIndex = -1;
      // Focus on the first day of the week
      if ( weekday === 0 ) {
        tabIndex = this.props.tabIndex;
      }
    }

    let onClick = null;
    if ( onWeekdayClick ) {
      onClick = ( e ) => this.handleWeekdayClick( e, weekday, modifiers );
    }
    let onMouseEnter = null;
    if ( onWeekdayMouseEnter ) {
      onMouseEnter = ( e ) => this.handleWeekdayMouseEnter( e, weekday, modifiers );
    }
    let onMouseLeave = null;
    if ( onWeekdayMouseLeave ) {
      onMouseLeave = ( e ) => this.handleWeekdayMouseLeave( e, weekday, modifiers );
    }

    return (
      <button
        key={weekday}
        type="button"
        className={className}
        tabIndex={tabIndex}
        aria-pressed={ariaSelected}
        onClick={onClick}
        onKeyDown={e => this.handleDayKeyDown( e, weekday, modifiers )}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        title={localeUtils.formatWeekdayLong( weekday, locale )}
      >
        {localeUtils.formatWeekdayShort( weekday, locale )}
      </button>
    );
  }

  focusPreviousDay( dayNode ) {
    const { classNamePrefix } = this.props;
    const body = dayNode.parentNode;
    let dayNodes = body.querySelectorAll(
      `.${classNamePrefix}WeekdayPicker-Weekday:not(.${classNamePrefix}WeekdayPicker-Weekday--outside)`
    );
    let nodeIndex;
    for ( let i = 0; i < dayNodes.length; i++ ) {
      if ( dayNodes[ i ] === dayNode ) {
        nodeIndex = i;
        break;
      }
    }
    if ( nodeIndex !== 0 ) {
      dayNodes[ nodeIndex - 1 ].focus();
    }
  }

  focusNextDay( dayNode ) {
    const { classNamePrefix } = this.props;
    const body = dayNode.parentNode;
    let dayNodes = body.querySelectorAll(
      `.${classNamePrefix}WeekdayPicker-Weekday:not(.${classNamePrefix}WeekdayPicker-Weekday--outside)`
    );
    let nodeIndex;
    for ( let i = 0; i < dayNodes.length; i++ ) {
      if ( dayNodes[ i ] === dayNode ) {
        nodeIndex = i;
        break;
      }
    }

    if ( nodeIndex !== dayNodes.length - 1 ) {
      dayNodes[ nodeIndex + 1 ].focus();
    }
  }

  // Event handlers
  handleDayKeyDown( e, day, modifiers ) {
    e.persist();
    switch ( e.keyCode ) {
      case keys.LEFT:
        e.preventDefault();
        e.stopPropagation();
        this.focusPreviousDay( e.target );
        break;
      case keys.RIGHT:
        e.preventDefault();
        e.stopPropagation();
        this.focusNextDay( e.target );
        break;
      case keys.ENTER:
      case keys.SPACE:
        e.preventDefault();
        e.stopPropagation();
        if ( this.props.onWeekdayClick ) {
          this.handleWeekdayClick( e, day, modifiers );
        }
        if ( this.props.onWeekdayTouchTap ) {
          this.handleWeekdayTouchTap( e, day, modifiers );
        }
        break;
    }
  }

  handleWeekdayTouchTap( e, weekday, modifiers ) {
    e.persist();
    this.props.onWeekdayTouchTap( e, weekday, modifiers );
  }

  handleWeekdayClick( e, weekday, modifiers ) {
    e.persist();
    this.props.onWeekdayClick( e, weekday, modifiers );
  }

  handleWeekdayMouseEnter( e, weekday, modifiers ) {
    e.persist();
    this.props.onWeekdayMouseEnter( e, weekday, modifiers );
  }

  handleWeekdayMouseLeave( e, weekday, modifiers ) {
    e.persist();
    this.props.onWeekdayMouseLeave( e, weekday, modifiers );
  }
}

export default WeekdayPicker;
