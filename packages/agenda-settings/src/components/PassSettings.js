import { useState, useEffect } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useLayoutData } from '@openagenda/react-shared';
import ListVenues from '@openagenda/registration-apps/dist/components/bootstrap/ListVenues.js';
import * as agendaActions from '../reducers/agenda.js';

const messages = defineMessages({
  learnMore: {
    id: 'AgendaSettings.Components.PassSettings.learnMore',
    defaultMessage: 'Learn more',
  },
  askForActivation: {
    id: 'AgendaSettings.Components.PassSettings.askForActivation',
    defaultMessage: 'Ask for activation',
  },
  siren: {
    id: 'AgendaSettings.Components.PassSettings.siren',
    defaultMessage: 'SIREN',
  },
  enterSiren: {
    id: 'AgendaSettings.Components.PassSettings.enterSiren',
    defaultMessage: 'Enter your SIREN number',
  },
  sirenMustBe9Digits: {
    id: 'AgendaSettings.Components.PassSettings.sirenMustBe9Digits',
    defaultMessage: 'The SIREN must contain 9 digits',
  },
  save: {
    id: 'AgendaSettings.Components.PassSettings.save',
    defaultMessage: 'Save',
  },
  saving: {
    id: 'AgendaSettings.Components.PassSettings.saving',
    defaultMessage: 'Saving...',
  },
  saveError: {
    id: 'AgendaSettings.Components.PassSettings.saveError',
    defaultMessage: 'An error occurred while saving',
  },
  sirenSavedSuccessfully: {
    id: 'AgendaSettings.Components.PassSettings.sirenSavedSuccessfully',
    defaultMessage: 'SIREN saved successfully',
  },
  editSiren: {
    id: 'AgendaSettings.Components.PassSettings.editSiren',
    defaultMessage: 'Edit SIREN',
  },
  currentSiren: {
    id: 'AgendaSettings.Components.PassSettings.currentSiren',
    defaultMessage: 'Current SIREN',
  },
  contributorAccess: {
    id: 'AgendaSettings.Components.PassSettings.contributorAccess',
    defaultMessage: 'Contributor Access',
  },
  contributorAccessDescription: {
    id: 'AgendaSettings.Components.PassSettings.contributorAccessDescription',
    defaultMessage:
      'To allow contributors to enter Pass Culture offers, contact us.',
  },
  cancel: {
    id: 'AgendaSettings.Components.PassSettings.cancel',
    defaultMessage: 'Cancel',
  },
  defaultVenue: {
    id: 'AgendaSettings.Components.PassSettings.defaultVenue',
    defaultMessage: 'Default venue',
  },
  selectDefaultVenue: {
    id: 'AgendaSettings.Components.PassSettings.selectDefaultVenue',
    defaultMessage: 'Select a default venue',
  },
  defaultVenueSaved: {
    id: 'AgendaSettings.Components.PassSettings.defaultVenueSaved',
    defaultMessage: 'Default venue saved successfully',
  },
});

export default function PassSettings() {
  const { agenda } = useLayoutData();
  const intl = useIntl();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.agenda.loading);
  const [siren, setSiren] = useState('');
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [defaultVenueId, setDefaultVenueId] = useState(null);
  const [tempSelectedVenueId, setTempSelectedVenueId] = useState(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [isEditingSiren, setIsEditingSiren] = useState(false);

  const sirenIsSet = !!agenda?.settings?.registration?.passCulture?.siren?.length;
  const currentSiren = agenda?.settings?.registration?.passCulture?.siren;

  useEffect(() => {
    // Load the default venue ID from settings if it exists
    if (agenda?.settings?.registration?.passCulture?.defaultVenueId) {
      setDefaultVenueId(
        agenda.settings.registration.passCulture.defaultVenueId,
      );
    }

    // Initialize SIREN field with current value when editing
    if (sirenIsSet && currentSiren) {
      setSiren(currentSiren);
    }
  }, [agenda, sirenIsSet, currentSiren]);

  useEffect(() => {
    // Initialize tempSelectedVenueId with defaultVenueId when it's loaded
    if (defaultVenueId && !tempSelectedVenueId) {
      setTempSelectedVenueId(defaultVenueId);
    }
  }, [defaultVenueId, tempSelectedVenueId]);

  const handleSaveSiren = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const settingsUpdate = {
        settings: {
          ...agenda.settings,
          registration: {
            ...agenda.settings?.registration,
            passCulture: {
              ...agenda.settings?.registration?.passCulture,
              siren,
            },
          },
        },
      };

      await dispatch(agendaActions.edit(settingsUpdate));
      setSaveSuccess(true);
      setIsEditingSiren(false);

      // Reload the page to reflect the updated settings
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setSaveError(error.message || 'Failed to save SIREN');
    }
  };

  const renderSirenSection = () => {
    if (!sirenIsSet || isEditingSiren) {
      // Show SIREN input form (either first time setup or editing)
      return (
        <div className="mb-4">
          <div className="margin-bottom-md">
            <a
              href="https://doc.openagenda.com/integration-du-pass-culture-sur-openagenda/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage(messages.learnMore)}
            </a>
          </div>

          <form onSubmit={handleSaveSiren}>
            <div className="form-group">
              <label htmlFor="siren">
                {intl.formatMessage(messages.siren)}
              </label>
              <input
                type="text"
                id="siren"
                className="form-control"
                value={siren}
                onChange={(e) => setSiren(e.target.value)}
                placeholder={intl.formatMessage(messages.enterSiren)}
                pattern="[0-9]{9}"
                title={intl.formatMessage(messages.sirenMustBe9Digits)}
                required
              />
              <small className="form-text text-muted">
                {intl.formatMessage(messages.sirenMustBe9Digits)}
              </small>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading
                  ? intl.formatMessage(messages.saving)
                  : intl.formatMessage(messages.save)}
              </button>

              {sirenIsSet && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditingSiren(false);
                    setSiren(currentSiren);
                    setSaveError(null);
                    setSaveSuccess(false);
                  }}
                >
                  {intl.formatMessage(messages.cancel)}
                </button>
              )}
            </div>

            {saveError && (
              <div className="alert alert-danger margin-top-sm">
                {intl.formatMessage(messages.saveError)}
              </div>
            )}

            {saveSuccess && (
              <div className="alert alert-success margin-top-sm">
                {intl.formatMessage(messages.sirenSavedSuccessfully)}
              </div>
            )}
          </form>
        </div>
      );
    }

    // Show current SIREN with edit option
    return (
      <div className="mb-4">
        <h4 className="mb-2">{intl.formatMessage(messages.currentSiren)}</h4>
        <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
          <strong className="me-3">{currentSiren}</strong>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm margin-left-sm"
            onClick={() => setIsEditingSiren(true)}
          >
            {intl.formatMessage(messages.editSiren)}
          </button>
        </div>
      </div>
    );
  };

  const renderContributorAccessSection = () => (
    <div className="mb-4">
      <h4>{intl.formatMessage(messages.contributorAccess)}</h4>
      <p className="text-muted mb-3">
        {intl.formatMessage(messages.contributorAccessDescription)}
      </p>
      <a
        className="btn btn-primary btn-medium text-center"
        target="_blank"
        rel="noopener noreferrer"
        href={`/support?origin=${encodeURIComponent(
          window.location.pathname,
        )}&subject=PassCulture`}
      >
        {intl.formatMessage(messages.askForActivation)}
      </a>
    </div>
  );

  if (!sirenIsSet) {
    // If agenda is official, show the SIREN input form
    if (agenda.official) {
      return (
        <>
          {renderSirenSection()}
          {renderContributorAccessSection()}
        </>
      );
    }

    // If not official, show the standard "ask for activation" UI
    return (
      <>
        <div>
          <a
            href="https://doc.openagenda.com/integration-du-pass-culture-sur-openagenda/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {intl.formatMessage(messages.learnMore)}
          </a>
        </div>
        <a
          className="btn btn-primary btn-medium text-center margin-top-sm margin-bottom-sm"
          target="_blank"
          rel="noopener noreferrer"
          href={`/support?origin=${encodeURIComponent(
            window.location.pathname,
          )}&subject=PassCulture`}
        >
          {intl.formatMessage(messages.askForActivation)}
        </a>
      </>
    );
  }

  const handleVenueSelect = (venueId) => {
    setTempSelectedVenueId(venueId);
    setShowSaveButton(true);
  };

  const handleSaveDefaultVenue = async () => {
    // Allow saving null to clear the default venue
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const settingsUpdate = {
        settings: {
          ...agenda.settings,
          registration: {
            ...agenda.settings?.registration,
            passCulture: {
              ...agenda.settings?.registration?.passCulture,
              defaultVenueId: tempSelectedVenueId,
            },
          },
        },
      };

      await dispatch(agendaActions.edit(settingsUpdate));

      setDefaultVenueId(tempSelectedVenueId);
      setSaveSuccess(true);
      setShowSaveButton(false);

      // Reload the page to reflect the updated settings
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setSaveError(error.message || 'Failed to save default venue');
    }
  };

  return (
    <>
      {renderSirenSection()}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>{intl.formatMessage(messages.defaultVenue)}</h4>
        {showSaveButton && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveDefaultVenue}
            disabled={loading}
          >
            {loading
              ? intl.formatMessage(messages.saving)
              : intl.formatMessage(messages.save)}
          </button>
        )}
      </div>

      <p className="text-muted mb-3">
        {intl.formatMessage(messages.selectDefaultVenue)}
      </p>

      <ListVenues
        res={{
          settings: `/api/agendas/${agenda.uid}/settings/passCulture`,
        }}
        defaultVenueId={tempSelectedVenueId || defaultVenueId}
        mode="select"
        onSelect={handleVenueSelect}
      />

      {saveError && (
        <div className="alert alert-danger margin-top-sm">
          {intl.formatMessage(messages.saveError)}
        </div>
      )}

      {saveSuccess && (
        <div className="alert alert-success margin-top-sm">
          {intl.formatMessage(messages.defaultVenueSaved)}
        </div>
      )}

      {renderContributorAccessSection()}
    </>
  );
}
