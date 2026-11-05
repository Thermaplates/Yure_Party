/**
 * MidiSuno Studio v4.5 - Main Application Controller
 * Handles Suno v4.5 Composer DNA generation, MIDI Reference Cloning,
 * custom instrument selection, real-time canvas visualizer,
 * and high-fidelity OGG / M4A / MIDI export for RPG Maker.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Core Engine Instances
    const engine = new MusicEngine();
    const synth = new WebSynth();
    const writer = new MidiWriter(480);

    // Current State
    let currentProject = null;
    let activeNotesMap = new Set();
    let currentMidiDNA = null;

    // DOM Elements
    const promptInput = document.getElementById("promptInput");
    const inputSongName = document.getElementById("inputSongName");
    const btnGenerate = document.getElementById("btnGenerate");
    const btnRandom = document.getElementById("btnRandom");
    const presetTags = document.querySelectorAll(".preset-tag");

    const selectKey = document.getElementById("selectKey");
    const selectScale = document.getElementById("selectScale");
    const sliderBpm = document.getElementById("sliderBpm");
    const valBpm = document.getElementById("valBpm");
    const selectBars = document.getElementById("selectBars");
    const checkLoop = document.getElementById("checkLoop");

    const badgeStatus = document.getElementById("badgeStatus");
    const badgeBpm = document.getElementById("badgeBpm");
    const badgeKey = document.getElementById("badgeKey");
    const badgeDuration = document.getElementById("badgeDuration");

    // Cloner & Reference Elements
    const midiDropzone = document.getElementById("midiDropzone");
    const fileMidiInput = document.getElementById("fileMidiInput");
    const btnBrowseMidi = document.getElementById("btnBrowseMidi");
    const clonerResult = document.getElementById("clonerResult");
    const btnCloneGenerate = document.getElementById("btnCloneGenerate");
    const dnaBpm = document.getElementById("dnaBpm");
    const dnaKey = document.getElementById("dnaKey");
    const dnaTracks = document.getElementById("dnaTracks");
    const dnaNotes = document.getElementById("dnaNotes");

    // Arranger / Piano Roll
    const canvas = document.getElementById("pianoRollCanvas");
    const canvasWrapper = document.getElementById("canvasWrapper");
    const ctx = canvas.getContext("2d");
    const currentBarLabel = document.getElementById("currentBarLabel");
    const totalBarsLabel = document.getElementById("totalBarsLabel");

    // Transport
    const btnPlayHero = document.getElementById("btnPlayHero");
    const btnStop = document.getElementById("btnStop");
    const timecodeCurrent = document.getElementById("timecodeCurrent");
    const timecodeTotal = document.getElementById("timecodeTotal");
    const seekProgress = document.getElementById("seekProgress");
    const masterVolume = document.getElementById("masterVolume");

    // Export Buttons
    const btnSaveGame = document.getElementById("btnSaveGame");
    const btnExportOgg = document.getElementById("btnExportOgg");
    const btnExportM4a = document.getElementById("btnExportM4a");
    const btnDownloadMidi = document.getElementById("btnDownloadMidi");

    // Modal
    const renderModal = document.getElementById("renderModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");

    // Tabs
    const tabMixerBtn = document.getElementById("tabMixerBtn");
    const tabLyricsBtn = document.getElementById("tabLyricsBtn");
    const tabMixer = document.getElementById("tabMixer");
    const tabLyrics = document.getElementById("tabLyrics");
    const lyricsBox = document.getElementById("lyricsBox");

    // Track Instrument Selectors
    const trackInstSelectors = document.querySelectorAll(".track-inst-select");
    const selectDrumStyle = document.getElementById("selectDrumStyle");

    // Track Colors
    const trackColors = [
        { fill: "#f59e0b", glow: "rgba(245, 158, 11, 0.7)" }, // Melody
        { fill: "#a855f7", glow: "rgba(168, 85, 247, 0.7)" }, // Harmony
        { fill: "#06b6d4", glow: "rgba(6, 182, 212, 0.7)" }, // Bass
        { fill: "#10b981", glow: "rgba(16, 185, 129, 0.7)" }, // Arp
        { fill: "#f43f5e", glow: "rgba(244, 63, 94, 0.7)" }  // Drums
    ];

    function resizeCanvas() {
        const rect = canvasWrapper.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        drawPianoRoll();
    }
    window.addEventListener("resize", resizeCanvas);

    function showToast(message, icon = "✨") {
        let container = document.querySelector(".toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(100%)";
            toast.style.transition = "all 0.3s";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function getSafeSongName() {
        let name = inputSongName.value.trim().replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
        if (!name) name = "MidiSuno_BGM";
        return name;
    }

    // -------------------------------------------------------------
    // Music Generation Handler (Suno v4.5 Architecture)
    // -------------------------------------------------------------
    function generateSong(autoPlay = false) {
        const prompt = promptInput.value.trim() || "Nobuo Uematsu Epic Orchestral";
        const key = selectKey.value;
        const scale = selectScale.value;
        const bpm = parseInt(sliderBpm.value, 10);
        const bars = parseInt(selectBars.value, 10);
        const loop = checkLoop.checked;

        badgeStatus.innerHTML = `<span class="status-dot" style="background:#f59e0b; box-shadow:0 0 10px #f59e0b"></span> Composing v4.5...`;

        const customMelodySynth = trackInstSelectors[0] ? trackInstSelectors[0].value : null;
        const customHarmonySynth = trackInstSelectors[1] ? trackInstSelectors[1].value : null;
        const customBassSynth = trackInstSelectors[2] ? trackInstSelectors[2].value : null;
        const customArpSynth = trackInstSelectors[3] ? trackInstSelectors[3].value : null;
        const customDrumStyle = selectDrumStyle ? selectDrumStyle.value : null;

        currentProject = engine.generateSong({
            prompt: prompt,
            key: key,
            scale: scale,
            bpm: bpm,
            bars: bars,
            loop: loop,
            melodySynthType: customMelodySynth,
            harmonySynthType: customHarmonySynth,
            bassSynthType: customBassSynth,
            arpSynthType: customArpSynth,
            drumStyle: customDrumStyle
        });

        syncMixerDropdownsWithProject();
        synth.loadProject(currentProject);

        badgeStatus.innerHTML = `<span class="status-dot"></span> Ready (v4.5)`;
        badgeBpm.textContent = `${currentProject.bpm} BPM`;
        badgeKey.textContent = `${currentProject.key} ${currentProject.scale.toUpperCase()}`;
        badgeDuration.textContent = formatTime(currentProject.totalDurationSec);
        totalBarsLabel.textContent = `Bars: ${currentProject.totalBars}`;
        timecodeTotal.textContent = formatTime(currentProject.totalDurationSec);

        lyricsBox.textContent = currentProject.lyrics;

        if (inputSongName.value === "Nobuo_Boss_DMin" || inputSongName.value === "") {
            const prefix = currentProject.genre.replace(/[^a-zA-Z0-9]/g, "_");
            inputSongName.value = `${prefix}_${currentProject.key}`;
        }

        drawPianoRoll();
        showToast(`Composed "${currentProject.title}" (Suno v4.5)!`, "⚡");

        if (autoPlay) {
            startPlayback();
        }
    }

    function syncMixerDropdownsWithProject() {
        if (!currentProject) return;
        currentProject.tracks.forEach((track, i) => {
            const select = document.querySelector(`.track-inst-select[data-track="${i}"]`);
            if (select && track.synthType) {
                select.value = track.synthType;
            }
        });
        if (selectDrumStyle && currentProject.tracks[4]) {
            selectDrumStyle.value = currentProject.tracks[4].drumStyle;
        }
    }

    trackInstSelectors.forEach(select => {
        select.addEventListener("change", (e) => {
            const trackIdx = parseInt(e.target.getAttribute("data-track"), 10);
            if (currentProject && currentProject.tracks[trackIdx]) {
                currentProject.tracks[trackIdx].synthType = e.target.value;
                showToast(`Track ${trackIdx + 1} changed to ${e.target.options[e.target.selectedIndex].text}`, "🎛️");
            }
        });
    });

    selectDrumStyle.addEventListener("change", () => {
        if (currentProject) {
            generateSong(synth.isPlaying);
        }
    });

    // -------------------------------------------------------------
    // MIDI Style Cloner & File Dropzone
    // -------------------------------------------------------------
    btnBrowseMidi.addEventListener("click", () => fileMidiInput.click());

    midiDropzone.addEventListener("click", (e) => {
        if (e.target !== btnBrowseMidi) fileMidiInput.click();
    });

    midiDropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        midiDropzone.classList.add("dragover");
    });

    midiDropzone.addEventListener("dragleave", () => {
        midiDropzone.classList.remove("dragover");
    });

    midiDropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        midiDropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleMidiFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileMidiInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleMidiFileUpload(e.target.files[0]);
        }
    });

    function handleMidiFileUpload(file) {
        if (!file.name.toLowerCase().endsWith(".mid") && !file.name.toLowerCase().endsWith(".midi")) {
            showToast("Please upload a standard .mid or .midi file!", "⚠️");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target.result;
                currentMidiDNA = MidiParser.parse(arrayBuffer);

                dnaBpm.textContent = `${currentMidiDNA.bpm} BPM`;
                dnaKey.textContent = `${currentMidiDNA.key} ${currentMidiDNA.scale.toUpperCase()}`;
                dnaTracks.textContent = `${currentMidiDNA.tracks.length} tracks`;
                dnaNotes.textContent = `${currentMidiDNA.totalNotes} notes`;

                clonerResult.style.display = "flex";
                showToast(`DNA Extracted from "${file.name}"!`, "🧬");

                // Auto update UI controls
                selectKey.value = currentMidiDNA.key;
                selectScale.value = currentMidiDNA.scale;
                sliderBpm.value = currentMidiDNA.bpm;
                valBpm.textContent = `${currentMidiDNA.bpm} BPM`;

                const baseClean = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
                inputSongName.value = `Inspired_${baseClean}`;
            } catch (err) {
                console.error("MIDI Parse Error:", err);
                showToast(`Could not parse MIDI: ${err.message}`, "❌");
            }
        };
        reader.readAsArrayBuffer(file);
    }

    btnCloneGenerate.addEventListener("click", () => {
        if (!currentMidiDNA) return;

        badgeStatus.innerHTML = `<span class="status-dot" style="background:#06b6d4"></span> Cloning DNA...`;
        currentProject = engine.generateFromMidiDNA(currentMidiDNA, promptInput.value);

        syncMixerDropdownsWithProject();
        synth.loadProject(currentProject);

        badgeStatus.innerHTML = `<span class="status-dot"></span> Ready (Cloned)`;
        badgeBpm.textContent = `${currentProject.bpm} BPM`;
        badgeKey.textContent = `${currentProject.key} ${currentProject.scale.toUpperCase()}`;
        badgeDuration.textContent = formatTime(currentProject.totalDurationSec);
        totalBarsLabel.textContent = `Bars: ${currentProject.totalBars}`;
        timecodeTotal.textContent = formatTime(currentProject.totalDurationSec);

        lyricsBox.textContent = currentProject.lyrics;
        drawPianoRoll();

        showToast(`Generated original track inspired by MIDI reference!`, "✨");
        startPlayback();
    });

    // -------------------------------------------------------------
    // Piano Roll Canvas Drawing
    // -------------------------------------------------------------
    function drawPianoRoll() {
        if (!currentProject) {
            const rect = canvasWrapper.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);
            ctx.fillStyle = "#0c111c";
            ctx.fillRect(0, 0, rect.width, rect.height);
            ctx.fillStyle = "#334155";
            ctx.font = "14px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Click 'Generate Suno v4.5' to compose and view multi-track arrangement", rect.width / 2, rect.height / 2);
            return;
        }

        const rect = canvasWrapper.getBoundingClientRect();
        const W = rect.width;
        const H = rect.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, W, H);

        const totalTicks = currentProject.totalTicks;
        const totalBars = currentProject.totalBars;
        const ticksPerBar = totalTicks / totalBars;

        // Draw Section Dividers & Bar Lines
        for (let b = 0; b <= totalBars; b++) {
            const x = (b * ticksPerBar / totalTicks) * W;
            ctx.strokeStyle = (b % 4 === 0) ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.04)";
            ctx.lineWidth = (b % 4 === 0) ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();

            // Section labels on timeline (Intro, Verse, Pre, Chorus, Drop)
            if (b < totalBars) {
                if (b === 0) drawSectionTag(x, "INTRO", "#64748b");
                else if (b === 4) drawSectionTag(x, "VERSE", "#3b82f6");
                else if (b === 12) drawSectionTag(x, "BUILD", "#f59e0b");
                else if (b === 16) drawSectionTag(x, "CHORUS DROP", "#ec4899");
                else if (b === 24) drawSectionTag(x, "BRIDGE", "#a855f7");
                else if (b === 28) drawSectionTag(x, "CLIMAX", "#ef4444");
            }
        }

        function drawSectionTag(x, label, color) {
            ctx.fillStyle = color;
            ctx.font = "bold 9px 'JetBrains Mono', monospace";
            ctx.textAlign = "left";
            ctx.fillText(label, x + 4, 13);
        }

        // Loop Marker
        if (currentProject.loop) {
            const loopStartX = (currentProject.loopStartTick / totalTicks) * W;
            const loopEndX = ((currentProject.loopStartTick + currentProject.loopLengthTicks) / totalTicks) * W;

            ctx.fillStyle = "rgba(99, 102, 241, 0.07)";
            ctx.fillRect(loopStartX, 0, loopEndX - loopStartX, H);

            ctx.strokeStyle = "#6366f1";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(loopStartX, 0);
            ctx.lineTo(loopStartX, H);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        const minPitch = 30;
        const maxPitch = 92;
        const pitchSpan = maxPitch - minPitch;

        // Draw Notes
        currentProject.tracks.forEach((track, trackIdx) => {
            const colors = trackColors[trackIdx] || trackColors[0];
            const notes = track.notes || [];

            notes.forEach(n => {
                const x = (n.startTick / totalTicks) * W;
                const noteW = Math.max(3, (n.durationTicks / totalTicks) * W - 1);
                const normY = 1 - ((n.pitch - minPitch) / pitchSpan);
                const y = Math.max(22, Math.min(H - 12, normY * (H - 34) + 17));
                const noteH = (trackIdx === 4) ? 4 : 6;

                const isActive = activeNotesMap.has(`${trackIdx}_${n.pitch}`);
                if (isActive) {
                    ctx.shadowColor = colors.fill;
                    ctx.shadowBlur = 12;
                    ctx.fillStyle = "#ffffff";
                } else {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = colors.fill;
                }

                ctx.beginPath();
                ctx.roundRect(x, y - noteH / 2, noteW, noteH, 2);
                ctx.fill();
            });
        });
        ctx.shadowBlur = 0;

        // Playhead
        const playheadX = (synth.currentPlayheadTick / totalTicks) * W;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, H);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(playheadX - 6, 0);
        ctx.lineTo(playheadX + 6, 0);
        ctx.lineTo(playheadX, 10);
        ctx.closePath();
        ctx.fill();
    }

    canvasWrapper.addEventListener("click", (e) => {
        if (!currentProject) return;
        const rect = canvasWrapper.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        const targetTick = ratio * currentProject.totalTicks;

        synth.currentPlayheadTick = targetTick;
        if (synth.isPlaying) {
            synth.play(targetTick);
        } else {
            drawPianoRoll();
            timecodeCurrent.textContent = formatTime(synth.ticksToSeconds(targetTick));
            seekProgress.value = (ratio * 100).toFixed(1);
        }
    });

    // -------------------------------------------------------------
    // Synthesizer Hooks & Transport
    // -------------------------------------------------------------
    synth.onTickCallback = (currentTick, currentSec) => {
        if (!currentProject) return;
        const totalTicks = currentProject.totalTicks;
        const ratio = Math.min(1, currentTick / totalTicks);

        timecodeCurrent.textContent = formatTime(currentSec);
        seekProgress.value = (ratio * 100).toFixed(1);

        const ticksPerBar = totalTicks / currentProject.totalBars;
        const barNumber = Math.min(currentProject.totalBars, Math.floor(currentTick / ticksPerBar) + 1);
        currentBarLabel.textContent = `Bar: ${barNumber} / ${currentProject.totalBars}`;

        drawPianoRoll();
    };

    synth.onNoteTriggerCallback = (trackIdx, note) => {
        const key = `${trackIdx}_${note.pitch}`;
        activeNotesMap.add(key);
        setTimeout(() => activeNotesMap.delete(key), 120);
    };

    synth.onEndCallback = () => {
        btnPlayHero.innerHTML = "▶";
        showToast("Playback finished", "⏹️");
    };

    function startPlayback() {
        if (!currentProject) {
            generateSong(true);
            return;
        }
        synth.play();
        btnPlayHero.innerHTML = "⏸";
    }

    function pausePlayback() {
        synth.pause();
        btnPlayHero.innerHTML = "▶";
    }

    function togglePlayback() {
        if (synth.isPlaying) pausePlayback();
        else startPlayback();
    }

    btnPlayHero.addEventListener("click", togglePlayback);

    btnStop.addEventListener("click", () => {
        synth.stop();
        btnPlayHero.innerHTML = "▶";
        timecodeCurrent.textContent = "00:00";
        seekProgress.value = 0;
        currentBarLabel.textContent = "Bar: 1 / --";
        drawPianoRoll();
    });

    window.addEventListener("keydown", (e) => {
        if (e.code === "Space" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "INPUT") {
            e.preventDefault();
            togglePlayback();
        }
    });

    seekProgress.addEventListener("input", (e) => {
        if (!currentProject) return;
        const ratio = parseFloat(e.target.value) / 100;
        const targetTick = ratio * currentProject.totalTicks;
        synth.currentPlayheadTick = targetTick;

        if (synth.isPlaying) {
            synth.play(targetTick);
        } else {
            drawPianoRoll();
            timecodeCurrent.textContent = formatTime(synth.ticksToSeconds(targetTick));
        }
    });

    masterVolume.addEventListener("input", (e) => {
        synth.setMasterVolume(parseFloat(e.target.value));
    });

    sliderBpm.addEventListener("input", (e) => {
        valBpm.textContent = `${e.target.value} BPM`;
        if (currentProject) {
            currentProject.bpm = parseInt(e.target.value, 10);
            synth.bpm = currentProject.bpm;
            badgeBpm.textContent = `${synth.bpm} BPM`;
        }
    });

    // Preset Tags
    presetTags.forEach(tag => {
        tag.addEventListener("click", () => {
            presetTags.forEach(t => t.classList.remove("active"));
            tag.classList.add("active");

            const presetKey = tag.getAttribute("data-preset");
            const preset = engine.genrePresets[presetKey];
            if (preset) {
                promptInput.value = tag.getAttribute("data-prompt") || preset.name;
                selectKey.value = preset.key;
                selectScale.value = preset.scale;
                sliderBpm.value = preset.bpm;
                valBpm.textContent = `${preset.bpm} BPM`;

                generateSong(true);
            }
        });
    });

    // Random Prompt generator
    const randomPrompts = [
        "Nobuo Uematsu Final Fantasy epic dramatic battle with brass fanfare and string runs in D minor",
        "Shoji Meguro Persona 5 acid jazz funk with tenor saxophone solo and slap bass in E dorian",
        "Toby Fox Undertale battle theme with overdrive guitar, driving 16th bass, and rock kit in D minor",
        "Joe Hisaishi Studio Ghibli emotional acoustic piano and concert flute waltz in F major",
        "Yu-Peng Chen Genshin asian orchestral fusion with shakuhachi and koto in A minor",
        "Keiichi Okabe NieR Automata haunting acoustic guitar and crystal celtic harp in C dorian",
        "ZUN Touhou romantic fast trumpet lead with cascading piano arpeggios in D minor",
        "Yasunori Mitsuda Chrono Celtic folk with wooden recorder and renaissance lute in G dorian"
    ];

    btnRandom.addEventListener("click", () => {
        const rand = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
        promptInput.value = rand;
        const parsed = engine.parsePrompt(rand);
        selectKey.value = parsed.key;
        selectScale.value = parsed.scale;
        sliderBpm.value = parsed.bpm;
        valBpm.textContent = `${parsed.bpm} BPM`;

        generateSong(true);
    });

    btnGenerate.addEventListener("click", () => {
        generateSong(true);
    });

    // Mixer Strips Controls
    for (let i = 0; i < 5; i++) {
        const strip = document.querySelector(`.mixer-strip.track-${i}`);
        if (!strip) continue;

        const volSlider = strip.querySelector(".track-vol");
        const volVal = strip.querySelector(".strip-vol-val");
        const btnMute = strip.querySelector(".btn-mute");
        const btnSolo = strip.querySelector(".btn-solo");

        volSlider.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            volVal.textContent = `${Math.round(val * 100)}%`;
            synth.setTrackVolume(i, val);
        });

        btnMute.addEventListener("click", () => {
            btnMute.classList.toggle("active");
            synth.setTrackMute(i, btnMute.classList.contains("active"));
        });

        btnSolo.addEventListener("click", () => {
            btnSolo.classList.toggle("active");
            synth.setTrackSolo(i, btnSolo.classList.contains("active"));
        });
    }

    tabMixerBtn.addEventListener("click", () => {
        tabMixerBtn.classList.add("active");
        tabLyricsBtn.classList.remove("active");
        tabMixer.style.display = "block";
        tabLyrics.style.display = "none";
    });

    tabLyricsBtn.addEventListener("click", () => {
        tabLyricsBtn.classList.add("active");
        tabMixerBtn.classList.remove("active");
        tabMixer.style.display = "none";
        tabLyrics.style.display = "block";
    });

    // -------------------------------------------------------------
    // Audio Export Pipeline (OGG, M4A, MIDI)
    // -------------------------------------------------------------
    function showModal(title, desc) {
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        renderModal.style.display = "flex";
    }

    function hideModal() {
        renderModal.style.display = "none";
    }

    // 1. SAVE TO GAME BGM (Saves OGG + M4A + MID directly into audio/bgm/ & exports/)
    btnSaveGame.addEventListener("click", async () => {
        if (!currentProject) return showToast("Generate a song first!", "⚠️");
        const songName = getSafeSongName();
        showModal("Rendering Suno v4.5 BGM...", "Generating studio-grade 44.1kHz audio waveforms...");

        try {
            const wavBytes = await synth.renderWav(currentProject, (msg) => {
                modalDesc.textContent = msg;
            });

            modalDesc.textContent = "Encoding MIDI and loop markers...";
            const midiBytes = writer.buildMidi(currentProject);

            modalDesc.textContent = "Converting to .OGG (Vorbis Loop) & .M4A (AAC 192k)...";
            const res = await fetch("/api/save-game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    song_name: songName,
                    wav_bytes: Array.from(wavBytes),
                    midi_bytes: Array.from(midiBytes),
                    loop_start_sec: currentProject.loopStartSec,
                    loop_length_sec: currentProject.loopLengthSec
                })
            });

            hideModal();

            if (res.ok) {
                showToast(`Saved ${songName}.ogg & ${songName}.m4a to audio/bgm/!`, "🎉");
            } else {
                const err = await res.json();
                showToast(`Conversion error: ${err.error}`, "❌");
            }
        } catch (e) {
            hideModal();
            console.error(e);
            showToast(`Save failed: Please ensure server.py is running!`, "⚠️");
        }
    });

    // 2. EXPORT OGG
    btnExportOgg.addEventListener("click", async () => {
        if (!currentProject) return showToast("Generate a song first!", "⚠️");
        const songName = getSafeSongName();

        showModal("Exporting OGG...", "Rendering audio waveforms & Vorbis encoding...");
        try {
            const wavBytes = await synth.renderWav(currentProject);
            const res = await fetch("/api/convert-audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    format: "ogg",
                    song_name: songName,
                    wav_bytes: Array.from(wavBytes)
                })
            });

            hideModal();

            if (res.ok) {
                const blob = await res.blob();
                downloadBlob(blob, `${songName}.ogg`);
                showToast(`Downloaded ${songName}.ogg!`, "🎵");
            } else {
                showToast("Conversion error. Is server.py active?", "❌");
            }
        } catch (e) {
            hideModal();
            showToast("Export failed. Please check server.py", "⚠️");
        }
    });

    // 3. EXPORT M4A
    btnExportM4a.addEventListener("click", async () => {
        if (!currentProject) return showToast("Generate a song first!", "⚠️");
        const songName = getSafeSongName();

        showModal("Exporting M4A...", "Rendering audio waveforms & AAC encoding...");
        try {
            const wavBytes = await synth.renderWav(currentProject);
            const res = await fetch("/api/convert-audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    format: "m4a",
                    song_name: songName,
                    wav_bytes: Array.from(wavBytes)
                })
            });

            hideModal();

            if (res.ok) {
                const blob = await res.blob();
                downloadBlob(blob, `${songName}.m4a`);
                showToast(`Downloaded ${songName}.m4a!`, "🎧");
            } else {
                showToast("Conversion error. Is server.py active?", "❌");
            }
        } catch (e) {
            hideModal();
            showToast("Export failed. Please check server.py", "⚠️");
        }
    });

    // 4. DOWNLOAD MIDI (.mid)
    btnDownloadMidi.addEventListener("click", () => {
        if (!currentProject) return showToast("Generate a song first!", "⚠️");
        const songName = getSafeSongName();
        const uint8Array = writer.buildMidi(currentProject);
        MidiWriter.downloadMidi(uint8Array, `${songName}.mid`);
        showToast(`Downloaded ${songName}.mid!`, "💾");
    });

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // -------------------------------------------------------------
    // Internet Music Knowledge Base & Web MIDI Fetcher
    // -------------------------------------------------------------
    const inputWebMidiUrl = document.getElementById("inputWebMidiUrl");
    const btnFetchWebMidi = document.getElementById("btnFetchWebMidi");
    const inputSearchKnowledge = document.getElementById("inputSearchKnowledge");
    const knowledgeCatTags = document.querySelectorAll(".kb-cat-tag");
    const knowledgeGrid = document.getElementById("knowledgeGrid");

    let currentKnowledgeCat = "all";
    let currentKnowledgeSearch = "";

    function renderKnowledgeCatalog() {
        if (typeof InternetMusicKnowledge === "undefined" || !knowledgeGrid) return;

        let items = InternetMusicKnowledge.catalog;

        // Filter by Category
        if (currentKnowledgeCat !== "all") {
            items = items.filter(item => item.category === currentKnowledgeCat);
        }

        // Filter by Search Query
        if (currentKnowledgeSearch.trim() !== "") {
            const q = currentKnowledgeSearch.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.artist.toLowerCase().includes(q) ||
                item.prompt.toLowerCase().includes(q)
            );
        }

        knowledgeGrid.innerHTML = "";

        if (items.length === 0) {
            knowledgeGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 1.5rem;">Tidak ditemukan lagu yang cocok dengan pencarian "${currentKnowledgeSearch}".</div>`;
            return;
        }

        items.forEach(song => {
            const card = document.createElement("div");
            card.className = "kb-song-card";
            card.innerHTML = `
                <div class="kb-card-top">
                    <div class="kb-song-title">${song.title}</div>
                    <div class="kb-song-artist">${song.artist}</div>
                </div>
                <div class="kb-card-meta">
                    <span class="kb-meta-pill highlight">${song.bpm} BPM</span>
                    <span class="kb-meta-pill">${song.key} ${song.scale.toUpperCase()}</span>
                    <span class="kb-meta-pill">${song.timeSig ? song.timeSig[0] + '/' + song.timeSig[1] : '4/4'}</span>
                </div>
                <button class="btn-learn-song" data-id="${song.id}">
                    ✨ Pelajari & Buat Lagu Terinspirasi
                </button>
            `;

            card.querySelector(".btn-learn-song").addEventListener("click", () => {
                applyLearnedSong(song);
            });

            knowledgeGrid.appendChild(card);
        });
    }

    function applyLearnedSong(song) {
        promptInput.value = `Inspired by ${song.title} (${song.artist}): ${song.prompt}`;
        selectKey.value = song.key;
        selectScale.value = song.scale;
        sliderBpm.value = song.bpm;
        valBpm.textContent = `${song.bpm} BPM`;

        // Update song filename suggestion
        const cleanName = song.title.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").slice(0, 24);
        inputSongName.value = `Inspired_${cleanName}`;

        badgeStatus.innerHTML = `<span class="status-dot" style="background:#8b5cf6"></span> Learning DNA...`;

        // Generate song using the authentic progression & orchestration
        currentProject = engine.generateSong({
            prompt: promptInput.value,
            key: song.key,
            scale: song.scale,
            bpm: song.bpm,
            progression: song.progression,
            melodySynthType: song.instruments.melody,
            harmonySynthType: song.instruments.harmony,
            bassSynthType: song.instruments.bass,
            arpSynthType: song.instruments.arp,
            drumStyle: song.instruments.drums,
            bars: 32,
            loop: true
        });

        syncMixerDropdownsWithProject();
        synth.loadProject(currentProject);

        badgeStatus.innerHTML = `<span class="status-dot"></span> Ready (Learned)`;
        badgeBpm.textContent = `${currentProject.bpm} BPM`;
        badgeKey.textContent = `${currentProject.key} ${currentProject.scale.toUpperCase()}`;
        badgeDuration.textContent = formatTime(currentProject.totalDurationSec);
        totalBarsLabel.textContent = `Bars: ${currentProject.totalBars}`;
        timecodeTotal.textContent = formatTime(currentProject.totalDurationSec);

        lyricsBox.textContent = currentProject.lyrics;
        drawPianoRoll();

        showToast(`AI berhasil mempelajari "${song.title}" dan menciptakan lagu orisinal baru!`, "🎓");
        startPlayback();
    }

    // Category Click Handlers
    knowledgeCatTags.forEach(tag => {
        tag.addEventListener("click", () => {
            knowledgeCatTags.forEach(t => t.classList.remove("active"));
            tag.classList.add("active");
            currentKnowledgeCat = tag.getAttribute("data-cat");
            renderKnowledgeCatalog();
        });
    });

    // Search Input Handler
    inputSearchKnowledge.addEventListener("input", (e) => {
        currentKnowledgeSearch = e.target.value;
        renderKnowledgeCatalog();
    });

    // Fetch and Learn Online MIDI from URL
    btnFetchWebMidi.addEventListener("click", async () => {
        const url = inputWebMidiUrl.value.trim();
        if (!url) {
            showToast("Masukkan link URL file .mid dari internet terlebih dahulu!", "⚠️");
            return;
        }

        showModal("Mempelajari Lagu dari Internet...", `Mengunduh ${url} dan mengekstrak DNA musiknya...`);

        try {
            const res = await fetch("/api/fetch-online-midi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url })
            });

            hideModal();

            if (res.ok) {
                const data = await res.json();
                const arrayBuffer = new Uint8Array(data.bytes).buffer;
                currentMidiDNA = MidiParser.parse(arrayBuffer);

                dnaBpm.textContent = `${currentMidiDNA.bpm} BPM`;
                dnaKey.textContent = `${currentMidiDNA.key} ${currentMidiDNA.scale.toUpperCase()}`;
                dnaTracks.textContent = `${currentMidiDNA.tracks.length} tracks`;
                dnaNotes.textContent = `${currentMidiDNA.totalNotes} notes`;

                clonerResult.style.display = "flex";
                showToast(`Berhasil mengunduh dan mempelajari ${currentMidiDNA.totalNotes} not dari internet!`, "🌐");

                // Auto apply and compose
                btnCloneGenerate.click();
            } else {
                const err = await res.json();
                showToast(`Gagal mengunduh: ${err.error}`, "❌");
            }
        } catch (e) {
            hideModal();
            console.error(e);
            showToast("Gagal terhubung ke server untuk download MIDI web!", "⚠️");
        }
    });

    // Initial setup
    renderKnowledgeCatalog();
    resizeCanvas();
    generateSong(false);
});
