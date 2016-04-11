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