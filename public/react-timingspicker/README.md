# Overview

Pick timings in a calendar week grid view

# Getting started

    yarn
    yarn start

Any changes brought in a src file will be loaded on to the browser

# Basic usage

    import TimingsPicker from '@openagenda/react-timingspicker'

    <TimingsPicker {...props} />

## Props

 * **onChange**: provides list of timings of picker as they are changed. Each timing is an object with two keys defining the date boundaries of the timing: `begin` and `end`
 * **value**: list of timings `[ { begin, end } ]`
 * **allowedTimings**: range of dates within which picker will allow user to define new timings.
 * **weekStartsOn**: Day of the week of the first column of the grid. Offset from sunday. Defaults on sunday.
 * **locale**: Two letter code of the interface language
