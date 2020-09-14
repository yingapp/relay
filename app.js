const WebTorrent = require('webtorrent-hybrid')
const fs = require('fs')
const client = new WebTorrent()
var http = require('http');
require('events').EventEmitter.defaultMaxListeners = 250
const cache = {}
http.createServer(function (request, response) {
    const url = request.url;
    if (url.substr(0, 8) === '/magnet:') {
        const torrentId = url.substr(1)
        if (!cache[torrentId]) {
            cache[torrentId] = true
            console.log('torrentId:\t', torrentId)
            client.add(torrentId, { path: __dirname + '/files' }, torrent => {
                const files = torrent.files
                let length = files.length
                // Stream each file to the disk
                files.forEach(file => {
                    const source = file.createReadStream()
                    const destination = fs.createWriteStream(file.name)
                    source.on('end', () => {
                        console.log('file:\t\t', file.name)
                        // close after all files are saved
                        length -= 1
                        if (!length) {
                            process.exit()
                        }
                    }).pipe(destination)
                })
            })
        }
    }
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end(request.url);
}).listen(60);