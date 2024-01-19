# Overview
The invitation service 

```js
invitations.init( {
  mysql: ..,
  actions: {
    adminCreate : stakeholders.create,
    ...
  }
} )
```

```js
// la tu es dans le controller web ( members.back.js par exemple )...
.assign( { email: 'test@gmail.com', token: 'fqfdsqfsdsq' }, 'adminCreate', {}, ( err, { success, token, email } ) => {

  mailer( {fsdqfdsqf }, ffdsq );


  .get( { email ou token }, ( err, actions ) => {

    actions.executeAll( /**/ );
  
  } )
} )
```

```js
// la on est à la fin de la validation d'un compte
// shortcut for get.then( actions.executeAll )
.executeAll( { email ou token }, ( err, result ) => { ... } )
```
