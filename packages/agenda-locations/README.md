# Overview

Handle locations in OpenAgenda

# Initialization

```
const service = AgendaLocations({ ... });

# Methods

Methods are exposed for handling locations within a dataset. A dataset is defined either by an agenda identifier or a location set identifier. To operate on locations of a given set, methods are exposed within a set namespace. Ex:

    const locationOfASet = await service.sets([setUID]).get([locationUID]);

## get

## list

## settings

### settings.get

    const settings = await service.agendas([agendaUID]).settings.get();

If location settings are defined at the agenda level and the agenda is linked to a location set, merged settings are provided in the result of the get. Settings defined in the set override the ones defined in the agenda.

Settings base structure:

    { tagSet, eventForm, labels, access }

#### How location settings are loaded for an agenda

Historically, there were no location sets. The only container for locations were agendas. Any location specific setting was stored in the db linked to a specific agenda.

With the introduction of location sets, it has become possible to link location settings to any given sets. Some agendas may still store their own settings, but when a location set is defined and is linked to such an agenda, the set settings take priority. Agenda-stored settings are still taken into account when no explicit corresponding setting is stored in the set.

A location set can also target specific settings for an agenda through its own agenda list. When settings are requested in the context of an agenda, precedence then proceeds in the following order:

1. If the agenda is not linked to a set and stores location settings, those settings are returned .
2. If the agenda is linked to a set and that set has defined settings, the defined set settings take precedence over the agenda settings.
3. If the set settings specify settings for the requested agenda, those last settings take precedence.

For example: The city of Geneva uses a location set for all its agendas and wants that set to be administered only through a single agenda.

All agendas are linked to the set so no settings needs to be stored in an agenda. The location set defines that no operations are permitted and lists specific settings for one agenda only, where all authorizations are provided.



```
[{
    countryCode: 'FR',
    adminLevels: [{
        level: 1,
        label: 'adminLevel1_FR'
    }]
}, {
    countryCode: 'AF',
    adminLevels: [{
        level: 1 -> `adminLevel${country.adminLevels[i].level}_${countryCode}`
    }, {
        level: 4
    }]
}]
```

Grande région (pas clair), canton, district, commune