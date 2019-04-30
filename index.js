
const url = require('url'),
	net = require('net'),
	events = require('events'),
	{promisify} = require('util');

class Proxy extends events {

	constructor(host, to) {
		super();
		this.uri = {
			host: url.parse((host.match(/^.*?:\/\//)) ? host : 'tcp://' + host),
			to: url.parse((to.match(/^.*?:\/\//)) ? to : 'tcp://' + to)
		};
		this.socket = [];
		this.server = net.createServer((socket) => {
			let key = this.key();

			const client = new net.Socket();
			client.connect(this.uri.to.port, this.uri.to.hostname, () => {
				this.emit('connect', [key, socket, client]);
			});
			client.on('error', (err) => {
				this.emit('error', [key, 'client', err]);
			}).on('close', () => {
				socket.close();
			}).on('data', (data) => {
				this.emit('recieve', [key, data]);
				return promisify(socket.write.bind(socket))(data);
			});

			socket.on('error', (err) => {
				this.emit('error', [key, 'socket', err]);
			}).on('close', () => {
				client.close();
			}).on('data', (data) => {
				this.emit('sent', [key, data]);
				return promisify(client.write.bind(client))(data);
			});
			this.socket.push(client);
			this.socket.push(socket);
		});
		this.server.on('error', (e) => {
			this.emit('error', e);
		}).on('close', (e) => {
			this.emit('close', e);
		}).listen({host: this.uri.host.hostname, port: this.uri.host.port}, () => {
			this.emit('open');
		});
	}

	close() {
		for (let i in this.socket) {
			if (this.socket[i]) {
				this.socket[i].close();
			}
		}
		return new Promise((resolve) => {
			this.server.close(() => {
				resolve();
			});
		});
	}

	key() {
		return new Date().getTime() + '.' + Math.random().toString(36).substr(2);
	}

}

module.exports = Proxy;
