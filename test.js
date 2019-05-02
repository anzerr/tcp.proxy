
const zlib = require('zlib'),
	{promisify} = require('util'),
	net = require('net.socket'),
	Proxy = require('./index.js');

const package = (data) => {
	let buffer = data.slice(6, data.length), json = null;
	return promisify(zlib.unzip)(buffer).then((d) => {
		json = JSON.parse(d);
		json.test = (json.test || '') + '.';
		return promisify(zlib.deflate)(JSON.stringify(json));
	}).then((d) => {
		const size = Buffer.alloc(6);
		size.writeIntLE(d.length, 0, 6);
		return [json, Buffer.concat([size, d])];
	}).catch(() => {
		return data;
	});
};

let p = new Proxy('localhost:5670', 'localhost:5671');

p.on('connect', (tunnel) => {
	tunnel.on(Proxy.RX, (data, resolve) => {
		package(data).then((r) => {
			console.log(Proxy.RX, tunnel.key, r[0]);
			resolve(r[1]);
		});
	}).on(Proxy.TX, (data, resolve) => {
		package(data).then((r) => {
			console.log(Proxy.TX, tunnel.key, r[0]);
			resolve(r[1]);
		});
	}).on('close', () => {
		console.log('tunnel closed');
	});
});


p.on('open', () => {
	let server = new net.Server('localhost:5671');
	server.on('message', (res) => {
		let client = res.client, payload = JSON.parse(res.payload.toString());
		// console.log('Server recieve', client.id(), payload);
		client.send(JSON.stringify({pong: payload}));
	});
	server.on('open', () => {
		let c = new net.Client('localhost:5670');
		c.on('connect', () => {
			// console.log('client connected');
			let i = 0;
			setInterval(() => {
				if (i > 5) {
					c.close();
				} else {
					c.send(JSON.stringify({test: 'cat' + i}));
				}
				i++;
			}, 1000);
			c.on('message', (/* res*/) => {
				// console.log('Client message', JSON.parse(res.toString()));
			});
		});
	});
});
