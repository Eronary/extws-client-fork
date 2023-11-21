
import { PAYLOAD_TYPE }   from '@extws/server/payload/data'; // eslint-disable-line import/extensions, import/no-unresolved
import {
	buildPayload,
	buildMessagePayload,
	parsePayload       }  from '@extws/server/payload/json'; // eslint-disable-line import/extensions, import/no-unresolved
import createEventEmitter from '@kirick/event-emitter';
import {
	SYMBOL_EXTWS,
	OPTIONS_DEFAULT,
	BROKEN_STATES,
	isPlainObject,
	parseUrl       }      from './utils.js';
import createWebSocket    from './websocket.js';

export class ExtWSClient {
	#emitter = createEventEmitter();
	#websocket;

	#timeout_id_ping = null;
	#timeout_id_dead = null;
	#timeout_id_reconnect = null;

	url;
	options = {};

	constructor(value) {
		if (isPlainObject(value)) {
			this.url = parseUrl(value.url);
			delete value.url;

			this.options = Object.freeze(value);
		}
		else {
			this.url = parseUrl(value);
		}

		if (this.url instanceof URL !== true) {
			throw new TypeError('Invalid URL.');
		}

		if (this.#getOption('connect') === true) {
			setTimeout(
				() => this.connect(),
			);
		}

		this.on(
			'disconnect',
			() => {
				this.#websocket = null;

				if (this.#getOption('reconnect') === true) {
					clearTimeout(this.#timeout_id_reconnect);

					this.#timeout_id_reconnect = setTimeout(
						() => this.connect(),
						this.#getOption('reconnect_interval'),
					);
				}
			},
		);
	}

	#getOption(key) {
		return this.options[key] ?? OPTIONS_DEFAULT[key];
	}

	get is_connected() {
		return this.#websocket
			&& BROKEN_STATES.has(this.#websocket.readyState) !== true
			&& Date.now() - this.#websocket[SYMBOL_EXTWS].ts_last_message < this.#websocket[SYMBOL_EXTWS].idle_timeout;
	}

	get id() {
		return this.#websocket[SYMBOL_EXTWS].socket_id;
	}

	#createPing() {
		clearTimeout(this.#timeout_id_ping);

		if (this.#websocket) {
			this.#timeout_id_ping = setTimeout(
				() => this.#sendPing(),
				this.#websocket[SYMBOL_EXTWS].idle_timeout - this.#getOption('ping_timeout'),
			);
		}
	}

	#sendPing() {
		clearTimeout(this.#timeout_id_dead);

		if (this.is_connected) {
			this.#websocket.send(
				buildPayload(
					PAYLOAD_TYPE.PING,
				),
			);

			this.#timeout_id_dead = setTimeout(
				() => this.disconnect(),
				this.#getOption('ping_timeout') * 1e3,
			);
		}
	}

	connect() {
		if (this.is_connected) {
			return;
		}

		if (this.#websocket) {
			this.#websocket.close();
		}

		this.#emitter.emit('beforeconnect');

		const ws = createWebSocket({
			url: this.url,
			headers: this.options.headers,
		});
		ws[SYMBOL_EXTWS] = {
			socket_id: null,
			idle_timeout: 60_000,
			ts_last_message: 0,
		};

		ws.addEventListener(
			'error',
			(error) => {
				console.error(error);
			},
		);

		ws.addEventListener(
			'open',
			() => {
				ws[SYMBOL_EXTWS].ts_last_message = Date.now();

				this.#createPing();
			},
		);

		ws.addEventListener(
			'message',
			(event) => {
				clearTimeout(this.#timeout_id_dead);
				this.#createPing();

				ws[SYMBOL_EXTWS].ts_last_message = Date.now();

				const {
					payload_type,
					data,
					event_type,
				} = parsePayload(event.data);
				// console.log(payload_type, data, event_type);

				switch (payload_type) {
					case PAYLOAD_TYPE.INIT:
						ws[SYMBOL_EXTWS].socket_id = data.id;
						ws[SYMBOL_EXTWS].idle_timeout = data.idle_timeout * 1000;

						this.#emitter.emit('connect');
						break;
					case PAYLOAD_TYPE.PING:
						ws.send(
							buildPayload(PAYLOAD_TYPE.PONG),
						);
						break;
					case PAYLOAD_TYPE.MESSAGE:
						this.#emitter.emit(
							event_type ?? 'message',
							data,
						);
						break;
					// no default
				}
			},
		);

		ws.addEventListener(
			'close',
			() => {
				ws[SYMBOL_EXTWS].ts_last_message = 0;
				this.#emitter.emit('disconnect');
			},
		);

		this.#websocket = ws;
	}

	disconnect() {
		clearTimeout(this.#timeout_id_reconnect);

		if (this.#websocket) {
			this.#websocket.close();
		}
	}

	on(...args) {
		return this.#emitter.on(...args);
	}

	once(...args) {
		return this.#emitter.once(...args);
	}

	send(event_type, data) {
		if (
			undefined === data
			&& typeof event_type !== 'string'
		) {
			data = event_type;
			event_type = undefined;
		}

		if (this.is_connected) {
			this.#websocket.send(
				buildMessagePayload(
					event_type,
					data,
				),
			);
		}
	}
}
