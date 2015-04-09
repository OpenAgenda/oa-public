Not really md. Bite me.


Some tests on how this is supposed to
behave in an integrated
environment:

- if the list has a map area filter activated and it is disabled, map auto mode should be disabled.

- if page is loaded with map area filter, auto mode should be enabled

- if auto is on, and map is moved around a bunch of times, no re-fitting
should occur once everything is properly loaded

- if a category a tag or any other param is selected, map changes bounds to the active markers.

- if an event is selected, bounds should center on it 

- when a location is clicked and selection is made, pop up opens. when a pop up is closed, location is unselected

- markers with passed events should be inactive unless dates are selected or passed param is specified