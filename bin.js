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
	p.on('open', () => {
		console.log('server started');
	}).on('recieve', (data) => {
		console.log('recieve', data[0], data[1].toString());
	}).on('sent', (data) => {
		console.log('sent', data[0], data[1].toString());
	});
} else {
	console.log('example: tcpproxy --host localhost:5964 --remote localhost:5965');
}
