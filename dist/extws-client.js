// node_modules/.pnpm/@extws+server@0.1.0-beta.8/node_modules/@extws/server/src/consts.js
var PAYLOAD_TYPE = {
  INIT: 1,
  PING: 2,
  PONG: 3,
  MESSAGE: 4
};
// /Users/daniil/Development/Public/extws/client/node_modules/@extws/server/src/payload/json.js
function buildPayload(payload_type, argument1, argument2) {
  let payload = String(payload_type);
  let event_type = argument1;
  let data = argument2;
  if (argument2 === undefined && typeof argument1 !== "string") {
    data = argument1;
    event_type = undefined;
  }
  if (event_type) {
    payload += event_type;
  }
  if (data) {
    payload += JSON.stringify(data);
  }
  return payload;
}
function buildMessagePayload(event_type, data) {
  return buildPayload(PAYLOAD_TYPE.MESSAGE, event_type, data);
}
function parsePayload(payload) {
  if (typeof payload === "string") {
  } else if (payload instanceof ArrayBuffer || ArrayBuffer.isView(payload) && payload instanceof DataView === false) {
    payload = textDecoder.decode(payload);
  } else {
    const error = new TypeError("Invalid payload type.");
    error.payload = payload;
    throw error;
  }
  const result = {
    payload_type: payload.codePointAt(0) - 48
  };
  let start = 1;
  let event_type = "";
  for (let index = start;index < payload.length && JSON_START.has(payload[index]) === false; index++) {
    event_type += payload[index];
    start++;
  }
  if (event_type.length > 31) {
    throw new Error("Event type cannot be longer than 31 characters.");
  }
  if (event_type.length > 0) {
    result.event_type = event_type;
  }
  if (start < payload.length) {
    result.data = JSON.parse(payload.slice(start));
  }
  return result;
}
var JSON_START = new Set(["[", "{"]);
var textDecoder = new TextDecoder;

// /Users/daniil/Development/Public/extws/client/node_modules/@kirick/event-emitter/main.js
var main_default = (storage = {}) => ({
  emit(event_name, ...args) {
    (storage[event_name] ?? []).forEach((fn) => fn(...args));
  },
  on(event_name, fn) {
    storage[event_name] = (storage[event_name] ?? new Set).add(fn);
    return () => storage[event_name].delete(fn);
  },
  once(event_name, fn, off) {
    return off = this.on(event_name, (...args) => {
      off();
      fn(...args);
    });
  }
});

// src/websocket.js
var { WebSocket } = self;
function createWebSocket({ url, headers }) {
  if (headers) {
    console.warn("[ExtWSClient] Headers are not supported while using WebSocket in browser. They will be ignored.");
  }
  return new WebSocket(url);
}

// src/utils.js
function isPlainObject(value) {
  return typeof value === "object" && value !== null && value.constructor === Object;
}
function parseUrl(value) {
  if (value instanceof URL) {
    return value;
  }
  if (typeof value === "string") {
    return new URL(value);
  }
  return null;
}
var SYMBOL_EXTWS = Symbol("extws");
var BROKEN_STATES = new Set([
  WebSocket.CLOSING,
  WebSocket.CLOSED
]);
var OPTIONS_DEFAULT = {
  connect: true,
  reconnect: true,
  reconnect_interval: 2000,
  ping_timeout: 5000
};

// src/main.js
class ExtWSClient {
  #emitter = main_default();
  #websocket;
  #timeout_id_ping = null;
  #timeout_id_dead = null;
  #timeout_id_reconnect = null;
  url;
  options = {};
  constructor(url, options = {}) {
    this.url = parseUrl(url);
    if (this.url instanceof URL !== true) {
      throw new TypeError("Invalid URL.");
    }
    if (isPlainObject(options) !== true) {
      throw new TypeError("Options must be an Object or not defined at all.");
    }
    this.options = options;
    if (this.#getOption("connect") === true) {
      setTimeout(() => this.connect());
    }
    this.on("disconnect", () => {
      this.#websocket = null;
      if (this.#getOption("reconnect") === true) {
        clearTimeout(this.#timeout_id_reconnect);
        this.#timeout_id_reconnect = setTimeout(() => this.connect(), this.#getOption("reconnect_interval"));
      }
    });
  }
  #getOption(key) {
    return this.options[key] ?? OPTIONS_DEFAULT[key];
  }
  get is_connected() {
    return this.#websocket && BROKEN_STATES.has(this.#websocket.readyState) !== true && typeof this.id === "string" && Date.now() - this.#websocket[SYMBOL_EXTWS].ts_last_message < this.#websocket[SYMBOL_EXTWS].idle_timeout;
  }
  get id() {
    return this.#websocket[SYMBOL_EXTWS].socket_id;
  }
  #createPing() {
    clearTimeout(this.#timeout_id_ping);
    if (this.#websocket) {
      this.#timeout_id_ping = setTimeout(() => this.#sendPing(), this.#websocket[SYMBOL_EXTWS].idle_timeout - this.#getOption("ping_timeout"));
    }
  }
  #sendPing() {
    clearTimeout(this.#timeout_id_dead);
    if (this.is_connected) {
      this.#websocket.send(buildPayload(PAYLOAD_TYPE.PING));
      this.#timeout_id_dead = setTimeout(() => this.disconnect(), this.#getOption("ping_timeout") * 1000);
    }
  }
  connect() {
    if (this.is_connected) {
      return;
    }
    if (this.#websocket) {
      this.#websocket.close();
    }
    this.#emitter.emit("beforeconnect");
    const ws = createWebSocket({
      url: this.url,
      headers: this.options.headers
    });
    ws[SYMBOL_EXTWS] = {
      socket_id: null,
      idle_timeout: 60000,
      ts_last_message: 0
    };
    ws.addEventListener("error", (error) => {
      console.error(error);
    });
    ws.addEventListener("open", () => {
      ws[SYMBOL_EXTWS].ts_last_message = Date.now();
      this.#createPing();
    });
    ws.addEventListener("message", (event) => {
      clearTimeout(this.#timeout_id_dead);
      this.#createPing();
      ws[SYMBOL_EXTWS].ts_last_message = Date.now();
      const {
        payload_type,
        data: data2,
        event_type
      } = parsePayload(event.data);
      switch (payload_type) {
        case PAYLOAD_TYPE.INIT:
          ws[SYMBOL_EXTWS].socket_id = data2.id;
          ws[SYMBOL_EXTWS].idle_timeout = data2.idle_timeout * 1000;
          this.#emitter.emit("connect");
          break;
        case PAYLOAD_TYPE.PING:
          ws.send(buildPayload(PAYLOAD_TYPE.PONG));
          break;
        case PAYLOAD_TYPE.MESSAGE:
          this.#emitter.emit(event_type ?? "message", data2);
          break;
      }
    });
    ws.addEventListener("close", () => {
      ws[SYMBOL_EXTWS].ts_last_message = 0;
      this.#emitter.emit("disconnect");
    });
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
  send(event_type, data2) {
    if (data2 === undefined && typeof event_type !== "string") {
      data2 = event_type;
      event_type = undefined;
    }
    if (this.is_connected) {
      this.#websocket.send(buildMessagePayload(event_type, data2));
    }
  }
}
export {
  ExtWSClient
};
