
import { ExtWSClient } from '../src/main.js';

const client = new ExtWSClient({
	url: 'https://monopoly-one.test/ws',
});

client.on(
	'connect',
	() => {
		console.log('');
		console.log(`Connected. Socket ID is "${client.id}".`);
	},
);

client.on(
	'events',
	(...args) => {
		console.log('Message:', ...args);
	},
);
