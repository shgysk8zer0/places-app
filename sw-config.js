/* eslint-env serviceworker */
/* eslint no-unused-vars: 0 */
/* 2021-02-08T09:11 */

const config = {
	version: '2.0.0',
	fresh: [
		'/',
		'/manifest.json',
		'https://apps.kernvalley.us/apps.json',
	].map(path => new URL(path, location.origin)),
	stale: [
		/* HTML and Templates */
		'https://cdn.kernvalley.us/components/leaflet/map.html',
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/components/github/user.html',

		/* Scripts */
		'/js/index.min.js',
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
	].map(path => new URL(path, location.origin)),
	allowed: [
		'https://www.google-analytics.com/analytics.js',
		'https://www.googletagmanager.com/gtag/js',
		'https://maps.wikimedia.org/osm-intl/',
		/https:\/\/\w+\.githubusercontent\.com\/u\/*/,
	],
	allowedFresh: [
		'https://api.github.com/users/',
	],
};
