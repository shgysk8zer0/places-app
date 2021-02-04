import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import { $, getCustomElement, debounce } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { alert, confirm } from 'https://cdn.kernvalley.us/js/std-js/asyncDialog.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { save } from 'https://cdn.kernvalley.us/js/std-js/filesystem.js';
import { fileToImageObject } from './functions.js';
import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';

$(document.documentElement).toggleClass({
	'no-js': false,
	'js': true,
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
});

$.ready.then(async () => {
	init().catch(console.error);

	$('form[name="addPlace"]').submit(async event => {
		event.preventDefault();
		const body = new FormData(event.target);
		const data = {
			'@type': body.get('@type') || 'LocalBusiness',
			'@context': 'https://schema.org',
			'ideintifier:': uuidv6(),
			'name': body.get('name'),
			'telephone': body.get('telephone'),
			'email': body.get('email'),
			'description': body.get('description'),
			'address': {
				'@type': 'PostalAddress',
				'streetAddress': body.get('address[streetAddress]'),
				'postOfficeBoxNumber': body.get('address[postOfficeBoxNumber]'),
				'addressLocality': body.get('address[addressLocality]'),
				'addressRegion': body.get('address[addressRegion]'),
				'postalCode': body.get('address[postalCode]'),
			},
			'geo': {
				'@type': 'GeoCoordinates',
				'latitude': body.get('geo[latitude]'),
				'longitude': body.get('geo[longitude]'),
				'elevation': body.get('geo[altitude]'),
			},
			'openingHoursSpecification': [{
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Monday][opens]'),
				'closes': body.get('openingHoursSpecification[Monday][closes]'),
				'dayOfWeek': 'https://scheme.org/Monday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Sunday][opens]'),
				'closes': body.get('openingHoursSpecification[Sunday][closes]'),
				'dayOfWeek': 'https://scheme.org/Sunday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Monday][opens]'),
				'closes': body.get('openingHoursSpecification[Monday][closes]'),
				'dayOfWeek': 'https://scheme.org/Monday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Tuesday][opens]'),
				'closes': body.get('openingHoursSpecification[Tuesday][closes]'),
				'dayOfWeek': 'https://scheme.org/Tuesday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Wednesday][opens]'),
				'closes': body.get('openingHoursSpecification[Wednesday][closes]'),
				'dayOfWeek': 'https://scheme.org/Wednesday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Thursday][opens]'),
				'closes': body.get('openingHoursSpecification[Thursday][closes]'),
				'dayOfWeek': 'https://scheme.org/Thursday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Friday][opens]'),
				'closes': body.get('openingHoursSpecification[Friday][closes]'),
				'dayOfWeek': 'https://scheme.org/Friday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Saturday][opens]'),
				'closes': body.get('openingHoursSpecification[Saturday][closes]'),
				'dayOfWeek': 'https://scheme.org/Saturday',
			}]
		};

		if (body.has('image')) {
			data.image = await fileToImageObject(body.get('image'));
		} else {
			data.image = [{
				'@type': 'ImageObject',
				url: 'https://cdn.kernvalley.us/img/raster/missing-image.png',
				width: 640,
				height: 480,
				encodingFormat: 'image/png',
			}];
		}

		const json = JSON.stringify([data], null, 4);
		const file = new File([json], `${body.get('name')}.json`, { type: 'application/json' });

		if (await confirm('Save file?')) {
			save(file).catch(console.error);
		} else if (navigator.clipboard && navigator.clipboard.writeText instanceof Function) {
			navigator.clipboard.writeText(json).then(() => alert('Copied to clipboard')).catch(console.error);
		}

		if (navigator.canShare({ title: 'Kern Valley Place Submission', body: body.get('name'), files: [file] })) {
			await navigator.share({ title: 'Kern Valley Place Submission', body: body.get('name'), files: [file] }).catch(console.error);
		} else {
			await navigator.share({ title: 'Kern Valley Place Submission', body: json }).catch(console.error);
		}
	});

	$('form[name="addPlace"]').reset(event => event.target.closest('dialog').close());

	$('#get-geo').click(async () => {
		await customElements.whenDefined('leaflet-map');
		document.querySelector('leaflet-map').locate({ setView: true, maxZoom: 17 });
	});

	getCustomElement('leaflet-marker').then(LeafletMarker => {
		$('leaflet-map').on('pan', debounce(async ({ target }) => {
			const { lat: latitude, lng: longitude } = target.map.getCenter();
			const marker = new LeafletMarker({ latitude, longitude,
				icon: 'https://cdn.kernvalley.us/img/adwaita-icons/actions/find-location.svg' });

			$('#latitude').value(latitude.toPrecision(8));
			$('#longitude').value(longitude.toPrecision(8));
			target.replaceChildren(marker);
		}, 150), { passive: true });
	});

	$('#add-place-dialog').showModal();
});
