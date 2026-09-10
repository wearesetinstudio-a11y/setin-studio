import { defineMiddleware } from 'astro:middleware';

/** Mirror vercel.json: serve /pl/* and /es/* from unprefixed routes. */
export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	const match = pathname.match(/^\/(pl|es)(?=\/|$)/);
	if (!match) return next();

	const bare = pathname.replace(/^\/(pl|es)/, '') || '/';
	const rewriteUrl = new URL(bare + context.url.search, context.url.origin);
	return context.rewrite(rewriteUrl);
});
