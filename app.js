require('events').EventEmitter.defaultMaxListeners = 250
const fs = require('fs')
var SimplePeer = require('simple-peer')
const WebTorrent = require('webtorrent')
const client = new WebTorrent({
    tracker: {
        rtcConfig: {
            ...SimplePeer.config,
            ...[
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:global.stun.twilio.com:3478'
                    ]
                },
            ]
        }
    }
})
// const client = new WebTorrent()
var express = require('express');
var app = express();
const cache = {}
app.get('/:magnet', function (req, res) {
    const url = req.url;
    if (url.substr(0, 8) === '/magnet:') {
        const torrentId = url.substr(1)
        if (cache[torrentId]) {
            console.log('已在下载：', torrentId)
        } else {
            cache[torrentId] = true
            console.log('torrentId:\t', torrentId)
            client.add(torrentId, { path: __dirname + '/files' })

            // client.add(torrentId, torrent => {
            //     const files = torrent.files
            //     let length = files.length
            //     // Stream each file to the disk
            //     files.forEach(file => {
            //         const source = file.createReadStream()
            //         const destination = fs.createWriteStream(__dirname + '/files/' + file.name)
            //         source.on('end', () => {
            //             console.log('file:\t\t', file.name)
            //             // close after all files are saved
            //             length -= 1
            //             if (!length) process.exit()
            //         }).pipe(destination)
            //     })
            // })
        }
    }
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(url);
});
var server = require('http').Server(app);
var port = process.env.PORT || 60;
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
