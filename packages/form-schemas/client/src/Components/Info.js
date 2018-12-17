import React, { Component } from 'react';

module.exports = ( { value } ) => value ? <div className="margin-bottom-xs">
  {value.split( '\n' ).map( ( line, index ) => <div key={'line-' + index}>{line}</div> )}
</div> : null;
