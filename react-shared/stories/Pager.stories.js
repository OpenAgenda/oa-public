import React, { useState } from 'react';
import Pager from '../src/components/Pager';
import AdminCanvas from './decorators/AdminCanvas';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Pager',
  component: Pager,
  decorators: [AdminCanvas],
};

export const Simple = () => {
  const [page, setPage] = useState(1);

  const nextPage = () => {
    setPage(page + 1);
  };

  const previousPage = () => {
    if (page >= 2) setPage(page - 1);
  };

  return (
    <>
      <p style={{ flexBasis: '60%' }}>Pager simple. pageSize=20 total=72</p>
      <div style={{ alignSelf: 'center' }}>
        <Pager
          page={page}
          pageSize={20}
          total={72}
          previousPage={previousPage}
          nextPage={nextPage}
          previousMessage="Previous"
          nextMessage="Next"
        />
      </div>
    </>
  );
};
