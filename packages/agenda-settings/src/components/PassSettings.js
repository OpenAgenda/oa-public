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
    defaultMessage: 'To activate the gateway, specify a SIREN',
  },
  enterSiren: {
    id: 'AgendaSettings.Components.PassSettings.enterSiren',
    defaultMessage: 'Enter your SIREN number',
  },
  sirenMustBe9Digits: {
    id: 'AgendaSettings.Components.PassSettings.sirenMustBe9Digits',
    defaultMessage: 'A SIREN consists of 9 digits',
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
    defaultMessage: 'Modifier',
  },
  currentSiren: {
    id: 'AgendaSettings.Components.PassSettings.currentSiren',
    defaultMessage: 'Current SIREN',
  },
  gatewayAccess: {
    id: 'AgendaSettings.Components.PassSettings.gatewayAccess',
    defaultMessage: 'Accès à la passerelle',
  },
  gatewayAccessDescription: {
    id: 'AgendaSettings.Components.PassSettings.gatewayAccessDescription',
    defaultMessage:
      'The gateway is enabled for agenda administrators or moderators. To open access to contributors, {contactLink}.',
  },
  contactUs: {
    id: 'AgendaSettings.Components.PassSettings.contactUs',
    defaultMessage: 'contact us',
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
  clearSettings: {
    id: 'AgendaSettings.Components.PassSettings.clearSettings',
    defaultMessage: 'Clear Settings',
  },
  clearSettingsConfirm: {
    id: 'AgendaSettings.Components.PassSettings.clearSettingsConfirm',
    defaultMessage:
      'Are you sure you want to clear the SIREN and default venue settings? This action cannot be undone.',
  },
  clearSettingsSuccess: {
    id: 'AgendaSettings.Components.PassSettings.clearSettingsSuccess',
    defaultMessage: 'Settings cleared successfully',
  },
});

export default function PassSettings() {
  const { agenda } = useLayoutData();
  const intl = useIntl();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.agenda.loading);
  const [siren, setSiren] = useState('');
  const [saveError, setSaveError] = useState(null);
  const [sirenSaveSuccess, setSirenSaveSuccess] = useState(false);
  const [venueSaveSuccess, setVenueSaveSuccess] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [defaultVenueId, setDefaultVenueId] = useState(null);
  const [tempSelectedVenueId, setTempSelectedVenueId] = useState(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [isEditingSiren, setIsEditingSiren] = useState(false);
  const [hasVenues, setHasVenues] = useState(false);

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

  useEffect(() => {
    // Check if venues are available when SIREN is set
    if (sirenIsSet && agenda?.uid) {
      const checkVenues = async () => {
        try {
          const response = await fetch(
            `/api/agendas/${agenda.uid}/settings/passCulture`,
          );
          if (response.ok) {
            const data = await response.json();
            const hasVenuesData = data?.offererVenues?.some(
              (offerer) => offerer.venues && offerer.venues.length > 0,
            );
            setHasVenues(hasVenuesData);
          }
        } catch (error) {
          console.log('Error checking venues:', error);
          setHasVenues(false);
        }
      };

      checkVenues();
    } else {
      setHasVenues(false);
    }
  }, [sirenIsSet, agenda?.uid, currentSiren]);

  const handleSaveSiren = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSirenSaveSuccess(false);
    setVenueSaveSuccess(false);
    setClearSuccess(false);

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
      setSirenSaveSuccess(true);
      setIsEditingSiren(false);
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
                onChange={(e) => {
                  setSiren(e.target.value);
                  // Clear success messages when user makes changes
                  setSirenSaveSuccess(false);
                  setVenueSaveSuccess(false);
                  setClearSuccess(false);
                }}
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
                  className="btn btn-secondary margin-left-xs"
                  onClick={() => {
                    setIsEditingSiren(false);
                    setSiren(currentSiren);
                    setSaveError(null);
                    setSirenSaveSuccess(false);
                    setVenueSaveSuccess(false);
                    setClearSuccess(false);
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

            {sirenSaveSuccess && (
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
        <div>SIREN: {currentSiren}</div>
        <button
          type="button"
          className="btn btn-link"
          onClick={() => setIsEditingSiren(true)}
          style={{ padding: '0', textDecoration: 'none' }}
        >
          {intl.formatMessage(messages.editSiren)}
        </button>
      </div>
    );
  };

  const renderNoVenuesSection = () => (
    <div className="mb-4 margin-top-sm">
      <p>
        Aucun lieu pass Culture lié à ce SIRET n&apos;a été trouvé.
        Connectez-vous à votre compte pass pro pour:
      </p>
      <ol>
        <li>Vérifier que des lieux y sont associés</li>
        <li>
          Que OpenAgenda est défini comme <strong>logiciel tiers lié</strong>{' '}
          pour au moins un de vos lieux
        </li>
      </ol>
      <p>
        Consultez la{' '}
        <a
          href="https://doc.openagenda.com/integration-du-pass-culture-sur-openagenda/"
          target="_blank"
          rel="noopener noreferrer"
        >
          documentation pass
        </a>{' '}
        pour plus de détails
      </p>
    </div>
  );

  const renderGatewayAccessSection = () => (
    <div className="mb-4">
      <h4>{intl.formatMessage(messages.gatewayAccess)}</h4>
      <p className="text-muted mb-3">
        {intl.formatMessage(messages.gatewayAccessDescription, {
          contactLink: (
            <a
              href={`/support?origin=${encodeURIComponent(
                window.location.pathname,
              )}&subject=PassCulture`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.formatMessage(messages.contactUs)}
            </a>
          ),
        })}
      </p>
    </div>
  );

  if (!sirenIsSet) {
    // If agenda is official, show the SIREN input form
    if (agenda.official) {
      return <>{renderSirenSection()}</>;
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
    // Clear success messages when user makes changes
    setSirenSaveSuccess(false);
    setVenueSaveSuccess(false);
    setClearSuccess(false);
  };

  const handleSaveDefaultVenue = async () => {
    // Allow saving null to clear the default venue
    setSaveError(null);
    setSirenSaveSuccess(false);
    setVenueSaveSuccess(false);
    setClearSuccess(false);

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
      setVenueSaveSuccess(true);
      setShowSaveButton(false);
    } catch (error) {
      setSaveError(error.message || 'Failed to save default venue');
    }
  };

  const handleClearSettings = async () => {
    setSaveError(null);
    setSirenSaveSuccess(false);
    setVenueSaveSuccess(false);
    setClearSuccess(false);

    try {
      const settingsUpdate = {
        settings: {
          ...agenda.settings,
          registration: {
            ...agenda.settings?.registration,
            passCulture: {
              siren: null,
              defaultVenueId: null,
            },
          },
        },
      };

      await dispatch(agendaActions.edit(settingsUpdate));
      setClearSuccess(true);
    } catch (error) {
      setSaveError(error.message || 'Failed to clear settings');
    }
  };

  return (
    <>
      {!sirenIsSet || isEditingSiren
        ? renderSirenSection()
        : (
          <>
            {/* Header section */}
            <div className="mb-4">
              <a
                href="https://doc.openagenda.com/integration-du-pass-culture-sur-openagenda/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
                style={{ textDecoration: 'none' }}
              >
                En savoir plus
              </a>
            </div>

            {/* SIREN section */}
            <div className="mb-4 margin-top-sm">
              <div className="d-flex align-items-baseline">
                <div>SIREN: {currentSiren}</div>
                <button
                  type="button"
                  className="btn btn-link btn-sm text-primary ms-3"
                  onClick={() => {
                    setIsEditingSiren(true);
                    setClearSuccess(false);
                  }}
                  style={{
                    textDecoration: 'none',
                    padding: '0',
                    lineHeight: 'inherit',
                  }}
                >
                  Modifier
                </button>
              </div>
            </div>

            {/* Venues section */}
            {hasVenues && (
            <div className="mb-4">
              <h4>Lieux pass Culture associés au SIREN</h4>
              <p className="text-muted">
                Sélectionnez un lieu par défaut pour éviter un choix additionnel
                à chaque nouvelle saisie
              </p>

              <ListVenues
                res={{
                  settings: `/api/agendas/${agenda.uid}/settings/passCulture`,
                }}
                defaultVenueId={tempSelectedVenueId || defaultVenueId}
                mode="select"
                onSelect={handleVenueSelect}
              />

              {showSaveButton && (
              <div className="d-flex justify-content-end mb-3">
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
              </div>
              )}
            </div>
            )}

            {/* Gateway access section */}
            {hasVenues && renderGatewayAccessSection()}

            {saveError && (
            <div className="alert alert-danger margin-top-sm">
              {intl.formatMessage(messages.saveError)}
            </div>
            )}

            {venueSaveSuccess && (
            <div className="alert alert-success margin-top-sm">
              {intl.formatMessage(messages.defaultVenueSaved)}
            </div>
            )}

            {clearSuccess && (
            <div className="alert alert-success margin-top-sm">
              {intl.formatMessage(messages.clearSettingsSuccess)}
            </div>
            )}

            {!hasVenues && renderNoVenuesSection()}
            {/* Clear Settings section */}
            <div className="mb-4 border-top pt-4">
              <button
                type="button"
                className="btn btn-link btn-link-inline text-danger"
                onClick={handleClearSettings}
              >
                {intl.formatMessage(messages.clearSettings)}
              </button>
            </div>
          </>
        )}
    </>
  );
}
