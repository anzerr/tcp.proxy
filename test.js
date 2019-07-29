
const net = require('net.socket'),
	Proxy = require('./index.js');

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	process.exit(1);
});

const package = (data) => {
	let buffer = data.slice(6, data.length), json = null;
	json = JSON.parse(buffer.toString());
	json.test = (json.test || '') + '.';
	let d = Buffer.from(JSON.stringify(json));
	const size = Buffer.alloc(6);
	size.writeIntLE(d.length, 0, 6);
	return Promise.resolve([json, Buffer.concat([size, d])]);
};

let p = new Proxy('localhost:5670', 'localhost:5671');

p.on('connect', (tunnel) => {
	tunnel.on(Proxy.RX, (data, resolve) => {
		package(data).then((r) => {
			console.log('rx', Proxy.RX, tunnel.key, r[0]);
			resolve(r[1]);
		});
	}).on(Proxy.TX, (data, resolve) => {
		package(data).then((r) => {
			console.log('tx', Proxy.TX, tunnel.key, r[0]);
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
			let set = setInterval(() => {
				if (i > 5) {
					c.close();
					p.close();
					server.close();
					clearInterval(set);
				} else {
					c.send(JSON.stringify({test: 'cat' + i}));
				}
				i++;
			}, 100);
			c.on('message', (/* res*/) => {
				// console.log('Client message', JSON.parse(res.toString()));
			});
		});
	});
});
