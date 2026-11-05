# 📘 ALUR KERJA & ARSITEKTUR SISTEM — YURE PARTY
> **Dokumen Resmi Panduan Sistem, Alur Eksekusi, & Standar Workflow Proyek**  
> *Versi Dokumen:* 1.0  
> *Status Proyek:* Versi 0.07+ (Stable)  
> *Engine:* RPG Maker MV (Custom WebGL Shaders, Procedural Web Audio API, Modular Architecture)  
> *Resolusi:* 1280 x 720 HD Widescreen (16:9)  

---

## 1. 🌟 IKHTISAR PROYEK (PROJECT OVERVIEW)

**Yure Party** adalah game *Supernatural Psychological Mystery RPG* dengan sentuhan budaya mistis lokal Indonesia yang dibalut estetika retro pixel, antarmuka fisik buatan tangan (*handmade tactile scrapbook UI*), pencahayaan *real-time WebGL shader*, serta sistem suara dialog prosedural (*Animalese-style chiptune*).

### 4 Pilar Utama Desain:
1. **Tactile Scrapbook Feel:** Menghindari menu RPG Maker standar yang steril; seluruh menu dirancang seperti buku jurnal fisik, Polaroid bertumpuk, selotip/lakban, kertas bergaris, dan matras lesehan.
2. **Action-Infused Combat:** Sistem pertarungan taktis CTB (*Charge Turn Battle*) berkecepatan tinggi yang dipadukan dengan QTE (*Quick Time Event*), akumulasi *Rage*, dan kartu aksi sinematik.
3. **Living Atmospheric World:** Dunia hidup dengan pencahayaan fisika kuadrat terbalik (*inverse-square*), bayangan penumbra lembut (*smooth building shadows*), lentera pemain [F], dan partikel atmosferik (kunang-kunang, debu, bara gaib, limbo void).
4. **Charming Living Voice:** Suara gumaman dialog berbasis sintesis prosedural Web Audio 8-bit tanpa aktor suara manual.

---

## 2. 🗂️ STRUKTUR DIREKTORI PROYEK (PROJECT STRUCTURE)

Setelah proses perapihan dan pemilahan, proyek memiliki susunan struktur yang bersih dan modular:

```
Yure Party/
├── audio/                   # Seluruh aset BGM, BGS, ME, dan SE game
├── chara/                   # Konfigurasi data karakter khusus (Nia.json, dll.)
├── data/                    # Database RPG Maker (Actors, Items, Skills, Maps, dll.)
├── dokumentasi/             # [TERORGANISIR] Pusat seluruh dokumen, panduan, GDD & Devlog
│   ├── ALUR_KERJA_PROJECT.md # Dokumen panduan alur kerja ini
│   ├── GDD.md               # Game Design Document resmi
│   ├── DEVLOG.md            # Arsip catatan log rilis & post-mortem bug
│   ├── browser.pdf          # Referensi browser & dokumentasi arsitektur
│   ├── karso item.pdf       # Panduan daftar item & balancing Toko Karso
│   └── MIDI_STUDIO_README.md# Panduan MidiSuno Studio Tracker
├── fonts/                   # Font kustom (KiwiSoda.ttf, mplus-1m-regular.ttf, gamefont.css)
├── icon/                    # Ikon executable & game assets
├── img/                     # Seluruh aset visual (characters, pictures, tilesets, system, dll.)
├── js/                      # Mesin JavaScript game
│   ├── libs/                # Library inti (pixi, pixi-tilemap, fpsmeter, lz-string)
│   ├── plugins/             # Plugin fungsional aktif (Yure_*, YEP_*, MOG_*, dll.)
│   ├── plugins_full_backup/ # Arsip cadangan plugin historis & eksperimental
│   ├── plugins.js           # Konfigurasi status dan parameter plugin RPG Maker
│   └── main.js, rpg_*.js    # Mesin utama RPG Maker MV
├── locales/                 # Konfigurasi lokalisasi Chromium/NW.js
├── midi/                    # Studio synthesizer Web Audio & MIDI composition mandiri
├── movies/                  # Video splash intro & background title screen
├── python/                  # Lingkungan portable Python 3.11 embedded
├── save/                    # File simpanan permainan (save files)
├── swiftshader/             # Fallback renderer software GPU
├── tools/                   # Perkakas pengembangan internal
│   └── legacy_scripts/      # Arsip skrip utility, patch perbaikan lama & converter
├── Website/                 # Portal web, assets SVG, & API eksternal
├── Game.exe                 # Executable launcher NW.js
├── Game.rpgproject          # File proyek RPG Maker MV
├── index.html               # Entry point HTML game
├── package.json             # Manifest konfigurasi NW.js
├── Playtest.bat             # Shortcut pengujian game cepat
├── Start_Midi_Studio.bat    # Launcher MidiSuno Studio
└── supertoolsengine.html    # Jendela GUI konfigurasi SRD Super Tools
```

---

## 3. 🔄 ALUR KERJA EKSEKUSI GAME (RUNTIME LIFECYCLE)

```mermaid
flowchart TD
    A["Game.exe / Playtest.bat"] --> B["NW.js (Chromium Engine)"]
    B --> C["index.html"]
    C --> D["RPG Maker MV Core (rpg_core, rpg_managers)"]
    D --> E["Yanfly Engine Plugins (YEP Core, Battle, Message)"]
    E --> F["Yure Custom Engine Plugins"]
    F --> G["Scene_Boot & CustomLogo (Video Splash + Glitch SE)"]
    G --> H["Scene_Title (Yure_TitleVideoBackground + MOG Title Com)"]
    
    H -->|New Game / Continue| I["Scene_Map (Eksplorasi Dunia)"]
    
    I --> J1["Pencahayaan & Shader (Yure_LightingShadowShader)"]
    I --> J2["Atmosfer Partikel (Yure_Atmosphere)"]
    I --> J3["Dialog Helltaker + Gibberish (Yure_FloatingNameBox + Voice)"]
    I --> J4["Tombol [I]: The Living Status Journal (Scene_StatusJournal)"]
    I --> J5["Event Mbah Karso: Toko Lesehan (Scene_KarsoShop)"]
    I --> J6["Trigger Musuh / Event Pertarungan"]
    
    J6 --> K["Scene_Battle (CTB + QTE V2 + Dynamic Popups)"]
    K -->|Menang| I
    K -->|Kalah (All Dead)| L["Bed Respawn System (Bangun di Kasur Kamar Tidur)"]
    L --> I
```

---

## 4. 🧩 RINCIAN SUBSISTEM UTAMA (CORE SUBSYSTEMS)

### 4.1. Eksplorasi & Lingkungan (Scene_Map)
1. **WebGL Inverse-Square Lighting & Realtime Shadows (`Yure_LightingShadowShader.js`):**
   - Menghitung atenuasi cahaya alami kuadrat terbalik tanpa artefak lingkaran terpotong.
   - Menggantikan bayangan kotak-kotak 24px kaku bawaan RPG Maker dengan penumbra blur difusi Gaussian yang melacak pergerakan matahari 24 jam.
   - Tombol `[F]` mengaktifkan/menonaktifkan lentera pemain (*player lantern*).
2. **Atmosfer & Partikel Dinamis (`Yure_Atmosphere.js`):**
   - Menginjeksikan partikel sesuai notetag peta (`<atmosphere: fireflies>`, `<dust>`, `<embers>`, `<leaves>`, `<limbo>`).
   - Mode **Limbo Void** (`$gameMap.isLimboVoid()`): Menyembunyikan seluruh ubin tanah dan parallax menjadi kehampaan hitam mutlak (`#000000`), hanya menyisakan karakter yang melangkah di atas kegelapan dengan pendaran cahaya api.
3. **Fisika Roh & Formasi Party:**
   - Saki melayang otomatis dengan gelombang sinus (`Yure_GhostFloat.js`).
   - Anggota party yang membuntuti menjaga jarak renggang 2 tile secara elastis (`Yure_PartyFollowerDistance.js`).

### 4.2. Percakapan Sinematik & Suara Prosedural
1. **Helltaker Letterbox Bar (`Yure_FloatingNameBox.js`):**
   - Bar hitam obsidian meluncur masuk di awal dialog dan bertahan mulus selama percakapan bersambung (dilengkapi fungsi *lookahead* `isNextCommandDialogue` untuk mencegah bar buka-tutup berulang kali).
2. **Procedural Cute Gibberish Voice (`Yure_DialogueGibberish.js`):**
   - Setiap huruf teks yang mengalir membunyikan gelombang Web Audio sintetis (Cute 780 Hz, Deep 110 Hz ala Sans, Mid 320 Hz, Ghost 440 Hz, Typewriter 620 Hz).
   - Memiliki modulasi lekukan vokal dinamis (*vowel sweeps*) untuk huruf vokal (A, I, U, E, O) dan jeda nafas alami pada tanda baca.

### 4.3. Antarmuka Scrapbook Buatan Tangan (Tactile Scrapbook UI)
1. **The Living Status Journal (`Yure_StatusJournal.js` — Tombol [I]):**
   - Dibuka kapan saja di peta melalui tombol `[I]`, navigasi tab dengan `[TAB]`, dan membalik halaman dengan `[Q / W]`.
   - **Tab 1 (Item):** Grid 24 slot berbingkai, foto Polaroid miring (-8.5°), kertas bergaris, dan pita bookmark kain.
   - **Tab 2 (Status):** Lembaran profil karakter, bio, pengukur HP/MP/Sanity, dan radar statistik.
   - **Tab 3 (Equip):** Ilustrasi kepala Cyclops dengan nyala api jiwa (*Soul Flame*) berdenyut pada pupil mata, membawahi 7 slot perlengkapan khusus.
   - **Tab 4 (Constellation):** Peta rasi bintang bercahaya untuk skill tree dengan popup kartu berbingkai emas.
   - **Tab 5 (Memory Hub):** Tumpukan foto kenangan Polaroid dan galeri CG.
2. **Toko Lesehan Mbah Karso (`Yure_KarsoShop.js`):**
   - Tampilan *overhead* beralaskan matras biru (`ground.png`) dan sepasang kaki bersila Mbah Karso (`sikil.png`).
   - 12 barang dagangan tergeletak acak dengan bayangan lembut, terangkat 4px dan membesar 1.05x saat disorot.
   - Transisi sinematik lampu neon/pijar tua berkedip-kedip saat masuk toko.
   - Kertas pembelian meluncur dari bawah ke atas (`Left page.png`) dan buku inventori penjualan meluncur dari kanan layar via `[TAB]`.

### 4.4. Pertarungan Aksi Kinetik (Combat System)
1. **Sistem Giliran CTB (Charge Turn Battle):** Dinamika urutan giliran berbasis kelincahan (AGI).
2. **Pethogs Rage System:** Akumulasi kemarahan permanen yang tidak hilang setelah pertarungan untuk jurus pamungkas.
3. **Quick Time Event V2 (`Yure_QTE_V2.js`):** Multiplier damage 2.0x dan peluang *Stun* musuh saat berhasil menekan tombol QTE tepat waktu.
4. **Dynamic Popups & Flying Cards (`Yure_DynamicBattlePopups.js`):** Teks damage membal elastis, kartu aksi sinematik melayang, dan hentakan kamera (*impact camera punch*).
5. **Bed Respawn System:** Menggantikan Game Over kaku; saat seluruh party kalah, pemain bangun di ranjang kamar tidur di keesokan harinya.

---

## 5. 🛠️ ALUR KERJA PENGEMBANGAN & PEMELIHARAAN (DEV WORKFLOW)

### 5.1. Menjalankan & Menguji Game
- **Playtest Cepat:** Jalankan file `Playtest.bat` di root direktori.
- **Developer Console:** Tekan tombol `[F8]` di dalam game untuk membuka Chromium DevTools (Console, Network, Elements).
- **Reload Cepat:** Tekan tombol `[F5]` untuk reload permainan seketika.

### 5.2. Pembuatan Musik & Sound Effect
- Buka `Start_Midi_Studio.bat` untuk menjalankan studio musik internal berbasis Python + Web Audio.
- Buat pola nada chiptune atau komposisi MIDI, lalu ekspor ke direktori `audio/bgm/` atau `audio/se/`.

### 5.3. Manajemen Plugin & Database
- Buka `Game.rpgproject` menggunakan editor RPG Maker MV.
- Jangan mengubah file `js/plugins.js` secara manual tanpa memperhatikan format *strict JSON* (hindari koma penutup / *trailing commas* agar editor RPG Maker MV tidak error).
- File cadangan plugin eksperimental ditaruh di folder `js/plugins_full_backup/`.

### 5.4. Pemeliharaan Kebersihan Direktori
- Seluruh file dokumen, panduan, atau file format PDF / Markdown **wajib** disimpan di folder `dokumentasi/`.
- Skrip ad-hoc, patch migrasi, atau perkakas pengujian tersimpan rapi di dalam `tools/legacy_scripts/`.
- Jangan menyimpan file installer pihak ketiga (seperti installer audio/video) di dalam folder aset game (`movies/` atau `audio/`).

