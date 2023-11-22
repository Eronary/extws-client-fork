
import WS from 'ws';

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

	return null;
})();

export const WebSocket = WebSocketNative ?? WS;

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

	if (WebSocketNative !== null) {
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
