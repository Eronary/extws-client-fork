
import { WebSocket } from './websocket.js';

export const SYMBOL_EXTWS = Symbol('extws');

export const BROKEN_STATES = new Set([
	WebSocket.CLOSING,
	WebSocket.CLOSED,
]);

export const OPTIONS_DEFAULT = {
	connect: true,
	reconnect: true,
	reconnect_interval: 2000,
	ping_timeout: 5000,
};

export function isPlainObject(value) {
	return typeof value === 'object' && value !== null && value.constructor === Object;
}

export function parseUrl(value) {
	if (value instanceof URL) {
		return value;
	}

	if (typeof value === 'string') {
		return new URL(value);
	}

	return null;
}
