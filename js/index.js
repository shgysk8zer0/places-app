import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/pwa/install.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import 'https://cdn.kernvalley.us/components/share-target.js';
import { $, getCustomElement, openWindow } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { alert, confirm } from 'https://cdn.kernvalley.us/js/std-js/asyncDialog.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { save } from 'https://cdn.kernvalley.us/js/std-js/filesystem.js';
import { uuidv6 } from 'https://cdn.kernvalley.us/js/std-js/uuid.js';
import { loadImage } from 'https://cdn.kernvalley.us/js/std-js/loader.js';
import { importGa, externalHandler, telHandler, mailtoHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { selectText, formToPlace,uploadToImgur } from './functions.js';
import { GA, ORG_TYPES } from './consts.js';

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

	try {
		const additionalTypes = document.getElementById('place-type').cloneNode(true);
		additionalTypes.multiple = true;
		additionalTypes.required = false;
		additionalTypes.name = 'additionalType';
		additionalTypes.id = 'place-additional-type';
		additionalTypes.firstElementChild.textContent = 'No Additional Type';
		document.getElementById('additional-types-placeholder').replaceWith(additionalTypes);
	} catch(err) {
		console.error(err);
	}

	if (location.search.includes('name=') || location.search.includes('description=')) {
		$('#add-place-dialog').showModal();
	}

	$('#img-upload').change(async ({ target }) => {
		if (target.files.length === 1) {
			const { data: { link }} = await uploadToImgur(target.files[0]).catch(console.error);

			if (typeof link === 'string') {
				const imgUrl = document.getElementById('place-img-url');
				imgUrl.value = link;
				imgUrl.dispatchEvent(new Event('change'));
				target.value = '';
			} else {
				throw new Error('Failed uploading image');
			}
		}
	});

	$('#place-type').change(({ target: { value }}) => {
		if (ORG_TYPES.includes(value)) {
			$('#hours-section').attr({ disabled: true, hidden: true });
		} else {
			$('#hours-section').attr({ disabled: false, hidden: false });
		}
	});

	$('#place-address-locality').change(({ target: { value }}) => {
		if (value.length !== 0) {
			const city = document.querySelector(`#cities > [value="${CSS.escape(value)}"][data-postal-code]`);
			if (city instanceof HTMLElement) {
				$('#place-postal-code').value(city.dataset.postalCode);
			}
		}
	});

	$('#place-img-url').change(async ({ target }) => {
		if (target.validity.valid && target.value !== '') {
			try {
				const img = await loadImage(target.value);
				await img.decode();
				const { naturalHeight, naturalWidth } = img;

				if (Number.isNaN(naturalHeight) || naturalHeight === 0) {
					$('#place-img-height').value(0);
					$('#place-img-width').value(0);
					document.getElementById('img-preview').replaceChildren();
				} else {
					$('#place-img-height').value(naturalHeight);
					$('#place-img-width').value(naturalWidth);
					document.getElementById('img-preview').replaceChildren(img);
				}
			} catch(err) {
				console.error(err);
				$('#place-img-height').value('');
				$('#place-img-width').value('');
				const msg = document.createElement('code');
				msg.classList.add('block', 'status-box', 'alert');
				msg.textContent = err.message;
				document.getElementById('img-preview').replaceChildren(msg);
			}
		} else {
			$('#place-img-height').value('');
			$('#place-img-width').value('');
			document.getElementById('img-preview').replaceChildren();
		}
	});

	$('form[name="addPlace"]').submit(async event => {
		event.preventDefault();
		const body = new FormData(event.target);
		let data = formToPlace(body);

		if (! Array.isArray(data.image) || data.image.length === 0) {
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
