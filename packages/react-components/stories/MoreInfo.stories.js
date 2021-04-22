import React from 'react';
import ReactMarkdown from 'react-markdown';
import MoreInfo from '../src/MoreInfo';
import Decorator from './helpers/Decorator';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'MoreInfo',
  component: MoreInfo,
  decorators: [Decorator]
};

export const Simple = () => (
  <MoreInfo
    id="first-popover"
    content="N'importe quoi par là"
  />
);

export const Content = () => (
  <MoreInfo
    id="second-popover"
    title="Un petit titre ici"
    content="N'importe quoi par là"
    placement="bottom"
  />
);
Content.storyName = 'Title and text content';

export const ContentLink = () => (
  <MoreInfo
    id="third-popover"
    title="Un petit titre ici"
    content="N'importe quoi par là"
    link="https://openagenda.zendesk.com/"
    placement="left"
  />
);
ContentLink.storyName = 'With a link';

export const Link = () => (
  <MoreInfo
    id="yetanother-popover"
    link="https://openagenda.zendesk.com/"
    placement="left"
  />
);
Link.storyName = 'Nothing but a link';

export const Comp = () => (
  <MoreInfo
    id="fourth-popover"
    content="Ce badge est un badge !"
  >
    <div className="badge">Un badge !</div>
  </MoreInfo>
);
Comp.storyName = 'Wrapping a component';

export const Markdown = () => (
  <MoreInfo
    id="fourth-popover"
    content={<ReactMarkdown disallowedElements={['p']} unwrapDisallowed>***Ce badge est un badge !***</ReactMarkdown>}
  >
    <div className="badge">Un badge !</div>
  </MoreInfo>
);
Markdown.storyName = 'With markdown content';
