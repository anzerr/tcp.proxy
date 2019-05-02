#!/usr/bin/env node

const Proxy = require('./index.js'),
	{Cli, Map} = require('cli.util');

let argv = process.argv;
let cli = new Cli(argv, [
	new Map('host').alias(['h', 'H']).arg(),
	new Map('remote').alias(['r', 'R']).arg()
], 1);

if (cli.has('host') && cli.has('remote') && cli.get('host') !== cli.get('remote')) {
	let p = new Proxy(cli.get('host'), cli.get('remote'));
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
} else {
	console.log('example: tcpproxy --host localhost:5964 --remote localhost:5965');
}
