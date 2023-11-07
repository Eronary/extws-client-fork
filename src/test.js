/* eslint-disable unicorn/prevent-abbreviations */

import ExtWSClient from './main.js';

const ws = new ExtWSClient(
	'wss://monopoly-one.com/ws',
	{
		headers: {
			Cookie: 'PHPSESSID=1234567890abcdef1234567890abcdef',
		},
	},
);

ws.on('events', (message) => {
	console.log('Message received:', message);
});
