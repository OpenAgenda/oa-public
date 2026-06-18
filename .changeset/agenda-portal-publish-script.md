---
'@openagenda/agenda-portal': patch
---

Fix the release pipeline for `@openagenda/agenda-portal`. The `publish` script was a self-referential npm lifecycle hook: `npm publish` uploads the tarball and *then* runs the package's `publish` script, which called `yarn npm publish` again on the just-published version — failing with a version conflict and marking the release job as failed (even though the package had already been published, leaving the git tag and GitHub release missing). The production dependency build now lives in `prepublishOnly`, which runs *before* packing (so it actually influences the tarball) and only on publish (so local `prepack` / `yarn pack` stays in dev), with no recursive double-publish.
