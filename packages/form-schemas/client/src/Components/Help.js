import React, { Component } from 'react';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';

import labels from '@openagenda/labels/form-schemas';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';

import multilingualLabels from '@openagenda/labels/form-schemas/fileUpload';

module.exports = ( {
  id,
  lang,
  label,
  content,
  link,
} ) => content ? <MoreInfo
  id={id}
  content={<ReactMarkdown source={content} />}>
  <a href="#">{label || labels.help[lang]}</a>
</MoreInfo> : <a className="margin-right-xs" target={_target( link )} href={link}>{label || labels.help[lang]}</a>

function _target( link ) {

  if ( !link || ( link.indexOf( 'mailto:' ) !== -1 ) ) return '_self';

  return '_blank';

}
