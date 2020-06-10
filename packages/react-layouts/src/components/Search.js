import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  search: {
    id: 'react-layouts.components.Search.search',
    defaultMessage: 'Search'
  }
});

function Search() {
  const intl = useIntl();

  return (
    <form className="navbar-left search-form" role="search" action="/agendas">
      <input
        className="search-input"
        placeholder={intl.formatMessage(messages.search)}
        type="text"
        name="search"
      />
      {/* <input type="hidden" name="lang" value="<%= lang %>" /> */}
      <div className="search-button">
        <button className="search-submit" type="submit">
          <i className="fa fa-search" />
        </button>
      </div>
    </form>
  );
}

export default React.memo(Search);
