
const url = require('url'),
	net = require('net'),
	events = require('events'),
	{safe} = require('./src/util.js'),
	Tunnel = require('./src/tunnel.js');

class Proxy extends events {

	constructor(host, to) {
		super();
		this.uri = {
			host: url.parse((host.match(/^.*?:\/\//)) ? host : 'tcp://' + host),
			to: url.parse((to.match(/^.*?:\/\//)) ? to : 'tcp://' + to)
		};
		this.alive = false;
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
			this.alive = true;
			this.emit('open');
		});
	}

	close() {
		if (!this.alive) {
			return Promise.resolve();
		}
		this.alive = false;
		for (let i in this.tunnel) {
			if (this.tunnel[i]) {
				this.tunnel[i].close();
			}
		}
		safe(() => this.server.close());
		safe(() => this.server.destroy());
		return Promise.resolve();
	}

}

Proxy.RX = 'recieved';
Proxy.TX = 'transmitted';

module.exports = Proxy;
