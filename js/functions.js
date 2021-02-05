export async function fileToImageObject(file) {
	if (file instanceof File) {
		return [{
			'@type': 'ImageObject',
			'encodingFormat': file.type,
			'url': await base64(file),
		}];
	} else {
		return [{
			'@type': 'ImageObject',
			url: 'https://cdn.kernvalley.us/img/raster/missing-image.png',
			width: 640,
			height: 480,
			encodingFormat: 'image/png',
		}];
	}
}

export async function base64(file) {
	if (file instanceof File) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener('load', ({ target: { result }}) => resolve(result));
			reader.addEventListener('error', reject);
			reader.readAsDataURL(file);
		});
	} else {
		return null;
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
	}
}
