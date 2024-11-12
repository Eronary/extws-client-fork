import { WebSocket as WebSocketWS } from 'ws';

export const LocalWebSocket = globalThis.WebSocket ?? WebSocketWS;

export interface Options {
	url: URL;
	headers?: Record<string, string>;
}

/**
 * Create a new WebSocket connection on the server using either the native WebSocket or the ws package.
 * @param options - The options for the WebSocket connection
 * @returns The WebSocket connection
 */
export function createWebsocket(options: Options): WebSocket {
	return new LocalWebSocket(
		options.url,
		[],
		{
			headers: options.headers,
		},
	);
}
