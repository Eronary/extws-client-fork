
import WS from 'ws';

const IS_VERBOSE = process.env.VERBOSE === '1';

const IS_BUN = (() => {
	try {
		return 'Bun' in global;
	}
	catch {}

	return false;
})();

const WebSocketNative = (() => {
	try {
		return global.WebSocket;
	}
	catch {}

	// browser Window and ServiceWorkerGlobalScope
	try {
		return self.WebSocket;
	}
	catch {}
})();

export const WebSocket = WebSocketNative ?? WS;

export default function createWebSocket({ url, headers }) {
	if (IS_BUN) {
		if (IS_VERBOSE) {
			console.log('[websocket.js] Using Bun WebSocket...');
		}

		return new WebSocket(
			url,
			{
				headers,
			},
		);
	}

	if (WebSocketNative !== undefined) {
		if (IS_VERBOSE) {
			console.log('[websocket.js] Using global WebSocket in unknown environment...');
		}

		if (headers) {
			console.warn('[ExtWSClient] Found global WebSocket class but in unknown environment. Headers will be ignored.');
		}

		return new WebSocketNative(url);
	}

	if (IS_VERBOSE) {
		console.log('[websocket.js] Using ws package...');
	}

	return new WS(
		url,
		[],
		{
			headers,
		},
	);
}
