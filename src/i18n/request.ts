
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'fr', 'ar'];

export default getRequestConfig(async ({ locale }) => {
    // If no locale is provided (e.g. non-localized routing), default to 'fr'
    const requestedLocale = (locale && locales.includes(locale as any)) ? locale : 'fr';

    return {
        locale: requestedLocale as any,
        messages: (await import(`../../messages/${requestedLocale}.json`)).default
    };
});
