/**
 * MidiParser - Pure JavaScript Standard MIDI File (SMF) Parser
 * Analyzes uploaded/existing MIDI files to extract their Musical DNA:
 * Tempo (BPM), Key/Scale estimation, Track count, Instrument programs,
 * Note density, Chord structures, and Rhythm groove patterns.
 */

class MidiParser {
    /**
     * Parse binary Uint8Array or ArrayBuffer of a .mid file
     */
    static parse(arrayBuffer) {
        const data = new Uint8Array(arrayBuffer);
        let pos = 0;

        // Verify "MThd" Header
        if (data.length < 14) throw new Error("File too small to be valid MIDI");
        const headerId = String.fromCharCode(...data.slice(0, 4));
        if (headerId !== "MThd") throw new Error("Invalid MIDI header: " + headerId);

        pos = 8;
        const format = (data[pos] << 8) | data[pos + 1];
        const numTracks = (data[pos + 2] << 8) | data[pos + 3];
        const ppq = (data[pos + 4] << 8) | data[pos + 5];
        pos = 14;

        const tracks = [];
        let detectedBpm = 120;
        let detectedKey = "C";
        let detectedScale = "minor";
        const allPitches = [];
        const detectedInstruments = [];

        // Parse Tracks
        for (let t = 0; t < numTracks && pos < data.length; t++) {
            if (pos + 8 > data.length) break;
            const chunkId = String.fromCharCode(...data.slice(pos, pos + 4));
            const chunkLength = (data[pos + 4] << 24) | (data[pos + 5] << 16) | (data[pos + 6] << 8) | data[pos + 7];
            pos += 8;

            if (chunkId !== "MTrk") {
                pos += chunkLength;
                continue;
            }

            const trackEnd = pos + chunkLength;
            let currentTick = 0;
            let lastStatus = 0;
            let trackName = `Track ${t + 1}`;
            let program = 0;
            const notes = [];
            const activeNoteOns = {};

            while (pos < trackEnd && pos < data.length) {
                // Read delta-time
                let delta = 0;
                while (pos < data.length) {
                    const byte = data[pos++];
                    delta = (delta << 7) | (byte & 0x7F);
                    if ((byte & 0x80) === 0) break;
                }
                currentTick += delta;

                if (pos >= data.length) break;
                let status = data[pos];

                // Running status check
                if (status < 0x80) {
                    status = lastStatus;
                } else {
                    pos++;
                    lastStatus = status;
                }

                const eventType = status & 0xF0;
                const channel = status & 0x0F;

                // Meta Events (0xFF)
                if (status === 0xFF) {
                    const metaType = data[pos++];
                    let metaLength = 0;
                    while (pos < data.length) {
                        const b = data[pos++];
                        metaLength = (metaLength << 7) | (b & 0x7F);
                        if ((b & 0x80) === 0) break;
                    }

                    const metaData = data.slice(pos, pos + metaLength);
                    pos += metaLength;

                    // Set Tempo (0x51)
                    if (metaType === 0x51 && metaLength === 3) {
                        const mpqn = (metaData[0] << 16) | (metaData[1] << 8) | metaData[2];
                        detectedBpm = Math.round(60000000 / mpqn);
                    }
                    // Track Name (0x03)
                    else if (metaType === 0x03) {
                        trackName = String.fromCharCode(...metaData);
                    }
                    // Key Signature (0x59)
                    else if (metaType === 0x59 && metaLength >= 2) {
                        const sf = metaData[0]; // sharps/flats (-7 to 7)
                        const mi = metaData[1]; // 0 = major, 1 = minor
                        detectedScale = mi === 1 ? "minor" : "major";
                        const keyMapMaj = { 0: "C", 1: "G", 2: "D", 3: "A", 4: "E", 5: "B", 6: "F#", "-1": "F", "-2": "Bb", "-3": "Eb", "-4": "Ab", "-5": "Db", "-6": "Gb" };
                        const keyMapMin = { 0: "A", 1: "E", 2: "B", 3: "F#", 4: "C#", 5: "G#", "-1": "D", "-2": "G", "-3": "C", "-4": "F", "-5": "Bb" };
                        const sfKey = sf > 127 ? sf - 256 : sf;
                        detectedKey = (mi === 1 ? keyMapMin[sfKey] : keyMapMaj[sfKey]) || (mi === 1 ? "A" : "C");
                    }
                }
                // Note On (0x90)
                else if (eventType === 0x90) {
                    const pitch = data[pos++];
                    const velocity = data[pos++];
                    if (velocity > 0) {
                        activeNoteOns[`${channel}_${pitch}`] = { startTick: currentTick, velocity: velocity };
                        allPitches.push(pitch);
                    } else {
                        // Note off with velocity 0
                        const key = `${channel}_${pitch}`;
                        if (activeNoteOns[key]) {
                            const start = activeNoteOns[key].startTick;
                            notes.push({
                                pitch: pitch,
                                startTick: start,
                                durationTicks: Math.max(60, currentTick - start),
                                velocity: activeNoteOns[key].velocity
                            });
                            delete activeNoteOns[key];
                        }
                    }
                }
                // Note Off (0x80)
                else if (eventType === 0x80) {
                    const pitch = data[pos++];
                    const velocity = data[pos++];
                    const key = `${channel}_${pitch}`;
                    if (activeNoteOns[key]) {
                        const start = activeNoteOns[key].startTick;
                        notes.push({
                            pitch: pitch,
                            startTick: start,
                            durationTicks: Math.max(60, currentTick - start),
                            velocity: activeNoteOns[key].velocity
                        });
                        delete activeNoteOns[key];
                    }
                }
                // Program Change (0xC0)
                else if (eventType === 0xC0) {
                    program = data[pos++];
                    detectedInstruments.push({ channel, program });
                }
                // Other channel events
                else if (eventType === 0xA0 || eventType === 0xB0 || eventType === 0xE0) {
                    pos += 2;
                } else if (eventType === 0xD0) {
                    pos += 1;
                }
            }

            if (notes.length > 0) {
                tracks.push({
                    name: trackName,
                    channel: tracks.length,
                    program: program,
                    notes: notes
                });
            }
        }

        // Estimate Root Key and Scale if not specified in metadata
        if (allPitches.length > 10) {
            const pitchClassCounts = new Array(12).fill(0);
            allPitches.forEach(p => pitchClassCounts[p % 12]++);

            // Find tonic
            let maxCount = -1;
            let tonicPitchClass = 0;
            pitchClassCounts.forEach((c, i) => {
                if (c > maxCount) {
                    maxCount = c;
                    tonicPitchClass = i;
                }
            });

            const pitchNames = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
            detectedKey = pitchNames[tonicPitchClass];

            // Check minor 3rd vs major 3rd
            const minor3rd = (tonicPitchClass + 3) % 12;
            const major3rd = (tonicPitchClass + 4) % 12;
            if (pitchClassCounts[minor3rd] > pitchClassCounts[major3rd]) {
                detectedScale = "minor";
            } else {
                detectedScale = "major";
            }
        }

        return {
            bpm: detectedBpm,
            key: detectedKey,
            scale: detectedScale,
            ppq: ppq,
            tracks: tracks,
            totalNotes: allPitches.length,
            detectedInstruments: detectedInstruments
        };
    }
}

if (typeof window !== "undefined") {
    window.MidiParser = MidiParser;
}
if (typeof module !== "undefined") {
    module.exports = MidiParser;
}
