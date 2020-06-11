import React from 'react';
import { Provider } from 'react-redux';
import Layout from './Layout';

export default function LayoutManager({
  store, apps, children, ...props
}) {
  return (
    <Provider store={store}>
      <Layout apps={apps} {...props}>
        {children}
      </Layout>
    </Provider>
  );
}
