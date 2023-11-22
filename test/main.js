
import { ExtWSClient } from '../src/main.js';

const client = new ExtWSClient('https://monopoly-one.test/ws');

client.on(
	'beforeconnect',
	() => {
		console.log(`About to connect to ${client.url.toString()}...`);
		console.log('');
	},
);

client.on(
	'connect',
	() => {
		console.log('');
		console.log(`Connected to ${client.url.toString()}. Socket ID is "${client.id}".`);
	},
);

client.on(
	'auth',
	(...args) => {
		console.log('Auth:', ...args);
	},
);

client.on(
	'events',
	(...args) => {
		console.log('Message:', ...args);
	},
);
