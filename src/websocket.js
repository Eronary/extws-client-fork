
import WS from 'ws';

const IS_WEBSOCKET_GLOBAL = (() => {
	try {
		return 'WebSocket' in global;
	}
	catch {}

	return false;
})();

const IS_BUN = (() => {
	try {
		return 'Bun' in global;
	}
	catch {}

	return false;
})();

export const WebSocket = IS_WEBSOCKET_GLOBAL ? global.WebSocket : WS;

export default function createWebSocket({ url, headers }) {
	if (IS_BUN) {
		console.log('[websocket.js] Using Bun WebSocket...');

		return new WebSocket(
			url,
			{
				headers,
			},
		);
	}

	if (IS_WEBSOCKET_GLOBAL) {
		console.log('[websocket.js] Using global WebSocket in unknown environment...');

		if (headers) {
			console.warn('Found global WebSocket class but in unknown environment. Headers will be ignored.');
		}

		return new WebSocket(url);
	}

	console.log('[websocket.js] Using ws package...');

	return new WS(
		url,
		[],
		{
			headers,
		},
	);
}
