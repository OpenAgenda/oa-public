# Development

On a `yarn start` the dev server will show on `localhost:3000` a series of scenarios. These are defined in `scenarios.dev.js`. A scenario is a use case.

# Saving drafts

The distinction between a draft save and a non-draft save is made by a query value set during the post of the event values to the server: `?draft=1`

The server app handling the posted event ( service/index.js ) passes on the draft value to the `setEvent` interface.
