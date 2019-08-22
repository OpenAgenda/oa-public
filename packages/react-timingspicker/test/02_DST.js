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
      DST.dayOffset( new Date( '2019-10-27T10:00:00+0200' ) ).should.equal( 1 );
    } );

    it( '-1 if switch is minus one hour', () => {
      DST.dayOffset( new Date( '2019-03-31T06:00:00+0200' ) ).should.equal( -1 );
    } );

    it( 'Next day offset is 0', () => {
      DST.dayOffset( new Date( '2019-10-28T02:00:00+0200' ) ).should.equal( 0 );
    } );

  } );

  describe( 'applyOffset', () => {

    it( 'apply offset should work for dates going over to next day before offset', () => {

      const d = new Date( '2019-03-31T23:00:00.000Z' );

      const timeBefore = d.getTime();

      DST.applyOffset( new Date( '2019-10-31T00:00:00.000Z' ), d );

      ( ( timeBefore - d.getTime() ) / 1000 / 60 / 60 ).should.equal( 1 );

    } );

  } );

} );
