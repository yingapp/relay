const WebTorrent = require('webtorrent-hybrid')
require('events').EventEmitter.defaultMaxListeners = 250
const fs = require('fs')
const client = new WebTorrent()
var express = require('express');
var app = express();
const cache = {}
app.get('/:magnet', function (req, res) {
    const url = req.url;
    if (url.substr(0, 8) === '/magnet:') {
        const torrentId = url.substr(1)
        if (!cache[torrentId]) {
            cache[torrentId] = true
            console.log('torrentId:\t', torrentId)
            client.add(torrentId, { path: __dirname + '/files' })
        }
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(url);
});
var server = require('http').Server(app);
var port = process.env.PORT || 60;
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
