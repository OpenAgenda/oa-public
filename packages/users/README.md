# Users

### list( query?, offset, limit, cb )

- query: (optional)
  - total: boolean
  - search: string, recherche dans le full_name et l'email
  - detailed: boolean, add detailed fields to request
  - removed: boolean, get users even if removed
- cb( err, users, total )
  - users: array of users
  - total: number of total

### get( query, options?, cb )

- query (identifier): object with an email, id or uid expected
- options: (optional)
  - fullImagePath: boolean
  - detailed: boolean, add detailed fields to request
  - removed: boolean, get user even if removed
- cb( err, user )
  - user: object of user
  
### set( query, options?, cb )

Usefull for internal set

- query: identifier (id or uid) + data
- options (optional):
  - detailed: boolean, add detailed fields to request
- cb( err, result )
  - result:
    - user: object of user modified
    - valid: boolean: result of data validation
    - success: boolean
    - errors: array of validation's errors
  
  
### updateProfile( query, cb )

- query: identifier (id, uid, or email) + data
- cb( err, result )
  - result:
    - user: object of user modified
    - valid: boolean: result of data validation
    - success: boolean
    - errors: array of validation's errors
  
  
### changePassword( query, cb )

- query: identifier (id, uid, or email) + new_password
- cb( err, result )
  - result:
    - valid: boolean: result of data validation
    - success: boolean
    - errors: array of validation's errors
  
  
### verifyPassword( query, cb )

- query: identifier (id, uid, or email) + password
- cb( err, success )
  - success: boolean
  
### requestChangeEmail( query, cb )

- query: identifier (id or uid) + email
- cb( err, result )
  - result:
    - valid: boolean: result of data validation
    - success: boolean
    - errors: array of validation's errors
    - token
    
### confirmChangeEmail( query, cb )

- query: identifier (id, uid or email) + token
- cb( err, email_changed )
  - email_changed: boolean

### generateApiKey( query, options, cb )

- query: identifier (id, uid or email)
- options:
  - secret: boolean
- cb( err, result )
  - result:
    - success: boolean
    - errors: array of validation's errors
    - key


### remove( query, cb )

- query: identifier (id, uid or email)
- cb( err, success )
  - success: boolean