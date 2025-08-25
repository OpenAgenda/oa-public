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
      {mode === 'select' ? (
        <p className="text-muted mb-3">
          Cliquez sur un lieu pour le sélectionner. Cliquez sur le lieu
          sélectionné pour le désélectionner.
        </p>
      ) : (
        <div>Lieux configurés:</div>
      )}

      <table className="table table-borderless bg-white">
        <tbody>
          {venues.map((venue) => {
            const isDefault = venue.id === defaultVenueId;
            const isSelectable = mode === 'select';

            return (
              <tr
                key={venue.id}
                className="bg-white"
                style={{
                  border: '1px solid #dee2e6',
                }}
              >
                <td className="border-0 py-2 align-middle">
                  <div>{venue.publicName || venue.legalName}</div>
                  <div className="text-muted small">
                    {`${venue.location.address}, ${venue.location.postalCode}, ${venue.location.city}`}
                  </div>
                </td>
                <td
                  className="border-0 text-center"
                  style={{
                    width: '200px',
                    verticalAlign: 'middle',
                    height: '100%',
                  }}
                >
                  {isDefault && (
                    <span
                      className="text-muted"
                      style={{
                        lineHeight: '1.5',
                        padding: '0.25rem 0.5rem',
                        display: 'inline-block',
                      }}
                    >
                      Lieu par défaut
                    </span>
                  )}
                </td>
                <td
                  className="border-0 text-end align-middle"
                  style={{
                    width: '120px',
                    height: '100%',
                  }}
                >
                  {isSelectable && (
                    <button
                      type="button"
                      className="btn btn-link text-primary p-0"
                      onClick={() => handleVenueClick(venue.id)}
                    >
                      {isDefault ? 'Désélectionner' : 'Sélectionner'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
