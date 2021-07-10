import { ORG_TYPES } from './consts.js';

export async function clipboardCopy(data) {
	if ('clipboard' in navigator && navigator.clipboard.writeText instanceof Function) {
		return await navigator.clipboard.writeText(data);
	} else {
		throw new Error('navigator.clipboard not supported');
	}
}

export function formToPlace(form) {
	if (form instanceof HTMLFormElement) {
		return formToPlace(new FormData(form));
	} else if (form instanceof Event) {
		return formToPlace(form.target);
	} else if (form instanceof FormData) {
		const data = {
			'@type': form.get('@type') || 'LocalBusiness',
			'@context': 'https://schema.org',
			'identifier': form.get('identifier'),
			'name': form.get('name').trim(),
			'url': form.get('url').trim(),
			'telephone': form.get('telephone') || null,
			'email': form.get('email') || null,
			'description': form.get('description').trim() || null,
			'additionalType': form.getAll('additionalType').filter(v => v.length !== 0),
			'sameAs': form.getAll('sameAs[]')
				.filter(url => typeof url === 'string' && url.length !== 0),
			'image': [{
				'@type': 'ImageObject',
				'url': form.get('image[url]') || null,
				'width': parseInt(form.get('image[width]')),
				'height': parseInt(form.get('image[height]')),
			}].filter(({ url, width }) => typeof url === 'string' && ! Number.isNaN(width)),
		};

		if (ORG_TYPES.includes(data['@type'])) {
			data.location = {
				'address': {
					'@type': 'PostalAddress',
					'streetAddress': form.get('address[streetAddress]').trim() || null,
					'postOfficeBoxNumber': form.get('address[postOfficeBoxNumber]') || null,
					'addressLocality': form.get('address[addressLocality]'),
					'addressRegion': form.get('address[addressRegion]') || 'CA',
					'addressCountry': form.get('address[addressCountry]') || 'US',
					'postalCode': form.get('address[postalCode]'),
				},
				'geo': {
					'@type': 'GeoCoordinates',
					'latitude': parseFloat(form.get('geo[latitude]')),
					'longitude': parseFloat(form.get('geo[longitude]')),
					'url': `geo:${form.get('geo[latitude]')},${form.get('geo[longitude]')}`,
				},
				'openingHoursSpecification': [{
					'@type': 'OpeningHoursSpecification',
					'opens': form.get('openingHoursSpecification[Sunday][opens]') || null,
					'closes': form.get('openingHoursSpecification[Sunday][closes]') || null,
					'dayOfWeek': 'Sunday',
				}, {
					'@type': 'OpeningHoursSpecification',
					'opens': form.get('openingHoursSpecification[Monday][opens]') || null,
					'closes': form.get('openingHoursSpecification[Monday][closes]') || null,
					'dayOfWeek': 'Monday',
				}, {
					'@type': 'OpeningHoursSpecification',
					'opens': form.get('openingHoursSpecification[Tuesday][opens]') || null,
					'closes': form.get('openingHoursSpecification[Tuesday][closes]') || null,
					'dayOfWeek': 'Tuesday',
				}, {
					'@type': 'OpeningHoursSpecification',
					'opens': form.get('openingHoursSpecification[Wednesday][opens]') || null,
					'closes': form.get('openingHoursSpecification[Wednesday][closes]') || null,
					'dayOfWeek': 'Wednesday',
				}, {
					'@type': 'OpeningHoursSpecification',
					'opens': form.get('openingHoursSpecification[Thursday][opens]') || null,
					'closes': form.get('openingHoursSpecification[Thursday][closes]') || null,
					'dayOfWeek': 'Thursday',
				}, {
					'@type': 'OpeningHoursSpecification',
					'opens': form.get('openingHoursSpecification[Friday][opens]') || null,
					'closes': form.get('openingHoursSpecification[Friday][closes]') || null,
					'dayOfWeek': 'Friday',
				}, {
					'@type': 'OpeningHoursSpecification',
					'opens': form.get('openingHoursSpecification[Saturday][opens]') || null,
					'closes': form.get('openingHoursSpecification[Saturday][closes]') || null,
					'dayOfWeek': 'Saturday',
				}].filter(({ opens, closes }) => typeof opens === 'string' && typeof closes === 'string'),
			};
		} else {
			data.address = {
				'@type': 'PostalAddress',
				'streetAddress': form.get('address[streetAddress]') || null,
				'postOfficeBoxNumber': form.get('address[postOfficeBoxNumber]') || null,
				'addressLocality': form.get('address[addressLocality]'),
				'addressRegion': form.get('address[addressRegion]') || 'CA',
				'addressCountry': form.get('address[addressCountry]') || 'US',
				'postalCode': form.get('address[postalCode]'),
			};
			data.geo = {
				'@type': 'GeoCoordinates',
				'latitude': parseFloat(form.get('geo[latitude]')),
				'longitude': parseFloat(form.get('geo[longitude]')),
				'url': `geo:${form.get('geo[latitude]')},${form.get('geo[longitude]')}`,
			};

			data.openingHoursSpecification = [{
				'@type': 'OpeningHoursSpecification',
				'opens': form.get('openingHoursSpecification[Sunday][opens]') || null,
				'closes': form.get('openingHoursSpecification[Sunday][closes]') || null,
				'dayOfWeek': 'Sunday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': form.get('openingHoursSpecification[Monday][opens]') || null,
				'closes': form.get('openingHoursSpecification[Monday][closes]') || null,
				'dayOfWeek': 'Monday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': form.get('openingHoursSpecification[Tuesday][opens]') || null,
				'closes': form.get('openingHoursSpecification[Tuesday][closes]') || null,
				'dayOfWeek': 'Tuesday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': form.get('openingHoursSpecification[Wednesday][opens]') || null,
				'closes': form.get('openingHoursSpecification[Wednesday][closes]') || null,
				'dayOfWeek': 'Wednesday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': form.get('openingHoursSpecification[Thursday][opens]') || null,
				'closes': form.get('openingHoursSpecification[Thursday][closes]') || null,
				'dayOfWeek': 'Thursday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': form.get('openingHoursSpecification[Friday][opens]') || null,
				'closes': form.get('openingHoursSpecification[Friday][closes]') || null,
				'dayOfWeek': 'Friday',
			}, {
				'@type': 'OpeningHoursSpecification',
				'opens': form.get('openingHoursSpecification[Saturday][opens]') || null,
				'closes': form.get('openingHoursSpecification[Saturday][closes]') || null,
				'dayOfWeek': 'Saturday',
			}].filter(({ opens, closes }) => typeof opens === 'string' && typeof closes === 'string');
		}

		return data;
	} else {
		throw new TypeError('Form must be a <form> or `FormData`');
	}
}

export function selectText(node) {
	if (typeof node === 'string') {
		return selectText(document.querySelector(node));
	} else if (! (node instanceof Element)) {
		throw new TypeError('Node must be an element or selector');
	} else if (document.body.createTextRange instanceof Function) {
		const range = document.body.createTextRange();
		range.moveToElementText(node);
		range.select();
	} else if (window.getSelection instanceof Function) {
		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(node);
		selection.removeAllRanges();
		selection.addRange(range);
	} else {
		console.warn('Could not select text in node: Unsupported browser.');
		throw new TypeError('Form must be a <form> or `FormData`');
	}
}
