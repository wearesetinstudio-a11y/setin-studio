import { defineMiddleware } from 'astro:middleware';

/** Mirror vercel.json: serve /pl/* and /es/* from unprefixed routes. */
export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	const barePath = pathname.replace(/^\/(pl|es)(?=\/|$)/, '') || '/';
	if (barePath === '/pitches/aeronaval' || barePath === '/pitches/aeronaval/') {
		return context.redirect('/projects/aeronaval' + context.url.search, 308);
	}
	if (barePath === '/pitches/turysta' || barePath === '/pitches/turysta/') {
		return context.redirect('/projects/turysta' + context.url.search, 308);
	}
	if (barePath === '/projects/nrv-web' || barePath === '/projects/nrv-web/') {
		return context.rewrite(new URL('/projects/nrv/' + context.url.search, context.url.origin));
	}

	const match = pathname.match(/^\/(pl|es)(?=\/|$)/);
	if (!match) return next();

	const rewriteUrl = new URL(barePath + context.url.search, context.url.origin);
	return context.rewrite(rewriteUrl);
});
