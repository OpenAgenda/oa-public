/* eslint-disable react/no-danger */
import { http, HttpResponse } from 'msw';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import example from './templates/example.ejs';

require('./scss/main.scss');

function Script(props) {
  const added = useRef(false);

  useEffect(() => {
    if (added.current) return;
    added.current = true;

    const script = document.createElement('script');

    Object.assign(script, props);

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [props]);

  return null;
}

function Link(props) {
  const added = useRef(false);

  useEffect(() => {
    if (added.current) return;
    added.current = true;

    const link = document.createElement('link');

    Object.assign(link, props);

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [props]);

  return null;
}

function Html({ html, options }) {
  window.oa = options;

  return (
    <>
      <Link
        rel="stylesheet"
        href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
        integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/"
        crossOrigin="anonymous"
      />
      <Link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin
      />
      <Script
        src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
        integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
        crossOrigin
        async={false}
      />
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
        crossOrigin="anonymous"
        async={false}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/popper.js@1.14.3/dist/umd/popper.min.js"
        async={false}
      />
      <Script
        src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"
        integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6"
        crossOrigin="anonymous"
        async={false}
      />
      <Script src="main.js" />
      <div dangerouslySetInnerHTML={{ __html: _.template(html)() }} />
    </>
  );
}

export default {
  title: 'React filters/Html',
};

export const SimpleExample = {
  name: 'Filters',
  render() {
    return (
      <Html
        html={example}
        options={{
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
          defaultViewport: {
            topLeft: {
              latitude: 64.14049196988344,
              longitude: -123.36745304055512,
            },
            bottomRight: {
              latitude: -39.238451002165675,
              longitude: 135.83260595798492,
            },
          },
        }}
      />
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/events', () =>
          HttpResponse.json({
            events: [],
            aggregations: {},
          })),
      ],
    },
  },
};

export const Playground = () => {
  const agendaUidRef = useRef();
  const apiKeyRef = useRef();
  const [res, setRes] = useState('');

  return (
    <div>
      <label htmlFor="angedaUid">
        Agenda UID :
        <input
          name="angedaUid"
          type="text"
          ref={agendaUidRef}
          defaultValue="89904399"
        />
      </label>
      <label htmlFor="apiKey">
        Api key :
        <input name="apiKey" type="text" ref={apiKeyRef} />
      </label>

      <button
        type="button"
        onClick={() =>
          setRes(
            `https://dapi.openagenda.com/v2/agendas/${agendaUidRef.current?.value}/events?key=${apiKeyRef.current?.value}`,
          )}
      >
        Valider
      </button>

      <Html
        key={res}
        html={example}
        options={{
          res,
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
          defaultViewport: {
            topLeft: {
              latitude: 64.14049196988344,
              longitude: -123.36745304055512,
            },
            bottomRight: {
              latitude: -39.238451002165675,
              longitude: 135.83260595798492,
            },
          },
        }}
      />
    </div>
  );
};

export const Search = () => (
  <Html
    options={{ locale: 'fr' }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'search', name:'search' }) %>"
      ></div>
    `)()}
  />
);
Search.storyName = 'Search filter';

export const Timings = () => (
  <Html
    options={{ locale: 'fr' }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'dateRange', name: 'timings' }) %>"
      ></div>
    `)()}
  />
);
Timings.storyName = 'Timings filter';

export const DefinedRange = () => (
  <Html
    options={{ locale: 'fr' }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({
          staticRanges: ['today', 'tomorrow'],
          type: 'definedRange',
          name: 'timings',
        }) %>"
      ></div>
    `)()}
  />
);
DefinedRange.storyName = 'Defined range filter';

export const NumberRange = () => (
  <Html
    options={{ locale: 'fr' }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({
          type: 'numberRange',
          name: 'seats',
        }) %>"
      ></div>
    `)()}
  />
);
NumberRange.storyName = 'Number range filter';

export const Map = {
  name: 'Map filter',
  render() {
    return (
      <Html
        options={{
          locale: 'fr',
          defaultViewport: {
            topLeft: {
              latitude: 64.14049196988344,
              longitude: -123.36745304055512,
            },
            bottomRight: {
              latitude: -39.238451002165675,
              longitude: 135.83260595798492,
            },
          },
        }}
        html={_.template(`
        <div
          data-oa-filter="an-id"
          data-oa-filter-params="<%- JSON.stringify({
            tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            tileAttribution: 'Map data © OpenStreetMap contributors',
            searchWithMap: true,
            searchMessage: 'Rechercher quand je déplace la carte',
            type: 'map',
            name: 'geo',
          }) %>"
        ></div>
      `)()}
      />
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/events', () =>
          HttpResponse.json({
            events: [],
            aggregations: {},
          })),
      ],
    },
  },
};

export const Relative = () => (
  <Html
    options={{ locale: 'fr' }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'relative' }) %>"
      ></div>
    `)()}
  />
);
Relative.storyName = 'Relative filter';

export const Languages = () => (
  <Html
    options={{
      locale: 'fr',
      filtersBase: {
        languages: [
          {
            key: 'fr',
            eventCount: 9,
          },
          {
            key: 'de',
            eventCount: 10,
          },
          {
            key: 'en',
            eventCount: 12,
          },
        ],
      },
      aggregations: {
        languages: [
          {
            key: 'fr',
            eventCount: 9,
          },
          {
            key: 'de',
            eventCount: 10,
          },
          {
            key: 'en',
            eventCount: 12,
          },
        ],
      },
    }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'languages' }) %>"
      ></div>
    `)()}
  />
);
Languages.storyName = 'Languages filter';

export const City = () => (
  <Html
    options={{
      locale: 'fr',
      filtersBase: {
        city: [
          { key: 'Paris', eventCount: 127 },
          { key: 'Toulouse', eventCount: 40 },
          { key: 'Le Port', eventCount: 33 },
          { key: 'Montpellier', eventCount: 33 },
          { key: 'Nantes', eventCount: 29 },
          { key: 'Colmar', eventCount: 24 },
        ],
      },
      aggregations: {
        city: [
          { key: 'Paris', eventCount: 34 },
          { key: 'Le Port', eventCount: 25 },
          { key: 'Montpellier', eventCount: 16 },
          { key: 'Colmar', eventCount: 7 },
        ],
      },
    }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'city' }) %>"
      ></div>
    `)()}
  />
);
City.storyName = 'City filter';

export const CountryCode = () => (
  <Html
    options={{
      locale: 'fr',
      filtersBase: {
        countryCode: [
          { key: 'FR', eventCount: 127 },
          { key: 'ES', eventCount: 40 },
          { key: 'EN', eventCount: 33 },
          { key: 'IT', eventCount: 33 },
          { key: 'PT', eventCount: 29 },
          { key: 'BD', eventCount: 24 },
        ],
      },
      aggregations: {
        countryCode: [
          { key: 'FR', eventCount: 34 },
          { key: 'ES', eventCount: 25 },
          { key: 'EN', eventCount: 16 },
          { key: 'IT', eventCount: 7 },
        ],
      },
    }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'countryCode' }) %>"
      ></div>
    `)()}
  />
);
CountryCode.storyName = 'CountryCode filter';

export const Keywords = () => (
  <Html
    options={{
      locale: 'fr',
      filtersBase: {
        keywords: [
          { key: 'CLAVIM', eventCount: 73 },
          { key: 'Espace Andrée Chedid', eventCount: 21 },
          { key: 'La Halle des Épinettes', eventCount: 21 },
          { key: "Les Maisons d'Issy", eventCount: 17 },
          { key: 'Atelier Janusz Korczak', eventCount: 15 },
          { key: 'philo', eventCount: 13 },
          { key: 'Espace Jeunes Anne Frank', eventCount: 11 },
        ],
      },
      aggregations: {
        keywords: [
          { key: 'CLAVIM', eventCount: 73 },
          { key: 'Espace Andrée Chedid', eventCount: 21 },
          { key: 'La Halle des Épinettes', eventCount: 21 },
          { key: "Les Maisons d'Issy", eventCount: 17 },
          { key: 'Atelier Janusz Korczak', eventCount: 15 },
          { key: 'philo', eventCount: 13 },
          { key: 'Espace Jeunes Anne Frank', eventCount: 11 },
        ],
      },
    }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'keywords' }) %>"
      ></div>
    `)()}
  />
);
Keywords.storyName = 'Keywords filter';

export const FavoritesSelectorWithCheckbox = () => (
  <Html
    options={{
      locale: 'fr',
    }}
    html={_.template(`
      <div
        class="checkbox"
        data-oa-widget
        data-oa-widget-params="<%- JSON.stringify({
          eventUid: 4564564,
          name: 'favorite'
        }) %>"
      >
        <label for="check-favorite-4564564">
          <input id="check-favorite-4564564" type="checkbox"/>
          Add to favorites
        </label>
      </div>
    `)()}
  />
);
FavoritesSelectorWithCheckbox.storyName = 'Favorites selector';

export const FavoritesFilter = () => (
  <Html
    options={{
      locale: 'fr',
    }}
    html={_.template(`
      <div
        class="checkbox"
        data-oa-filter
        data-oa-filter-params="<%- JSON.stringify({
          activeClass: 'active',
          inactiveClass: 'inactive',
          activeFilterLabel: 'Favorites'
        }) %>"
      >
        <label for="favorites">
          <input type="checkbox" id="favorites" />
          Favoris
        </label>
      </div>
    `)()}
  />
);
FavoritesFilter.storyName = 'Favorites filter';

export const Total = () => (
  <Html
    options={{
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
      total: 42,
    }}
    html={_.template(`
      <div
        data-oa-widget="an-id"
        data-oa-widget-params="<%- JSON.stringify({
          message: {
            id: 'eventsTotal',
            defaultMessage:
              '{total, plural, =0 {Aucun événement ne correspond à cette recherche} one {{total} événement} other {{total} événements}}',
          },
          name: 'total',
        }) %>"
      ></div>
    `)()}
  />
);
Total.storyName = 'Total widget';

export const ActiveFilters = () => (
  <Html
    options={{
      locale: 'fr',
      query: {
        relative: ['current'],
      },
    }}
    html={_.template(`
      <div
        data-oa-widget="an-id"
        data-oa-widget-params="<%- JSON.stringify({ name: 'activeFilters' }) %>"
      ></div>

      <div
        data-oa-filter="relative"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'relative' }) %>"
      ></div>
    `)()}
  />
);
ActiveFilters.storyName = 'Active filters widget';

export const PageSize = () => (
  <Html
    options={{
      locale: 'fr',
      filtersBase: {
        city: [
          { key: 'Paris', eventCount: 127 },
          { key: 'Toulouse', eventCount: 40 },
          { key: 'Le Port', eventCount: 33 },
          { key: 'Montpellier', eventCount: 33 },
          { key: 'Nantes', eventCount: 29 },
          { key: 'Colmar', eventCount: 24 },
          { key: 'a', eventCount: 23 },
          { key: 'b', eventCount: 22 },
          { key: 'c', eventCount: 21 },
          { key: 'd', eventCount: 20 },
          { key: 'e', eventCount: 19 },
          { key: 'f', eventCount: 18 },
        ],
      },
      aggregations: {
        city: [
          { key: 'Paris', eventCount: 34 },
          { key: 'Le Port', eventCount: 25 },
          { key: 'Montpellier', eventCount: 16 },
          { key: 'Colmar', eventCount: 7 },
        ],
      },
    }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'city', pageSize: 12 }) %>"
      ></div>
    `)()}
  />
);
PageSize.storyName = 'Options page size';

export const SortChoice = () => (
  <Html
    options={{
      locale: 'fr',
      filtersBase: {
        city: [
          { key: 'Paris', eventCount: 127 },
          { key: 'Toulouse', eventCount: 40 },
          { key: 'Le Port', eventCount: 33 },
          { key: 'Montpellier', eventCount: 33 },
          { key: 'Nantes', eventCount: 29 },
          { key: 'Colmar', eventCount: 24 },
          { key: 'a', eventCount: 23 },
          { key: 'b', eventCount: 22 },
          { key: 'c', eventCount: 21 },
          { key: 'd', eventCount: 20 },
          { key: 'e', eventCount: 19 },
          { key: 'f', eventCount: 18 },
        ],
      },
      aggregations: {
        city: [
          { key: 'Paris', eventCount: 34 },
          { key: 'Le Port', eventCount: 25 },
          { key: 'Montpellier', eventCount: 16 },
          { key: 'Colmar', eventCount: 7 },
        ],
      },
    }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'city', sort: 'alphabetical' }) %>"
      ></div>
    `)()}
  />
);
SortChoice.storyName = 'Choice with sort';

export const SortChoiceList = () => (
  <Html
    options={{
      locale: 'fr',
      filtersBase: {
        city: [
          { key: 'Paris', eventCount: 127 },
          { key: 'Toulouse', eventCount: 40 },
          { key: 'Le Port', eventCount: 33 },
          { key: 'Montpellier', eventCount: 33 },
          { key: 'Nantes', eventCount: 29 },
          { key: 'Colmar', eventCount: 24 },
          { key: 'a', eventCount: 23 },
          { key: 'b', eventCount: 22 },
          { key: 'c', eventCount: 21 },
          { key: 'd', eventCount: 20 },
          { key: 'e', eventCount: 19 },
          { key: 'f', eventCount: 18 },
        ],
      },
      aggregations: {
        city: [
          { key: 'Paris', eventCount: 34 },
          { key: 'Le Port', eventCount: 25 },
          { key: 'Montpellier', eventCount: 16 },
          { key: 'Colmar', eventCount: 7 },
        ],
      },
    }}
    html={_.template(`
      <ul
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'city', sort: 'alphabetical', tag: 'li'}) %>"
      ></ul>
    `)()}
  />
);
SortChoiceList.storyName = 'Choice with sort list';

export const SortChoiceListInDropdown = () => (
  <Html
    options={{
      locale: 'fr',
      filtersBase: {
        city: [
          { key: 'Paris', eventCount: 127 },
          { key: 'Toulouse', eventCount: 40 },
          { key: 'Le Port', eventCount: 33 },
          { key: 'Montpellier', eventCount: 33 },
          { key: 'Nantes', eventCount: 29 },
          { key: 'Colmar', eventCount: 24 },
          { key: 'a', eventCount: 23 },
          { key: 'b', eventCount: 22 },
          { key: 'c', eventCount: 21 },
          { key: 'd', eventCount: 20 },
          { key: 'e', eventCount: 19 },
          { key: 'f', eventCount: 18 },
        ],
      },
      aggregations: {
        city: [
          { key: 'Paris', eventCount: 34 },
          { key: 'Le Port', eventCount: 25 },
          { key: 'Montpellier', eventCount: 16 },
          { key: 'Colmar', eventCount: 7 },
        ],
      },
    }}
    html={_.template(`
    <div class="dropdown">
      <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Ville
      </button>
        <ul class="dropdown-menu"
          aria-labelledby="dropdown"
          data-oa-filter="an-id"
          data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'city', sort: 'alphabetical', tag: 'li', preventDefault: false}) %>"
        ></ul>
    </div>
    `)()}
  />
);
SortChoiceListInDropdown.storyName = 'Choice with sort list in dropdown';

export const Valid = () => (
  <Html
    options={{
      locale: 'fr',
      filtersBase: {
        valid: [
          { key: 'true', eventCount: 4 },
          { key: 'false', eventCount: 2 },
        ],
      },
      aggregations: {
        valid: [
          { key: 'true', eventCount: 4 },
          { key: 'false', eventCount: 2 },
        ],
      },
    }}
    html={_.template(`
      <div
        data-oa-filter="an-id"
        data-oa-filter-params="<%- JSON.stringify({ type: 'choice', name: 'valid' }) %>"
      ></div>
    `)()}
  />
);
Valid.storyName = 'Valid filter';
