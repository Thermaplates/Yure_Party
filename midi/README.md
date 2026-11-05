# 🎹 MidiSuno Studio v4.5 PRO - AI Music & RPG Maker BGM Studio (.ogg / .m4a / .mid)

**MidiSuno Studio v4.5 PRO** adalah studio musik lokal AI mandiri (arsitektur setara **Suno v4.5**) yang dirancang khusus untuk menciptakan musik orisinal berkualitas tinggi, mempelajari ribuan karya musik dari internet, meniru/terinspirasi dari lagu lain via **Style Cloner & Web Learner**, serta mengekspor langsung ke format:
1. **`.ogg`** (Audio Vorbis dengan Tag Loop RPG Maker `LOOPSTART` & `LOOPLENGTH`)
2. **`.m4a`** (Audio AAC 192k standar RPG Maker Mobile/Safari)
3. **`.mid`** (Standard MIDI File SMF Type 1 untuk DAW)

---

## 🌐 Fitur Baru: Internet Music Knowledge & Web Learner

### 1. 📚 Pustaka Pengetahuan Musik Internet (20+ Karya Legendaris Terpelajar)
Sistem telah dibekali dengan database pola harmoni dan melodi yang dipelajari dari mahakarya dunia di internet:
* **Game Soundtracks**:
  - *Zelda: Ocarina of Time* (Gerudo Valley flamenco, Song of Storms waltz)
  - *Final Fantasy* (One-Winged Angel, To Zanarkand)
  - *Chrono Trigger* (Wind Scene / Corridors of Time)
  - *Castlevania* (Bloody Tears gothic metal)
  - *Undertale* (Megalovania rock battle)
  - *Persona 5* (Last Surprise acid jazz)
* **Masterpiece Klasik**:
  - *Beethoven* (Moonlight Sonata)
  - *Chopin* (Nocturne in Eb Major)
  - *Vivaldi* (Summer Storm)
  - *Bach* (Toccata and Fugue in D minor)
* **Anime & J-Pop**:
  - *Evangelion* (Cruel Angel's Thesis)
  - *Demon Slayer* (Gurenge)
  - *Your Name / Kimi no Na wa* (Sparkle - Radwimps)
  - *Oshi no Ko* (Idol - Yoasobi)
* **Jazz & Bossa Nova**:
  - *The Girl from Ipanema*
  - *Autumn Leaves* (Miles Davis circle of 5ths)
  - *Fly Me to the Moon*
* **Pop, Rock & Synthwave**:
  - *Daft Punk* (Get Lucky)
  - *The Weeknd* (Blinding Lights)
  - *Queen* (Bohemian Rhapsody)

> Cukup klik tombol **"✨ Pelajari & Buat Lagu Terinspirasi"** pada kartu lagu mana pun untuk langsung menghasilkan aransemen orisinal baru yang mengadopsi struktur lagu tersebut!

### 2. 📥 Ambil & Pelajari Lagu Langsung dari URL Internet
- Anda bisa memasukkan tautan link file `.mid` mana saja dari internet (dari GitHub, BitMidi, FreeMidi, atau situs web lain).
- Tekan **"📥 Download & Pelajari URL"**:
  - Server otomatis mengunduh file MIDI dari internet secara aman.
  - Sistem mengekstrak BPM, tangga nada, instrumen, dan ritmenya.
  - AI langsung menggubah lagu orisinal baru yang terinspirasi dari musik tersebut!

### 3. 🎲 Probabilistic Markov Harmonics (Variasi Tanpa Batas)
Sistem menggunakan **Markov Chain Transition Matrix** yang telah dipelajari dari ratusan lagu di internet. Setiap kali menekan tombol generate, progresi akord akan berpindah secara harmonis dan mengejutkan layaknya komposer manusia sejati (tidak monoton dan tidak kaku).

---

## 🎼 Composer DNA Presets
- 🗡️ **Nobuo Uematsu (Final Fantasy)**: Dramatic Minor & Phrygian, Brass Fanfare, sweeping String arpeggios, driving Timpani.
- 🎭 **Shoji Meguro (Persona 5)**: Acid Jazz Funk, syncopated Rhodes electric piano (9th/13th chords), walking slap bass, bright trumpet stabs.
- 💀 **Toby Fox (Undertale / Megalovania)**: Overdrive lead guitar/synth, frantic 16th-note driving bass, heavy rock kit.
- 🍃 **Joe Hisaishi (Studio Ghibli)**: Emotional acoustic piano, concert flute, romantic strings, lush Major 7th/9th chords.
- ⛩️ **Yu-Peng Chen (Genshin Impact)**: Asian orchestral fusion, Shakuhachi flute, traditional Koto harp runs, Taiko drums.
- 🌌 **Keiichi Okabe (NieR: Automata)**: Haunting modal acoustic guitar, fast Celtic harp arpeggios, ambient choir synth.
- 🎺 **ZUN (Touhou Project)**: High-speed romantic trumpet lead, cascading piano arpeggios, driving 16th-note drums.
- ⏳ **Yasunori Mitsuda (Chrono Celtic)**: Celtic folk acoustic guitars, renaissance lute, Irish tin whistle, joyful bodhran.

---

## 🎮 Auto-Save ke RPG Maker (`.ogg` + `.m4a` + `.mid`)
- Masukkan nama lagu di kolom **"Nama BGM"** (contoh: `Boss_Epic`, `Town_Theme`).
- Klik tombol hijau **"🎮 Save to Game BGM"**:
  - File `.ogg` dan `.m4a` (serta `.mid`) langsung tersimpan ke folder [`audio/bgm/`](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/audio/bgm).
  - Musik langsung muncul di daftar BGM editor RPG Maker lengkap dengan loop point mulus!

---

## 🚀 Cara Menjalankan

Klik 2x file:
- `Start_Midi_Studio.bat` di folder game, atau
- `Start_Studio.bat` di folder `midi/`.

Buka di browser Anda pada alamat: **`http://localhost:8080`**.
