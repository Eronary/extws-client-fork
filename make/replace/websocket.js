
export const { WebSocket } = self;

export default function createWebSocket({ url, headers }) {
	if (headers) {
		console.warn('[ExtWSClient] Headers are not supported while using WebSocket in browser. They will be ignored.');
	}

	return new WebSocket(url);
}
