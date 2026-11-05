# 📜 YURE PARTY — ARSIP LOG PENGEMBANGAN (DEVLOG)
### *Dari Versi 0.00 (Genesis) Hingga Versi Terkini 0.20*
> **Dokumentasi Perjalanan Pengembangan Game Supernatural RPG & Psychological Mystery "Yure Party"**  
> *Engine: RPG Maker MV (Custom WebGL Shader & Procedural Audio Engine) | Resolusi: 1280 x 720 HD Widescreen*



---

## 🌟 Ringkasan Visi Proyek

**Yure Party** dibangun dengan visi menghadirkan game RPG petualangan misteri supranatural yang menggabungkan estetika retro yang kental dengan *game-feel* modern yang *juicy*, atmosferik, dan penuh sentuhan personal. Proyek ini berevolusi dari proyek standar RPG Maker menjadi sebuah karya kustom dengan sistem pertarungan dinamis, pencahayaan shader *real-time*, antarmuka *scrapbook* fisik buatan tangan (*handmade tactile UI*), dan sistem suara prosedural tanpa henti.

Berikut adalah rekam jejak lengkap setiap tonggak pembaruan (*milestone*) dari versi awal **0.00** hingga saat ini:

```
[v0.00] Inisiasi Engine & Setup HD
   │
   ▼
[v0.01] Action Combat & Pethogs Engine Core
   │
   ▼
[v0.02] Dynamic WebGL Shader & Battle Visual Juice
   │
   ▼
[v0.03] Cinematic Dialogue (Helltaker Letterbox) & Title Polish
   │
   ▼
[v0.04] The Living Scrapbook Status Journal (Lead Drain Production)
   │
   ▼
[v0.05] Toko Lesehan Mbah Karso & Sinematik Lampu Tua
   │
   ▼
[v0.06] Cute Pixel Dialogue Gibberish Voice System
   │
   ▼
[v0.07] High-Performance Hardware Custom Cursor System (Terkini)
```

---

## 📑 Daftar Isi Linimasa Versi

1. [Versi 0.00 — The Awakening: Genesis & Fondasi Sistem](#versi-000--the-awakening-genesis--fondasi-sistem)
2. [Versi 0.01 — Tactical Combat & Pethogs Engine Core](#versi-001--tactical-combat--pethogs-engine-core)
3. [Versi 0.02 — Atmospheric Shader & Dynamic Battlefield](#versi-002--atmospheric-shader--dynamic-battlefield)
4. [Versi 0.03 — Helltaker Cinematic Dialogue & Title Polish](#versi-003--helltaker-cinematic-dialogue--title-polish)
5. [Versi 0.04 — The Living Scrapbook Status Journal](#versi-004--the-living-scrapbook-status-journal)
6. [Versi 0.05 — Toko Lesehan Mbah Karso & Sinematik Lampu Tua](#versi-005--toko-lesehan-mbah-karso--sinematik-lampu-tua)
7. [Versi 0.06 — Cute Pixel Dialogue Gibberish Voice System](#versi-006--cute-pixel-dialogue-gibberish-voice-system)
8. [Versi 0.07 (Terkini) — High-Performance Hardware Custom Cursor System](#versi-007-terkini--high-performance-hardware-custom-cursor-system)
9. [Matriks Arsitektur Teknis & Standar Kualitas](#matriks-arsitektur-teknis--standar-kualitas)

---

## Versi 0.00 — The Awakening: Genesis & Fondasi Sistem
*Fokus: Peletakan Batu Pertama, Standarisasi Layar Lebar HD, & Integrasi Engine Inti*

Di awal proyek, tantangan terbesar adalah melepaskan keterbatasan format klasik RPG Maker MV (816x624) dan menyusun arsitektur modular yang stabil:

### 1. Standarisasi Layar & Engine Core
* **Migrasi ke Resolusi HD 1280 x 720:** Seluruh rasio antarmuka, peta, koordinat jendela, dan skalasi grafis dirombak menggunakan `YEP_CoreEngine` dan `Community_Basic`.
* **Pondasi Yanfly Suite:** Integrasi sistem pertempuran berbasis giliran dinamis (`YEP_BattleEngineCore`, `YEP_X_BattleSysCTB`), manajemen inventori (`YEP_ItemCore`), kustomisasi slot perlengkapan (`YEP_EquipCore`), hingga otomasi pasif (`YEP_AutoPassiveStates`).
* **Pseudo-3D Rendering Tilemap (`UltraMode7`):** Menghadirkan perspektif kedalaman kamera 3D dengan kemiringan *pitch* 45° dan *field of view* dinamis untuk area-area eksplorasi tertentu.

### 2. Siklus Waktu & Identitas Awal
* **Siklus Waktu Dinamis (`MOG_TimeSystem`):** Mengatur perputaran jam, hari, bulan, dan musim dengan transisi *tone* warna layar alami (Pagi, Siang, Sore, Senja, Malam).
* **Interaksi Fisik Peta (`MOG_PickupThrow`):** Pemain dapat mengangkat dan melempar objek/batu di peta untuk teka-teki lingkungan.
* **Intro Sinematik Glitch (`CustomLogo`):** Animasi pembuka logo studio dengan efek gangguan sinyal TV tabung (*analog CRT glitch*) dan audio noise yang membangun atmosfer misteri.

---

## Versi 0.01 — Tactical Combat & Pethogs Engine Core
*Fokus: Rombakan Total Mekanika Pertarungan, Action QTE, & Sistem Sanity*

Pertarungan diubah dari sekadar memilih menu pasif menjadi aksi bertempo dinamis dengan respons kinetik pemain:

### 1. Pethogs Engine Core (v1.0 – v2.0)
* **Battle HUD Khusus Yure Party:** Slot kartu skill kustom di bagian bawah layar menggantikan jendela perintah kaku bawaan.
* **Pethogs Rage System (`Pethogs_RageSystem.js`):** Mengganti TP bawaan yang biasanya hilang usai pertarungan menjadi sistem *Rage* permanen layaknya MP untuk mengeksekusi serangan pamungkas.
* **Combo Queuing (`Yure_BattleChainBuilder.js`):** Memungkinkan pemain menyusun rantai kombo skill secara taktis sebelum dieksekusi oleh karakter.

### 2. Interaktivitas Serangan & Status Mental
* **Quick Time Event Dinamis (`Yure_QTE_V2.js`):** Saat melancarkan serangan tertentu, muncul pemicu tombol QTE interaktif; keberhasilan tepat waktu melipatgandakan *damage* (2.0x) dan dapat memicu efek *stun* pada musuh.
* **In-Battle Equipment Swap (`Custom_BattleEquip.js`):** Memberikan kebebasan mengganti senjata dan perlengkapan secara instan di tengah pertempuran sengit tanpa membuang giliran.
* **Sistem Kewarasan (`Custom_SanitySystem.js`):** Pengukur mental (*Sanity*) karakter yang terkuras saat menghadapi kengerian gaib atau pertempuran berkepanjangan, mempengaruhi kestabilan aksi karakter.
* **Bed Respawn System (`Yure_BedRespawn.js`):** Menggantikan layar *Game Over* klasik yang memutus imersi; jika party tumbang, karakter terbangun di tempat tidur kamar rumah di pagi hari dengan pemulihan penuh dan kemajuan hari.

---

## Versi 0.02 — Atmospheric Shader & Dynamic Battlefield
*Fokus: Pencahayaan WebGL Real-time, Fisika Roh Melayang, & Efek Visual Juicy*

Versi ini membawa peningkatan drastis pada kualitas grafis, pencahayaan atmosferik, dan umpan balik visual (*combat juice*):

### 1. Mesin Pencahayaan Shader WebGL (`Yure_LightingShadowShader.js`)
* **Lentera / Senter Pemain Dinamis:** Sumber cahaya portabel mengikuti pergerakan karakter dengan warna hangat (`#ffdd99`), intensitas yang dapat disesuaikan, serta tombol pintasan toggle `[F]`.
* **Bayangan Real-time (*Cast Shadows & Contact AO*):** Objek dan rintangan di peta memproyeksikan bayangan gelap realistis sesuai posisi lentera pemain.
* **Post-Processing Shader FX:** Penambahan efek *vignette* sudut gelap dan *bloom glow* lembut yang memperkuat nuansa horor psikologis.

### 2. Fisika Supranatural & Partikel Medan Tempur
* **Fisika Melayang Saki & Arwah (`Yure_GhostFloat.js`):** Karakter Saki dan musuh bertipe hantu bergerak mengambang dengan osilasi vertikal halus (*sinusoidal bobbing*), ayunan lembut, dan denyut transparansi (*opacity pulse*).
* **Boss Aura & Enrage Mode (`Yure_BossAura.js`):** Ketika HP boss merosot di bawah 50%, boss melepaskan gelombang amarah (*Enrage*) disertai semburan partikel asap merah, aura ungu menyala, kilatan layar, dan getaran gempa.
* **Battlefield Living Motion (`Yure_DynamicBattlefield.js`):** Efek pegas *jiggle* musuh saat menerima hantaman, partikel debu halus (*ambient motes*), dan ayunan kamera medan tempur.
* **Tipografi Damage & Kartu Aksi Melayang (`Yure_DynamicBattlePopups.js`):** Angka kerusakan dengan gradien warna dinamis (normal, heavy, critical, heal, MP gain) dengan animasi membal elastis (*spring bounce*), hentakan kamera (*impact punch*), serta kartu aksi sinematik yang meluncur ke target.

---

## Versi 0.03 — Helltaker Cinematic Dialogue & Title Polish
*Fokus: Format Percakapan Letterbox Sinematik, Tutorial Interaktif, & Sentuhan Judul*

Komunikasi naratif dan kesan pertama pemain disempurnakan setara visual novel kelas atas:

### 1. Helltaker Cinematic Letterbox Dialogue (`Yure_FloatingNameBox.js`)
* **Bar Hitam Sinematik Atas-Bawah (*Letterbox Bars*):** Bar atas dan bar bawah selebar layar penuh (1280px) berwarna hitam obsidian solid (`#0b0410`) dengan garis pembatas lembut (*hairline divider*).
* **Animasi Sliding Cerdas (Anti-Bouncing):** Bar meluncur masuk mulus di awal percakapan dan tetap bertahan di posisinya saat dialog bersambung, lalu meluncur keluar rapi hanya saat seluruh rangkaian percakapan usai.
* **Tata Letak Khas:** Nama pembicara terpusat di tengah dengan aksen merah crimson (`• Saki •`), teks dialog rata tengah, dan lambang jeda mata mistis (`< o >`) yang berdenyut lembut.
* **Integrasi Dual Bust VN (`GALV_MessageBusts`):** Kompatibel penuh dengan dua ilustrasi karakter di layar dengan efek redup (*dimming*) pada karakter yang sedang mendengarkan.

### 2. Title Polish & Battle Tutorial
* **Title Polish (`Yure_TitlePolish.js`):** Transisi cincin kartun melingkar (*cartoon circle iris*), watermark versi resmi (*V0.04 - Lead Drain Production*), pintasan cepat keluar `[ESC]`, dan efek suara tombol responsif.
* **Battle Tutorial Spotlight (`Yure_BattleTutorialSpotlight.js`):** Tabir sorotan gelap interaktif yang memfokuskan perhatian pemain baru ke elemen antarmuka tertentu, disertai kartu panduan beranimasi dan anak panah penunjuk.
* **Anti-Dempet Party (`Yure_PartyFollowerDistance.js`):** Menjaga jarak renggang antar anggota party yang mengekor di peta agar langkah karakter terlihat rapi dan tidak saling tumpuk.

---

## Versi 0.04 — The Living Scrapbook Status Journal
*Fokus: Rombakan Menu Utama Menjadi Jurnal Fisik Interaktif (Scrapbook)*

Pembaruan terbesar dalam sejarah proyek: menggantikan menu status kaku bawaan RPG Maker dengan **Jurnal Status Scrapbook Interaktif** satu buku penuh berukuran 1280x720 (`Yure_StatusJournal.js` dengan hampir 8.000 baris kode):

```
+--------------------------------------------------------------------------------------------------+
|  [PITA ITEM]    +-----------------------------+  +--------------------------------------------+  |
|  [PITA STATUS]  |                             |  |                                            |  |
|  [PITA EQUIP]   |      HALAMAN KIRI BUKU      |  |             HALAMAN KANAN BUKU             |  |
|  [PITA SKILL]   |     (Data, Slot & Grid)     |  |       (Polaroid, Detail & Catatan)         |  |
|  [PITA ARCHIVE] |                             |  |                                            |  |
|                 +-----------------------------+  +--------------------------------------------+  |
+--------------------------------------------------------------------------------------------------+
```

### 1. Tab 1: Journal Item (Katalog Barang Koleksi)
* **Grid 24 Slot (`Column_.png`):** Susunan 4 kolom x 6 baris dengan reticle kursor magenta sudut (`#ec4899`), angka jumlah item berbayang, dan navigasi halaman `[Q / W]`.
* **Detail Halaman Kanan:** Frame Polaroid miring (-8.5°) dengan foto item besar (100x100), label kategori tulisan tangan, serta kertas catatan bergaris (`Description_.png`) yang menempel dengan selotip rapi.

### 2. Tab 2: Journal Status (Profil Karakter & Jiwa)
* Lembar biodata lengkap karakter, foto potret polaroid, status statistik pertempuran (HP, MP, SAN, ATK, DEF, MAT, MDF, AGI, LUK), serta badge elemen bawaan.

### 3. Tab 3: Journal Equip (Sistem Perlengkapan Cyclops & Souls)
* **Visualisasi Kepala Cyclops:** Menggunakan ilustrasi kepala Cyclops misterius dengan nyala api jiwa (*Soul Flame*) yang berdenyut di pupil matanya.
* **7 Slot Perlengkapan Khusus:** Penataan presisi untuk 1 Slot Jiwa (Souls), 2 Aksesoris (sejajar di kiri-kanan), 2 Segel Kertas Gulungan (Seals), dan 2 Botol Ramuan Katalis (Catalysts).
* **Catatan 8 Baris Parameter:** Menampilkan nama perlengkapan dan rincian peningkatan statistik secara transparan di atas lembar bergaris.

### 4. Tab 4: Constellation & Skill Tree
* Pohon keahlian berbentuk rasi bintang interaktif dengan bintang-bintang yang saling terhubung garis cahaya (*glowing constellation*).
* **Constellation Skill Detail Popup (350x185 px):** Kartu informasi instan yang membedah biaya MP/TP, tipe elemen tanpa emoji norak, jangkauan target, potensi damage, hingga status QTE.

### 5. Tab 5: Archive & Adventure Activity Log
* **Landing Page Kenangan:** Tumpukan 6 foto polaroid miring (*Memories*) dan lembar ringkasan progres game.
* **Sub-Halaman 1 (Galeri CG 8-Slot):** Penampil ilustrasi peristiwa penting dengan mode layar penuh (*Fullscreen Viewer*).
* **Sub-Halaman 2 (Log Petualangan Dua Kolom):** Terintegrasi langsung dengan `Yure_ActivityLog.js` yang otomatis mencatat perolehan item penting, kenaikan level, dan skill baru, lengkap dengan notifikasi toast elegan dan lencana titik merah (*Red Dot Badge*).

---

## Versi 0.05 — Toko Lesehan Mbah Karso & Sinematik Lampu Tua
*Fokus: Toko Interaktif Lesehan, Fisika Atmosferik, & Transisi Lampu Tua*

Mengubah jendela toko standar `Scene_Shop` menjadi pengalaman belanja warung lesehan malam yang hidup, grounded, dan bebas dari ornamen AI norak (`Yure_KarsoShop.js`):

```
+------------------------------------------------------------------------------------------------+
|  [💰 Gold: 1250 G]                                                         (Lampu Gantung)     |
|  [🌙 Malam Hari (Toko Mbah Karso)]                                              \             |
|                                     (Sikil Mbah Karso)                           \  [lamp.png] |
|                                                                                   \  (Berkedip)|
|                     [Item 1]               [Item 2]             [Item 3]           v           |
|                                                                                                |
|          [Item 4]            (Pusat Potion) [Item 5]                   [Item 6]    [🎀 ITEM]   |
|                                                                                    (Pita Kanan)|
|                     [Item 7]               [Item 8]             [Item 9]             |         |
|  [Popup Tooltip Detail]                                                              v         |
|  (Nama, Harga, Dimiliki, Deskripsi)                                               [INVENTORY]  |
|                                                                                   (Jual Item)  |
|------------------------------------------------------------------------------------------------|
|  ◄▲▼► Pilih Item  |  [ENTER] Lihat Detail / Beli  |  [TAB] Buka Inventory / Jual  |  [ESC] Keluar |
+------------------------------------------------------------------------------------------------+
```

### 1. Lingkungan Lesehan & Barang Berserakan (*Scattered Goods*)
* **Sudut Pandang Atas (*Overhead View*):** Matras kain biru (`ground.png`) dan sepasang kaki Mbah Karso (`sikil.png`) di bagian atas.
* **12 Slot Barang Tersebar Alami:** Barang dagangan tergeletak di atas matras dengan bayangan kontak lembut (*soft contact shadow*) dan sudut kemiringan alami.
* **Stok Acak Harian:** Stok barang otomatis di-refresh dan diacak setiap malam baru tiba terhubung ke sistem waktu.

### 2. Transisi Sinematik Lampu Tua Berkedip Sputtering
* **Transisi Masuk:** Dimulai dari kegelapan pekat total (`#060408`), sentakan saklar (*Switch1*), lampu padam mendadak, sentakan kembar, rentetan dengung kedipan cepat (*sputtering buzz*), pemanasan kawat filamen, hingga semburan penyalaan penuh (*Fire1 ignition surge*) dan stabilisasi cahaya.
* **Pemusatan Lampu Melonjong:** Pendaran cahaya berpusat tepat pada fisik lampu gantung lonjong di pojok kanan atas (`x: 1145, y: 95`).
* **Transisi Keluar:** Saklar dimatikan, kilatan daya sesaat, lampu anjlok padam (*click1*), bara filamen mendingin, dan layar kembali tenggelam ke kegelapan pekat sebelum berpindah ke peta.
* **Fitur Responsif:** Pemain dapat menekan tombol aksi kapan saja untuk *skip* langsung ke kondisi stabil.

### 3. Atmosfir Hidup Tanpa Elemen AI Norak
* **Nafas Halus Mbah Karso:** Kaki Mbah Karso bergerak vertikal naik-turun halus secara sinusoidal (`1.5px`) memberikan ilusi sosok kakek penjual yang bernafas tenang.
* **Ayunan Lampu Tertembus Angin:** Kap lampu dan kawat gantung berayun perlahan tertiup angin malam di sekitar poros atasnya.
* **Sensasi Angkat Taktil Item Matras:** Item yang disorot kursor terangkat 4px ke atas dan membesar halus (1.05x zoom) dengan interpolasi pegas elastis.
* **Partikel Debu Mengambang:** 14 bintik debu keemasan melayang acak melintasi berkas cahaya lampu malam.

### 4. Lembar Kertas Pembelian & Buku Inventori Meluncur
* **Lembar Kertas Detail (`Left page.png`):** Meluncur naik dinamis dari bawah layar (`y: 720 -> 26`) disertai kemiringan kertas alami dan efek suara gemerisik kertas membuka (`Book1`) serta menutup (`Book2`).
* **Buku Inventori Jual Meluncur Kanan-ke-Kiri:** Menekan `[TAB]` meluncurkan buku inventori dari sisi kanan luar layar (`x: 1280 -> 0`) untuk menjual barang ke Mbah Karso, dengan safeguard tombol panah kanan yang tidak sengaja membuka buku.

---

## Versi 0.06 — Cute Pixel Dialogue Gibberish Voice System
*Fokus: Sintesis Suara Prosedural Real-time, Karakter Chiptune Imut, & Kadensa Alami*

Menggantikan heningnya dialog dengan sistem suara gumaman berkarakter imut yang memadukan kehangatan chiptune 8-bit Undertale dengan modulasi vokal bahasa Animal Crossing (*Animalese*):

```
   [ TEKS BERJALAN ] ────────► "H - a - l - o   S - a - k - i !"
                                   │   │         │   │   │
                                   ▼   ▼         ▼   ▼   ▼
             [ VOWEL FORMANTS ] : 'a' 'o'       'a' 'i' (Animalese Modulasi)
                                   ▲   ▲         ▲   ▲   ▲
                                   │   │         │   │   │
          [ RETRO CHIPTUNE ]   : 8-Bit Pixel Triangle Wave (Undertale Crisp Blip)
```

### 1. Sintesis Real-Time Prosedural (Web Audio API)
* **Nol Audio Lag & Tanpa Beban File:** Suara dihasilkan secara matematis lewat osilator Web Audio bawaan, sehingga langsung sinkron dengan laju ketikan huruf, tidak memakan penyimpanan disk game, dan bebas jeda *loading*.
* **100% Otomatis:** Berjalan langsung pada seluruh dialog perintah standar **Show Text** (`Tampilkan Pesan`) tanpa perlu menyematkan tag atau script khusus di event.

### 2. Formula Karakter Imut (Cute Bubbly Chiptune)
* **Pitch Tinggi Ceria (780 Hz – 1050 Hz):** Nada dasar dinaikkan ke oktaf tinggi (G5 - C6) khas karakter chibi imut seperti *Isabelle* (Animal Crossing) dan *Madeline* (Celeste).
* **Lengkungan Vokal Gelembung (*Micro-Pitch Sweeps*):**
  * Huruf **'I'** & **'E'**: Meluncur melengking naik (+0.14) menghasilkan kicauan ceria (*high cheerful chirp*).
  * Huruf **'U'** & **'O'**: Memantul membal turun (-0.12) menciptakan efek tetesan gelembung air (*bubbly droplet pop*).
  * Huruf **'A'**: Ceria dan terbuka lebar (-0.05).
  * Konsonan: Menggunakan modulasi mikro berdasarkan kode ASCII karakter agar kalimat memiliki melodi bicara yang kaya dan tidak datar.
* **Filter Lowpass Hangat (4800 Hz):** Menghilangkan suara kresek digital tajam tanpa mematikan kehangatan nada segitiga (*triangle wave*), menghasilkan suara renyah dan terdengar jelas di atas musik BGM.

### 3. Deteksi Otomatis Profil Suara Karakter
* **Saki / Nia / Modeus / Perempuan:** Profil `'cute'` (High chirpy squeak 780 Hz).
* **Mbah Karso / Kakek / Monster:** Profil `'deep'` (Gerutu berat 8-bit square wave 110 Hz ala Sans Undertale).
* **Pethogs / MC / Protagonis:** Profil `'mid'` (Blip petualang netral 320 Hz).
* **Hantu / Arwah:** Profil `'ghost'` (Sine wave mistis melayang 440 Hz).
* **Narator / Sistem:** Profil `'typewriter'` (Ketukan mekanikal retro 620 Hz).

### 4. Ritme Bicara Alami & Proteksi Telinga
* **Jeda Nafas Tanda Baca (*Punctuation Pause*):** Huruf spasi tidak berbunyi, sementara tanda baca titik (`.`), seru (`!`), tanya (`?`), dan koma (`,`) memberikan jeda hening sejenak (4–8 frame) layaknya manusia yang mengambil nafas saat berbicara.
* **Proteksi Fast-Forward:** Saat pemain menahan tombol untuk mempercepat teks, jarak ketukan suara otomatis dilonggarkan dan volume diredam 50% demi kenyamanan pendengaran pemain.
* **Opsi Fleksibel:** Tersedia pengaturan toggle langsung di menu **Options -> Suara Dialog (ON / OFF)** serta tag opsional dalam teks seperti `\voice[cute]` atau `\pitch[120]`.


---

## Versi 0.07 (Terkini) — High-Performance Hardware Custom Cursor System
*Fokus: Kursor Kustom Zero-Lag (CSS GPU Compositor), Tiga Status Dinamis (Default, Pointer, Click), & Umpan Balik Visual Tactile*

Menggantikan kursor bawaan sistem operasi yang standar dengan kursor piksel retro khas *Yure Party* berakselerasi perangkat keras (*hardware-accelerated*):

```
+---------------------------------------------------------------------------------------------------+
|                         EKOSISTEM KURSOR KUSTOM DINAMIS (YURE PARTY v0.07)                        |
+---------------------------------+---------------------------------+-------------------------------+
|  1. DEFAULT (cursor.png)        |  2. POINTER (cursor_pointer.png)|  3. CLICK (cursor_click.png)  |
|  Panah retro obsidian & cream   |  Sarung tangan putih bergelang  |  Panah tertekan tactile +     |
|  dengan satelit spirit star cyan|  cyan saat hover di tombol & tab|  radiasi 4 letupan bintang    |
+---------------------------------+---------------------------------+-------------------------------+
|                                 4. TACTILE CLICK SPARKLES                                         |
|      Letupan 6-8 partikel bintang retro piksel berkilau di koordinat klik seketika                 |
+---------------------------------------------------------------------------------------------------+
```

### 1. Zero-Lag Hardware Acceleration (0ms Input Latency)
* **Kursor GPU Native via CSS:** Menggunakan aturan CSS `cursor: url(...) !important` pada elemen `html`, `body`, dan kanvas WebGL. Kursor digerakkan langsung oleh *compositor thread* GPU/OS pada kecepatan refresh penuh monitor (60Hz / 144Hz+), sepenuhnya bebas dari jeda 1-frame (16ms) *rendering loop* game.
* **Presisi Titik Klik (*Hotspot Alignment*):** Ujung panah diatur tepat pada koordinat piksel mutlak `(0, 0)`, ujung telunjuk tangan pada `(5, 1)`, dan kursor klik pada `(1, 1)`.

### 2. Tiga Status Kursor Interaktif Dinamis
* **Default State (`cursor.png`):** Panah retro berwarna krem langit (*celestial cream*) dengan bingkai ungu obsidian pekat dan gradasi lavender senja, ditemani satelit bintang arwah (*spirit star*) cyan bercahaya.
* **Pointer State (`cursor_pointer.png`):** Sarung tangan putih retro chibi yang mengacungkan jari telunjuk dengan gelang arwah cyan bercahaya. Otomatis aktif saat kursor melayang di atas tombol perintah, opsi jendela yang aktif, pita bookmark jurnal, lentera gantung Mbah Karso, maupun item dagangan yang bisa dibeli.
* **Click State (`cursor_click.png`):** Panah tertekan 1 piksel secara diagonal dengan semburan kilau instan di ujungnya, memberikan sensasi fisik sentuhan (*tactile feedback*) yang mantap saat tombol mouse ditekan.

### 3. Letupan Partikel Bintang Retro (*Pixel Sparkle Feedback*)
* Saat pemain mengklik layar di area mana pun, kanvas transparan khusus memunculkan semburan 6–8 partikel bintang piksel bersinar dalam palet warna cyan arwah (`#42f5e9`) dan putih berkilau yang menyebar dan mengecil selama 12–18 frame.

### 4. Hemat Energi & Auto-Hide Cerdas
* **Deteksi Inaktivitas:** Jika mouse tidak digerakkan selama 3 detik, kursor otomatis menghilang (`cursor: none`) agar tidak mengganggu sinematik cerita atau saat pemain memilih bermain menggunakan keyboard maupun gamepad.
* Begitu mouse digerakkan sedikit saja, kursor seketika muncul kembali tanpa jeda.

---

## Versi 0.08 (Terkini) — Silky Smooth Building Shadows, Realistic Inverse-Square Lighting & World Atmosphere Engine
*Fokus: Bayangan Bangunan Halus (Penumbra Soft Gradient), Fisika Cahaya Terbalik Kuadratik (Inverse-Square Falloff), & Mesin Partikel Atmosfer Dunia (Kunang-Kunang & Notetag Peta)*

Meningkatkan kualitas visual peta dunia (*world graphics polishing*) menjadi jauh lebih hidup, estetik, dan sinematik tanpa merusak performa 60/144 FPS:

```
+---------------------------------------------------------------------------------------------------+
|               EVOLUSI GRAFIK DUNIA: SHADOWS, REALISTIC LIGHTING & WORLD ATMOSPHERE                |
+---------------------------------+---------------------------------+-------------------------------+
|  1. SMOOTH BUILDING SHADOWS     |  2. REALISTIC PHYSICAL LIGHTING |  3. WORLD ATMOSPHERE ENGINE   |
|  - Hilangkan kotak hitam 24px   |  - Inverse-Square Falloff       |  - Kunang-kunang bioluminescent|
|  - Penumbra blur halus & empuk  |  - Filmic tone saturation       |  - Debu mistis & abu melayang |
|  - Palet ungu malam atmosferik  |  - Turbulensi nyala api 3-oktaf |  - Notetag peta otomatis      |
+---------------------------------+---------------------------------+-------------------------------+
```

### 1. Silky Smooth Building Shadows (`Sprite_SmoothBuildingShadows`)
* **Pembersihan Bayangan Kaku RPG Maker:** Secara default, RPG Maker MV merender bayangan bangunan (`shadowBits` pada layer 4 tilemap) sebagai kotak hitam pekat kaku berukuran 24px dengan sudut tajam 90 derajat yang terlihat kasar dan kuno.
* **Teknik Penumbra Gradient Prosedural:**
  * Komponen bawaan `ShaderTilemap.prototype._drawShadow` dinonaktifkan bersih dan `shadowColor` disetel transparan mutlak (`0.0, 0.0, 0.0, 0.0`) tanpa merusak layer geometri tile.
  * Dilapisi dengan layer bayangan independen beresolusi optimal (`scale: 0.5` dengan `PIXI.SCALE_MODES.LINEAR`).
  * Setiap bayangan bangunan dirender dengan *multi-pass soft radial blur* dan sapuan gradasi linear halus, menghasilkan efek difusi penumbra nyata (*silky contact penumbra*) dengan ujung lengkung halus (*rounded soft caps*).
  * Warna bayangan menggunakan rona malam atmosferik `rgba(20, 10, 36, 0.42)` (ungu kebiruan pekat) yang menyatu sempurna dengan pencahayaan dunia malam hari, bukan lagi hitam arang pekat.

### 2. Realistic Physical Inverse-Square Lighting Shader (v3.0)
* **Kurva Pelemahan Fisika Optik Asli (*Inverse-Square Falloff*):**
  * Menggantikan formula gradasi linear kuno `(1.0 - dist / radius)` yang menciptakan batas lingkaran terpotong kaku.
  * Menerapkan formula atenuasi kuadrat terbalik optik fisik:
    $$\text{Atten} = \frac{1.0}{1.0 + 1.8 \cdot (\text{dist}/\text{radius}) + 3.2 \cdot (\text{dist}/\text{radius})^2} \times \left(1.0 - \text{smoothstep}(0.72, 1.0, \text{dist}/\text{radius})\right)$$
  * Efek pendaran cahaya meleleh lembut menyatu dengan kegelapan secara mulus tanpa garis potong lingkaran (*zero hard boundary artifacts*).
* **Filmic Saturation-Preserving Blending:**
  * Mencegah fenomena *chalky overexposure* (cahaya bertumpuk menjadi putih pucat menyilaukan tak berkarakter).
  * Kurva penyesuaian kecerahan mempertahankan nuansa kehangatan oranye keemasan (*warm amber*) atau biru mistis (*spectral cyan*) bahkan di titik pusat cahaya terterang.
* **Turbulensi Nyala Api 3-Oktaf (*Organic Flame Turbulence*):**
  * Sumber cahaya lentera, lilin, dan obor mendapatkan modulasi frekuensi harmonik fraktal 3-oktaf berbasis waktu real-time, menirukan jilatan api organik yang ditiup angin sepoi-sepoi secara alami.

### 3. World Atmosphere & Fireflies Particle Engine (`Yure_Atmosphere.js` v2.0)
* **Sistem Notetag Peta Otomatis (Per-World Atmosphere):**
  * Setiap peta kini memiliki atmosfer dunianya sendiri hanya dengan menambahkan catatan (*Map Note*):
    * `<atmosphere: fireflies>` atau `<kunang-kunang>`: Menghidupkan puluhan kunang-kunang liar di malam hari.
    * `<atmosphere: dust>` atau `<dust>`: Menghasilkan bintik debu kuno melayang lambat di dalam kastil/dungeon.
    * `<atmosphere: embers>` atau `<sparks>`: Menghasilkan percikan bara api melayang ke atas di sekitar tungku/gunung.
    * `<atmosphere: spirits>` atau `<spirits>`: Memunculkan partikel arwah bercahaya biru-keunguan melayang lembut.
    * `<atmosphere: leaves>` atau `<leaves>`: Dedaunan hutan berguguran tertiup angin sepoi.
    * `<atmosphere: void>` atau `<limbo>`: Memunculkan partikel wisps arwah ungu-cyan melayang di jurang kehampaan.
* **Bioluminescent Breathing & 3D Spatial Wandering:**
  * Kunang-kunang berdenyut memancarkan cahaya secara periodik (*breathing luminescence pulse*) dengan fase acak antar individu.
  * Jalur pergerakan menggunakan fungsi harmonik 2D/3D sinusoidal (*wandering drift*) yang menirukan gaya terbang serangga malam.
  * Menggunakan sistem jangkar koordinat dunia (*world coordinate anchor*) sehingga partikel tetap konsisten berada di lokasinya di dalam peta saat kamera bergerak (*smooth camera tracking*).
  * Blending mode aditif (`PIXI.blendModes.ADD`) menghasilkan kilau neon yang menyatu memukau di atas grafis map.
* **Performa Ekstrem Ringan (Zero-GC Stutter):**
  * Menggunakan sistem *particle pool pre-allocated* tanpa alokasi objek baru dalam *game loop*, menjamin 60/144 FPS tanpa gangguan *garbage collector*.
* **Status Implementasi:**
  * Diaktifkan langsung di **Map005** (Area Hutan / Petualangan) dengan tag `<atmosphere: fireflies>`, siap dinikmati langsung oleh pemain!

### 4. Penyesuaian Halus Kunang-Kunang & Mode LIMBO Void Abyss
* **Kunang-Kunang Lembut & Mungil (*Fairy Speck Refinement*):**
  * Mengoreksi ukuran kunang-kunang yang sebelumnya terlalu tebal dan besar. Kanvas partikel dipangkas dari 32px ke 16px dengan radius visual riil 4.5px – 10px dan titik pusat (*pinpoint core*) 0.5px.
  * Gradasi cahaya dibuat sangat lembut dan transparan dengan puncak alpha bernafas 0.64 (bukan lagi 1.0 yang solid pekat), menghasilkan kesan kerlipan peri malam yang magis dan anggun.
* **Mode LIMBO Void Abyss (`$gameMap.isLimboVoid()`):**
  * Sesuai atmosfer dunia cerita saat pemain menerobos keluar mansion melalui retakan dinding menuju dunia **LIMBO (Map 1)** (*"Tapi... ini tempat apa, kok gelap banget"*):
  * Seluruh ubin lantai (*ground tiles*), ubin atas (*upper tiles*), parallax langit, bayangan bangunan, dan bayangan kendaraan ditelan sepenuhnya oleh kegelapan mutlak (`#000000`).
  * **Hanya Entitas yang Terlihat:** Seluruh entitas fisik (`_characterSprites`: Pemain, rekan party, NPC, monster, dan api lentera) tetap berdiri dan melangkah dengan jelas di dalam kehampaan hitam pekat, dengan cahaya lentera/api yang memancarkan pendaran hangat ke sekeliling jurang kehampaan.
### 5. Unreal Engine Dynamic Soft Shadow Engine & Contact Drop Shadows (v0.09)
* **Solusi Undakan Tangga Piksel 24px (*Eliminating Stepped Blocks*):**
  * Mengatasi anomali di mana bayangan tebing atau lereng yang digambar menggunakan *Shadow Pen* (seperti pada Map006 sisi kanan) tampak sebagai balok-balok tangga 24x24 px yang kaku.
* **Continuous Whole-Map Shadow Field (Triple-Pass Gaussian Diffusion):**
  * Seluruh data *shadow bits* peta dipetakan secara serentak ke dalam buffer kanvas *half-resolution* dan diproses melalui filter difusi Gaussian *separable 3-pass* berkecepatan tinggi (~15ms saat peta dimuat).
  * Menggunakan formulasi *smoothstep S-curve* PCSS (Virtual Shadow Maps) sehingga seluruh undakan tangga tajam meleleh menjadi garis kontur bayangan organik yang sangat lembut (*soft feathered penumbra*) tanpa garis potong piksel.
* **Directional Sun/Moonlight Cast Projection:**
  * Menghadirkan proyeksi arah datang sinar matahari/rembulan (sudut datang dari kiri-atas mengarah ke kanan-bawah), memberikan persepsi dimensi dan kedalaman tebing 3D yang nyata.
* **Unreal-Style Dynamic Character Contact Drop Shadows:**
  * Karakter pemain (Nia), pengikut party, dan NPC kini memiliki bayangan kontak elips bergradasi lembut (`rgba(16, 10, 26, 0.48)` ke transparan) tepat di bawah kaki mereka (`z = 0.8`), menambatkan karakter ke atas tanah.
  * Dilengkapi fisika melompat (*jumping physics*): saat karakter melompat (`jumpHeight()`), bayangan tetap menempel di tanah dan mengecil serta memudar secara dinamis.
  * Otomatis disembunyikan untuk event tak kasat mata atau saat berada di mode `<limbo>` void abyss.
### 6. Real-Time Solar Arc Trajectory, Dynamic Sun-Tracking Shadows, & Automated Evening Streetlights (v0.10)
* **Lintasan Sinar Matahari Real-Time (Left-to-Right Solar Arc):**
  * **Pagi (05:30 - 09:00):** Matahari terbit dari Kiri (Timur) dengan berkas fajar keemasan (`#e4783c`), menyinari ke arah kanan.
  * **Siang (11:00 - 13:30):** Matahari berada tepat di Atas Kepala (Zenith) dengan cahaya putih jernih benderang (`#ffffff`).
  * **Sore (16:30 - 18:30):** Matahari tenggelam di Kanan (Barat) dengan rona jingga-merah tembaga membara (`#e06030` -> `#c44828`), menyinari ke arah kiri.
  * **Malam (19:30 - 05:00):** Atmosfer malam ungu misterius Guardian Tales (`#381c54`) dengan cahaya rembulan sejuk.
* **Bayangan Dinamis Real-Time Mengikuti Matahari (*Sun-Tracking Physics*):**
  * Bayangan tebing, bangunan (`Sprite_SmoothBuildingShadows`), serta karakter/NPC (`Sprite_YureCharacterShadow`) melacak posisi matahari secara real-time:
    * Di pagi hari, bayangan memanjang ke arah kanan (+X).
    * Di siang bolong, bayangan memendek dan berkumpul tepat di bawah kaki / dasar dinding.
    * Di sore hari, bayangan memanjang dramatis ke arah kiri (-X) dengan kemiringan sudut rotasi alami.
* **Penjadwalan Pintar Lampu Jalan (*Automated Evening Streetlight Scheduling*):**
  * Lampu jalan luar ruangan (seperti tiang lampu di Map006: EV001 - EV007) otomatis padam total pada siang hari (06:00 - 17:30).
  * Pada sore menjelang malam (17:30), filamen lampu mulai menyala secara gradual (*smooth fade-in*) dan bersinar terang sepanjang malam membasuh tanah dan dinding.
  * Event lampu dalam ruangan atau bertag `<always>` / `<indoor>` tetap menyala sepanjang waktu tanpa terpengaruh siklus luar ruangan.

---


### 7. Living Town NPC System: Warga Berlalu Lalang di Map 006 (v0.11)
Menghidupkan atmosfer kota luar ruangan (Map 006) dengan menghadirkan warga yang berlalu lalang secara otonom dan interaktif:
* **Jon (Jon Kenek - `jon.png` [0])**: Berjalan bolak-balik berpatroli di sepanjang jalan utama kota (`x: 8..12, y: 8`), menyapa pemain saat diajak bicara mengenai suasana sore dan lampu jalan.
* **Rudi (Warga Santai - `People1.png` [0])**: Berkeliaran santai di area alun-alun kota (`x: 11, y: 14`) menyarankan pemain mampir ke toko Mbah Karso.
* **Tina (Gadis Pengelana - `People1.png` [3])**: Melintas antara persimpangan jalan dan plaza taman kota (`x: 16, y: 11`), mengagumi langit senja dan kunang-kunang.
* **Kakek Somad (Sesepuh Kota - `People2.png` [5])**: Berjalan santai menikmati udara sore di dekat bangku taman (`x: 19, y: 14`).
* **Integrasi Penuh Seluruh Sistem**:
  - **Realtime Solar Shadows**: Keempat NPC otomatis memiliki bayangan di tanah yang memanjang dan condong sesuai pergerakan matahari.
  - **Cute Gibberish Voice & Letterbox**: Dialog interaktif dilengkapi suara chiptune menggemaskan dan nama terpusat bergaya Helltaker (`• Jon •`).


### 8. Adaptive Resolution Title Video Background Engine (v0.12)
Menghadirkan sistem latar belakang video animasi (*looping video background*) untuk menu utama game (**Title Screen** / `Scene_Title`) melalui plugin `Yure_TitleVideoBackground.js`:
* **Agnostik Multi-Resolusi & Rasio Aspek**:
  - Mendukung berbagai resolusi video: 720p HD, 1080p Full HD, 2K/4K Ultra HD, 4:3 klasik (800x600, 1024x768), hingga 21:9 ultrawide dan vertikal.
  - Tiga mode skala adaptif: `cover` (memenuhi layar penuh tanpa letterbox), `contain` (menjaga bidang visual penuh dengan letterbox), dan `stretch` (rentang paksa).
* **Performa Tinggi WebGL GPU Hardware Acceleration**:
  - Menggunakan `PIXI.Texture.fromVideo` langsung pada kanvas WebGL tanpa lag, terikat di layer dasar Scene_Title.
  - Seluruh tombol interaktif MOG, menu galeri, kursor kustom, watermark versi, dan transisi kartun `Yure_TitlePolish` tetap tampil elegan di atas video.
* **Transisi Mulus & Bebas Kebocoran Memori (Zero Memory Leak)**:
  - Latar belakang statis Title1 dijadikan placeholder sementara sampai frame video pertama siap diputar, lalu melakukan cross-fade mulus tanpa kedip hitam/putih.
  - Siklus hidup video dibersihkan total saat pemain memulai game (*New Game* / *Continue*), melepaskan buffer tekstur GPU dan menghentikan audio video secara bersih.

### 9. Occult Living Menu & Precision Command Geometry (v0.13)
Menyempurnakan antarmuka menu utama dalam game (`Scene_Menu` / [MOG_SceneMenu.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/MOG_SceneMenu.js) & [Yure_DynamicMenuMotion.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_DynamicMenuMotion.js)):
* **Koreksi Geometri & Anchor Poros Tombol (`setupCommandAnchor`)**:
  - Mengatasi masalah tombol opsi yang meloncat terlalu jauh ke kanan dan terpotong di sebelah kiri saat aktif.
  - Anchor tombol banner (173x40) diposisikan presisi pada poros lencana lingkaran (`x ≈ 0.104`), memberikan jarak bebas lebih dari 73px dari rahang tengkorak.
  - Skala tombol aktif dirampingkan dari 1.60 menjadi 1.18 proporsional dengan efek geser halus (+12px) sebagai feedback seleksi.
  - Backlight cahaya magenta disinkronkan presisi mengikuti skala, rotasi, dan posisi tombol aktif tanpa menjorok berlebihan.
  - Hitbox `isOnSprite` diperbarui untuk mendukung anchor dan scaling dinamis bagi pengguna mouse dan layar sentuh.
* **Tengkorak Mistis Bernapas (*Floating Occult Skull*)**:
  - Tengkorak dan mata api berkedip kini memiliki animasi mengambang/melayang (*bobbing*) perlahan dan goyangan rotasi sinusoidal halus, memberi kesan entitas hidup yang bernapas.
* **Bara Arwah & Ledakan Percikan Navigasi (`Sprite_MenuWheelEmbers`)**:
  - Menghadirkan 18 partikel bara arwah (*spirit embers*) prosedural di sekitar roda mantra dan tengkorak.
### 10. Title Screen Occult Atmosphere & Zero-Clipping Precision Ribbon UI (v0.14)
Menyempurnakan antarmuka layar judul game (**Title Screen** / `Scene_Title`) melalui perbaikan geometri pita menu [MOG_TitlePictureCom.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/MOG_TitlePictureCom.js) dan penambahan atmosfer mistis dinamis pada [Yure_TitlePolish.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_TitlePolish.js):
* **Penyelesaian Masalah Pita Terpotong di Kiri & Kursor Tangan Terjepit**:
  - **Akar Masalah**: Aset tombol judul (`Command_0.png` s.d. `Command_3.png`) dirancang sebagai pita pembatas buku (*bookmark ribbon*) dengan potongan rata di sisi kiri dan ujung panah chevron (`>`) di kanan. Bila diberi margin X, sisi kirinya tampak mengambang dengan potongan terbuka (*raw cut*). Selain itu, kursor tangan tengkorak (`Cursor.png`) yang jarinya mengarah ke kiri-atas (`↖`) bila diletakkan di sebelah kiri tombol akan terjepit menabrak batas layar kiri (`X = 0`) dan terpotong setengah.
  - **Solusi Geometri Presisi**:
    - **Rata Kiri Penuh (`baseX = 0`, `anchor.x = 0; anchor.y = 0.5;`)**: Seluruh tombol pita kembali dirapatkan menempel sempurna ke tepi kiri layar sehingga potongan rata di kiri tersembunyi alami di balik bingkai layar.
    - **Ekstensi Horizontal Proporsional**: Tombol aktif tidak bergeser koordinat X-nya (mencegah celah kosong di kiri), melainkan memanjang keluar secara horizontal (`scale.x: 1.05x s.d. 1.08x`), memberi efek pita yang ditarik keluar dari tepi layar saat dipilih.
    - **Kursor Tangan Tengkorak di Ujung Chevron**: Kursor diposisikan di sebelah kanan ujung runcing pita (`nx = targetSpr.x + (345 * scale.x) + 24`), sehingga jari tengkorak menunjuk tepat ke ujung panah ribbon yang aktif dengan animasi melayang lembut (*floating wave bobbing*), 100% aman di dalam bidang layar tanpa terpotong.
    - **Hitbox Mouse Presisi**: Batas interaksi sentuh mouse disesuaikan dengan lebar pita aktif (~345px), menghindari salah klik di area transparan.
* **Efek Atmosfer Mistis Dinamis (Title Screen Occult Polish)**:
  - **Occult Spirit Embers (`Sprite_TitleEmbers`)**: 24 partikel bara arwah bercahaya (cyan, violet, gold) melayang perlahan ke atas dengan ayunan sinusoidal dan efek pendar *additive blend* (`Graphics.BLEND_ADD`), memberikan kesan misterius yang hidup pada layar judul.
  - **Burst Percikan Seleksi**: Berpindah opsi tombol (melalui keyboard, gamepad, maupun hover mouse) memancarkan letupan 8 percikan cahaya magis dari posisi ujung chevron pita yang dipilih.
  - **Gradien Kontras Latar Belakang (`createTitleBackdropShade`)**: Lapisan gradien halus gelap transparan (lebar 480px) di sisi kiri layar memastikan teks tombol selalu kontras, tajam, dan mudah dibaca di atas video latar belakang apa pun.

### 11. Journal Menu Direct Integration & Scene_Menu Bypass (v0.15)
Menonaktifkan antarmuka menu bawaan/MOG dan mengalihkan seluruh pemanggilan menu langsung ke buku jurnal status kustom (**The Living Scrapbook Journal** / [Yure_StatusJournal.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_StatusJournal.js)):
* **Pintasan Tombol Menu Standar Dialihkan ke Jurnal**:
  - Tombol `ESC`, `X`, `NumPad 0`, dan Klik Kanan (*Cancel*) saat berada di peta (`Scene_Map.prototype.callMenu`) kini langsung membuka buku jurnal `Scene_StatusJournal` dengan suara konfirmasi `SoundManager.playOk()`.
  - Integrasi pencegahan *double-trigger* (`_journalCooldown = 20`) saat membuka dan `_journalCooldown = 25` saat menutup jurnal (`popScene`) memastikan transisi buka-tutup berjalan sangat mulus tanpa risiko jurnal terbuka kembali secara tidak sengaja.
  - Perintah Event Bawaan RPG Maker (Event Command 351: *Open Menu Screen*) dan fallback `Scene_Menu.prototype.create` dialihkan langsung ke `Scene_StatusJournal`.
* **Optimasi Performa & Deaktivasi Scene Menu Bawaan**:
  - Plugin `MOG_SceneMenu` dan `Yure_DynamicMenuMotion` dinonaktifkan secara aman di [plugins.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins.js).
  - Menghemat alokasi memori WebGL dan siklus draw call CPU/GPU dari elemen roda mantra/menu lingkaran yang sedang tidak digunakan dalam alur gameplay aktif.

### 12. Automatic HD Character Scaling & Smooth Anti-Aliasing (v0.16)
Menghadirkan sistem penskalaan cerdas dan penghalusan tekstur otomatis untuk sprite karakter resolusi tinggi/HD ([Yure_HDCharacterScaler.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_HDCharacterScaler.js)):
* **Penskalaan Otomatis Karakter HD ($) Berdasarkan Proporsi Acuan**:
  - Secara otomatis mendeteksi ukuran frame sprite sheet tunggal berawalan `$` (seperti karakter baru `$Eina.png` berukuran 1024x1536 dengan frame 341x384).
  - Skala dihitung proporsional terhadap tinggi acuan karakter standar Yure Party (Nia `$niatot`, Sophia `$Sphitot`, Saki `$Saki` = 128 px):
    $$\text{Skala} = \frac{128}{\text{Tinggi Frame}} = \frac{128}{384} = \frac{1}{3}$$
  - Karakter HD otomatis memiliki tinggi visual dan proporsi tubuh yang selaras sempurna dengan karakter lainnya saat berjalan di peta, tanpa terlihat raksasa.
* **Penyaringan Tekstur Bilinear Halus (Anti-Burik HD Mode)**:
  - Mengatasi masalah sprite HD yang tampak bergerigi, berkedip (*shimmering*), atau pecah (*burik*) akibat pemaksaan mode tekstur *nearest-neighbor* dari engine 3D UltraMode7.
  - Untuk setiap karakter HD yang diskalakan ke bawah, `bitmap.smooth` disetel ke `true` dan `scaleMode` diaktifkan ke `PIXI.SCALE_MODES.LINEAR`.
  - Karakter HD tampil dengan detail super tajam, garis halus, dan gradasi warna yang bersih layaknya game HD modern.
* **Kompatibilitas Penuh Arsitektur Engine**:
  - **UltraMode7 3D Perspective**: Mengait `Sprite_Character.prototype._ultraMode7PreUpdate` agar skala dasar HD tidak di-reset ke 1.0, sehingga karakter tetap berskala tepat saat kamera 3D berputar atau melakukan zoom.
  - **Efek Rumput/Air (Bush Depth)**: Kedalaman badan di rumput tinggi atau air diskalakan secara presisi mengikuti skala karakter (`d / autoScaleY`).
  - **Balon Ekspresi & Animasi**: Balon percakapan dan efek animasi bertengger tepat di atas kepala karakter HD (`this.y - this.height`).
  - **Menu & Save File**: `Window_Base.prototype.drawCharacter` secara otomatis menggambar karakter HD dalam ukuran mini proporsional (128 px) di slot simpanan game dan antarmuka menu.
  - **Kalibrasi Garis Pijak Kaki ($Eina.png)**: Meratakan pijakan kaki (*footing ground baseline*) di seluruh 4 arah (Bawah, Kiri, Kanan, Atas) pada `bottomMargin ≈ 3..5 px` dan membersihkan stray pixels, dengan file asli disimpan aman sebagai `$Eina_raw_backup.png`.

### 13. Dynamic Title BGM Engine & Audio Aliasing System (v0.17)
Memperbaiki dan memodernisasi arsitektur pemutaran musik latar di layar judul (Title Screen) serta audio buffering ([Yure_AutoPlayBGM.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_AutoPlayBGM.js)):
* **Diagnosa Akar Masalah Musik Title**:
  - Parameter plugin bawaan `Yure_AutoPlayBGM` sebelumnya secara *hardcoded* mengunci BGM ke `'New_Project'`, sehingga mengabaikan konfigurasi lagu judul yang dipilih di Database RPG Maker (`data/System.json`).
  - File audio fisik di folder `audio/bgm/` awalnya bernama `Dancing Shadow.ogg` & `Dancing Shadow.m4a`, sementara referensi database / pemanggilan sering menggunakan nama `Dancing Dead`.
  - Direktori `Yure Party #3` sebelumnya belum memiliki folder `audio/bgm/` dan salinan `Yure_AutoPlayBGM.js`.
* **Solusi & Fitur Sistem Audio yang Diterapkan**:
  - **Dinamisasi Parameter `overrideBgm`**: Jika dikosongkan (default), engine otomatis membaca `$dataSystem.titleBgm` dari Database RPG Maker dengan volume, pitch, dan pan utuh. Terdapat fallback pembacaan sinkron `data/System.json` via NW.js saat awal boot jika database belum tuntas dimuat.
  - **Sistem Aliasing Audio Cerdas (`AudioManager.createBuffer`)**: Menghubungkan secara otomatis pemanggilan audio `Dancing Dead` dan `Dancing Shadow`. Jika game memanggil `Dancing Dead` atau `Dancing Shadow`, engine otomatis memutar file yang tersedia tanpa memicu error audio hilang.
  - **Distribusi File Audio Lengkap**: File `Dancing Shadow.ogg`, `Dancing Shadow.m4a`, `Dancing Dead.ogg`, dan `Dancing Dead.m4a` kini terpasang lengkap di kedua direktori kerja (`Yure Party` dan `Yure Party #3`).
  - **Paritas 100% SHA256**: `Yure_AutoPlayBGM.js` dan `js/plugins.js` tersinkronisasi byte-for-byte antar direktori.

### 14. Universal Anime.js Core Engine & RPG Maker Motion Bridge (v0.18)
Mengintegrasikan library animasi kelas dunia **Anime.js (v3.2.2)** ke arsitektur game RPG Maker MV ([Yure_AnimeEngine.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_AnimeEngine.js)):
* **Pemasangan Featherweight Library**:
  - `anime.min.js` (~17 KB) dipasang di `js/libs/` dan diintegrasikan langsung ke `index.html` sebelum core game dimuat.
  - Zero idle CPU impact: komputasi animasi otomatis tidur saat tidak ada objek bergerak.
* **Jembatan Plugin RPG Maker (`Yure_AnimeEngine.js`)**:
  - Menyediakan global API `anime()` dan helper praktis `Yure.Anime`:
    - `Yure.Anime.popIn()`: Animasi zoom elastic/spring untuk modal, jendela dialog, dan kartu UI.
    - `Yure.Anime.popOut()`: Transisi keluar mulus.
    - `Yure.Anime.staggerSlideIn()`: Animasi berantai berurutan (*staggered wave*) untuk deretan tombol atau slot item inventory.
    - `Yure.Anime.pulse()`: Respon kursor kenyal (*squash & stretch* / micro-interaction).
    - `Yure.Anime.float()`: Efek melayang/bernapas halus dengan kurva sine.
* **Pencegahan Memory Leak Otomatis**:
  - Mengait `Scene_Base.prototype.terminate` untuk otomatis membersihkan (`anime.remove()`) seluruh animasi aktif pada sprite atau window saat scene ditutup/berpindah.
* **Paritas Direktori Penuh**:
  - `anime.min.js`, `Yure_AnimeEngine.js`, `index.html`, dan `plugins.js` tersinkronisasi 100% SHA256 antar direktori `Yure Party` dan `Yure Party #3`.

### 15. Title Screen Anime.js Stagger Entrance & Dynamic Selection Shift (v0.19)
Menerapkan gaya animasi dinamis ala Anime.js pada tombol menu Title Screen (New Game, Continue, Options, Gallery) ([Yure_TitlePolish.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_TitlePolish.js)):
* **Animasi Masuk Berurutan (Staggered Wave Entrance)**:
  - Tombol menu meluncur masuk secara berurutan (*staggered*) satu demi satu (`anime.stagger(85, { start: 160 })`) dari arah kiri-bawah ke posisi aslinya ($\Delta Y = +45\text{ px}$, $\Delta X = -25\text{ px}$).
  - Transisi opasitas mulus dari tak terlihat (`opacity: 0`) menuju terlihat penuh (`opacity: 255`) beriringan dengan lingkaran kartun pembuka (*cartoon circle transition*).
  - Menggunakan kurva elastisitas khas anime.js `easeOutElastic(1, .75)` yang membal empuk dan berbobot.
* **Pergeseran Dinamis Tombol Terseleksi (Rightward Selection Shift)**:
  - Saat suatu tombol aktif/dipilih (`isSelected`), tombol otomatis meluncur agak ke kanan sejauh $+28\text{ px}$ dengan pegas kenyal `easeOutElastic(1, .68)`.
  - Saat kursor berpindah ke opsi lain, tombol yang ditinggalkan meluncur kembali ke posisi awal di kiri secara mulus (`easeOutQuad`).
  - Posisi kursor MOG (`this._cursor`) otomatis sinkron mengikuti tombol yang bergeser ke kanan tanpa jeda frame.
* **Preservasi Penuh Mouse Hover & Audio Feedback**:
  - Deteksi sentuhan mouse (*hover hit-box*) otomatis menyesuaikan pergeseran posisi tombol ke kanan secara akurat.
  - Mempertahankan efek suara navigasi `cardSelect.ogg`, partikel percikan bara roh (*spirit embers burst*), dan pembesaran denyut (*command pulse*).
* **Paritas SHA256 100% Antar Direktori**:
  - `Yure_TitlePolish.js`, `plugins.js`, dan `DEVLOG.md` identik *byte-for-byte* di kedua direktori kerja.

### 16. Dynamic Status Octagram Radar & Tilted Scrapbook Card (v0.20)
Menambahkan visualisasi status karakter interaktif berbasis radar 8-sumbu (Octagram) dengan teknologi SVG Morphto bertenaga **Anime.js** di samping panel deskripsi Status Journal ([Yure_StatusJournal.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_StatusJournal.js)):
* **Kotak Ground Kertas Memo Miring (Tactile Scrapbook Aesthetic)**:
  - Ditempatkan di samping teks daftar parameter pada halaman kiri buku jurnal ($X=372, Y=498$).
  - Memiliki kemiringan organik (rotasi $-2.3^\circ$ / $-0.040\text{ rad}$) lengkap dengan bayangan lembut (*drop shadow*), bingkai kertas vintage, kisi blueprint samar, dan selotip washi (*masking tape*) di sudut atas.
* **Octagram Radar 8 Sumbu Parameter**:
  - Merepresentasikan ke-8 parameter RPG Maker secara presisi: **HP, MP, ATK, DEF, MAT, MDF, AGI, LUK**.
  - Dilengkapi 3 cincin oktagon konsentris ($35\%, 68\%, 100\%$) dan garis sumbu radial dengan label tipografi jernih.
* **Visualisasi Dua Lapisan (*Dual-Layer Status*)**:
  - **Layer 1 (Stat Asli / Pink)**: Poligon warna pink neon supernatural (`rgba(255, 77, 148, 0.42)`, stroke `#ff4d94`) dengan titik simpul berinti putih bercahaya yang dihitung murni dari nilai dasar karakter (`paramBase`).
  - **Layer 2 (Tambahan Equipment / Cyan-Teal)**: Lapisan kedua poligon bercahaya (`rgba(56, 189, 248, 0.30)`, stroke `#0ea5e9`) yang merefleksikan stat total setelah diperkuat perlengkapan (*equipment bonus*). Jika perlengkapan memberikan bonus stat, poligon Layer 2 meluas keluar dari Layer 1.
* **Animasi Morphing Real-time (Anime.js Morphto)**:
  - Setiap kali karakter diganti (Q/W atau 1/2/3) maupun saat perlengkapan diubah, ke-16 koordinat simpul bermutasi (*morphto*) secara mulus dengan kurva pegas `easeOutElastic(1, .75)` selama 720 ms.
  - Dilengkapi animasi bernapas mikro (*idle breathing*) yang dinamis saat membuka jurnal.
* **Paritas SHA256 100% Antar Direktori**:
  - `Yure_StatusJournal.js` dan `DEVLOG.md` sinkron *byte-for-byte* di kedua direktori kerja.

### 17. Revised Sanity, Trauma Manifestation & Adrenaline Syringe (v0.21)
Implementasi sistem psikologis menyeluruh berbasis dokumen revisi trauma dan jarum suntik Mbah Karso melalui modul terpadu [Yure_SanityTraumaSystem.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_SanityTraumaSystem.js):
* **Individual Sanity & 5-Tier Thresholds**:
  - Setiap aktor mengelola resource Sanity independen ($0 - \text{MaxSanity}$, default 100) yang menetap antar battle dan map.
  - Pengurangan base Sanity 10 poin khusus setelah pertarungan menang (*victorious battle*).
  - 5 Tingkatan Mental: **Stabil** ($76\text{--}100\%$), **Uneasy** ($51\text{--}75\%$), **Disturbed** ($26\text{--}50\%$), **Critical** ($1\text{--}25\%$), dan **Trauma Manifestation** ($0\%$).
* **Trauma Manifestation di 0 Sanity (Bukan Generic Berserk)**:
  - Hilangnya kendali input pemain (*auto-action*), digantikan oleh profil perilaku trauma masa lalu masing-masing karakter:
    - **Nia (Psychic Breakdown)**: Pelepasan gelombang psikis liar (Spark, Ghost Blast, Harming Curse), peluang target 50% musuh, 35% kawan (friendly fire), 15% ledakan area, kutipan histeris, dan kilatan ungu.
    - **Saki (Survival Panic)**: Respon bertahan hidup ekstrim & paranoia, menganggap kawan ancaman, peluang target 45% musuh, 35% kawan, 20% Guard/bertahan, kutipan panik, dan kilatan biru.
    - **Sophia (Violent Dissociation)**: Amarah lepas kendali & pertarungan jarak dekat membabi buta, peluang target 60% musuh, 35% kawan, 5% frenzy berulang. Menonaktifkan QTE EWGF sempurna pemain.
* **Friendly Fire & Safe Targeting Override**:
  - Mengalihkan target skill musuh ke sekutu secara aman saat aksi ramah (*friendly fire*) tanpa mengubah properti global skill di `$dataSkills`.
  - Pencegahan loop serangan balik rekursif antar sesama rekan party (*anti-counter crash protection*).
  - Menonaktifkan pembukaan menu Chain Skill ([Yure_BattleChainBuilder.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_BattleChainBuilder.js)) saat dalam kondisi trauma.
* **Adrenaline Syringe dari Toko Mbah Karso**:
  - Efek saat dikonsumsi: $+25\%$ Rage/TP seketika.
  - Mengaktifkan penalti Sanity post-battle harian dengan rumus eksponensial independen per-aktor:
    $$\text{extraLoss} = \text{maxSanity} \times 0.10 \times 1.5^{(\text{affectedBattles} + \text{syringeCount} - 2)}$$
  - Syringe pertama memberi $+10\%$ Max Sanity loss pada battle pertama, meningkat $\times 1.5$ per battle berikutnya dan $\times 1.5$ per pemakaian syringe tambahan di hari yang sama.
  - Reset harian berbasis variabel in-game hari (Variable 11 / MOG_TimeSystem) tanpa merusak nilai Sanity saat ini dan tanpa menghilangkan Trauma aktif.
  - Pembersihan total terhadap prototipe lama di [Yure_CustomIcon.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_CustomIcon.js).
* **Indikator Badge Battle HUD & Pemulihan Trauma**:
  - Menampilkan badge kondisi Sanity/Trauma langsung di layar pertarungan.
  - Mendukung pemulihan melalui item/skill penenang (`<calm_trauma>`, `<trauma_recovery>`), kenaikan Sanity di atas 0, dan Plugin Commands.

### 18. Live In-Game Testing & Dev Debug Panel (v0.22)
Menambahkan panel pengujian developer instan yang dapat dibuka kapan saja di Map maupun Battle via tombol **F7** / `~` atau perintah menu utama ([Yure_DevDebugMenu.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_DevDebugMenu.js)):
* **Targeting Fleksibel**: Dapat memilih Aktor tertentu (Nia, Sophia, Saki) atau sekaligus `Seluruh Party`.
* **Sanity & Trauma Sandbox**: Set instan ke 0 (memicu Trauma), 15 (Critical), 40 (Disturbed), 70 (Uneasy), 100 (Stabil), tombol paksa picu Trauma, serta pemulihan mental.
* **Adrenaline Syringe & Time Simulator**: Minum syringe instan (+25% Rage), tambah 10 jarum ke tas, simulasi kemenangan battle untuk menguji akumulasi penalti x1.5, reset penalti harian, dan percepat 1 hari in-game (Variable 11).
* **Vitals & Combat Manipulation**: Full heal all, set HP = 1 (uji ketahanan / Endurance), HP 50%/100%, MP 0/100%, Rage 0/50%/100%.

### 19. Ethereal Purple Trauma Glow FX pada Battle HUD & Status Journal (v0.23)

Menambahkan efek visual atmosferik pendaran ungu gaib (*pulsing purple trauma glow/aura*) ketika Sanity karakter mencapai 0 (kondisi Trauma Manifestation) di seluruh interface utama:
* **Battle HUD Portrait Card ([Pethogs_EngineCore.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Pethogs_EngineCore.js))**:
  - Penambahan layer dinamis `_purpleTraumaTint` pada [Window_PethogsActorCard](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Pethogs_EngineCore.js#L248).
  - Mengaplikasikan *radial purple gradient vignette* halus di atas foto potret karakter, bingkai neon violet berpendar (`#c084fc`), dan kabut tipis di area stat.
  - Animasi berdenyut (*breathing sine-wave pulse*) berkecepatan 60 FPS saat karakter aktif mengalami manifestasi trauma.
* **Status Journal — Polaroid Photo ([Yure_StatusJournal.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_StatusJournal.js))**:
  - Overlay `_polaroidTraumaGlowSprite` berukuran presisi 208x194 px di atas foto Polaroid karakter.
  - Menampilkan vignette radial ungu kelam, border neon bercahaya, dan lencana peringatan `⚡ TRAUMA MANIFEST ⚡`.
  - Tab selektor karakter di bagian atas Polaroid berubah warna menjadi ungu mistis (`#9333ea` / `#581c87`) jika anggota party tersebut mengalami trauma.
* **Status Journal — Party Scrapbook & Darkroom Candidates ([Yure_StatusJournal.js](file:///c:/Users/Apri%20Laksono/Documents/Games/Yure%20Party/Yure%20Party/js/plugins/Yure_StatusJournal.js))**:
  - **Halaman Kiri (Baris Rekan):** Lencana `⚡ TRAUMA MANIFEST` dan overlay `_partyTraumaGlowSprite` berdenyut pada bingkai foto polaroid anggota party yang mengalami trauma.
  - **Halaman Kanan (Jemuran Foto Cuci Gelap):** Overlay `_partyRightTraumaGlowSprite` memancarkan pendaran ungu pada kandidat di jemuran ruang gelap yang sedang mengalami trauma.

## 🛠️ Matriks Arsitektur Teknis & Standar Kualitas

Sepanjang seluruh siklus pengembangan, proyek ini memegang teguh standar ketat stabilitas perangkat lunak game:

| Standar Teknis | Implementasi Nyata di Yure Party |
| :--- | :--- |
| **Sinkronisasi Direktori Ganda** | Menjaga 100% konsistensi *byte-for-byte* (verifikasi hash SHA256 identik) antara direktori kerja utama `Yure Party` dan direktori cadangan `Yure Party #3`. |
| **Pencegahan Kebocoran Memori (Memory Leak)** | Seluruh sprite dinamis, kanvas bitmap, dan node Web Audio selalu dibersihkan (*destroy/disconnect*) saat berganti scene. |
| **Uji Unit Test Otomatis (Headless Node.js)** | Setiap fitur besar divalidasi menggunakan simulator logika otomatis di folder `scratch/` sebelum diterapkan ke proyek produksi. |
| **Arsitektur Tanpa Dependency Berat** | Fitur audio prosedural dan visual scrapbook memanfaatkan kemampuan native Chromium/HTML5 Canvas tanpa menambah *bloatware*. |
| **Desain UI Grounded & Imersif** | Menghindari ornamen grafis generik atau artifisial; seluruh animasi, bayangan, dan fisika berpegang pada atmosfer mistis lokal yang nyata. |

---

> **Status Saat Ini:** Versi **0.23** aktif dan siap dimainkan dengan Revised Sanity System, Karso Adrenaline Syringe, Character Trauma Profiles, Live Dev Debug Panel (F7), dan Ethereal Purple Trauma Glow FX pada Battle HUD & Journal Menu! 🎮✨💉🧠⚡🔮🎨




