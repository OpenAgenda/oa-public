import should from 'should';
import stepPositionToSelection from '../src/utils/stepPositionToSelection';

describe( '01 - unit - stepPositionToSelection', () => {

  const props = {
    activeWeek: new Date( '2019-11-02T09:45:49+0100' ),
    weekStartsOn: 0,
    selectableStep: 1800
  };

  const topAt10 = 20;

  it( 'provides begin and end datetimes matching cursor position from given start point', () => {
    const { begin, end } = stepPositionToSelection( props, {
      top: topAt10,
      left: 1
    }, new Date( '2019-10-28T09:00:00+0100' ) );

    JSON.stringify( begin ).should.equal( '"2019-10-28T08:00:00.000Z"' )
    JSON.stringify( end ).should.equal( '"2019-10-28T09:00:00.000Z"' );
  } );

  it( 'if reference date is not provided, does not provide begin', () => {
    const { begin, end } = stepPositionToSelection( props, {
      top: topAt10,
      left: 1
    } );

    should( begin ).equal( null );
    JSON.stringify( end ).should.equal( '"2019-10-28T09:00:00.000Z"' );
  } );

} );
