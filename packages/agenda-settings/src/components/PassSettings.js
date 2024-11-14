import { useContext } from 'react';
import { useLayoutData } from '@openagenda/react-shared';
import ListVenues from '@openagenda/registration-apps/dist/components/bootstrap/ListVenues.js';
import I18nContext from '../contexts/I18nContext.js';

export default function PassSettings() {
  const { agenda } = useLayoutData();
  const { getLabel } = useContext(I18nContext);
  const sirenIsSet = !!agenda?.settings?.registration?.passCulture?.siren?.length;
  if (!sirenIsSet) {
    return (
      <>
        <div>
          <a
            href="https://doc.openagenda.com/integration-du-pass-culture-sur-openagenda/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {getLabel('learnMore')}
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
          {getLabel('askForActivation')}
        </a>
      </>
    );
  }

  return (
    <ListVenues
      res={{
        settings: `/api/agendas/${agenda.uid}/settings/passCulture`,
      }}
    />
  );
}
