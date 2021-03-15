import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import * as dateFns from 'date-fns';

export default class Stats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      first: null,
      last: null,
    };
  }

  static getDerivedStateFromProps(props) {
    const { value } = props;

    const { first, last } = (value || []).reduce(
      (result, next) => {
        if (!result.first || next.begin < result.first) {
          result.first = next.begin;
        }
        if (!result.last || next.end > result.last) {
          result.last = next.end;
        }
        return result;
      },
      { first: null, last: null }
    );

    return {
      first: new Date(first),
      last: new Date(last),
    };
  }

  render() {
    const { value, reset, classNamePrefix } = this.props;
    const { first, last } = this.state;
    const sameDay = dateFns.isSameDay(first, last);

    return (
      <>
        <div className={`${classNamePrefix}stats`}>
          {value && value.length ? (
            <>
              {sameDay ? (
                <FormattedMessage
                  id="rtp.definedTimings"
                  defaultMessage="{timingsCount, plural, =0 {No defined timings} one {# defined timing} other {# defined timings}} {timingsCount, plural, =0 {} other {at {when, date, short}}}"
                  values={{
                    timingsCount: value.length,
                    when: first,
                  }}
                />
              ) : (
                <FormattedMessage
                  id="rtp.definedTimingsInRange"
                  defaultMessage="{timingsCount, plural, =0 {No defined timings} one {# defined timing} other {# defined timings}} from {from, date, short} to {to, date, short}"
                  values={{
                    timingsCount: value.length,
                    from: first,
                    to: last,
                  }}
                />
              )}
            </>
          ) : (
            <FormattedMessage
              id="rtp.defineTiming"
              defaultMessage="Click and drag on the grid to set a timing"
            />
          )}
        </div>

        {value && value.length ? (
          <div
            role="button"
            tabIndex={0}
            onClick={reset}
            onKeyPress={reset}
            className={`${classNamePrefix}reset`}
          >
            <FormattedMessage
              id="rtp.reset"
              defaultMessage="Delete all timings"
            />
          </div>
        ) : null}

        <div className={`${classNamePrefix}clearfix`} />
      </>
    );
  }
}
