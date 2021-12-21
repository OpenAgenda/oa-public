import React, { useState } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useIntl, defineMessages } from 'react-intl';
import { Spinner } from '@openagenda/react-shared';
import EmbedSelection from '../components/EmbedSelection';
import TagMenu from '../components/TagMenu';
import MapMenu from '../components/MapMenu';
import SearchMenu from '../components/SearchMenu';
import CalendarMenu from '../components/CalendarMenu';
import ListMenu from '../components/ListMenu';
import Presentation from '../components/Presentation';

const messages = defineMessages({
  applicationInfo: {
    id: 'LegacyEmbed.Dashboard.applicationInfo',
    defaultMessage: 'You are now using an new iteration of the the integrated views configuration tool.'
  },
  backToLegacy: {
    id: 'LegacyEmbed.Dashboard.backToLegacy',
    defaultMessage: 'Use the legacy application instead'
  }
});

function Dashboard({
  agendaUid,
  res,
  selectionMenuContainerRef,
  embedLanguages = ['fr', 'en', 'es', 'it', 'de'],
  defaultTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}) {
  const [editedEmbed, setEditedEmbed] = useState(null);

  const m = useIntl().formatMessage;

  const baseRes = res.embeds.replace(':agendaUid', agendaUid);

  const query = useQuery('embeds', () => axios.get(baseRes), {
    select: ({ data }) => data,
    onSettled: embeds => {
      setEditedEmbed(embeds.pop());
    }
  });
  const [activeMenu, setActiveMenu] = useState('list');

  const [displayEmbed, setDisplayEmbed] = useState(true);

  if (query.isLoading && !query.data) {
    return <Spinner page />;
  }

  if (!editedEmbed) {
    return (
      <Presentation
        res={baseRes}
        onCreate={setEditedEmbed}
      />
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-sm-12">
          <p>{m(messages.applicationInfo)} <a href={res.legacy.replace(':agendaUid', agendaUid)}>{m(messages.backToLegacy)}</a></p>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          {activeMenu === 'list' ? (
            <ListMenu
              res={{
                preview: res.preview
                  .replace(':embedUid', editedEmbed.uid)
                  .replace(':agendaUid', agendaUid),
                previewScript: res.previewScript,
                events: res.events
                  .replace(':agendaUid', agendaUid)
              }}
              embed={editedEmbed}
              onChange={setEditedEmbed}
              displayEmbed={displayEmbed}
            />
          ) : null}
          {activeMenu === 'tag' ? (
            <TagMenu
              embed={editedEmbed}
              onChange={setEditedEmbed}
              res={res.agendaSettings.replace(':agendaUid', agendaUid)}
            />
          ) : null}
          {activeMenu === 'search' ? (
            <SearchMenu
              embed={editedEmbed}
              onChange={setEditedEmbed}
            />
          ) : null}
          {activeMenu === 'map' ? (
            <MapMenu
              embed={editedEmbed}
              onChange={setEditedEmbed}
              embedLanguages={embedLanguages}
              defaultTiles={defaultTiles}
            />
          ) : null}
          {activeMenu === 'calendar' ? (
            <CalendarMenu
              embed={editedEmbed}
              onChange={setEditedEmbed}
            />
          ) : null}
        </div>
      </div>
      <EmbedSelection
        containerRef={selectionMenuContainerRef}
        activeMenu={activeMenu}
        onChange={setActiveMenu}
        updateRes={`${baseRes}/${editedEmbed.uid}`}
        embed={editedEmbed}
        onSave={() => {
          setDisplayEmbed(false);
          setTimeout(() => {
            setDisplayEmbed(true);
          }, 500);
        }}
      />
    </div>
  );
}

export default Dashboard;
