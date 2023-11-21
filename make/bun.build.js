
/* global Bun */

async function readFile(path) {
	const file_websocket = Bun.file(
		new URL(
			path,
			import.meta.url,
		),
	);

	return file_websocket.text();
}

const replace_websocket = await readFile('./replace/websocket.js');

const result = await Bun.build({
	entrypoints: [
		'./src/main.js',
	],
	minify: process.env.MINIFY === '1',
	plugins: [{
		name: 'extws',
		async setup(build) {
			build.onLoad(
				{
					filter: /\/websocket\.js$/,
				},
				() => ({
					contents: replace_websocket,
					loader: 'js',
				}),
			);
		},
	}],
});

if (result.success === true) {
	console.log('Build succeeded.');

	Bun.write(
		`./dist/${process.env.OUT}`,
		result.outputs[0],
	);
}
else {
	console.error(result);
}
