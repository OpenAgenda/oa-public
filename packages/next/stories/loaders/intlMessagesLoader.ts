type Fetch = (locale: string) => Promise<any>;

export default function intlMessagesLoader(fetchFn: Fetch) {
  return async ({ args: { locale = 'fr' } }) => ({
    intlMessages: await fetchFn(locale),
  });
}
