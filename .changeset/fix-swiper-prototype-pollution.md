---
'@openagenda/react-filters': patch
---

Bump `swiper` from `^11.2.6` to `^12.1.2` to remediate a critical prototype-pollution advisory (GHSA affecting `swiper >= 6.5.1, < 12.1.2`). The only consumer is `TimelineField`, which uses the module-based `swiper/react` + `swiper/modules` API (`FreeMode`, `Navigation`) that is unchanged across Swiper v9–v12, so this is a drop-in security bump.
