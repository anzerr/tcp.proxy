
### `Intro`
proxy connection to a remote socket and listen to the traffic

#### `Install`
``` bash
npm install --save git+https://git@github.com/anzerr/tcp.proxy.git
```

### `Example`
``` javascript
const Proxy = require('tcp.proxy');

let p = new Proxy('localhost:5670', 'localhost:5671');

p.on('recieve', (data) => {
	console.log('recieve', data[0], data[1].toString());
}).on('sent', (data) => {
	console.log('sent', data[0], data[1].toString());
});
```