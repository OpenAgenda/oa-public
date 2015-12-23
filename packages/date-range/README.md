Date Ranges
===========

OpenAgenda is a platform where anyone can publish calendars of events: for instance a conference center or a concert hall.
One event, such as a concert or an exhibition , may have simple or complex timings. Date ranges are a sum up of these timings.
A *date* is a day with at least one occurrence.
An *occurrence* is defined by a start and end time.

# Overview

- The date ranges should be as simple as possible, in order to be read at a glance.
- Date ranges are multilingual ( fr & en to start with ) - texts are listed in labels.js
- The year is displayed only if it is not the current year
- The month and year are not repeated of they are the same on start and end date, for instance: "3-12 december 2024" instead of "3 december 2024 - 12 december 2024"


We offer 4 types of date ranges

If one date
-----------

we display [date] [month] [start time(s)]
> 10 december, 15:00
  10 décembre, 15:00

An event may have several occurrences in the same day, for instance a movie projection. In this case we display all start times, separated by comas.
> 10 december, 15:00, 17:00, 19:00
  10 décembre, 15:00, 17:00, 19:00

If two dates
------------

we display [first date] and [last date] [month]. Start times are not displayed.
> 4 and 10 december
  4 et 10 décembre

If more than 2 dates
--------------------
We display [first date] - [last date] [month]. Start times are not displayed.
> 4-10 december
  4-10 décembre

Additionnal information in case of timings patterns
---------------------------------------------------
For events with numerous dates, it is useful to indicate eventual regularities /timing patterns.
Patterns to observe are:

- WeekDays
> 1-29 december, *on tuesdays*

- MonthDate
> 1 january - 1 december, *the 1st day of the month*

It should be possible to add other patterns later.


# Implementation

In ES5 for lib ( tests are run on server so ES6 is ok there )

To be used in a commonjs environment ( server or browser )

The lib will be used by browserify and should be lightweight; the requirements are simple enough not to require any specialized date library ( moment )

Input sample ( there can be multiple timings on same day )

var timings = [ {
  start: new Date( '2014-11-12T17:00:00Z' ),
  end: new Date( '2014-11-12T18:00:00Z' )
}, {
  start: new Date( '2014-11-12T19:00:00Z' ),
  end: new Date( '2014-11-12T21:00:00Z' )
}, /** and so on */ ];