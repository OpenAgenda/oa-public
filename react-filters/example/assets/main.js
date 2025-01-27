/* global axios, Qs */

async function loadEventList(values, aggregations = []) {
  try {
    const { data } = await axios.get('/events', {
      params: { ...values, aggregations, aggsSizeLimit: 2000 },
      paramsSerializer: Qs.stringify,
    });

    return data;
  } catch (e) {
    console.log('Error:', e);
  }
}

function updateContent(html) {
  document.querySelector('.event-list').innerHTML = html;
}

// Params for react-filters
window.oa = {
  query: window.location.search,
  locale: 'fr',
  locales: {
    en: {
      eventsTotal:
        '{total, plural, =0 {No events match this search} one {{total} event} other {{total} events}}',
    },
    fr: {
      eventsTotal:
        '{total, plural, =0 {Aucun événement ne correspond à cette recherche} one {{total} événement} other {{total} événements}}',
    },
  },
  manualSubmit: true,
  onLoad: async (values, aggregations, filtersRef, form) => {
    try {
      const formElem = document.querySelector('#filters-form');

      formElem.addEventListener('submit', (event) => {
        event.preventDefault();
        form.submit();
      });

      const result = await loadEventList({ ...values, size: 0 }, aggregations);

      // Already loaded by map
      delete result?.aggregations?.viewport;

      filtersRef.updateFiltersAndWidgets(values, result);
    } catch (e) {
      console.log('onLoad error:', e);
    }
  },
  onFilterChange: async (values, aggregations, filtersRef, _form) => {
    try {
      const result = await loadEventList(values, aggregations);

      updateContent(result.html);

      filtersRef.updateLocation(values);
      filtersRef.updateFiltersAndWidgets(values, result);
    } catch (e) {
      console.log('onFilterChange error:', e);
    }
  },
};
