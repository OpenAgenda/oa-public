import { useState, useEffect } from 'react';
import { Spinner } from '@openagenda/react-shared';

export default function ListVenues({
  res,
  defaultVenueId,
  mode = 'display',
  onSelect,
}) {
  const [isLoadingPassData, setIsLoadingPassData] = useState(true);
  const [passData, setPassData] = useState(null);

  useEffect(() => {
    fetch(res.settings)
      .then((r) => r.json())
      .then((data) => {
        setPassData(data);
        setIsLoadingPassData(false);
      });
  }, [res.settings]);

  const handleVenueClick = (venueId) => {
    if (mode === 'select' && onSelect) {
      // If clicking on the already selected venue, unselect it (pass null)
      if (venueId === defaultVenueId) {
        onSelect(null);
      } else {
        onSelect(venueId);
      }
    }
  };

  const handleKeyDown = (event, venueId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleVenueClick(venueId);
    }
  };

  const venueItem = (venue, moreThanOneOfferer, isDefault) => {
    const isSelectable = mode === 'select';

    const content = (
      <div>
        <b>{venue.publicName}</b>
        <div>{`${venue.location.address}, ${venue.location.postalCode}, ${venue.location.city}`}</div>
        {moreThanOneOfferer ? <div>Propriétaire: {venue.offerer}</div> : null}
      </div>
    );

    if (isSelectable) {
      return (
        <li
          key={venue.id}
          className={`list-group-item ${isDefault ? 'active' : ''}`}
        >
          <button
            type="button"
            className="btn btn-link p-0 text-start w-100 border-0"
            onClick={() => handleVenueClick(venue.id)}
            onKeyDown={(event) => handleKeyDown(event, venue.id)}
            aria-pressed={isDefault}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            {content}
          </button>
        </li>
      );
    }

    return (
      <li
        key={venue.id}
        className="list-group-item"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {content}
      </li>
    );
  };

  if (isLoadingPassData) {
    return <Spinner />;
  }

  const offerers = passData.offererVenues;
  const venues = offerers.reduce(
    (acc, carry) =>
      acc.concat(
        carry.venues.map((c) => ({ ...c, offerer: carry.offerer.name })),
      ),
    [],
  );

  return (
    <div>
      {mode === 'select' ? (
        <p className="text-muted mb-3">
          Cliquez sur un lieu pour le sélectionner. Cliquez sur le lieu
          sélectionné pour le désélectionner.
        </p>
      ) : (
        <div>Lieux configurés:</div>
      )}
      <ul className="margin-v-z margin-bottom-md list-unstyled list-group">
        {venues.map((v) =>
          venueItem(v, offerers.length > 1, v.id === defaultVenueId))}
      </ul>
    </div>
  );
}
