import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import { $, getCustomElement, openWindow } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { importGa, externalHandler, telHandler, mailtoHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { alert, confirm } from 'https://cdn.kernvalley.us/js/std-js/asyncDialog.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { save } from 'https://cdn.kernvalley.us/js/std-js/filesystem.js';
import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';
import { fileToImageObject, selectText } from './functions.js';
import { GA } from './consts.js';

$(document.documentElement).toggleClass({
	'no-js': false,
	'js': true,
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
});

if (typeof GA === 'string' && GA.length !== 0) {
	requestIdleCallback(() => {
		importGa(GA).then(async ({ set, pageView, send, ready }) => {
			await Promise.allSettled([$.ready, ready()]);
			set('transport', 'beacon');
			pageView(location.pathname);

			$('a[rel~="external"]').click(externalHandler, { passive: true, capture: true });
			$('a[href^="tel:"]').click(telHandler, { passive: true, capture: true });
			$('a[href^="mailto:"]').click(mailtoHandler, { passive: true, capture: true });

			$(document.forms).submit(({ target }) => {
				send({
					eventCategory: 'form',
					eventAction: 'submit',
					eventLabel: target.name || target.id,
				});
			}, { passive: true, capture: true });
		});
	});
}

$.ready.then(async () => {
	init().catch(console.error);
	$('#identifier').value(uuidv6());

	$('#place-address-locality').change(({ target: { value }}) => {
		if (value.length !== 0) {
			const city = document.querySelector(`#cities > [value="${CSS.escape(value)}"][data-postal-code]`);
			if (city instanceof HTMLElement) {
				$('#place-postal-code').value(city.dataset.postalCode);
			}
		}
	});

	$('form[name="addPlace"]').submit(async event => {
		event.preventDefault();
		const body = new FormData(event.target);
		let data = {
			'@type': body.get('@type') || 'LocalBusiness',
			'@context': 'https://schema.org',
			'identifier': body.get('identifier'),
			'name': body.get('name'),
			'telephone': body.get('telephone') || null,
			'email': body.get('email') || null,
			'description': body.get('description') || null,
			'sameAs': body.getAll('sameAs[]').filter(url => typeof url === 'string' && url.length !== 0),
			'address': {
				'@type': 'PostalAddress',
				'streetAddress': body.get('address[streetAddress]') || null,
				'postOfficeBoxNumber': body.get('address[postOfficeBoxNumber]') || null,
				'addressLocality': body.get('address[addressLocality]'),
				'addressRegion': body.get('address[addressRegion]'),
				'postalCode': body.get('address[postalCode]'),
			},
			'geo': {
				'@type': 'GeoCoordinates',
				'latitude': body.get('geo[latitude]'),
				'longitude': body.get('geo[longitude]'),
				'url': `geo${body.get('latitude')},${body.get('longitude')}`,
			},
			'openingHoursSpecification': [{
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Sunday][opens]') || null,
				'closes': body.get('openingHoursSpecification[Sunday][closes]') || null,
				'dayOfWeek': 'Sunday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Monday][opens]') || null,
				'closes': body.get('openingHoursSpecification[Monday][closes]') || null,
				'dayOfWeek': 'Monday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Tuesday][opens]') || null,
				'closes': body.get('openingHoursSpecification[Tuesday][closes]') || null,
				'dayOfWeek': 'Tuesday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Wednesday][opens]') || null,
				'closes': body.get('openingHoursSpecification[Wednesday][closes]') || null,
				'dayOfWeek': 'Wednesday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Thursday][opens]') || null,
				'closes': body.get('openingHoursSpecification[Thursday][closes]') || null,
				'dayOfWeek': 'Thursday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Friday][opens]') || null,
				'closes': body.get('openingHoursSpecification[Friday][closes]') || null,
				'dayOfWeek': 'Friday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': body.get('openingHoursSpecification[Saturday][opens]') || null,
				'closes': body.get('openingHoursSpecification[Saturday][closes]') || null,
				'dayOfWeek': 'Saturday',
			}].filter(({ opens, closes }) => typeof opens === 'string' && typeof closes === 'string')
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
		const file = new File([json], `${body.get('name')}.text`, { type: 'text/plain' });

		if (await confirm('Save file?')) {
			await save(file).catch(async err => {
				console.error(err);
				$('dialog').close();
				$('#content-fallback').text(json);
				await $('#content-fallback-dialog').showModal();
				await new Promise(resolve => {
					selectText('#content-fallback');
					$('#content-fallback-dialog').on('close', resolve, { once: true });
				});
			});
		} else if (navigator.clipboard && navigator.clipboard.writeText instanceof Function) {
			await navigator.clipboard.writeText(json)
				.then(() => alert('Copied to clipboard')).catch(async err => {
					console.error(err);
					$('dialog').close();
					$('#content-fallback').text(json);
					await $('#content-fallback-dialog').showModal();
					await new Promise(resolve => {
						selectText('#content-fallback');
						document.getElementById('content-fallback').parentElement.select();
						$('#content-fallback-dialog').on('close', resolve, { once: true });
					});
				});
		} else {
			$('dialog').close();
			$('#content-fallback').text(json);
			await $('#content-fallback-dialog').showModal();
			await new Promise(resolve => {
				selectText('#content-fallback');
				$('#content-fallback-dialog').on('close', resolve, { once: true });
			});
		}

		if (await confirm('Submit data on GitHub (requires GitHub account)?')) {
			openWindow('https://github.com/kernvalley/places/issues/new/choose', {
				name: 'GitHub Issues'
			});
		} else if (navigator.canShare({
			title: 'Kern Valley Place Submission',
			body: body.get('name'),
			files: [file],
		})) {
			await navigator.share({
				title: 'Kern Valley Place Submission',
				body: body.get('name'),
				files: [file],
			}).catch(console.error);
		} else if (navigator.share instanceof Function) {
			await navigator.share({
				title: 'Kern Valley Place Submission',
				body: json,
			}).catch(console.error);
		}
	});

	$('form[name="addPlace"]').reset(({ target }) => {
		target.closest('dialog').close();
		$('#identifier').value(uuidv6());
	}, { passive: true });

	$('#get-geo').click(async () => {
		await customElements.whenDefined('leaflet-map');
		document.querySelector('leaflet-map').locate({ setView: true, maxZoom: 17 });
	});

	Promise.all([
		getCustomElement('leaflet-map'),
		getCustomElement('leaflet-marker'),
	]).then(([LeafletMap, LeafletMarker]) => {
		const map = new LeafletMap({
			latitude: 35.664676,
			longitude: -118.450685,
			crossOrigin: 'anonymous',
			detectRetina: true,
			zoom: 12,
			maxZoom: 19,
			minZoom: 9,
			zoomControl: true,
			loading: 'lazy',
		});
		map.id = 'map';
		map.classList.add('custom-element', 'contain-content', 'relative', 'z-1');
		document.getElementById('map-placeholder').append(map);

		$(map).on('pan', async ({ target }) => {
			await target.ready;
			const { lat: latitude, lng: longitude } = target.map.getCenter();
			const marker = new LeafletMarker({ latitude, longitude,
				icon: 'https://cdn.kernvalley.us/img/adwaita-icons/actions/find-location.svg' });

			$('#latitude').value(latitude.toFixed(8));
			$('#longitude').value(longitude.toFixed(8));
			target.replaceChildren(marker);
		}, { passive: true });
	});
});
