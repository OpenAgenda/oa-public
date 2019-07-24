# Overview

Handle OpenAgenda members

## Get

    const member = await membersSvc.get( identifiers, options );

Identifiers is an object containing an `agendaUid` and or a `userUid` key.

## List

    const members = await membersSvc.list( filter, nav );

### Filter

 * **agendaUid**: Optional. The uid of the agenda associated with the member;
 * **userUid**: Optional. The uid of the user associated with the member.

### Nav

 * **order**: Defaults at id.asc; Possible values: `id.asc`, `id.desc`, `slug.asc`, `slug.desc`, `actionsCounter.asc`, `actionsCounter.desc`

## Create

    const { member, errors, success } = await svc.create( {
      userUid: 12,
      agendaUid: 31,
      role: 1,
      custom: {
        organization: 'OpenAgenda',
        contactName: 'Gaetan',
        contactNumber: '01 23 45 67 89',
        email: 'support@openagenda.com',
        contactPosition: 'Support'
      }
    }, options );

### Options

 * **requireCustom**: boolean, defaults at true. If false, custom member data is not required for create

### Result

 * **success**: true if create is successful
 * **errors**: array of validation errors
 * **member**: created member data, including id value
