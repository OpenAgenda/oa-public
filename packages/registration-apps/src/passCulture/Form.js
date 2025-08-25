import { useContext, useState, useMemo, useEffect } from 'react';
import { distance } from 'fastest-levenshtein';
import { validateLocalData } from '@openagenda/registrations/passCulture/iso/validate';
import { getCurrentValue } from '@openagenda/registrations/passCulture/iso/utils';

import ComponentsContext from '../components/Context.js';
import PriceCategories from './PriceCategories/index.js';
import Dates from './Dates/index.js';
import Description from './Description.js';
import Conditions from './Conditions.js';
import Name from './Name.js';
import Duration from './Duration.js';
import BookingEmail from './BookingEmail.js';
import {
  addPriceCategory,
  removePriceCategory,
  changePriceCategory,
  removeDate,
  changeDate,
  getRelatedFieldName,
  getRelatedFieldOptions,
  getNextId,
} from './utils.js';

const hasPriceCategories = (value) => !!(value?.priceCategories ?? []).length;

const checkForLocationMatch = (oaLocation, venues) => {
  const resp = venues.reduce((carry, item) => {
    let bestMatch = null;

    // Check publicName if it exists
    if (item.publicName) {
      const publicNamePercent = (distance(oaLocation.name, item.publicName) * 100)
        / Math.max(oaLocation.name.length, item.publicName.length);
      bestMatch = { percent: publicNamePercent, name: 'publicName' };
    }

    // Check legalName if it exists
    if (item.legalName) {
      const legalNamePercent = (distance(oaLocation.name, item.legalName) * 100)
        / Math.max(oaLocation.name.length, item.legalName.length);

      // Use legalName if it's better than publicName or if publicName doesn't exist
      if (!bestMatch || legalNamePercent < bestMatch.percent) {
        bestMatch = { percent: legalNamePercent, name: 'legalName' };
      }
    }

    // If we have a good match (less than 80% distance)
    if (bestMatch && bestMatch.percent < 80) {
      if (!carry || carry.levenshteinPercent > bestMatch.percent) {
        return {
          id: item.id,
          levenshteinPercent: bestMatch.percent,
        };
      }
    }

    return carry;
  }, null);
  return resp?.id || null;
};

function infoBlock({ status }) {
  if (status === 'validation en cours') {
    return (
      <div className="info-block warning">
        Votre offre est en cours de validation. les modifications faites seront
        appliquées des que possible.
      </div>
    );
  }
  if (status === 'modification') {
    return (
      <div className="info-block">
        Votre offre est déja crée, vous pouvez encore faire certaines
        modifications.
      </div>
    );
  }
  return null;
}

export default function Form({
  value: initialValue,
  timings,
  onSubmit,
  onClear,
  categories,
  related,
  offererVenues,
  bookingEmail,
  oaLocation = null,
  title = null,
  longDesc = null,
  conditions = null,
  patchMode = false,
  defaultVenueId = null,
  userRole,
}) {
  const [patch, setPatch] = useState(
    initialValue[initialValue.length - 1]?.editing
      ? initialValue[initialValue.length - 1]
      : { editing: true },
  );
  const [showErrors, setShowErrors] = useState(false);

  const [openSubForm, setOpenSubForm] = useState();
  const titleWarning = title ? title.length > 90 : false;
  const longDescWarning = longDesc ? longDesc.length > 1000 : false;

  const { Section, Select, Button, Input, Checkbox } = useContext(ComponentsContext);
  const storedValue = useMemo(
    () => getCurrentValue(initialValue),
    [initialValue],
  );
  const currentValue = useMemo(
    () => getCurrentValue(initialValue.filter((v) => !v.editing).concat(patch)),
    [initialValue, patch],
  );
  const nextId = useMemo(() => getNextId(currentValue), [currentValue]);
  const relatedCategoryFieldName = useMemo(
    () => getRelatedFieldName(categories, currentValue.category),
    [categories, currentValue.category],
  );
  const relatedCategoryOptions = useMemo(
    () =>
      (relatedCategoryFieldName
        ? getRelatedFieldOptions(related, relatedCategoryFieldName)
        : undefined),
    [relatedCategoryFieldName, related],
  );
  const venuesOptions = offererVenues
    .reduce((carry, item) => carry.concat(item.venues), [])
    .map((v) => ({
      value: v.id,
      label: `${v.publicName || v.legalName} - ${v.location.address}, ${v.location.postalCode} ${v.location.city}`,
    }));

  const status = useMemo(() => {
    if (!patchMode) return 'creation';
    if (currentValue?.isPending) return 'validation en cours';
    if (currentValue?.passId) return 'modification';
  }, [patchMode, currentValue]);

  const errors = useMemo(() => {
    try {
      validateLocalData(currentValue, { timings }, { categories, related });
    } catch (error) {
      return error?.info?.errors ?? [];
    }
    return false;
  }, [currentValue, timings, categories, related]);

  useEffect(() => {
    const defaultsAtInit = {};

    // defaultVenueId has absolute priority over everything
    if (defaultVenueId) {
      defaultsAtInit.venueId = defaultVenueId;
    } else {
      if (venuesOptions.length === 1 && !storedValue.venueId) {
        defaultsAtInit.venueId = venuesOptions[0].value;
      }

      if (
        venuesOptions.length > 1
        && oaLocation?.name
        && !storedValue.venueId
      ) {
        const match = checkForLocationMatch(
          oaLocation,
          offererVenues.reduce((carry, item) => carry.concat(item.venues), []),
        );
        if (match) defaultsAtInit.venueId = match;
      }
    }

    if (!hasPriceCategories(storedValue)) {
      defaultsAtInit.priceCategories = [
        {
          label: 'Tarif unique',
          price: 0,
          id: nextId,
        },
      ];
    }

    if (storedValue.duo === undefined) {
      defaultsAtInit.duo = true;
    }

    setPatch({ ...patch, ...defaultsAtInit });
  }, []);

  return (
    <form>
      <Section>{infoBlock({ status })}</Section>
      {!defaultVenueId ? (
        <Section>
          <Select
            disabled={openSubForm}
            label="Lieu"
            value={currentValue?.venueId}
            placeholder="Sélectionner un lieu"
            options={venuesOptions}
            onChange={(option) =>
              setPatch({
                ...patch,
                venueId: option.value,
              })}
            error={
              showErrors
                ? (errors || []).filter((e) => e?.field === 'venueId')
                : false
            }
            optional={false}
          />
        </Section>
      ) : null}
      <Section>
        <Select
          disabled={openSubForm || patchMode}
          label="Catégorie"
          value={currentValue?.category}
          placeholder="Choix requis"
          options={categories}
          onChange={(option) =>
            setPatch({
              ...patch,
              category: option.value,
            })}
          error={
            showErrors
              ? (errors || []).filter((e) => e?.field === 'category')
              : false
          }
          optional={false}
        />

        {relatedCategoryFieldName ? (
          <Select
            disabled={openSubForm}
            label={
              relatedCategoryFieldName === 'musicType'
                ? 'Type de musique'
                : 'Type de spectacle'
            }
            value={currentValue[relatedCategoryFieldName]}
            placeholder="Choix requis"
            options={relatedCategoryOptions}
            onChange={(option) =>
              setPatch({
                ...patch,
                [relatedCategoryFieldName]: option.value,
              })}
            error={
              showErrors
                ? (errors || []).filter(
                  (e) => e?.field === 'musicType' || e?.field === 'showType',
                )
                : false
            }
          />
        ) : null}
      </Section>
      <Section>
        <PriceCategories
          userRole={userRole}
          disabled={openSubForm && openSubForm !== 'priceCategories'}
          value={currentValue}
          onAdd={(pc) => {
            setPatch(addPriceCategory(patch, nextId, pc));
            setOpenSubForm(false);
          }}
          onRemove={(pc) => setPatch(removePriceCategory(patch, pc))}
          onSubFormToggle={(open) =>
            setOpenSubForm(open ? 'priceCategories' : false)}
          onChange={(pc) => {
            setPatch(changePriceCategory(patch, pc, currentValue));
            setOpenSubForm(false);
          }}
          error={
            showErrors
              ? (errors || []).filter((e) => e?.field === 'priceCategories')
              : false
          }
        />
      </Section>
      <Section>
        <Dates
          disabled={openSubForm && openSubForm !== 'dates'}
          value={currentValue}
          onAdd={(d) => {
            setPatch({
              ...patch,
              dates: (patch.dates ?? []).concat({ id: nextId, ...d }),
            });
            setOpenSubForm(false);
          }}
          onRemove={(d) => setPatch(removeDate(patch, d, currentValue))}
          onChange={(d) => {
            setPatch(changeDate(patch, d));
            setOpenSubForm(false);
          }}
          onSubFormToggle={(open) => setOpenSubForm(open ? 'dates' : false)}
          timings={timings}
          error={
            showErrors
              ? (errors || []).filter((e) => e?.field === 'dates')
              : false
          }
        />
      </Section>
      <Section>
        <Duration
          value={currentValue}
          onChange={(v) => setPatch({ ...patch, eventDuration: v })}
          timings={timings}
        />
      </Section>
      {titleWarning ? (
        <Section>
          <Name
            value={currentValue}
            onChange={(v) => setPatch({ ...patch, name: v })}
            title={title}
          />
        </Section>
      ) : null}
      <Section>
        <Description
          value={currentValue}
          onChange={(v) => setPatch({ ...patch, description: v })}
          longDesc={longDesc}
          longDescWarning={longDescWarning}
        />
      </Section>
      <Section>
        <Conditions
          value={currentValue}
          onChange={(v) => setPatch({ ...patch, itemCollectionDetails: v })}
          conditions={conditions}
        />
      </Section>
      <Section>
        <Input
          id="booking-contact"
          value={currentValue.bookingContact}
          label="Email de contact"
          type="email"
          onChange={(e) =>
            setPatch({ ...patch, bookingContact: e.target.value })}
          sub="Cette adresse email sera communiquée aux bénéficiaires ayant réservé votre offre."
          error={
            showErrors
              ? (errors || []).filter((e) => e?.field === 'bookingContact')
              : false
          }
          optional={false}
        />
      </Section>
      <Section>
        <BookingEmail
          value={currentValue}
          onChange={(v) => setPatch({ ...patch, bookingEmail: v })}
          settingsBookingEmail={bookingEmail}
        />
      </Section>
      <Section>
        <Checkbox
          info="Cette option permet au bénéficiaire de venir accompagné. La seconde place sera délivrée au même tarif que la première, quel que soit l’accompagnateur."
          value={currentValue.duo}
          onChange={() => setPatch({ ...patch, duo: !currentValue.duo })}
          label="Réservations “Duo”"
        />
      </Section>
      {showErrors && errors && errors.length > 0 ? (
        <Section>
          <div className="error-summary boxed padding-all-md">
            <b>Certaines saisies doivent être corrigées:</b>
            <ul className="list-unstyled margin-left-xs">
              {errors.map((e) => (
                <li key={e.code}>{e.label}</li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}
      <Section>
        <Button
          disabled={(showErrors && errors.length) || openSubForm}
          shape="primary"
          label="Enregistrer"
          onClick={() => {
            if (errors) {
              setShowErrors(true);
              return;
            }
            onSubmit(
              initialValue[initialValue.length - 1]?.editing
                ? initialValue.slice(0, -1).concat(patch)
                : initialValue.concat(patch),
            );
          }}
        />
        <Button shape="link-danger" label="Annuler" onClick={onClear} />
      </Section>
    </form>
  );
}
