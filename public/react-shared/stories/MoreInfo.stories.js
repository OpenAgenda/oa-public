import React from 'react';
import ReactMarkdown from 'react-markdown';
import MoreInfo from '../src/components/MoreInfo';
import AdminCanvas from './decorators/AdminCanvas';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'MoreInfo',
  component: MoreInfo,
  decorators: [AdminCanvas],
};

export const Simple = () => (
  <>
    <p style={{ flexBasis: '60%' }}>
      Simple icône d'aide auquel on peut attacher un message.
    </p>
    <div style={{ alignSelf: 'center' }}>
      <MoreInfo id="first-popover" content="Text" />
    </div>
  </>
);

export const Content = () => (
  <>
    <p style={{ flexBasis: '60%' }}>
      Un titre et un message s'affichent lorsqu'on hover sur l'icône d'aide.
      L'emplacement du message est paramétrable.
    </p>

    <div style={{ alignSelf: 'center' }}>
      <MoreInfo
        id="second-popover"
        title="Im' a title"
        content="I'm a text"
        placement="bottom"
      />
    </div>
  </>
);
Content.storyName = 'Title and text content';

export const ContentLink = () => (
  <>
    <p style={{ flexBasis: '60%' }}>
      L'icône est également utilisable comme lien cliquable, en complément de
      l'affichage d'un message.
    </p>
    <div style={{ alignSelf: 'center' }}>
      <MoreInfo
        id="third-popover"
        title="Link"
        content="Click on the icon"
        link="https://openagenda.zendesk.com/"
        placement="left"
      />
    </div>
  </>
);
ContentLink.storyName = 'With a link';

export const Link = () => (
  <>
    <p style={{ flex: 1 }}>
      Ici, l'icône n'affiche plus de message, et fait uniquement office de lien.
    </p>
    <div style={{ alignSelf: 'center' }}>
      <MoreInfo
        id="yetanother-popover"
        link="https://openagenda.zendesk.com/"
        placement="left"
      />
    </div>
  </>
);
Link.storyName = 'Nothing but a link';

export const Comp = () => (
  <>
    <p style={{ flexBasis: '60%' }}>
      Le composant peut être restylisé en lui passant des enfants.
    </p>
    <div style={{ alignSelf: 'center' }}>
      <MoreInfo id="fourth-popover" content="Ce badge est un badge !">
        <div className="badge">Un badge !</div>
      </MoreInfo>
    </div>
  </>
);
Comp.storyName = 'Wrapping a component';

export const Markdown = () => (
  <>
    <p style={{ flexBasis: '60%' }}>
      Il est possible d'inclure du markdown dans le message.
    </p>
    <div style={{ alignSelf: 'center' }}>
      <MoreInfo
        id="fourth-popover"
        content={
          <ReactMarkdown disallowedElements={['p']} unwrapDisallowed>
            ***Ce badge est un badge !***
          </ReactMarkdown>
        }
      >
        <div className="badge">Un badge !</div>
      </MoreInfo>
    </div>
  </>
);
Markdown.storyName = 'With markdown content';
