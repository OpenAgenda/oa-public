Structure of the event form script:

===================================================================
cibulEvent:
interface: event handler

Handles event data structure through an event handler. Updates it and cleans it through events it listens to.

===================================================================
cibulEventDescription:
interface: event handler

Writes and manages the description fields of the form.

===================================================================
cibulEventImage:
interface: event handler 

Handles image loads.

===================================================================
cibulEventLocation:
interface: event handler

Handles event dates and locations using specialized scripts listed here below.

-------------------------------------------------------------------
handleEventPlaceEdit:

Handles one location/dates group.

- interface: callbacks
- used by: cibulEventLocation

- callbacks called:

  /* this here is a bit ambiguous */

  onChange: called when there is a change in the location data, regardless of its validity

  onComplete: called when there is a change in the location data and it is valid


-------------------------------------------------------------------
handlePlaceFetch

Handles the place name and address fields and the fetching of remote location suggestions

- interface: callbacks
- used by: handleEventPlaceEdit


-------------------------------------------------------------------
handlePlaceSelection

Handles the menu for selecting a place from a list of possible choices.

- interface: callbacks

- used by: handleEventPlaceEdit

- setters:

  set: set a list of suggestions

- callbacks called:

  onSelect: when a place is chosen
  onDefaultSelect: whenever a selection can be passively deduced, it is specified here. Should not be called if user selects specific location


-------------------------------------------------------------------
handlePricingSelection:

Handles pricing fields for specific location

- interface: callbacks
- used by: handleEventPlaceEdit



-------------------------------------------------------------------
handleDateSelection:

Handles dates selection for specific location

- interface: callbacks
- used by: handleEventPlaceEdit

- callbacks:

  onChange: when there is a change in date list

- public methods

  showAdd: to show the calendar form



-------------------------------------------------------------------
handlePlaceSelectionList

Handle list view of location suggestions

- interface: callbacks
- used by: handlePlaceSelection

- callbacks: onSelect: when a place is chosen

- setters: set - to suggest a location for the marker. Takes a list to be coherent with other location selectors,


-------------------------------------------------------------------
handlePlaceMapDrag:

Handles marker drag map place selector

- interface: callbacks
- used by: handlePlaceSelection

- callbacks: onSelect: when a place is chosen

- setters: set - to suggest a location for the marker. Takes a list to be coherent with other location selectors, but only places the first suggestion.



-------------------------------------------------------------------
handleDatesAdd

handles the date calendar/timing form

- interface: callbacks
- used by: handleDateSelection

- callbacks:

  onAdd: called when a new valid range of dates and timings have been selected

-------------------------------------------------------------------
handleDatesList

handles the selected dates list

- interface: callbacks
- used by: handleDateSelection

===================================================================
cibulEventSubmit:
interface: event handler

Handles submission buttons