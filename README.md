
### `Intro`
Tunnel a tcp connection to a remote socket and listen/edit the traffic through the tunnel.

#### `Install`
``` bash
npm install --save git+https://github.com/anzerr/tcp.proxy.git
```

### `Example`
``` javascript
const Proxy = require('tcp.proxy');

let p = new Proxy('localhost:5670', 'localhost:5671');

p.on('connect', (tunnel) => {
	tunnel.on(Proxy.RX, (data, resolve) => {
		console.log(Proxy.RX, tunnel.key, data.toString());
		resolve(data);
	}).on(Proxy.TX, (data, resolve) => {
		console.log(Proxy.TX, tunnel.key, data.toString());
		resolve(data);
	}).on('close', () => {
		console.log('tunnel closed', tunnel.key);
	});
});
```