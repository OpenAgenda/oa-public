import getNonce from '../src/api/utils/getNonce';
import reduceAccessToken from '../src/api/utils/reduceAccessToken';

describe('utils', () => {
  describe('getNonce', () => {
    test('nonce must not be greater or equal than 10 ** 15', () => {
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 1);
      const nonce = getNonce(
        reduceAccessToken('afI8hMb0C1Vg136AhFOm18toiegPN9au'),
        oneDayAgo,
      );

      expect(nonce).toBeLessThan(10 ** 15);
    });
  });
});
