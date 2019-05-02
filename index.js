
const url = require('url'),
	net = require('net'),
	events = require('events'),
	Tunnel = require('./src/tunnel.js');

class Proxy extends events {

	constructor(host, to) {
		super();
		this.uri = {
			host: url.parse((host.match(/^.*?:\/\//)) ? host : 'tcp://' + host),
			to: url.parse((to.match(/^.*?:\/\//)) ? to : 'tcp://' + to)
		};
		this.tunnel = {};
		this.server = net.createServer((socket) => {
			let t = new Tunnel(socket, this.uri.to);
			t.on('connect', () => {
				this.emit('connect', t);
			});
			t.on('close', () => this.tunnel[t.key] = null);
			this.tunnel[t.key] = t;
		});
		this.server.on('error', (e) => {
			this.emit('error', e);
		}).on('close', (e) => {
			this.emit('close', e);
			this.close();
		}).listen({host: this.uri.host.hostname, port: this.uri.host.port}, () => {
			this.emit('open');
		});
	}

	close() {
		return new Promise((resolve) => {
			for (let i in this.tunnel) {
				if (this.tunnel[i]) {
					this.socket[i].close();
				}
			}
			this.server.close(() => {
				resolve();
			});
		});
	}

}

Proxy.RX = 'recieved';
Proxy.TX = 'transmitted';

module.exports = Proxy;
