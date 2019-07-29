import 'https://cdn.kernvalley.us/js/std-js/deprefixer.js';
import 'https://cdn.kernvalley.us/js/std-js/shims.js';
import 'https://cdn.kernvalley.us/components/login-button.js';
import 'https://cdn.kernvalley.us/components/logout-button.js';
import 'https://cdn.kernvalley.us/components/register-button.js';
import 'https://cdn.kernvalley.us/components/login-form/login-form.js';
import 'https://cdn.kernvalley.us/components/registration-form/registration-form.js';
import './share-button.js';
import './current-year.js';
// import './gravatar-img.js';
import './imgur-img.js';
import User from 'https://cdn.kernvalley.us/js/User.js';
import {$, ready, registerServiceWorker, getLocation} from 'https://cdn.kernvalley.us/js/std-js/functions.js';

if (document.documentElement.dataset.hasOwnProperty('serviceWorker')) {
	registerServiceWorker(document.documentElement.dataset.serviceWorker).catch(console.error);
}

document.documentElement.classList.replace('no-js', 'js');
document.documentElement.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
document.documentElement.classList.toggle('no-details', document.createElement('details') instanceof HTMLUnknownElement);

ready().then(async () => {
	$('[data-scroll-to]').click(event => {
		const target = document.querySelector(event.target.closest('[data-scroll-to]').dataset.scrollTo);
		target.scrollIntoView({
			bahavior: 'smooth',
			block: 'start',
		});
	});

	$('[data-show]').click(event => {
		const target = document.querySelector(event.target.closest('[data-show]').dataset.show);
		if (target instanceof HTMLElement) {
			target.show();
		}
	});

	$('[data-show-modal]').click(event => {
		const target = document.querySelector(event.target.closest('[data-show-modal]').dataset.showModal);
		if (target instanceof HTMLElement) {
			target.showModal();
		}
	});

	$('[data-close]').click(event => {
		const target = document.querySelector(event.target.closest('[data-close]').dataset.close);
		if (target instanceof HTMLElement) {
			target.tagName === 'DIALOG' ? target.close() : target.open = false;
		}
	});

	$('form[name="addPlace"]').submit(async event => {
		event.preventDefault();
		const body = new FormData(event.target);
		body.set('token', User.token);
		const resp = await fetch(new URL('https://api.kernvalley.us/test/'), {
			headers: new Headers({
				Accept: 'application/json',
			}),
			method: 'POST',
			mode: 'cors',
			body,
		});

		const data = await resp.json();
		console.info(data);
	});

	$('form[name="addPlace"]').reset(event => {
		event.target.closest('dialog').close();
	});

	$('#get-geo').click(async () => {
		const {coords} = await getLocation({enableHighAccuracy: true});
		$('#longitude').attr({value: coords.longitude});
		$('#latitude').attr({value: coords.latitude});
		$('#elevation').attr({value: coords.elevation});
	});
});
