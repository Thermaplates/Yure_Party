//=============================================================================
// mobile_server.js - Server Lokal Kecepatan Tinggi (Turbo Streaming & Smart Cache)
//=============================================================================
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');

const PORT = 8080;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
    '.webm': 'video/webm',
    '.mp4':  'video/mp4',
    '.ogg':  'audio/ogg',
    '.m4a':  'audio/mp4',
    '.mp3':  'audio/mpeg',
    '.wav':  'audio/wav',
    '.ttf':  'font/ttf',
    '.woff': 'font/woff',
    '.woff2':'font/woff2'
};

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') {
        reqPath = '/index.html';
    }

    const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found: ' + reqPath);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;

        // 1. Validasi Smart Cache ETag (HTTP 304 Not Modified)
        // Memungkinkan browser HP langsung memakai file di memori tanpa unduh ulang!
        if (req.headers['if-none-match'] === etag) {
            res.writeHead(304, {
                'ETag': etag,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });
            res.end();
            return;
        }

        const isMedia = ['.ogg', '.m4a', '.mp3', '.webm', '.mp4'].includes(ext);
        const isStaticAsset = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ttf', '.woff', '.woff2'].includes(ext);
        const isCompressible = ['.json', '.js', '.css', '.html'].includes(ext) && stats.size > 1024;

        // 2. Dukungan HTTP 206 Partial Content (Range Requests) Khusus Audio & Video
        // Sangat krusial agar browser mobile HP (Chrome/Safari) tidak macet saat streaming lagu/suara/video!
        const range = req.headers.range;
        if (isMedia && range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

            if (start >= stats.size) {
                res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
                res.end();
                return;
            }

            const chunksize = (end - start) + 1;
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
                'ETag': etag,
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*'
            });

            const stream = fs.createReadStream(filePath, { start, end });
            stream.pipe(res);
            return;
        }

        // 3. Header Standar & Kebijakan Cache Cerdas
        const headers = {
            'Content-Type': contentType,
            'ETag': etag,
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*'
        };

        if (isStaticAsset || isMedia) {
            // Aset gambar/audio yang berat di-cache agar HP membuka secepat kilat
            headers['Cache-Control'] = 'public, max-age=86400, must-revalidate';
        } else {
            // Script JS & data JSON selalu revalidate ETag (bila diedit di PC, HP langsung dapat update)
            headers['Cache-Control'] = 'no-cache';
        }

        // 4. Kompresi Gzip untuk File Teks Besar (.json, .js)
        const acceptEncoding = req.headers['accept-encoding'] || '';
        if (isCompressible && acceptEncoding.includes('gzip')) {
            headers['Content-Encoding'] = 'gzip';
            res.writeHead(200, headers);
            const rawStream = fs.createReadStream(filePath);
            const gzip = zlib.createGzip({ level: 6 });
            rawStream.pipe(gzip).pipe(res);
            return;
        }

        headers['Content-Length'] = stats.size;
        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIp();
    console.log('====================================================================');
    console.log('⚡ YURE PARTY - TURBO MOBILE SERVER (High-Speed & Smart Cache)');
    console.log('====================================================================');
    console.log('Server berjalan dengan akselerasi HTTP Range Streaming & ETag Cache!');
    console.log('');
    console.log('📲 ALAMAT AKSES DI HP (Buka di Google Chrome / Safari HP):');
    console.log('');
    console.log('   👉  http://' + localIp + ':' + PORT);
    console.log('');
    console.log('🚀 KEUNGGULAN TURBO SERVER INI:');
    console.log('1. Loading Cepat: Audio & Video menggunakan Partial Streaming (tidak akan macet).');
    console.log('2. Smart Caching: Gambar & Font langsung disimpan di memori HP.');
    console.log('3. Live Update: Jika kodingan di PC diubah, HP otomatis membaca update');
    console.log('   cukup dengan me-refresh browser!');
    console.log('4. Gzip Compression: File JSON database dikompres hingga 75% lebih ringan.');
    console.log('====================================================================');
    console.log('Tekan Ctrl + C di jendela ini untuk mematikan server.');
});
