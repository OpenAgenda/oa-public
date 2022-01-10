import React from 'react';
import ReactMarkdown from 'react-markdown';
import labels from '@openagenda/labels/form-schemas';
import { MoreInfo } from '@openagenda/react-shared';

export default function Help({
  id,
  lang,
  label,
  content,
  link,
}) {
  if (content) {
    return (
      <MoreInfo
        id={id}
        content={(
          <ReactMarkdown disallowedElements={['p']} unwrapDisallowed>
            {content}
          </ReactMarkdown>
        )}
      >
        <a target={_target(link)} href={link}>{label || labels.help[lang]}</a>
      </MoreInfo>
    );
  }

  return <a className="margin-right-xs" target={_target(link)} href={link}>{label || labels.help[lang]}</a>;
}

function _target( link ) {

  if ( !link || ( link.indexOf( 'mailto:' ) !== -1 ) ) return '_self';

  return '_blank';

}
