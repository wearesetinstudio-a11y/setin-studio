import { defineMiddleware } from 'astro:middleware';

/** Locale pages are real routes. Only legacy aliases are rewritten here. */
export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname, search, origin } = context.url;
	const localeMatch = pathname.match(/^\/(pl|es)(?=\/|$)/);
	const prefix = localeMatch ? `/${localeMatch[1]}` : '';
	const barePath = pathname.replace(/^\/(pl|es)(?=\/|$)/, '') || '/';

	if (barePath === '/pitches/aeronaval' || barePath === '/pitches/aeronaval/') {
		return context.redirect(`${prefix}/projects/aeronaval${search}`, 308);
	}
	if (barePath === '/pitches/turysta' || barePath === '/pitches/turysta/') {
		return context.redirect(`${prefix}/projects/turysta${search}`, 308);
	}
	if (barePath === '/projects/nrv-web' || barePath === '/projects/nrv-web/') {
		return context.rewrite(new URL(`${prefix}/projects/nrv/${search}`, origin));
	}

	return next();
});
