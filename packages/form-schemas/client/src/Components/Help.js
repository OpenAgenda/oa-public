import React, { Component } from 'react';
import classNames from 'classnames';

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
  className="margin-right-xs"
  id={id}
  content={content}>
  <a target={link ? '_blank' : '_self'} href={link || '#'}>{label || labels.help[lang]}</a>
</MoreInfo> : <a className="margin-right-xs" target="_blank" href={link}>{label || labels.help[lang]}</a>
