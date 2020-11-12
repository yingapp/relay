require('events').EventEmitter.defaultMaxListeners = 250
const fs = require('fs')
var SimplePeer = require('simple-peer')
const WebTorrent = require('webtorrent-hybrid')
const client = new WebTorrent({
    tracker: {
      rtcConfig: {
        ...SimplePeer.config,
        iceServers:[{"urls":["stun:stun.l.google.com:19302","stun:global.stun.twilio.com:3478"]},{"urls":["turn:relay.instant.io:443?transport=udp","turn:relay.instant.io:443?transport=tcp","turns:relay.instant.io:443?transport=tcp"],"username":"relay.instant.io","credential":"nepal-cheddar-baize-oleander"}]
      }
    }
  })
const cache = {}
var express = require('express');
var cors = require('cors');
var app = express()
var allowlist = ['https://yingapp.herokuapp.com', 'http://localhost:50']
//  异步配置
var corsOptions;
var corsOptionsDelegate = function (req, callback) {
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }
    } else {
        corsOptions = { origin: false } // 拦截请求
    }
    callback(null, corsOptions)
}

app.get('/:magnet', cors(corsOptionsDelegate), function (req, res, next) {
    if (corsOptions.origin === true) {
        const url = req.url;
        if (url.substr(0, 8) === '/magnet:') {
            const torrentId = url.substr(1)
            if (cache[torrentId]) {
                console.log('已在下载：', torrentId)
            } else {
                cache[torrentId] = true
                console.log('torrentId:\t', torrentId)
                client.add(torrentId, { path: __dirname + '/files' }, torrent => {
                    torrent.on('download', function (bytes) {
                        console.log('下载字节: ' + bytes)
                        console.log('总下载字节: ' + torrent.downloaded)
                        console.log('下载速度: ' + torrent.downloadSpeed)
                        console.log('下载进度: ' + torrent.progress)
                        console.log('上传速度: ' + torrent.uploaded)
                        console.log('连接数量: ' + torrent.numPeers)
                    })
                })
            }
        }
        res.writeHead(200);
        res.end(url);
    } else {
        res.sendStatus(500); //被拦截
    }
})

var server = require('http').Server(app);
var port = process.env.PORT || 60;
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
