import { useState, useEffect } from 'react';
import { Spinner } from '@openagenda/react-shared';

const venueItem = (venue, moreThanOneOfferer) => (
  <li className="list-group-item">
    <b>{venue.publicName}</b>
    <div>{`${venue.location.address}, ${venue.location.postalCode}, ${venue.location.city}`}</div>
    {moreThanOneOfferer ? <div>Propriétaire: {venue.offerer}</div> : null}
  </li>
);

export default function ListVenues({ res }) {
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
  const venuesItems = venues.map((v) => venueItem(v, offerers.length > 1));
  return (
    <div>
      Lieux configurés:
      <ul className="margin-v-z margin-bottom-md list-unstyled list-group">
        {venuesItems}
      </ul>
    </div>
  );
}
