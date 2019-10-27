"use strict";

const should = require( 'should' );

const  evaluate = require( '../lib/rules' );

describe( 'evaluateRules', () => {

  describe( 'tag evaluates, no transform', () => {

    const rule = {
      query: {
        tags: [ 'Tag1' ]
      }
    };

    it( 'tag evaluate passes if data has tag specified in query', () => {

      const data = {
        title: 'A thing',
        tags: [ 'Tag1', 'Tag2' ]
      }

      evaluate( rule, data ).should.eql( {
        title: 'A thing',
        tags: [ 'Tag1', 'Tag2' ]
      } );

    } );

    it( 'tag evaluate does not pass if data does not have tag specified in query', () => {

      const data = {
        title: 'A thing',
        tags: [ 'Tag3' ]
      }

      should( evaluate( rule, data ) ).eql( null );

    } );

    it( 'tag evaluate passes event if query does not match if required is false', () => {

      const data = {
        title: 'Another thing',
        tags: [ 'Tag3' ]
      };

      const rule = {
        query: {
          tags: [ 'Tag1' ]
        },
        required: false
      };

      evaluate( rule, data ).should.eql( data );

    } );

  } );

  describe( 'tag evaluate with transform', () => {

    const rule = {
      query: {
        tags: [ 'Tag1' ]
      },
      transform: {
        tags: { $set: [ 'Tag4' ] }
      },
      required: false
    };

    it( 'if data does not match rule, there is no transform', () => {

      const data = {
        title: 'Line 77',
        tags: [ 'Tag2' ]
      };

      evaluate( rule, data ).should.eql( data );

    } );

    it( 'if data matches rule and a transform is specified, it is applied', () => {

      const data = {
        title: 'Transformed line 77',
        tags: [ 'Tag1', 'Tag77' ]
      };

      evaluate( rule, data ).should.eql( {
        title: 'Transformed line 77',
        tags: [ 'Tag4' ]
      } );

    } );

    it( 'multiple transforms can be brought by multiple rules', () => {

      const data = {
        title: 'Evénement de la ville de Lille',
        tags: [ 'Cinéma - projection', 'Fête / festival' ]
      }

      const rules = [ {
        transform: {
          tags: { $set: [] }
        }
      }, {
        query: {
          tags: 'Cinéma - projection'
        },
        transform: {
          tags: { $push: [ 'Cinéma' ] }
        },
        required: false
      }, {
        query: {
          tags: 'Fête / festival'
        },
        transform: {
          tags: { $push: [ 'Fête - Festival' ] }
        },
        required: false
      } ];

      evaluate( rules, data ).should.eql( {
        title: 'Evénement de la ville de Lille',
        tags: [ 'Cinéma', 'Fête - Festival' ]
      } );

    } );

  } );

  describe('location evaluate', async () => {

    it('if one location evaluated field does not match, the rule does not match', () => {
      const rules = [{
        query: {
          location: {
            region: 'Ile-de-France',
            city: 'Courbevoie'
          }
        }
      }];

      const data = {
        location: {
          name: 'La boutique',
          city: 'Paris',
          region: 'Ile-de-France'
        }
      };

      should(evaluate(rules, data)).equal(null);
    });

    it('evaluation passes if all specified location fields pass', () => {
      const rules = [{
        query: {
          location: {
            region: 'Ile-de-France',
            city: 'Paris'
          }
        }
      }];

      const data = {
        location: {
          name: 'La boutique',
          city: 'Paris',
          region: 'Ile-de-France'
        }
      };

      should(evaluate(rules, data)).eql(data);
    } );

    it('when multiple locations are specified in the same rule, operand is OR', () => {
      const rules = [{
        query: {
          location: [{
            city: 'Bordeaux'
          }, {
            city: 'Toulouse'
          }]
        }
      }];

      const data = {
        location: {
          city: 'Toulouse'
        }
      };

      evaluate(rules, data).should.eql(data);
    });

    it('multiple values can be specified in the same filter field for an OR evaluation', () => {
      const rules = [{
        query: {
          location: {
            city: ['Bordeaux', 'Toulouse']
          }
        }
      }];

      const data = {
        location: {
          city: 'Toulouse'
        }
      };

      evaluate(rules, data).should.eql(data);
    });

  } );

  describe( 'truthy evaluates', async () => {

    it( 'fields specified in truthy rule field have to be truthy for evaluation to pass', () => {

      const rule = {
        truthy: [ 'intercommunal_interest' ]
      }

      const data = {
        intercommunal_interest: [ 1 ]
      }

      evaluate( rule, data ).should.eql( {
        intercommunal_interest: [ 1 ]
      } );

    } );

    it( 'empty array is falsy', () => {

      const rule = {
        truthy: [ 'intercommunal_interest' ]
      };

      const data = {
        intercommunal_interest: []
      };

      should( evaluate( rule, data ) ).eql( null );

    } );

    it( 'false is falsy', () => {

      const rule = {
        truthy: [ 'intercommunal_interest' ]
      };

      const data = {
        intercommunal_interest: false
      };

      should( evaluate( rule, data ) ).eql( null );

    } );

  } );

  describe( 'other field evaluates', () => {

    it( 'evaluation based on boolean value passes if boolean is same', () => {

      const rule = {
        query: {
          intercommunal_interest: true
        }
      };

      const data = {
        intercommunal_interest: true
      };

      evaluate( rule, data ).should.eql( {
        intercommunal_interest: true
      } );

    } );

    it( 'evaluation based on boolean value passes if boolean is different', () => {

      const rule = {
        query: {
          intercommunal_interest: true
        }
      };

      const data = {
        intercommunal_interest: false
      };

      should( evaluate( rule, data ) ).equal( null );

    } );

  } );


  describe( 'legacy value', () => {

    it( 'when value key is specified at root of rule, it is converted to transform format as $set', () => {

      const rule = {
        query: {
          yes: true
        },
        value: {
          state: 2
        }
      };

      const data = {
        yes: true
      }

      should( evaluate( rule, data ) ).eql( {
        yes: true,
        state: 2
      } );

    } );

  } );

} );
