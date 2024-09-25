# Overview

When using this package, the following dependencies are also required:

- @babel/runtime-corejs3
- core-js
- regenerator-runtime

.. and dev dependencies:

- @babel/core

On top of file provided to the webpack configuration as main index files, add the following first lines:

    import 'core-js/stable';
    import 'regenerator-runtime/runtime';
