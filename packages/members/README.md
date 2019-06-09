# Overview

Handle OpenAgenda members

## List

    const members = await membersSvc.list( filter, nav );

### Filter

 * **agendaUid**: Optional. The uid of the agenda associated with the member;
 * **userUid**: Optional. The uid of the user associated with the member.

### Nav

 * **order**: Defaults at id.asc; Possible values: id.asc, id.desc, slug.asc, slug.desc, actionsCounter.asc, actionsCounter.desc
