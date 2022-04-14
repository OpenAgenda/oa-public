# @openagenda/common-labels

## Installation

```
yarn add @openagenda/common-labels
```

## Usage

For the react-intl Provider:

```js
import commonLocales from '@openagenda/common-locales';

// to merge with others locales
import { mergeLocales } from '@openagenda/intl';

const locales = mergeLocales(commonLocales, appLocales);

// in render
<IntlProvider messages={locales[lang]} locale={lang} key={lang}>
```

Usage with react-intl formatter:

```js
import stateMessages from '@openagenda/common-locales/event/states';

intl.formatMessage(stateMessages.published);
```

## Workflow

1. Define messages in `messages` directory
2. Build with `yarn prepack`
4. Translate in `locales` (with Crowdin)
5. Compile locales with `yarn prepack`
