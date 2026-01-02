import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'ko'],
    defaultLocale: 'ko'
});

createNavigation(routing);
