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
 * **role**: Optional. List certain roles. Takes on or multiple role slugs
 * **withUser**: Optional. null (default): include all members, false: exclude members linked with users, true: exclude members not linked with users.
 * **withActions**: Optional. null (default): no constraint. false: excludes members with a non zero action count. true: excludes members with a zero action count.
 * **deleted**: Optional. false (default): excludes members marked as deleted. true: excludes members not marked as deleted. null: no constraint.

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
