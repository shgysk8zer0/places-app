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
