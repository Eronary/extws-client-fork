# @extws/client

Universal client for [ExtWS servers](https://github.com/extws-team/server).

Works in Node.js using [ws](http://npmjs.com/package/ws) package, in [Bun](https://bun.sh) using it's [WebSocket](https://bun.sh/docs/api/websockets) implementation, and in browsers using [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

ExtWS client is a wrapper around WebSocket. It makes easy to subscribe to specific types of events.

## Installation

```bash
npm install @extws/client
pnpm install @extws/client
bun install @extws/client
```

## Usage

```js
import { ExtWSClient } from '@extws/client';

const client = new ExtWSClient('ws://localhost:8080');
```

## API

### ExtWSClient

#### constructor(url: `string | URL`, options?: `ExtWSClientOptions`)

Creates a new client instance.

Available options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `headers` | `object` | `{}` | HTTP headers to send on connection. Does not work in browsers. |
| `connect` | `boolean` | `true` | Whether to connect immediately after client creation. |
| `reconnect` | `boolean` | `true` | Whether to reconnect automatically on disconnect. |
| `reconnect_interval` | `number` | `1000` | Reconnection interval in milliseconds. |
| `ping_timeout` | `number` | `5000` | Timeframe in milliseconds to wait for a ping response to the server. If no response is received, the connection is considered lost. |

#### url: `URL`

URL of the server.

#### options: `object<string, any>`

Options passed to the constructor. Can be modified at any time.

#### id: `string`

Unique connection identifier.

#### is_connected: `boolean`

Whether the client is connected to the server using ExtWS protocol. Equals to `false` even if underlying WebSocket is connected, but ExtWS handshake is not completed.

#### connect(): `void`

Connects to the server.

#### disconnect(): `void`

Closes connection to the server.

#### on(event_type: `string`, listener: `(...args: array<any>) => void`): `() => void`

Adds an event listener to specific event type. Returns a function that removes the listener.

#### once(event_type: `string`, listener: `(...args: array<any>) => void`): `() => void`

Adds an event listener to specific event type that will be called only once. Returns a function that removes the listener.

#### send(event_type: `string`, data?: `any`): `void`

Sends an event to the server. If client is not connected, the message will be discarded.

### Built-in events

#### beforeconnect

Emitted before client opens a WebSocket connection so you can modify URL or options here. Does not support async operations.

#### connect

Emitted when client connects to the server using ExtWS protocol.

#### disconnect

Emitted when client disconnects from the server.
