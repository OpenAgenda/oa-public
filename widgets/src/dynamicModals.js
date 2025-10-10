import {
  AgendaExportModal,
  EventShareModal,
  fetchLocale as fetchReactLocale,
} from '@openagenda/react';
import { fetchLocale as fetchFiltersLocales } from '@openagenda/react-filters';
import { createSystem, themeConfig as oaThemeConfig } from '@openagenda/uikit';
import { createRoot } from 'react-dom/client';
import Provider, { themeConfig } from './components/Provider';
import TopLayerPopover from './components/TopLayerPopover';

export async function renderAgendaExportModal(message, iframe) {
  const modalDiv = document.createElement('div');
  document.body.appendChild(modalDiv);

  const intlMessages = await Promise.all([
    fetchReactLocale(message.locale),
    fetchFiltersLocales(message.locale),
  ]).then((results) => Object.assign({}, ...results));

  const root = createRoot(modalDiv);

  const onClose = () => {
    root.unmount();
    document.body.removeChild(modalDiv);
  };

  const system = createSystem(oaThemeConfig, themeConfig, {
    ...message.themeConfig,
    globalCss: {
      ':host': message.themeConfig.globalCss?.html ?? {},
    },
  });

  root.render(
    <Provider
      intlMessages={intlMessages}
      locale={message.locale}
      theme={system}
    >
      <TopLayerPopover open>
        {(containerRef) => (
          <AgendaExportModal
            isOpen
            onClose={onClose}
            agenda={message.agenda}
            query={message.query}
            renderHost="parent"
            fetchAgendaExportSettings={(agendaUid) =>
              iframe.iFrameResizer.callChild('fetchAgendaExportSettings', {
                agendaUid,
              })}
            portalRef={containerRef}
          />
        )}
      </TopLayerPopover>
    </Provider>,
  );
}

export async function renderEventShareModal(message) {
  const modalDiv = document.createElement('div');
  document.body.appendChild(modalDiv);

  const intlMessages = await Promise.all([
    fetchReactLocale(message.locale),
    fetchFiltersLocales(message.locale),
  ]).then((results) => Object.assign({}, ...results));

  const root = createRoot(modalDiv);

  const onClose = () => {
    root.unmount();
    document.body.removeChild(modalDiv);
  };

  const system = createSystem(oaThemeConfig, themeConfig, {
    ...message.themeConfig,
    globalCss: {
      ':host': message.themeConfig.globalCss?.html ?? {},
    },
  });

  root.render(
    <Provider
      intlMessages={intlMessages}
      locale={message.locale}
      theme={system}
    >
      <TopLayerPopover open>
        {(containerRef) => (
          <EventShareModal
            isOpen
            onClose={onClose}
            agenda={message.agenda}
            event={message.event}
            contentLocale={message.contentLocale}
            renderHost="parent"
            portalRef={containerRef}
          />
        )}
      </TopLayerPopover>
    </Provider>,
  );
}
