import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // Use the locale from the request
  let locale = await requestLocale;
  
  // Ensure that a valid locale is used
  if (!locale || !['hu', 'en'].includes(locale)) {
    locale = 'hu';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
