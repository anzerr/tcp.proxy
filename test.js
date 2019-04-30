
const zlib = require('zlib'),
	{promisify} = require('util'),
	net = require('net.socket'),
	Proxy = require('./index.js');

const package = (data) => {
	let buffer = data.slice(6, data.length);
	return promisify(zlib.unzip)(buffer).then((d) => {
		return d;
	}).catch(() => {
		return data;
	});
};

let p = new Proxy('localhost:5670', 'localhost:5671');

p.on('recieve', (data) => {
	package(data[1]).then((r) => {
		console.log('recieve', data[0], r.toString());
	});
}).on('sent', (data) => {
	package(data[1]).then((r) => {
		console.log('sent', data[0], r.toString());
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
				c.send(JSON.stringify({test: 'cat' + i}));
				i++;
			}, 1000);
			c.on('message', (res) => {
				// console.log('Client message', JSON.parse(res.toString()));
			});
		});
	});
});
