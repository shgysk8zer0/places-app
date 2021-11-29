/* eslint-env serviceworker */
/* eslint no-unused-vars: 0 */
/* 2021-02-26T09:47 */

const config = {
	version: '2.0.1',
	fresh: [
		'/',
		'/webapp.webmanifest',
		'https://apps.kernvalley.us/apps.json',
	].map(path => new URL(path, location.origin)),
	stale: [
		/* HTML and Templates */
		'https://cdn.kernvalley.us/components/leaflet/map.html',
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/components/github/user.html',

		/* Scripts */
		'/js/index.min.js',
		'https://cdn.kernvalley.us/js/std-js/no-console.js',
		'https://cdn.kernvalley.us/components/leaflet/map.min.js',

		/* Styles */
		'/css/index.min.css',
		'https://cdn.kernvalley.us/components/leaflet/map.css',
		'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
		'https://cdn.kernvalley.us/components/toast-message.css',
		'https://cdn.kernvalley.us/components/github/user.css',

		/* Fonts */
		'https://cdn.kernvalley.us/fonts/roboto.woff2',

		/* Images and Icons */
		'/img/apple-touch-icon.png',
		'/img/favicon.svg',
		'/img/icons.svg',
		'https://cdn.kernvalley.us/img/logos/instagram.svg',
		'https://cdn.kernvalley.us/img/keep-kern-clean.svg',
		'https://cdn.kernvalley.us/img/adwaita-icons/actions/find-location.svg',
		'https://cdn.kernvalley.us/img/logos/play-badge.svg',
		'https://cdn.kernvalley.us/img/logos/pwa-badge.svg',
	].map(path => new URL(path, location.origin)),
	allowed: [
		'https://www.google-analytics.com/analytics.js',
		'https://www.googletagmanager.com/gtag/js',
		'https://maps.wikimedia.org/osm-intl/',
		/https:\/\/\w+\.githubusercontent\.com\/u\/*/,
		/\.(jpg|png|webp|svg|gif|woff2|woff)$/,
	],
	allowedFresh: [
		'https://api.github.com/users/',
		/\.(html|css|js|json)$/,
	],
};
