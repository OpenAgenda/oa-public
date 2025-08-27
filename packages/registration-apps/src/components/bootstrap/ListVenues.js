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
      {mode !== 'select' && <div>Lieux configurés:</div>}

      <div className="list-group">
        {venues.map((venue) => {
          const isDefault = venue.id === defaultVenueId;
          const isSelectable = mode === 'select';

          return (
            <div key={venue.id} className="list-group-item bg-white border">
              <div className="py-2">
                <div className="fw-normal d-flex align-items-center">
                  {venue.publicName || venue.legalName}
                  {isDefault && (
                    <i
                      className="fa-regular fa-square-check text-primary margin-left-xs"
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Lieu par défaut"
                    />
                  )}
                </div>
                <div className="text-muted">
                  {`${venue.location.address}, ${venue.location.postalCode}, ${venue.location.city}`}
                </div>
                <div>
                  {isSelectable && (
                    <button
                      type="button"
                      className="btn btn-link text-primary padding-all-z"
                      onClick={() => handleVenueClick(venue.id)}
                    >
                      {isDefault ? 'Désélectionner' : 'Sélectionner'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
