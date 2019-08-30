# Overview

Handle OpenAgenda members

## Get

    const member = await membersSvc.get( identifiers, options );

Identifiers is an object containing an `agendaUid` and or a `userUid` key. Or at list a list of ids in an id key.

## List

    const members = await membersSvc.list( filter, nav );

### Filter

 * **agendaUid**: Optional. The uid of the agenda associated with the member;
 * **userUid**: Optional. The uid of the user associated with the member.
 * **id**: Optional. List of ids from which members should be a part of.
 * **role**: Optional. List certain roles. Takes one or multiple role slugs
 * **withUser**: Optional. null (default): include all members, false: exclude members linked with users, true: exclude members not linked with users.
 * **withActions**: Optional. null (default): no constraint. false: excludes members with a non zero action count. true: excludes members with a zero action count.
 * **deletedUser**: Optional. false (default): excludes members if associated with deleted user. true: excludes members not marked ... null: no constraint.

### Nav

 * **order**: Defaults at id.asc; Possible values: `id.asc`, `id.desc`, `slug.asc`, `slug.desc`, `actionsCounter.asc`, `actionsCounter.desc`
 * **limit**: Number of members retrieved for one list call. Defaults at 20.
 * **offset**: Offset from wich list should start

### Options

 * **detailed**: Optional, defaults at false. If true, includes user data in a user key for each member associated with a user

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
