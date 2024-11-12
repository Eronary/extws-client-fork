/* eslint-disable no-console */

const replace_websocket = await Bun.file('./src/websocket.browser.ts').text();

const result = await Bun.build({
	entrypoints: [
		'./src/main.js',
	],
	minify: process.env.MINIFY === '1',
	plugins: [{
		name: 'extws',
		setup(build) {
			build.onLoad(
				{
					filter: /\/websocket\.ts$/,
				},
				() => {
					return {
						contents: replace_websocket,
						loader: 'ts',
					};
				},
			);
		},
	}],
});

if (result.success === true) {
	console.log('Build succeeded.');

	Bun.write(
		`./dist/browser/main${process.env.MINIFY ? '.min' : ''}.js`,
		result.outputs[0],
	);
}
else {
	console.error(result);
}

// eslint-disable-next-line no-restricted-exports
export default null;
