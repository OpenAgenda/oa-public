import convertTextLinks from '../src/utils/convertTextLinks.js';

describe('convertTextLinks', () => {
  test('link which is already markdown is not extracted', () => {
    expect(
      convertTextLinks(
        '[autre label](https://www.site.com?c%5B%5D=v&dfa%5B%5D=discovery)',
      ),
    ).toBe('[autre label](https://www.site.com?c%5B%5D=v&dfa%5B%5D=discovery)');
  });
});
