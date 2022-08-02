'use strict';

import du from '@openagenda/dom-utils';

function navTimings(direction, e) {
  const displayedMonth = e.target.parentNode.parentNode;
  const neighborMonth = displayedMonth[direction === 'next' ? 'nextElementSibling' : 'previousElementSibling'];
  
  du.addClass(displayedMonth, 'display-none');
  du.removeClass(neighborMonth, 'display-none')
}

function portalTimings() {
  for (const prevElem of du.els('.js_portal_timings_prev')) {
    du.addEvent(prevElem, 'click', navTimings.bind(null, 'prev'));
  }
  for (const nextElem of du.els('.js_portal_timings_next')) {
    du.addEvent(nextElem, 'click', navTimings.bind(null, 'next'));
  }  
}

export default portalTimings;
