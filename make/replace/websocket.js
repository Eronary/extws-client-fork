
export const { WebSocket } = window;

export default function createWebSocket({ url, headers }) {
	if (headers) {
		console.warn('Headers are not supported while using WebSocket in browser. They will be ignored.');
	}

	return new WebSocket(url);
}
