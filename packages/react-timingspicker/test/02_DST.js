import should from 'should';
import DST from '../src/utils/DST';

describe( '02 - unit - DST', () => {

  describe( 'hasSwitched', () => {

    it( 'hasSwitched gives true when DST has occurred between dates', () => {
      DST.hasSwitched(
        new Date( '2019-10-27T00:00:00Z' ),
        new Date( '2019-10-27T10:00:00Z' )
      ).should.equal( true );
    } );

    it( 'hasSwitched gives false when DST has occurred between dates', () => {
      DST.hasSwitched(
        new Date( '2019-10-27T00:00:00Z' ),
        new Date( '2019-10-25T10:00:00Z' )
      ).should.equal( false );
    } );

  } );

  describe( 'dayOffset', () => {

    it( '0 if no switch', () => {
      DST.dayOffset( new Date( '2019-01-01' ) ).should.equal( 0 );
    } );

    it( '1 if switch is plus one hour', () => {
      DST.dayOffset( new Date( '2019-10-27' ) ).should.equal( 1 );
    } );

    it( '-1 if switch is minus one houre', () => {
      DST.dayOffset( new Date( '2019-03-31' ) ).should.equal( -1 );
    } );

  } );

} );
