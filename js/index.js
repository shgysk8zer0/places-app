import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/components/share-button.js';
import 'https://cdn.kernvalley.us/components/current-year.js';
import 'https://cdn.kernvalley.us/components/github/user.js';
import 'https://cdn.kernvalley.us/components/install/prompt.js';
import 'https://cdn.kernvalley.us/components/app/list-button.js';
import 'https://cdn.kernvalley.us/components/app/stores.js';
import 'https://cdn.kernvalley.us/components/share-target.js';
import { getCustomElement, openWindow, sleep } from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import { $ } from 'https://cdn.kernvalley.us/js/std-js/esQuery.js';
import { upload } from 'https://cdn.kernvalley.us/js/std-js/imgur.js';
import { confirm } from 'https://cdn.kernvalley.us/js/std-js/asyncDialog.js';
import { init } from 'https://cdn.kernvalley.us/js/std-js/data-handlers.js';
import { save } from 'https://cdn.kernvalley.us/js/std-js/filesystem.js';
import { loadImage, loadScript } from 'https://cdn.kernvalley.us/js/std-js/loader.js';
import { send } from 'https://cdn.kernvalley.us/js/std-js/slack.js';
import { importGa, externalHandler, telHandler, mailtoHandler } from 'https://cdn.kernvalley.us/js/std-js/google-analytics.js';
import { selectText, formToPlace, clipboardCopy } from './functions.js';
import { GA, imgurClientId as clientId } from './consts.js';

$(document.documentElement).toggleClass({
	'no-js': false,
	'js': true,
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
});

if (typeof GA === 'string' && GA.length !== 0) {
	requestIdleCallback(() => {
		importGa(GA).then(async ({ set, pageView, send, ready, hasGa }) => {
			if (hasGa()) {
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
			}
		});
	});
}

$.ready.then(async () => {
	init();

	customElements.whenDefined('install-prompt').then(() => {
		$('#install-btn').click(() => {
			const InstallPrompt = customElements.get('install-prompt');
			const prompt = new InstallPrompt();
			prompt.show();
		}).each(el => el.hidden = false);
	});

	$('#identifier').value(crypto.randomUUID());

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
			const { data: { link }} = await upload(target, { clientId }).catch(console.error);

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
		const form = event.target;
		const body = new FormData(form);
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
		const file = new File([json], `${body.get('name')}.json.txt`, { type: 'text/plain' });

		await Promise.allSettled([
			save(file),
			clipboardCopy(json).catch(async err => {
				console.error(err);
				$('dialog').close();
				$('#content-fallback').text(json);
				await $('#content-fallback-dialog').showModal();
				await new Promise(resolve => {
					selectText('#content-fallback');
					$('#content-fallback-dialog').on('close', resolve, { once: true });
				});
			}),
		]);

		if (await confirm('Submit data?')) {
			try {
				const { success = false, body = {}} = await send('https://contact.kernvalley.us/api/slack', {
					name: 'Anonymous User',
					email: 'no-reply@kernvalley.us',
					subject: `Add ${data.name}`,
					body: '```\n' + json + '\n```',
				});

				if (success === true) {
					alert('Data submitted');
				} else if ('error' in body && typeof body.error.message === 'string') {
					alert(body.error.message);
				} else {
					alert('Error sending data');
				}
			} catch(err) {
				console.error(err);
				alert('Error sending data');
			}
		} else if (await confirm('Submit data on GitHub (requires GitHub account)?')) {
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

		if (await confirm('Clear form data?')) {
			form.reset();
		}
	});

	$('#latitude, #longitude').on('paste', async ({ clipboardData }) => {
		const data = clipboardData.getData('text/plain');
		if (data.includes(',')) {
			const [latitude, longitude] = data.split(',').map(v => parseFloat(v.trim()));

			if (! (Number.isNaN(latitude) || Number.isNaN(longitude))) {
				await sleep(100);
				document.getElementById('latitude').value = latitude.toFixed(6);
				document.getElementById('longitude').value = longitude.toFixed(6);
				$('leaflet-map').attr({ center: `${latitude},${longitude}` });
			}
		}
	}, { passive: true });

	$('form[name="addPlace"]').reset(() => {
		$('#identifier').value(crypto.randomUUID());
		$('.input-reset').value('');
		$('#basic-section details:not([open]), #address-section details:not([open])').attr({ open: true });
		$('#geo-section details[open], #image-section details[open], #hours-section details[open], #social-section details[open]').attr({ open: true });
	});

	$('#get-geo').click(async () => {
		await customElements.whenDefined('leaflet-map');
		document.querySelector('leaflet-map').locate({ setView: true, maxZoom: 17 });
	});

	$('#weekday-hr-copy').click(() => {
		const opens = document.getElementById('mon-opens').value;
		const closes = document.getElementById('mon-closes').value;
		if (opens.length !== 0 && closes.length !== 0) {
			$('[type="time"].weekday-opens:not(#mon-opens)').value(opens);
			$('[type="time"].weekday-closes:not(#mon-closes)').value(closes);
		}
	});
});

$.loaded.then(() => {
	requestIdleCallback(() => Promise.all([
		getCustomElement('leaflet-map'),
		getCustomElement('leaflet-marker'),
		loadScript('https://cdn.kernvalley.us/components/leaflet/map.min.js'),
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

		$('#get-geo').unhide();
	}));
});
