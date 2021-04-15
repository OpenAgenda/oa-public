'use strict';

module.exports = (locals, event) => {
    if(!event.timezone){
        event.timezone = event.location ? event.location.timezone : locals.defaultTimezone;
    }
    return event;
}