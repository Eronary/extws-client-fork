import {
	test,
	expect,
} from 'bun:test';
import { ExtWSBunServer } from '@extws/server-bun';
import { ExtWSClient } from './main';

const server = new ExtWSBunServer({
	port: 8000,
});

const client = new ExtWSClient(
	new URL('ws://localhost:8000/ws'),
	{
		connect: false,
		reconnect: true,
		reconnect_interval: 2000,
		ping_timeout: 5000,
	},
);

test('connect', async () => {
	expect(client.is_connected).toBe(false);
	expect(client.id).toBe(null);

	const promise = client.wait('connect');
	client.connect();

	await promise;

	expect(client.is_connected).toBe(true);
	expect(typeof client.id).toBe('string');
});
