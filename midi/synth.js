/**
 * WebSynth - Studio Multi-Instrument Synthesizer & Offline Audio Renderer
 * High-fidelity synthesis for Jazz Sax, Bossa Guitar, Medieval Lute/Recorder,
 * Pipe Organ, Rhodes, Upright Bass, Koto, Drums, and Offline WAV export.
 */

class WebSynth {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.compressor = null;
        this.reverbNode = null;
        this.trackGains = [];
        this.trackMuted = [false, false, false, false, false];
        this.trackSolo = [false, false, false, false, false];

        this.projectData = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.bpm = 120;
        this.ppq = 480;

        this.playbackStartCtxTime = 0;
        this.currentPlayheadTick = 0;
        this.scheduledUpToTick = 0;
        this.scheduleTimer = null;

        this.onTickCallback = null;
        this.onNoteTriggerCallback = null;
        this.onEndCallback = null;
    }

    /**
     * Initialize Audio Context
     */
    init(customCtx = null) {
        if (this.audioCtx && !customCtx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = customCtx || new AudioContextClass();

        // Master Compressor
        this.compressor = this.audioCtx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-14, this.audioCtx.currentTime);
        this.compressor.knee.setValueAtTime(40, this.audioCtx.currentTime);
        this.compressor.ratio.setValueAtTime(8, this.audioCtx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.audioCtx.currentTime);

        // Master Gain
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(0.85, this.audioCtx.currentTime);

        // Algorithmic Reverb Impulse
        this.reverbNode = this.audioCtx.createConvolver();
        this.reverbNode.buffer = this.createReverbImpulse(this.audioCtx, 1.8, 2.0);

        const reverbGain = this.audioCtx.createGain();
        reverbGain.gain.setValueAtTime(0.22, this.audioCtx.currentTime);

        // Connections
        this.masterGain.connect(this.compressor);
        this.reverbNode.connect(reverbGain);
        reverbGain.connect(this.compressor);
        this.compressor.connect(this.audioCtx.destination);

        // 5 Track Bus Gains & Stereo Panners
        this.trackGains = [];
        this.trackPanners = [];
        const panValues = [-0.15, 0.25, 0.0, 0.35, 0.0]; // Stereo imaging per track

        for (let i = 0; i < 5; i++) {
            const gain = this.audioCtx.createGain();
            gain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

            const panner = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
            if (panner) {
                panner.pan.setValueAtTime(panValues[i], this.audioCtx.currentTime);
                gain.connect(panner);
                panner.connect(this.masterGain);
            } else {
                gain.connect(this.masterGain);
            }

            if (i !== 2 && i !== 4) {
                gain.connect(this.reverbNode);
            }
            this.trackGains.push(gain);
            this.trackPanners.push(panner);
        }
    }

    /**
     * Create Reverb Impulse Buffer
     */
    createReverbImpulse(ctx, durationSec = 2.0, decay = 2.0) {
        const rate = ctx.sampleRate;
        const length = Math.floor(rate * durationSec);
        const impulse = ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const t = i / length;
            const factor = Math.exp(-t * decay);
            left[i] = (Math.random() * 2 - 1) * factor;
            right[i] = (Math.random() * 2 - 1) * factor;
        }
        return impulse;
    }

    midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    loadProject(project) {
        this.projectData = project;
        this.bpm = project.bpm || 120;
        this.ppq = 480;
        this.stop();
    }

    play(fromTick = null) {
        this.init();
        if (this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }

        if (fromTick !== null) {
            this.currentPlayheadTick = fromTick;
        }

        this.isPlaying = true;
        this.isPaused = false;
        this.playbackStartCtxTime = this.audioCtx.currentTime - this.ticksToSeconds(this.currentPlayheadTick);
        this.scheduledUpToTick = this.currentPlayheadTick;

        if (this.scheduleTimer) clearInterval(this.scheduleTimer);
        this.scheduleTimer = setInterval(() => this.scheduleLoop(), 25);
    }

    pause() {
        this.isPlaying = false;
        this.isPaused = true;
        if (this.scheduleTimer) clearInterval(this.scheduleTimer);
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlayheadTick = 0;
        this.scheduledUpToTick = 0;
        if (this.scheduleTimer) clearInterval(this.scheduleTimer);
        if (this.onTickCallback) this.onTickCallback(0, 0);
    }

    ticksToSeconds(ticks) {
        return ((ticks / this.ppq) * 60) / this.bpm;
    }

    secondsToTicks(seconds) {
        return (seconds * this.bpm * this.ppq) / 60;
    }

    scheduleLoop() {
        if (!this.isPlaying || !this.projectData) return;

        const currentSec = this.audioCtx.currentTime - this.playbackStartCtxTime;
        this.currentPlayheadTick = this.secondsToTicks(currentSec);

        const totalTicks = this.projectData.totalTicks || (32 * 4 * this.ppq);

        if (this.currentPlayheadTick >= totalTicks) {
            if (this.projectData.loop) {
                const loopStart = this.projectData.loopStartTick || 0;
                this.currentPlayheadTick = loopStart;
                this.playbackStartCtxTime = this.audioCtx.currentTime - this.ticksToSeconds(loopStart);
                this.scheduledUpToTick = loopStart;
            } else {
                this.stop();
                if (this.onEndCallback) this.onEndCallback();
                return;
            }
        }

        if (this.onTickCallback) {
            this.onTickCallback(this.currentPlayheadTick, currentSec);
        }

        const lookaheadSec = 0.15;
        const scheduleEndTick = this.secondsToTicks(currentSec + lookaheadSec);
        const hasSolo = this.trackSolo.some(s => s);

        this.projectData.tracks.forEach((track, trackIdx) => {
            const isAudible = hasSolo ? this.trackSolo[trackIdx] : !this.trackMuted[trackIdx];
            if (!isAudible) return;

            const notes = track.notes || [];
            const synthType = track.synthType || "lead_synth";

            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                if (note.startTick >= this.scheduledUpToTick && note.startTick < scheduleEndTick) {
                    const noteStartTime = this.playbackStartCtxTime + this.ticksToSeconds(note.startTick);
                    const noteDurSec = Math.max(0.05, this.ticksToSeconds(note.durationTicks));

                    this.dispatchVoice(this.audioCtx, trackIdx, synthType, note.pitch, noteStartTime, noteDurSec, note.velocity || 90, this.trackGains[trackIdx]);

                    if (this.onNoteTriggerCallback) {
                        this.onNoteTriggerCallback(trackIdx, note);
                    }
                }
            }
        });

        this.scheduledUpToTick = scheduleEndTick;
    }

    // =========================================================================
    // Multi-Instrument Voice Dispatcher (Supports Live & Offline Context)
    // =========================================================================
    dispatchVoice(ctx, trackIdx, synthType, pitch, startTime, duration, velocity, bus) {
        const velGain = velocity / 127;

        if (trackIdx === 4) {
            this.playDrumNote(ctx, pitch, startTime, velGain, bus);
            return;
        }

        switch (synthType) {
            case "saxophone":
                this.playSaxophone(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "flute":
            case "recorder":
            case "shakuhachi":
                this.playFlute(ctx, pitch, startTime, duration, velGain, bus, synthType);
                break;
            case "nylon_guitar":
            case "lute":
                this.playNylonGuitar(ctx, pitch, startTime, duration, velGain, bus, synthType === "lute");
                break;
            case "celtic_harp":
            case "harpsichord":
                this.playHarpOrHarpsichord(ctx, pitch, startTime, duration, velGain, bus, synthType === "harpsichord");
                break;
            case "pipe_organ":
                this.playPipeOrgan(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "rhodes":
                this.playRhodes(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "upright_bass":
                this.playUprightBass(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "slap_bass":
                this.playSlapBass(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "overdrive_guitar":
                this.playOverdriveGuitar(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "koto":
                this.playKoto(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "brass":
                this.playBrass(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "vibraphone":
            case "celesta":
                this.playBellVoice(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "piano":
                this.playPianoVoice(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "strings":
                this.playStringsVoice(ctx, pitch, startTime, duration, velGain, bus);
                break;
            case "bass_synth":
                this.playBassVoice(ctx, pitch, startTime, duration, velGain, bus);
                break;
            default:
                this.playLeadSynth(ctx, pitch, startTime, duration, velGain, bus);
                break;
        }
    }

    // --- 1. Tenor Saxophone (Rich reed harmonics + expressive vibrato) ---
    playSaxophone(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const oscHarm = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        // Vibrato LFO (Gentle delayed vibrato)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(5.0, startTime);
        lfoGain.gain.setValueAtTime(0.0001, startTime);
        lfoGain.gain.linearRampToValueAtTime(freq * 0.008, startTime + 0.15);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfoGain.connect(oscHarm.frequency);

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, startTime);

        oscHarm.type = "square";
        oscHarm.frequency.setValueAtTime(freq * 2, startTime);

        // Formant bandpass
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1400, startTime);
        filter.Q.setValueAtTime(2.5, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.30 * vel, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.22 * vel, startTime + duration * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.08);

        osc.connect(filter);
        oscHarm.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        lfo.start(startTime);
        osc.start(startTime);
        oscHarm.start(startTime);
        lfo.stop(startTime + duration + 0.1);
        osc.stop(startTime + duration + 0.1);
        oscHarm.stop(startTime + duration + 0.1);
    }

    // --- 2. Flute / Recorder / Shakuhachi ---
    playFlute(ctx, pitch, startTime, duration, vel, bus, type) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(freq * 2, startTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(type === "shakuhachi" ? 1800 : 2600, startTime);

        const attack = type === "recorder" ? 0.02 : 0.06;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.28 * vel, startTime + attack);
        gain.gain.exponentialRampToValueAtTime(0.20 * vel, startTime + duration * 0.75);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.08);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        osc2.start(startTime);
        osc.stop(startTime + duration + 0.1);
        osc2.stop(startTime + duration + 0.1);
    }

    // --- 3. Nylon Guitar / Medieval Lute ---
    playNylonGuitar(ctx, pitch, startTime, duration, vel, bus, isLute = false) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = isLute ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(freq * 2, startTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(isLute ? 3200 : 2000, startTime);
        filter.frequency.exponentialRampToValueAtTime(600, startTime + duration);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime((isLute ? 0.28 : 0.32) * vel, startTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration + 0.3, 1.8));

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        osc2.start(startTime);
        osc.stop(startTime + Math.min(duration + 0.35, 1.9));
        osc2.stop(startTime + Math.min(duration + 0.35, 1.9));
    }

    // --- 4. Celtic Harp / Harpsichord ---
    playHarpOrHarpsichord(ctx, pitch, startTime, duration, vel, bus, isHarpsi = false) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = isHarpsi ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = isHarpsi ? "bandpass" : "lowpass";
        filter.frequency.setValueAtTime(isHarpsi ? 2400 : 3600, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.26 * vel, startTime + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (isHarpsi ? 0.4 : 1.6));

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        osc.stop(startTime + (isHarpsi ? 0.45 : 1.7));
    }

    // --- 5. Cathedral Pipe Organ ---
    playPipeOrgan(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const o1 = ctx.createOscillator(); // 8' rank
        const o2 = ctx.createOscillator(); // 4' rank
        const o3 = ctx.createOscillator(); // 2' rank
        const gain = ctx.createGain();

        o1.type = "triangle";
        o1.frequency.setValueAtTime(freq, startTime);
        o2.type = "sawtooth";
        o2.frequency.setValueAtTime(freq * 2, startTime);
        o3.type = "sine";
        o3.frequency.setValueAtTime(freq * 4, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.24 * vel, startTime + 0.05);
        gain.gain.setValueAtTime(0.20 * vel, startTime + duration * 0.85);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.15);

        o1.connect(gain);
        o2.connect(gain);
        o3.connect(gain);
        gain.connect(bus);

        o1.start(startTime);
        o2.start(startTime);
        o3.start(startTime);
        o1.stop(startTime + duration + 0.18);
        o2.stop(startTime + duration + 0.18);
        o3.stop(startTime + duration + 0.18);
    }

    // --- 6. Rhodes Electric Piano ---
    playRhodes(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const oscBell = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        oscBell.type = "sine";
        oscBell.frequency.setValueAtTime(freq * 3, startTime); // Bell tine

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2200, startTime);
        filter.frequency.exponentialRampToValueAtTime(600, startTime + duration);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.30 * vel, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration + 0.5, 2.5));

        osc.connect(filter);
        oscBell.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        oscBell.start(startTime);
        osc.stop(startTime + Math.min(duration + 0.55, 2.6));
        oscBell.stop(startTime + Math.min(duration + 0.55, 2.6));
    }

    // --- 7. Upright Jazz Bass (Woody acoustic decay) ---
    playUprightBass(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq * 1.04, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.02);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, startTime);
        filter.frequency.exponentialRampToValueAtTime(220, startTime + duration);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.45 * vel, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration + 0.2, 1.4));

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        osc.stop(startTime + Math.min(duration + 0.25, 1.5));
    }

    // --- 8. Slap Bass ---
    playSlapBass(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const oscPop = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, startTime);

        oscPop.type = "triangle";
        oscPop.frequency.setValueAtTime(freq * 4, startTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3200, startTime);
        filter.frequency.exponentialRampToValueAtTime(450, startTime + 0.1);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.42 * vel, startTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration, 0.9));

        osc.connect(filter);
        oscPop.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        oscPop.start(startTime);
        osc.stop(startTime + Math.min(duration + 0.05, 0.95));
        oscPop.stop(startTime + Math.min(duration + 0.05, 0.95));
    }

    // --- 9. Overdrive Guitar ---
    playOverdriveGuitar(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2400, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.35 * vel, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.20 * vel, startTime + duration * 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
    }

    // --- 10. Koto / Shamisen ---
    playKoto(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq * 1.02, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.05);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1800, startTime);
        filter.Q.setValueAtTime(3.0, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.32 * vel, startTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        osc.stop(startTime + 1.25);
    }

    // --- 11. Brass Section (Dual oscillator warmth and fanfare attack) ---
    playBrass(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, startTime);

        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(freq * 1.002, startTime); // Rich 3.5-cent ensemble width

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, startTime);
        filter.frequency.linearRampToValueAtTime(3200, startTime + 0.06);
        filter.frequency.exponentialRampToValueAtTime(1200, startTime + duration);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.28 * vel, startTime + 0.03);
        gain.gain.setValueAtTime(0.22 * vel, startTime + duration * 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.06);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        osc2.start(startTime);
        osc.stop(startTime + duration + 0.08);
        osc2.stop(startTime + duration + 0.08);
    }

    // --- Existing Tone Synthesizers ---
    playLeadSynth(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        o1.type = "sawtooth";
        o1.frequency.setValueAtTime(freq, startTime);
        o2.type = "square";
        o2.frequency.setValueAtTime(freq * 1.0015, startTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2800, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.26 * vel, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.05);

        o1.connect(filter);
        o2.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        o1.start(startTime);
        o2.start(startTime);
        o1.stop(startTime + duration + 0.06);
        o2.stop(startTime + duration + 0.06);
    }

    playPianoVoice(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const oscH = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        oscH.type = "sine";
        oscH.frequency.setValueAtTime(freq * 2, startTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2600, startTime);
        filter.frequency.exponentialRampToValueAtTime(600, startTime + duration);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.25 * vel, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration + 0.4, 2.0));

        osc.connect(filter);
        oscH.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        oscH.start(startTime);
        osc.stop(startTime + Math.min(duration + 0.45, 2.1));
        oscH.stop(startTime + Math.min(duration + 0.45, 2.1));
    }

    playStringsVoice(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        o1.type = "sawtooth";
        o1.frequency.setValueAtTime(freq, startTime);
        o2.type = "sawtooth";
        o2.frequency.setValueAtTime(freq * 1.002, startTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1600, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.22 * vel, startTime + 0.08);
        gain.gain.setValueAtTime(0.18 * vel, startTime + duration * 0.85);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.15);

        o1.connect(filter);
        o2.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        o1.start(startTime);
        o2.start(startTime);
        o1.stop(startTime + duration + 0.18);
        o2.stop(startTime + duration + 0.18);
    }

    playBassVoice(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq * 1.4, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.03);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.40 * vel, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.05);

        osc.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.06);
    }

    playBellVoice(ctx, pitch, startTime, duration, vel, bus) {
        const freq = this.midiToFreq(pitch);
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(freq * 2, startTime);
        filter.Q.setValueAtTime(4.0, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.26 * vel, startTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.45);
    }

    // --- Drum Synthesizer (Includes Rimshot, Shaker, Ride, etc.) ---
    playDrumNote(ctx, pitch, startTime, vel, bus) {
        // Kick
        if (pitch === 35 || pitch === 36) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(155, startTime);
            osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.09);
            gain.gain.setValueAtTime(0.85 * vel, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
            osc.connect(gain);
            gain.connect(bus);
            osc.start(startTime);
            osc.stop(startTime + 0.30);
            return;
        }

        // Snare
        if (pitch === 38 || pitch === 40) {
            const bufferSize = ctx.sampleRate * 0.18;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = "highpass";
            filter.frequency.setValueAtTime(1000, startTime);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.55 * vel, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(bus);
            noise.start(startTime);
            noise.stop(startTime + 0.2);
            return;
        }

        // Rimshot / Clave (Pitch 37)
        if (pitch === 37) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1200, startTime);
            gain.gain.setValueAtTime(0.6 * vel, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
            osc.connect(gain);
            gain.connect(bus);
            osc.start(startTime);
            osc.stop(startTime + 0.05);
            return;
        }

        // Closed Hi-Hat (42) / Shaker (70)
        if (pitch === 42 || pitch === 44 || pitch === 70) {
            const isShaker = (pitch === 70);
            const dur = isShaker ? 0.08 : 0.05;
            const bufferSize = ctx.sampleRate * dur;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = "highpass";
            filter.frequency.setValueAtTime(isShaker ? 6000 : 7500, startTime);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.35 * vel, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(bus);
            noise.start(startTime);
            noise.stop(startTime + dur + 0.02);
            return;
        }

        // Open Hi-Hat (46), Crash (49), Ride (51)
        if (pitch === 46 || pitch === 49 || pitch === 51) {
            const isCrash = (pitch === 49);
            const dur = isCrash ? 1.4 : (pitch === 51 ? 0.8 : 0.45);
            const bufferSize = ctx.sampleRate * dur;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = "highpass";
            filter.frequency.setValueAtTime(isCrash ? 5000 : (pitch === 51 ? 4000 : 7000), startTime);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime((isCrash ? 0.65 : 0.35) * vel, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(bus);
            noise.start(startTime);
            noise.stop(startTime + dur + 0.05);
            return;
        }

        // Toms (45, 47, 48, 50)
        const tomFreq = pitch === 50 ? 160 : (pitch === 47 ? 130 : 95);
        const tomOsc = ctx.createOscillator();
        const tomGain = ctx.createGain();
        tomOsc.type = "sine";
        tomOsc.frequency.setValueAtTime(tomFreq * 1.4, startTime);
        tomOsc.frequency.exponentialRampToValueAtTime(tomFreq, startTime + 0.12);
        tomGain.gain.setValueAtTime(0.55 * vel, startTime);
        tomGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
        tomOsc.connect(tomGain);
        tomGain.connect(bus);
        tomOsc.start(startTime);
        tomOsc.stop(startTime + 0.25);
    }

    setTrackVolume(trackIdx, val) {
        if (this.trackGains[trackIdx]) {
            this.trackGains[trackIdx].gain.setValueAtTime(val, this.audioCtx ? this.audioCtx.currentTime : 0);
        }
    }

    setTrackMute(trackIdx, isMuted) {
        this.trackMuted[trackIdx] = isMuted;
    }

    setTrackSolo(trackIdx, isSolo) {
        this.trackSolo[trackIdx] = isSolo;
    }

    setMasterVolume(val) {
        if (this.masterGain && this.audioCtx) {
            this.masterGain.gain.setValueAtTime(val, this.audioCtx.currentTime);
        }
    }

    // =========================================================================
    // High-Speed Offline Audio Rendering (WAV Export)
    // =========================================================================
    async renderWav(projectData, onProgress = null) {
        const sampleRate = 44100;
        const totalDurationSec = Math.max(1, projectData.totalDurationSec || 60);
        const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * (totalDurationSec + 2)), sampleRate);

        // Offline Routing
        const comp = offlineCtx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-14, 0);
        comp.ratio.setValueAtTime(8, 0);

        const master = offlineCtx.createGain();
        master.gain.setValueAtTime(0.88, 0);

        const rev = offlineCtx.createConvolver();
        rev.buffer = this.createReverbImpulse(offlineCtx, 1.8, 2.0);
        const revGain = offlineCtx.createGain();
        revGain.gain.setValueAtTime(0.22, 0);

        master.connect(comp);
        rev.connect(revGain);
        revGain.connect(comp);
        comp.connect(offlineCtx.destination);

        const bpm = projectData.bpm || 120;
        const ppq = 480;

        projectData.tracks.forEach((track, trackIdx) => {
            const trackGain = offlineCtx.createGain();
            trackGain.gain.setValueAtTime(1.0, 0);
            trackGain.connect(master);
            if (trackIdx !== 2 && trackIdx !== 4) trackGain.connect(rev);

            const synthType = track.synthType || "lead_synth";
            const notes = track.notes || [];

            notes.forEach(n => {
                const startTime = ((n.startTick / ppq) * 60) / bpm;
                const dur = Math.max(0.05, ((n.durationTicks / ppq) * 60) / bpm);
                this.dispatchVoice(offlineCtx, trackIdx, synthType, n.pitch, startTime, dur, n.velocity || 90, trackGain);
            });
        });

        if (onProgress) onProgress("Rendering audio waveforms...");
        const audioBuffer = await offlineCtx.startRendering();

        if (onProgress) onProgress("Encoding 16-bit PCM WAV...");
        return this.audioBufferToWav(audioBuffer);
    }

    /**
     * Convert Web Audio AudioBuffer to 16-bit PCM WAV byte array
     */
    audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;

        const left = buffer.getChannelData(0);
        const right = numChannels > 1 ? buffer.getChannelData(1) : left;
        const numSamples = left.length;
        const dataLength = numSamples * blockAlign;
        const bufferLength = 44 + dataLength;

        const arrayBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(arrayBuffer);

        // RIFF chunk descriptor
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        this.writeString(view, 8, 'WAVE');

        // FMT sub-chunk
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // SubChunk1Size
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);

        // DATA sub-chunk
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        // Write interleaved 16-bit PCM samples
        let offset = 44;
        for (let i = 0; i < numSamples; i++) {
            let sL = Math.max(-1, Math.min(1, left[i]));
            view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
            offset += 2;

            if (numChannels > 1) {
                let sR = Math.max(-1, Math.min(1, right[i]));
                view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Uint8Array(arrayBuffer);
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

if (typeof window !== "undefined") {
    window.WebSynth = WebSynth;
}
if (typeof module !== "undefined") {
    module.exports = WebSynth;
}
