/**
 * MidiWriter - Pure JavaScript Standard MIDI File (SMF Type 1) Encoder
 * Generates valid .mid files with multi-track support, GM instruments,
 * channel 10 drums, tempo, time signatures, and RPG Maker loop markers.
 */
class MidiWriter {
    constructor(ticksPerQuarter = 480) {
        this.ppq = ticksPerQuarter;
    }

    /**
     * Encode an integer as Variable Length Quantity (VLQ)
     */
    static writeVLQ(value) {
        let buffer = [];
        buffer.push(value & 0x7F);
        value >>= 7;
        while (value > 0) {
            buffer.unshift((value & 0x7F) | 0x80);
            value >>= 7;
        }
        return buffer;
    }

    /**
     * Write 16-bit big endian integer
     */
    static write16(value) {
        return [(value >> 8) & 0xFF, value & 0xFF];
    }

    /**
     * Write 32-bit big endian integer
     */
    static write32(value) {
        return [
            (value >> 24) & 0xFF,
            (value >> 16) & 0xFF,
            (value >> 8) & 0xFF,
            value & 0xFF
        ];
    }

    /**
     * Convert string to ASCII byte array
     */
    static stringToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) & 0xFF);
        }
        return bytes;
    }

    /**
     * Generate MIDI file byte array from project data
     */
    buildMidi(projectData) {
        const tracks = projectData.tracks || [];
        const bpm = projectData.bpm || 120;
        const ppq = this.ppq;

        // Conductor / Tempo Track (Track 0)
        const conductorEvents = [];

        // Track Name
        const titleBytes = MidiWriter.stringToBytes(projectData.title || "MidiSuno Composition");
        conductorEvents.push({
            tick: 0,
            bytes: [0xFF, 0x03, titleBytes.length, ...titleBytes]
        });

        // Time Signature: [numerator, denominatorPower, clocksPerClick, 32ndsPerQuarter]
        const num = (projectData.timeSignature && projectData.timeSignature[0]) || 4;
        const den = (projectData.timeSignature && projectData.timeSignature[1]) || 4;
        const denPower = Math.round(Math.log2(den));
        conductorEvents.push({
            tick: 0,
            bytes: [0xFF, 0x58, 0x04, num, denPower, 24, 8]
        });

        // Set Tempo: microseconds per quarter note = 60,000,000 / BPM
        const mpqn = Math.round(60000000 / bpm);
        conductorEvents.push({
            tick: 0,
            bytes: [0xFF, 0x51, 0x03, (mpqn >> 16) & 0xFF, (mpqn >> 8) & 0xFF, mpqn & 0xFF]
        });

        // RPG Maker Loop Markers if loop is enabled
        if (projectData.loop) {
            const startTick = projectData.loopStartTick || 0;
            const loopLen = projectData.loopLengthTicks || (ppq * 4 * 16);

            // RPG Maker CC 111 (Control Change 111 is standard RPG Maker loop marker)
            conductorEvents.push({
                tick: startTick,
                bytes: [0xB0, 111, 0]
            });

            // Text markers for other game engines (LOOPSTART & LOOPLENGTH)
            const loopStartText = MidiWriter.stringToBytes("LOOPSTART");
            conductorEvents.push({
                tick: startTick,
                bytes: [0xFF, 0x06, loopStartText.length, ...loopStartText]
            });

            const loopLengthText = MidiWriter.stringToBytes(`LOOPLENGTH=${loopLen}`);
            conductorEvents.push({
                tick: startTick + loopLen,
                bytes: [0xFF, 0x06, loopLengthText.length, ...loopLengthText]
            });
        }

        const encodedTracks = [];

        // Encode Conductor Track
        encodedTracks.push(this.encodeTrackEvents(conductorEvents));

        // Encode Music Tracks
        tracks.forEach((track, trackIdx) => {
            const channel = (track.channel !== undefined ? track.channel : trackIdx) & 0x0F;
            const rawEvents = [];

            // Track Name Meta Event
            const nameBytes = MidiWriter.stringToBytes(track.name || `Track ${trackIdx + 1}`);
            rawEvents.push({
                tick: 0,
                bytes: [0xFF, 0x03, nameBytes.length, ...nameBytes]
            });

            // Program Change (Instrument)
            const program = (track.program !== undefined ? track.program : 0) & 0x7F;
            rawEvents.push({
                tick: 0,
                bytes: [0xC0 | channel, program]
            });

            // Volume CC 7 (default 100)
            rawEvents.push({
                tick: 0,
                bytes: [0xB0 | channel, 0x07, 100]
            });

            // Pan CC 10 (default 64 center)
            const pan = track.pan !== undefined ? track.pan : 64;
            rawEvents.push({
                tick: 0,
                bytes: [0xB0 | channel, 0x0A, pan & 0x7F]
            });

            // Note On and Note Off events
            const notes = track.notes || [];
            notes.forEach(n => {
                const pitch = Math.max(0, Math.min(127, Math.round(n.pitch)));
                const velocity = Math.max(1, Math.min(127, Math.round(n.velocity !== undefined ? n.velocity : 90)));
                const startTick = Math.max(0, Math.round(n.startTick));
                const endTick = Math.max(startTick + 10, Math.round(startTick + n.durationTicks));

                // Note On
                rawEvents.push({
                    tick: startTick,
                    order: 2, // Note On after Note Off if at exact same tick
                    bytes: [0x90 | channel, pitch, velocity]
                });

                // Note Off
                rawEvents.push({
                    tick: endTick,
                    order: 1, // Note Off before Note On
                    bytes: [0x80 | channel, pitch, 0]
                });
            });

            // Sort events by tick, then order
            rawEvents.sort((a, b) => {
                if (a.tick !== b.tick) return a.tick - b.tick;
                return (a.order || 0) - (b.order || 0);
            });

            encodedTracks.push(this.encodeTrackEvents(rawEvents));
        });

        // Assemble Final MIDI Header (MThd) + Track Chunks (MTrk)
        const headerChunk = [
            0x4D, 0x54, 0x68, 0x64, // "MThd"
            0x00, 0x00, 0x00, 0x06, // Chunk length: 6
            0x00, 0x01,             // Format 1 (multi-track synchronous)
            ...MidiWriter.write16(encodedTracks.length), // Number of tracks
            ...MidiWriter.write16(ppq)                  // Ticks per quarter note
        ];

        const allBytes = [...headerChunk];
        encodedTracks.forEach(trkBytes => {
            allBytes.push(...trkBytes);
        });

        return new Uint8Array(allBytes);
    }

    /**
     * Encode raw events list with delta times and End of Track event
     */
    encodeTrackEvents(events) {
        const bodyBytes = [];
        let lastTick = 0;

        events.forEach(evt => {
            const deltaTick = Math.max(0, evt.tick - lastTick);
            lastTick = evt.tick;
            bodyBytes.push(...MidiWriter.writeVLQ(deltaTick));
            bodyBytes.push(...evt.bytes);
        });

        // End of Track Meta Event (0xFF 0x2F 0x00)
        bodyBytes.push(...MidiWriter.writeVLQ(0));
        bodyBytes.push(0xFF, 0x2F, 0x00);

        // MTrk chunk: "MTrk" + 32-bit length + body
        const chunk = [
            0x4D, 0x54, 0x72, 0x6B, // "MTrk"
            ...MidiWriter.write32(bodyBytes.length),
            ...bodyBytes
        ];

        return chunk;
    }

    /**
     * Trigger browser download of generated MIDI
     */
    static downloadMidi(uint8Array, filename = "song.mid") {
        const blob = new Blob([uint8Array], { type: "audio/midi" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

// Export for browser script or Node
if (typeof window !== "undefined") {
    window.MidiWriter = MidiWriter;
}
if (typeof module !== "undefined") {
    module.exports = MidiWriter;
}
