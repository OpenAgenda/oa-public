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