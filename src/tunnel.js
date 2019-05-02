
const net = require('net'),
	{safe, ENUM} = require('./util.js'),
	key = require('unique.util'),
	{promisify} = require('util');

class Tunnel extends require('events') {

	get key() {
		return this._key;
	}

	constructor(socket, uri) {
		super();
		this._key = `${Date.now()}-${key.plain()}`;
		this.closed = false;

		this.uri = uri;
		this.socket = socket;
		this.client = new net.Socket();
		this.client.connect(this.uri.port, this.uri.hostname, () => this.emit('connect', this.key));
		this.hook(ENUM.RX, this.client, this.socket).hook(ENUM.TX, this.socket, this.client);
	}

	hook(type, a, b) {
		a.on('error', (err) => {
			this.emit('error', err);
		}).on('close', () => {
			safe(() => a.close());
			safe(() => b.destroy());
			if (!this.closed) {
				this.closed = true;
				this.emit('close');
			}
		}).on('data', (data) => {
			return new Promise((resolve) => {
				this.emit(type, data, resolve);
			}).then((res) => {
				return promisify(b.write.bind(b))(res);
			});
		});
		return this;
	}

	close() {
		safe(() => this.client.close());
		safe(() => this.client.destroy());
		safe(() => this.socket.close());
		safe(() => this.socket.destroy());
		return Promise.resolve();
	}

}

module.exports = Tunnel;
