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

      <table
        className="table table-borderless"
        style={{ backgroundColor: 'white' }}
      >
        <tbody>
          {venues.map((venue) => {
            const isDefault = venue.id === defaultVenueId;
            const isSelectable = mode === 'select';

            return (
              <tr
                key={venue.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                }}
              >
                <td className="border-0 py-2 align-top">
                  <div>{venue.publicName}</div>
                  <div className="text-muted small">
                    {`${venue.location.address}, ${venue.location.postalCode}, ${venue.location.city}`}
                  </div>
                </td>
                <td
                  className="border-0 py-2 text-center align-top"
                  style={{ width: '200px' }}
                >
                  {isDefault && (
                    <span
                      className="text-muted btn-sm"
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
                  className="border-0 py-2 text-end align-top"
                  style={{ width: '120px' }}
                >
                  {isSelectable && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-primary p-0"
                      onClick={() => handleVenueClick(venue.id)}
                      style={{ textDecoration: 'none', lineHeight: '1.5' }}
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
