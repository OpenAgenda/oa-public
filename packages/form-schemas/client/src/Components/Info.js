import React from 'react';

export default ( { value } ) => value ? <div className="margin-bottom-xs">
  {value.split( '\n' ).map( ( line, index ) => <div key={'line-' + index}>{line}</div> )}
</div> : null;
