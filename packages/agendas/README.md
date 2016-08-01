# settings options for agendas

.settings

  .theme

  .credentials
    .moderators
    .tags
    .chatbox
    .embeds
      .head
      .templates

  .exports
    .pdf
  
  .keys: [ { type, rights } ] // list of hashes found in store

  .stakeholders: [ { type, rights, fields } ]
    // may be in own service
    // types: 'all', 'administrator', 'moderator', 'contributor'

  .contribution
    .message
    .type

  .events

    .decorators // in fields?
      .longDescription
        .suffix

    .fields
      .standard: []
      .custom: []


.set( {id}, {} )

  validate

  map

  update or create







  ype | owner_id | review_id | integrated | newsletter | facebook | admins | embedded_form | moderated | extended_rights | aggregator | indesign | dataviz | editors | created_at          | updated_at          | lifespan | newsletters | swapcard | activating_invitations | custom_templates | contribution_info | moderator | custom_head | emailstrategie | wysiwyg | event_transfer | tags | tagcat | location |


#Sample config

    "use strict";

    module.exports = {
      mysql : {
        host : '127.0.0.1',
        database : 'agenda_test',
        password : 'grut',
        user : 'root'
      },
      schemas : {
        agenda: 'agenda',
        occurrence: 'occurrence',
        agendaEvent: 'agenda_event'
      },
      image: {
        default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },

      // dependency injection
      services: {
        
        // service in charge of handling and storing images
        images: {
          getPath: () => '/imagepath',
          getDefaultImagePath: () => '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png',
          set: ( name, cb ) => cb( null, { name: 'nameoftheimage', path: 'pathoftheimage' }),
          remove: ( name, cb ) => cb( null )
        }

      }
    }