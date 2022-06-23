## Modify mails templates

To modify the templates of emails you have to run `yarn mails-editor`

## Core

### Tests

In order to run tests, all environment variables present in the `test/testConfig.js` file must be set.

Using a tool like [direnv](https://direnv.net/), define them in a `.envrc` file at the root of the package. This will avoid unnecessary clutter in your general bashrc file. The `.envrc` file is gitignored. 

Then, open a terminal in the cibul-node folder, ensure that NO container is running the integrated app and run `yarn test`
