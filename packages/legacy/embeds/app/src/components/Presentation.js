import { useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Modal } from '@openagenda/react-shared';

import MenuOption from './MenuOption';

const messages = defineMessages({
  title: {
    id: 'LegacyEmbed.Presentation.title',
    defaultMessage: 'Integrations',
  },
  create: {
    id: 'LegacyEmbed.Presentation.create',
    defaultMessage: 'Create an embed for this agenda',
  },
  otherIntegrations: {
    id: 'LegacyEmbed.Presentation.otherIntegrations',
    defaultMessage: 'Other integrations',
  },
  embedPresentation: {
    id: 'LegacyEmbed.Presentation.embedPresentation',
    defaultMessage: 'The public embed code allows you to simply embed a complete agenda or a selection of events into a web page. Find it on the export modal of your agenda homepage.',
  },
  embedAction: {
    id: 'LegacyEmbed.Presentation.embedAction',
    defaultMessage: 'Show export modal',
  },
  pluginsTitle: {
    id: 'LegacyEmbed.Presentation.pluginsTitle',
    defaultMessage: 'Plugins',
  },
  pluginsSummary: {
    id: 'LegacyEmbed.Presentation.pluginsSummary',
    defaultMessage: 'Your website is powered by Wordpress, Drupal or Typo3',
  },
  pluginsPresentation: {
    id: 'LegacyEmbed.Presentation.pluginsPresentation',
    defaultMessage: 'Use the plugin corresponding to your CMS, allowing for a flexible and advanced integration of your events: adapt the layout and the styles, chose the filters to use...',
  },
  pluginsAction: {
    id: 'LegacyEmbed.Presentation.pluginsAction',
    defaultMessage: 'Discover the plugins',
  },
  portalTitle: {
    id: 'LegacyEmbed.Presentation.portalTitle',
    defaultMessage: 'Bespoke event portal website',
  },
  portalSummary: {
    id: 'LegacyEmbed.Presentation.portalSummary',
    defaultMessage: 'You want a dedicated website to display your events',
  },
  portalPresentation: {
    id: 'LegacyEmbed.Presentation.portalPresentation',
    defaultMessage: 'Deploy a dedicated bespoke events portal on your domain. This can be done by your web agency or by the OpenAgenda web development team.',
  },
  standardEmbedTitle: {
    id: 'LegacyEmbed.Presentation.standardEmbedTitle',
    defaultMessage: 'Customizable embed code',
  },
  standardEmbedSummary: {
    id: 'LegacyEmbed.Presentation.standardEmbedSummary',
    defaultMessage: 'You want a simple and efficient embed code to place in your website',
  },
  standardEmbedPresentation: {
    id: 'LegacyEmbed.Presentation.standardEmbedPresentation',
    defaultMessage: 'Get an embed code to place on a page of your website. It will display your events as well as the search and filtering features of your choice. Some visual adjustments are possible. The configuration and usage of this code are free.',
  },
  standardEmbedGetBack: {
    id: 'LegacyEmbed.Presentation.standardEmbedGetBack',
    defaultMessage: 'We\'ll get back to you shortly with a ready to use embed code',
  },
  legacyEmbedTitle: {
    id: 'LegacyEmbed.Presentation.legacyEmbedTitle',
    defaultMessage: 'Legacy embed code',
  },
  legacyEmbedSummary: {
    id: 'LegacyEmbed.Presentation.legacyEmbedSummary',
    defaultMessage: 'Use an embed code right away',
  },
  legacyEmbedPresentation: {
    id: 'LegacyEmbed.Presentation.legacyEmbedPresentation',
    defaultMessage: 'Create an embed code to be used right away',
  },
  legacyEmbedWarning: {
    id: 'LegacyEmbed.Presentation.legacyEmbedWarning',
    defaultMessage: 'Warning',
  },
  legacyEmbedWarningDetail: {
    id: 'LegacyEmbed.Presentation.legacyEmbedWarningDetail',
    defaultMessage: 'A redesign of this feature is under process; use as much as possible for a new integration the Customizable embed code method',
  },
  contactUs: {
    id: 'LegacyEmbed.Presentation.contactUs',
    defaultMessage: 'Contact us',
  },
  moreInfo: {
    id: 'LegacyEmbed.Presentation.moreInfo',
    defaultMessage: 'Find out more',
  },
});

export default function Presentation({ agendaSlug }) {
  const [activeOption, setActiveOption] = useState(false);
  const m = useIntl().formatMessage;

  return (
    <div className="row">
      <div className="col-md-12">
        <h2>{m(messages.title)}</h2>
        <p className="margin-v-md" style={{ fontSize: '16px' }}>
          {m(messages.embedPresentation)}
        </p>
        <div className="text-center margin-v-md">
          <a
            rel="noreferrer"
            className="btn btn-primary"
            target="_blank"
            href={`/${agendaSlug}?displayExportModal=embed`}
          >
            {m(messages.embedAction)}
          </a>
        </div>

        <h3>{m(messages.otherIntegrations)}</h3>

        <MenuOption
          head={m(messages.pluginsTitle)}
          value="plugins"
          summary={m(messages.pluginsSummary)}
          selection={activeOption}
          onSelect={setActiveOption}
        />
        <MenuOption
          head={m(messages.portalTitle)}
          summary={m(messages.portalSummary)}
          value="portal"
          selection={activeOption}
          onSelect={setActiveOption}
        />
        <MenuOption
          head={m(messages.standardEmbedTitle)}
          summary={m(messages.standardEmbedSummary)}
          value="standard-embed"
          selection={activeOption}
          onSelect={setActiveOption}
        />
      </div>

      {activeOption === 'plugins' ? (
        <Modal
          title={m(messages.pluginsTitle)}
          onClose={() => setActiveOption(false)}
        >
          <p>{m(messages.pluginsPresentation)}</p>
          <div className="text-center margin-v-md">
            <a rel="noreferrer" className="btn btn-primary" target="_blank" href="https://developers.openagenda.com/tag/60-plugins/">{m(messages.pluginsAction)}</a>
          </div>
        </Modal>
      ) : null}

      {activeOption === 'portal' ? (
        <Modal
          title={m(messages.portalTitle)}
          onClose={() => setActiveOption(false)}
        >
          <p>{m(messages.portalPresentation)}</p>
          <div className="text-center margin-v-md">
            <a rel="noreferrer" className="btn btn-link padding-left-z margin-right-md" target="_blank" href="https://developers.openagenda.com/portail-node-js/">{m(messages.moreInfo)}</a>
            <a className="btn btn-primary" href="mailto:support@openagenda.com">{m(messages.contactUs)}</a>
          </div>
        </Modal>
      ) : null}

      {activeOption === 'standard-embed' ? (
        <Modal
          title={m(messages.standardEmbedTitle)}
          onClose={() => setActiveOption(false)}
        >
          <p>{m(messages.standardEmbedPresentation)}</p>
          <div className="text-center margin-v-md">
            <a rel="noreferrer" className="btn btn-link padding-left-z margin-right-md" target="_blank" href="https://doc.openagenda.com/iframe-standard/">{m(messages.moreInfo)}</a>
            <a className="btn btn-primary" href="mailto:support@openagenda.com">{m(messages.contactUs)}</a>
          </div>
          <p className="text-center">{m(messages.standardEmbedGetBack)}</p>
        </Modal>
      ) : null}
    </div>
  );
}
