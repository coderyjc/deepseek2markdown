// Minimal STORE-method ZIP writer. No compression, no dependencies.
// Usage:
//   const zw = new ZipWriter();
//   zw.add('a.md', '# hello'); // string or Uint8Array
//   const blob = zw.build();   // application/zip Blob
//
// Limitations: 32-bit sizes, no encryption, no compression. Plenty for tens
// of MB of plain markdown.
(function (global) {
    const CRC_TABLE = (function () {
        const t = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let k = 0; k < 8; k++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            t[i] = c >>> 0;
        }
        return t;
    })();

    function crc32(bytes) {
        let c = 0xFFFFFFFF;
        for (let i = 0; i < bytes.length; i++) {
            c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
        }
        return (c ^ 0xFFFFFFFF) >>> 0;
    }

    const enc = new TextEncoder();

    // DOS time/date encoding for ZIP local headers
    function dosTime(d) {
        return ((d.getHours() & 0x1F) << 11) | ((d.getMinutes() & 0x3F) << 5) | ((d.getSeconds() / 2) & 0x1F);
    }
    function dosDate(d) {
        return (((d.getFullYear() - 1980) & 0x7F) << 9) | (((d.getMonth() + 1) & 0x0F) << 5) | (d.getDate() & 0x1F);
    }

    class ZipWriter {
        constructor() {
            this.entries = [];
        }
        add(name, data) {
            const bytes = (typeof data === 'string') ? enc.encode(data) : data;
            const nameBytes = enc.encode(name);
            this.entries.push({
                nameBytes,
                bytes,
                crc: crc32(bytes),
                date: new Date(),
            });
        }
        build() {
            const parts = [];
            const central = [];
            let offset = 0;
            for (const e of this.entries) {
                const dt = dosTime(e.date);
                const dd = dosDate(e.date);
                // Local file header (30 bytes + name)
                const lh = new ArrayBuffer(30);
                const lv = new DataView(lh);
                lv.setUint32(0, 0x04034b50, true);
                lv.setUint16(4, 20, true);              // version needed
                lv.setUint16(6, 0, true);               // flags
                lv.setUint16(8, 0, true);               // method = STORE
                lv.setUint16(10, dt, true);
                lv.setUint16(12, dd, true);
                lv.setUint32(14, e.crc, true);
                lv.setUint32(18, e.bytes.length, true); // compressed size
                lv.setUint32(22, e.bytes.length, true); // uncompressed size
                lv.setUint16(26, e.nameBytes.length, true);
                lv.setUint16(28, 0, true);              // extra length
                parts.push(lh, e.nameBytes, e.bytes);

                // Central directory header (46 bytes + name)
                const ch = new ArrayBuffer(46);
                const cv = new DataView(ch);
                cv.setUint32(0, 0x02014b50, true);
                cv.setUint16(4, 20, true);              // version made by
                cv.setUint16(6, 20, true);              // version needed
                cv.setUint16(8, 0, true);
                cv.setUint16(10, 0, true);
                cv.setUint16(12, dt, true);
                cv.setUint16(14, dd, true);
                cv.setUint32(16, e.crc, true);
                cv.setUint32(20, e.bytes.length, true);
                cv.setUint32(24, e.bytes.length, true);
                cv.setUint16(28, e.nameBytes.length, true);
                cv.setUint16(30, 0, true);              // extra
                cv.setUint16(32, 0, true);              // comment
                cv.setUint16(34, 0, true);
                cv.setUint16(36, 0, true);
                cv.setUint32(38, 0, true);              // external attrs
                cv.setUint32(42, offset, true);
                central.push(ch, e.nameBytes);

                offset += 30 + e.nameBytes.length + e.bytes.length;
            }

            const centralStart = offset;
            let centralSize = 0;
            for (const p of central) centralSize += p.byteLength;

            // End of central directory (22 bytes)
            const eocd = new ArrayBuffer(22);
            const ev = new DataView(eocd);
            ev.setUint32(0, 0x06054b50, true);
            ev.setUint16(4, 0, true);
            ev.setUint16(6, 0, true);
            ev.setUint16(8, this.entries.length, true);
            ev.setUint16(10, this.entries.length, true);
            ev.setUint32(12, centralSize, true);
            ev.setUint32(16, centralStart, true);
            ev.setUint16(20, 0, true);

            return new Blob([...parts, ...central, eocd], { type: 'application/zip' });
        }
    }

    global.ZipWriter = ZipWriter;
})(typeof window !== 'undefined' ? window : self);
