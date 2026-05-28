import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['hu', 'en'],
  defaultLocale: 'hu',
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/kiadvanyok': {
      hu: '/kiadvanyok',
      en: '/releases'
    },
    '/videos': {
      hu: '/videok',
      en: '/videos'
    },
    '/events': {
      hu: '/esemenyek',
      en: '/events'
    },
    '/hirek': {
      hu: '/hirek',
      en: '/news'
    },
    '/contact': {
      hu: '/kapcsolat',
      en: '/contact'
    },
    '/projects': {
      hu: '/projektek',
      en: '/projects'
    },
    '/projects/[slug]': {
      hu: '/projektek/[slug]',
      en: '/projects/[slug]'
    }
  }
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
