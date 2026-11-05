# 🎮 YURE PARTY — GAME DESIGN DOCUMENT (GDD)
### *Dokumen Desain Game, Evolusi Sistem, & Log Post-Mortem Bug*
> **Versi Dokumen:** *v1.0 (Lead Drain Production)*  
> **Status Proyek:** *Versi Game 0.07 (Stable)*  
> **Platform Target:** *PC (Windows / Mac) via NW.js / Chromium*  
> **Engine:** *RPG Maker MV (Custom WebGL Shaders, Procedural Web Audio, & Modular Architecture)*  
> **Resolusi Layar:** *1280 x 720 HD Widescreen (16:9)*

---

## 📑 DAFTAR ISI

1. [Bagian 1: Ikhtisar Game & Pilar Utama (Core Pillars)](#bagian-1-ikhtisar-game--pilar-utama-core-pillars)
2. [Bagian 2: Karakter & Alur Naratif (Story & Characters)](#bagian-2-karakter--alur-naratif-story--characters)
3. [Bagian 3: Mekanika Inti Permainan (Core Mechanics)](#bagian-3-mekanika-inti-permainan-core-mechanics)
   - 3.1. Eksplorasi & Lingkungan (Exploration & Atmosphere)
   - 3.2. Pertarungan Taktis Berkecepatan Tinggi (Combat System)
   - 3.3. Sistem Kelangsungan Hidup & Psikologis (Survival & Sanity)
4. [Bagian 4: Ekosistem Antarmuka Scrapbook (Handmade Tactile UI)](#bagian-4-ekosistem-antarmuka-scrapbook-handmade-tactile-ui)
   - 4.1. Jurnal Status Utama (The Living Status Journal)
   - 4.2. Toko Lesehan Mbah Karso (Interactive Scattered Bazaar)
   - 4.3. Dialog Sinematik Helltaker (Letterbox Dialogue System)
5. [Bagian 5: Desain Suara & Sintesis Prosedural (Audio Design)](#bagian-5-desain-suara--sintesis-prosedural-audio-design)
6. [Bagian 6: Riwayat Perubahan & Evolusi Desain (What Was Changed)](#bagian-6-riwayat-perubahan--evolusi-desain-what-was-changed)
7. [Bagian 7: Register Bug & Catatan Debugging (Bug Post-Mortem)](#bagian-7-register-bug--catatan-debugging-bug-post-mortem)
8. [Bagian 8: Standar Kualitas & Arsitektur Teknis](#bagian-8-standar-kualitas--arsitektur-teknis)

---

## BAGIAN 1: IKHTISAR GAME & PILAR UTAMA (CORE PILLARS)

### 1.1. Logline & Konsep Utama
**Yure Party** adalah game *Supernatural Psychological Mystery RPG* yang memadukan misteri gaib lokal, komedi santai yang hangat, dan pertarungan aksi bertempo cepat. Pemain mengarungi petualangan di dunia di mana batas antara alam manusia dan dunia arwah saling bertumpukan, dipandu oleh estetika retro pixel, antarmuka jurnal *scrapbook* fisik buatan tangan (*handmade tactile UI*), dan sistem suara bicara prosedural yang hidup.

### 1.2. Pilar Utama Desain (The 4 Core Pillars)

```
+---------------------------------------------------------------------------------------------------+
|                                      PILAR UTAMA YURE PARTY                                       |
+---------------------------------+---------------------------------+-------------------------------+
|  1. TACTILE SCRAPBOOK FEEL      |  2. ACTION-INFUSED COMBAT       |  3. LIVING ATMOSPHERIC WORLD  |
|  Semua UI terasa seperti benda  |  Pertarungan taktis CTB dengan  |  Pencahayaan WebGL real-time, |
|  fisik nyata: kertas bergaris,  |  respons aksi kinetik: QTE      |  lentera pemain, debu melayang|
|  polaroid miring, lakban, & pita|  multipliers & combo queuing.   |  dan siklus waktu dinamis.    |
+---------------------------------+---------------------------------+-------------------------------+
|                                 4. CHARMING LIVING VOICE                                          |
|         Dialog bersuara gumaman lucu prosedural tanpa henti (Animal Crossing + Undertale)         |
+---------------------------------------------------------------------------------------------------+
```

1. **Tactile Scrapbook Feel (Sentuhan Fisik yang Nyata):**  
   Menghindari menu jendela RPG Maker yang generik dan steril. Seluruh antarmuka (Status, Toko, Inventori) disajikan sebagai objek fisik: buku jurnal usang, foto Polaroid miring, lembaran kertas bergaris yang meluncur dari bawah meja, kain matras lesehan, dan pita bookmark kain.
2. **Action-Infused Combat (Pertarungan Bertempo Kinetik):**  
   Mengawinkan kedalaman strategi *turn-based* CTB dengan refleks pemain melalui sistem QTE berbobot ganda, akumulasi *Rage* permanen, dan eksekusi kombo beruntun (*Battle Chain Builder*).
3. **Living Atmospheric World (Dunia yang Bernafas):**  
   Malam yang remang dengan lampu tua berkedip-kedip, bayangan real-time yang memanjang mengikuti lentera pemain, musuh yang membal elastis (*spring jiggle*), serta kakek penjual yang bernafas tenang di hadapan pemain.
4. **Charming Living Voice (Suara Bicara yang Berkarakter):**  
   Setiap huruf yang mengalir membunyikan nada chiptune 8-bit dengan modulasi vokal vokal yang manis (*cute animalese*), memberikan nyawa pada setiap baris cerita tanpa perlu sulih suara aktor yang berat.

---

## BAGIAN 2: KARAKTER & ALUR NARATIF (STORY & CHARACTERS)

### 2.1. Karakter Utama
* **Pethogs (Protagonis / MC):**  
  Sosok petualang utama yang terjebak di tengah anomali gaib desa Yure. Memiliki daya juang tinggi dan kestabilan mental yang menjadi tumpuan kelompok. Profil Suara: `mid` (blip petualang netral 320 Hz).
* **Saki (Gadis Hantu / Spirit Companion):**  
  Arwah gadis penasaran yang ceria, usil, namun setia mendampingi pemain. Tidak menyentuh tanah dan melayang dengan fisika *ghost float*. Profil Suara: `cute` (kicauan manis melengking 780 Hz).
* **Nia & Modeus:**  
  Rekan seperjuangan dengan kemampuan sihir dan pengetahuan supranatural. Memiliki kepribadian ekspresif yang tercermin dalam potret dialog dual-bust VN. Profil Suara: `cute`.
* **Mbah Karso (Penjual Lesehan Keramat):**  
  Kakek misterius penjual barang-barang antik dan ramuan gaib di malam hari. Duduk bersila di atas matras biru di bawah temaram lampu gantung tua. Profil Suara: `deep` (gerutu 8-bit square wave 110 Hz ala Sans Undertale).

---

## BAGIAN 3: MEKANIKA INTI PERMAINAN (CORE MECHANICS)

### 3.1. Eksplorasi & Lingkungan
* **Sudut Pandang Pseudo-3D (`UltraMode7`):** Kamera eksplorasi menggunakan perspektif miring 45° dengan efek kedalaman ruang dinamis.
* **Pencahayaan WebGL Real-time (`Yure_LightingShadowShader.js`):**  
  * Tombol `[F]` mengaktifkan lentera pemain.
  * Menghasilkan bayangan dinamis (*cast shadows*) pada pilar dan pepohonan, lengkap dengan *contact ambient occlusion* lembut di kaki karakter.
* **Fisika Roh Melayang (`Yure_GhostFloat.js`):** Saki bergerak melayang dengan perhitungan sinus otomatis (`bobbing height 4px`, `elevation 8px`) dan denyut transparansi mistis.
* **Formasi Barisan Party (`Yure_PartyFollowerDistance.js`):** Memastikan anggota party yang mengekor berjarak renggang 2 tile sehingga langkah tidak saling tumpuk.

### 3.2. Pertarungan Taktis Berkecepatan Tinggi (Combat System)
* **Sistem Giliran CTB (Charge Turn Battle):** Kecepatan aksi ditentukan oleh atribut kelincahan (AGI) dengan indikator urutan giliran visual di bagian atas layar.
* **Pethogs Rage System:** Menggantikan TP standar. Nilai Rage tidak hilang usai pertempuran dan terakumulasi untuk membuka jurus kombo terkuat.
* **Quick Time Event (QTE V2):**  
  * Indikator QTE muncul saat skill dilancarkan.
  * Berhasil: Damage berlipat 2.0x dan musuh berpotensi terkena *Stun*.
  * Gagal: Damage standar 1.0x.
* **Boss Aura & Enrage:** Boss yang sekarat (HP < 50%) melepaskan semburan asap merah, kilatan layar merah pekat, gempa bumi, dan peningkatan agresivitas drastis.
* **Ganti Perlengkapan di Pertarungan (`Custom_BattleEquip.js`):** Pemain dapat menukar senjata atau aksesori langsung di tengah pertempuran untuk merespons kelemahan elemen musuh.

### 3.3. Sistem Kelangsungan Hidup & Psikologis
* **Sistem Kewarasan (Sanity System):** Energi mental terkuras saat menjelajah area berhantu atau terkena serangan kutukan. Sanity rendah memicu gangguan penglihatan dan penurunan akurasi.
* **Bed Respawn System (Tanpa Layar Game Over Kaku):** Jika seluruh anggota party tumbang, pemain tidak dilempar ke menu awal (*Title Screen*), melainkan terbangun di kasur kamar tidur di pagi hari dengan pemulihan penuh dan pergantian hari.

---

## BAGIAN 4: EKOSISTEM ANTARMUKA SCRAPBOOK (HANDMADE TACTILE UI)

### 4.1. Jurnal Status Utama (`Yure_StatusJournal.js`)
Menghadirkan buku jurnal fisik 1280x720 yang dibuka melalui tombol `[I]`, navigasi tab `[TAB]`, dan rotasi halaman `[Q / W]`:
* **Tab 1 — Item Journal:** Grid 24 slot berbingkai `Column_.png`, Polaroid foto item miring (-8.5°), kertas bergaris bertuliskan lore, dan pita bookmark tunggal `Item.png` di sisi kiri.
* **Tab 2 — Status Journal:** Lembaran profil karakter, bio, pengukur HP/MP/Sanity, dan statistik atribut 8 arah.
* **Tab 3 — Equip Journal (Kepala Cyclops & Nyala Jiwa):** Ilustrasi kepala Cyclops dengan nyala api jiwa (*Soul Flame*) berdenyut tepat di pupil mata Cyclops (X: 248), membawahi 7 slot perlengkapan khusus (Soul, 2 Aksesori, 2 Segel Gulungan, 2 Katalis Botol).
* **Tab 4 — Constellation & Skill Tree:** Peta rasi bintang bercahaya dengan popup kartu detail skill (350x185 px) berbingkai emas elegan.
* **Tab 5 — Archive & Memory Hub:** Tumpukan foto kenangan Polaroid, galeri CG 8-slot layar penuh, dan Log Petualangan otomatis (`Yure_ActivityLog.js`) dengan notifikasi toast dan red dot badge.

### 4.2. Toko Lesehan Mbah Karso (`Yure_KarsoShop.js`)
* **Tampilan Lesehan (Overhead View):** Beralaskan matras kain biru (`ground.png`) dan sepasang kaki Mbah Karso (`sikil.png`) di tepi atas.
* **12 Barang Berserakan (*Scattered Goods*):** Barang dagangan tergeletak acak di atas kain dengan bayangan lembut, terangkat 4px dan membesar 1.05x saat disorot kursor.
* **Transisi Lampu Tua Berkedip Sputtering:** Transisi masuk sinematik dari gelap gulita, sentakan saklar, rentetan kedipan lampu starter aus, hingga semburan terang stabil.
* **Lembar Kertas Pembelian Meluncur Bawah-ke-Atas:** Kertas detail (`Left page.png`) meluncur dari bawah layar (`y: 720 -> 26`) disertai suara gemerisik kertas membuka/menutup (`Book1`/`Book2`).
* **Buku Inventori Penjualan Meluncur:** Buku inventori meluncur dari kanan layar (`x: 1280 -> 0`) saat pemain menekan `[TAB]` untuk menjual barang.

### 4.3. Dialog Sinematik Helltaker (`Yure_FloatingNameBox.js`)
* **Bar Hitam Obsidian:** Bar atas dan bawah selebar 1280px (`#0b0410`) dengan garis pembatas tipis elegan.
* **Sliding Cerdas:** Bar meluncur masuk mulus di awal percakapan dan tetap bertahan selama dialog bersambung, lalu meluncur keluar saat seluruh dialog selesai.
* **Tipografi & Ikon:** Nama pembicara terpusat dengan aksen crimson (`• Saki •`), teks rata tengah, dan lambang mata mistis berdenyut (`< o >`).

---


### 4.4. Sistem Kursor Kustom Hardware & Feedback Visual (`Yure_CustomCursor.js`)
* **Arsitektur Zero-Lag CSS Hardware:** Kursor di-render langsung pada tingkat GPU Compositor Chromium menggunakan aset gambar 32x32 piksel kustom yang disematkan melalui aturan CSS `cursor: url(...) !important`. Mengeliminasi jeda input 1-frame bawaan sprite WebGL kanvas.
* **Tiga State Otomatis:**
  * `default` (`img/system/cursor.png`, Hotspot 0, 0): Panah retro obsidian-cream dengan satelit spirit star cyan.
  * `pointer` (`img/system/cursor_pointer.png`, Hotspot 5, 1): Sarung tangan putih retro bergelang cyan yang aktif otomatis saat melayang di atas elemen interaktif (jendela opsi aktif, tombol sprite, tab pita jurnal, tali lentera toko).
  * `click` (`img/system/cursor_click.png`, Hotspot 1, 1): Umpan balik penekanan instan saat mouse ditekan.
* **Efek Partikel Letupan Klik:** Lapisan kanvas overlay non-interaktif memunculkan 6–8 butir partikel piksel plus/diamond warna cyan (`#42f5e9`) dan putih yang memancar dan memudar selama 14 frame saat klik terjadi.
* **Auto-Hide On Inactivity:** Otomatis menyembunyikan kursor setelah 3 detik tanpa interaksi atau saat tombol navigasi keyboard/gamepad ditekan, dan langsung muncul kembali saat mouse digerakkan.

### 4.5. Pencahayaan Realistis, Bayangan Halus & Mesin Atmosfer Dunia (`Yure_LightingShadowShader.js` & `Yure_Atmosphere.js`)
* **Silky Smooth Penumbra Building Shadows (`Sprite_SmoothBuildingShadows`):**
  * Mengeliminasi bayangan hitam persegi kaku bawaan layer 4 tilemap RPG Maker MV (`_drawShadow`).
  * Merender bayangan penumbra bergradasi halus (*contact penumbra*) dengan interpolasi linear WebGL, ujung membulat (*rounded soft caps*), dan palet warna malam atmosferik `rgba(20, 10, 36, 0.42)`.
* **Realistic Physical Inverse-Square Lighting Shader (v3.0):**
  * Menggantikan degradasi linear kaku dengan model atenuasi fisika kuadrat terbalik (*inverse-square falloff*) berbobot parameter jarak optik riil.
  * Menerapkan batas luar *smoothstep* lembut (100% bebas dari artefak potongan lingkaran).
  * *Filmic Saturation-Preserving Blending* mencegah *overexposure / chalky whiteout* saat berbagai sumber cahaya saling bertumpuk.
  * Turbulensi harmonik fraktal 3-oktaf untuk efek nyala lentera/obor/api unggun yang berayun alami tertiup angin malam.
* **World Atmosphere & Fireflies Engine (v2.0):**
  * Setiap peta memiliki ekosistem partikel atmosferik mandiri yang dipicu oleh notetag peta (`<atmosphere: fireflies>`, `<dust>`, `<embers>`, `<spirits>`, `<leaves>`, `<limbo>`).
  * Kunang-kunang disempurnakan menjadi bintik peri mungil (*fairy speck*, diameter 4.5px–10px, core 0.5px, alpha 0.06–0.64) yang berkerlip halus tanpa kesan tebal/pekat.
  * Dilengkapi logika *bioluminescent breathing*, pergerakan melayang sinusoidal 3D, pelacakan kamera koordinat dunia, dan *additive blending* ringan tanpa beban *Garbage Collector* (60-144 FPS). Aktif langsung pada Map005.
* **Mode LIMBO Void Abyss (`$gameMap.isLimboVoid()`):**
  * Khusus di peta LIMBO (Map 1 atau notetag `<limbo>` / `<void>`), seluruh ubin dunia (tilemap ground & upper), parallax langit, dan bayangan bangunan disembunyikan total ke dalam kegelapan mutlak (`#000000`).
  * Hanya entitas fisik (`Sprite_Character`: Pemain, rekan party, NPC, monster, dan api) yang terlihat melangkah di atas jurang kehampaan, dengan pendaran cahaya dari lentera/api yang menerangi sekitarnya. Proyeksi 3D UltraMode7 dinonaktifkan otomatis di peta ini.

---

## BAGIAN 5: DESAIN SUARA & SINTESIS PROSEDURAL (AUDIO DESIGN)

### 5.1. Cute Pixel Dialogue Gibberish Engine (`Yure_DialogueGibberish.js`)
Menggabungkan kehangatan gelombang chiptune retro Undertale dengan kelincahan intonasi vokal Animal Crossing (*Animalese*):

```
+------------------+------------------+-------------------+--------------------+
|  PROFIL SUARA    |  FREKUENSI DASAR |  BENTUK GELOMBANG |  KARAKTERISTIK     |
+------------------+------------------+-------------------+--------------------+
|  Cute            |  780 Hz (G5)     |  Triangle Wave    |  Ceria, manis, pip |
|  Deep            |  110 Hz          |  Square Wave      |  Berat, 8-bit Sans |
|  Mid             |  320 Hz          |  Triangle Wave    |  Petualang netral  |
|  Ghost           |  440 Hz          |  Sine Wave        |  Mistik melayang   |
|  Typewriter      |  620 Hz          |  Square Wave      |  Ketukan mekanis   |
+------------------+------------------+-------------------+--------------------+
```

* **Vowel Modulation & Micro-Sweeps:**
  * Vokal **'I'** & **'E'**: Meluncur melengking naik (+0.14) menghasilkan nada imut membal (*high cheerful chirp*).
  * Vokal **'U'** & **'O'**: Memantul bulat turun (-0.12) menciptakan efek tetesan air (*droplet pop*).
  * Vokal **'A'**: Terbuka dan ceria (-0.05).
* **Filter Lowpass Hangat (4800 Hz):** Suara jernih dan renyah tanpa menusuk telinga.
* **Jeda Nafas Tanda Baca Alami:** Tanda baca titik, koma, seru, dan tanya memicu jeda hening sejenak (4–8 frame) layaknya nafas manusia.

---

## BAGIAN 6: RIWAYAT PERUBAHAN & EVOLUSI DESAIN (WHAT WAS CHANGED)

Berikut adalah daftar keputusan desain (*design pivot*) yang diubah dari konsep awal ke konsep final:

| Sistem / Fitur | Konsep Lama (Awal) | Konsep Baru (Hasil Redesain) | Alasan Perubahan |
| :--- | :--- | :--- | :--- |
| **Menu Status** | Jendela teks standar RPG Maker abu-abu gelap. | Buku Jurnal Scrapbook Fisik 1280x720 dengan Polaroid, lakban, & pita kain. | Memperkuat imersi, identitas seni visual, dan memberikan rasa kepemilikan buku harian nyata. |
| **Toko Perlengkapan** | Menu daftar teks vertikal standar `Scene_Shop`. | Toko Lesehan Mbah Karso (Overhead view, matras kain, kaki kakek, barang berserakan). | Menghadirkan atmosfer misteri pasar malam lokal Indonesia yang grounded dan unik. |
| **Navigasi Kursor Matras** | Menekan panah kanan di item terkanan otomatis membuka inventori. | Kursor panah murni berputar di atas matras; inventori hanya terbuka via `[TAB]` atau klik pita. | Mencegah pemain membuka inventori secara tidak sengaja saat bernavigasi cepat. |
| **Transisi Masuk Toko** | Layar langsung menyala polos saat toko dibuka. | Tabir gelap gulita, saklar berbunyi, kedipan lampu tua sputtering aus, hingga semburan terang. | Menciptakan suasana dramatis dan kesan lampu pijar tua di warung remang malam hari. |
| **Suara Dialog Karakter** | Hening tanpa suara (atau bip mekanik monoton). | Sintesis Web Audio prosedural imut 780 Hz (Animal Crossing vowel + Undertale 8-bit). | Menghidupkan percakapan karakter dengan nada manis tanpa membebani ukuran file instalasi game. |
| **Format Dialog Pesan** | Kotak teks standar RPG Maker di bagian bawah layar. | Helltaker Cinematic Letterbox (bar obsidian solid atas-bawah, nama terpusat, mata berdenyut). | Tampilan percakapan terlihat profesional setara novel visual modern kelas atas. |
| **Bayangan Dunia & Karakter** | Kotak-kotak hitam 24px kaku bawaan RPG Maker & karakter tanpa bayangan pijakan. | Unreal Engine Dynamic Soft Shadow Engine (Gaussian diffusion, PCSS S-curve, sun angle projection) + Contact Drop Shadows karakter. | Menghilangkan artefak undakan tangga saat menggunakan Shadow Pen, menghadirkan estetika bayangan dinamis dan realistis setara game Unreal Engine modern. |
| **Siklus Surya & Lampu Jalan** | Pencahayaan statis bernuansa malam atau siang terpisah tanpa pergerakan matahari, lampu menyala terus siang-malam. | Real-Time Solar Arc Trajectory (Kiri/Pagi -> Kanan/Sore), Bayangan Dinamis Mengikuti Posisi Matahari, & Lampu Jalan Otomatis Hanya Nyala Sore-Malam. | Memberikan game-feel kelas AAA di RPG Maker MV: dunia terasa hidup dan bernafas secara organik sesuai siklus waktu. |

---

## BAGIAN 7: REGISTER BUG & CATATAN DEBUGGING (BUG POST-MORTEM)

Berikut rekam jejak kendala teknis nyata (*bugs*) yang berhasil dideteksi, dianalisis akar masalahnya, dan diperbaiki secara tuntas:

### 🐛 Bug 1: Pemicu Auto-Open Buku Inventori pada Matras Mbah Karso
* **Gejala:** Saat pemain mengarahkan kursor belanja ke item paling kanan di matras (`x >= 800`), buku inventori mendadak terbuka sendiri.
* **Akar Masalah:** Terdapat logika batas lama di mana kursor kanan yang mentok dianggap sebagai gestur ingin beralih ke inventori di sisi kanan layar.
* **Solusi:** Menghapus pengait otomatis `cur.x >= 800`; mengunci pembukaan buku hanya melalui pemicu eksplisit: tombol `[TAB]` atau klik mouse pada pita bookmark kanan.

### 🐛 Bug 2: Pergeseran Koordinat Tata Letak Buku Inventori di Toko
* **Gejala:** Tampilan buku inventori saat belanja sempat terpotong dan pita bookmark-nya keluar layar.
* **Akar Masalah:** Perbedaan koordinat lokal antara `Scene_StatusJournal` dan kontainer sprite di `Scene_KarsoShop`.
* **Solusi:** Standarisasi pusat buku `Whole book.png` pada `(0, 0)`, menyematkan pita bookmark `Item.png` di `(15, 122)` di bawah kertas kiri `(239, 21)` sehingga identik 100% pixel-perfect dengan Tab 1 Jurnal Status.

### 🐛 Bug 3: Bar Dialog Bouncing / Buka-Tutup pada Percakapan Bersambung
* **Gejala:** Bar hitam sinematik atas-bawah membuka dan menutup berkali-kali setiap pemain menekan tombol lanjut (Enter) pada dialog beruntun.
* **Akar Masalah:** `Window_Message.prototype.terminateMessage` menutup jendela secara instan setiap halaman pesan berakhir tanpa memeriksa perintah berikutnya.
* **Solusi:** Membangun fungsi *lookahead* `isNextCommandDialogue()`. Jika perintah penerjemah event berikutnya adalah dialog lain (`code === 101`), bar tetap diam di posisinya dan hanya menghapus teks; bar baru meluncur menutup saat seluruh dialog selesai.

### 🐛 Bug 4: Suara Karakter Mbah Karso Tidak Terdeteksi (Race Condition)
* **Gejala:** Karakter Mbah Karso tetap berbunyi suara default cute dan bukannya suara berat (`deep`).
* **Akar Masalah:** Pembacaan nama pembicara `this._speakerName` dilakukan *sebelum* `_Window_Message_startMessage.call(this)`. Padahal nama pembicara baru diekstrak oleh plugin *floating name box* saat `convertEscapeCharacters` dipanggil di dalam `startMessage`.
* **Solusi:** Memindahkan resolusi suara ke akhir pemanggilan `startMessage`, menjamin `this._speakerName` telah terisi sempurna.

### 🐛 Bug 5: Suara Dialog Mendem, Pelan, dan Tidak Terdengar Imut
* **Gejala:** Suara gumaman dialog terdengar redup, tenggelam di bawah BGM, dan bernada datar.
* **Akar Masalah:** Filter bandpass memiliki resonansi Q terlalu tinggi (3.5–4.0) sehingga menolak sebagian besar spektrum suara; frekuensi dasar 430 Hz setara nada orang dewasa (bukan imut); belum ada lekukan frekuensi (*pitch sweep*).
* **Solusi:** Menaikkan nada dasar ke 780 Hz – 1050 Hz (oktaf F#5 - C6), mengganti filter ke warm open lowpass (4800 Hz), menambahkan lengkungan nada vokal gelembung (*dynamic micro-sweeps*), dan memperbesar volume ke 0.38.

### 🐛 Bug 6: TypeError Ramping Web Audio Param
* **Gejala:** Eksekusi audio gagal pada lingkungan uji dengan galat `gain.gain.linearRampToValueAtTime is not a function`.
* **Akar Masalah:** Pemanggilan langsung metode ramping tanpa pengecekan tipe pada objek audio param yang belum tentu mendukung seluruh metode W3C Web Audio di lingkungan simulasi.
* **Solusi:** Menambahkan pemeriksaan protektif `typeof gain.gain.linearRampToValueAtTime === 'function'` dengan fallback otomatis ke `setValueAtTime`.

### 🐛 Bug 7: Inkonsistensi Hash SHA256 Antara Direktori Kerja Ganda
* **Gejala:** File `js/plugins.js` terdeteksi berbeda hash antara direktori `Yure Party` dan `Yure Party #3`.
* **Akar Masalah:** Penyunting eksternal sempat membuka editor plugin dan menghilangkan pendaftaran plugin di baris paling bawah pada salah satu direktori.
* **Solusi:** Menjalankan skrip sinkronisasi otomatis dan memverifikasi integritas hash SHA256 100% identik *byte-for-byte* di kedua direktori.

### 🐛 Bug 8: Galat 'Unable to read file: plugins.js' di Editor RPG Maker MV
* **Gejala:** Saat membuka Plugin Manager di editor RPG Maker MV, muncul kotak dialog galat: `Unable to read file: plugins.js`.
* **Akar Masalah:** Parser internal editor RPG Maker MV (berbasis Qt C++ `QJsonDocument`) menerapkan parsing JSON ketat (*strict JSON*). Terdapat tanda koma penutup (*trailing comma*) pada entri plugin terakhir sebelum kurung siku tutup `];`, yang memicu galat sintaks di parser Qt editor.
* **Solusi:** Menghilangkan tanda koma pada objek plugin paling akhir (`Yure_VisualInspector`), memastikan seluruh blok array `$plugins` 100% lolos uji *strict JSON.parse* dan dapat dibaca sempurna oleh editor RPG Maker MV.

### 🐛 Bug 9: RPG Maker MV Harsh Rectangular Tile Shadows (Kotak Hitam Kaku 24px)
* **Gejala:** Bayangan bangunan bawaan RPG Maker MV tampak sebagai balok-balok hitam pekat bersudut tajam 90° (`shadowBits` layer 4), merusak estetika peta bernuansa mistis.
* **Akar Masalah:** Logika bawaan `ShaderTilemap.prototype._drawShadow` langsung menggambar persegi 24x24 px berwarna hitam pekat di kanvas tilemap tanpa dukungan gradasi atau anti-aliasing.
* **Solusi:** Menonaktifkan fungsi `_drawShadow` bawaan dan mengosongkan `shadowColor` shader tilemap, lalu menggantikannya dengan modul rendering penumbra mandiri `Sprite_SmoothBuildingShadows` yang menghasilkan gradasi blur difusi lembut dengan sudut melengkung dan palet ambient ungu malam (`rgba(20, 10, 36, 0.42)`).

### 🐛 Bug 10: Overexposure / Whiteout pada Tumpang Tindih Sumber Cahaya Shader
* **Gejala:** Ketika beberapa sumber cahaya (lentera karakter + obor jalan) berdekatan, area perpotongan cahaya menjadi putih terbakar (*blown-out white chalk*) dan kehilangan saturasi warnanya.
* **Akar Masalah:** Pencampuran warna aditif langsung tanpa kurva kompresi saturasi menghasilkan nilai RGB > 1.0 yang terpotong menjadi putih murni pada shader WebGL.
* **Solusi:** Menerapkan formulasi atenuasi kuadrat terbalik (*inverse-square falloff*) dengan pembatas kurva *smoothstep* serta kompresi *filmic saturation-preserving* pada fragment shader `Yure_LightingShadowShader.js`.

### 🐛 Bug 11: TypeError: layers[i].clear is not a function di pixi-tilemap.js
* **Gejala:** Game langsung crash saat memuat scene peta (`Scene_Map`) dengan pesan galat `TypeError: layers[i].clear is not a function at ZLayer.clear (pixi-tilemap.js:825:31)`.
* **Akar Masalah:** `Sprite_SmoothBuildingShadows` sempat dimasukkan ke dalam `this._tilemap.lowerZLayer` (`ZLayer`). Kontainer `ZLayer` milik Pixi-Tilemap secara ketat mengasumsikan seluruh anaknya adalah `CompositeRectTileLayer` dan memanggil metode `.clear()` pada setiap elemen saat repainting tile. Sprite standar tidak memiliki fungsi `.clear()`.
* **Solusi:**
  1. Menambahkan sprite bayangan langsung ke kontainer utama `this._tilemap.addChild(this._smoothBuildingShadows)` dengan nilai `z = 0.5`. Melalui fungsi `_sortChildren()`, sprite otomatis terurut di atas layer dasar (`lowerZLayer` z: 0) dan di bawah karakter (`z = 1`) tanpa mengotori array internal `ZLayer`.
  2. Menyediakan fungsi stub protektif `Sprite_SmoothBuildingShadows.prototype.clear = function() {}`.
### 🐛 Bug 12: Undakan Tangga Kotak-Kotak 24px pada Goresan Bebas Shadow Pen
* **Gejala:** Saat pemain/kreator menggambar bayangan tebing, lereng, atau rumput miring menggunakan *Shadow Pen* bawaan editor RPG Maker MV (seperti pada Map006 sisi kanan), bayangan in-game tampak sebagai undakan tangga kaku bersudut tajam 90° berukuran 24x24 px.
* **Akar Masalah:** Logika `Sprite_SmoothBuildingShadows` sebelumnya hanya memperhalus garis vertikal lurus 1-tile `(bits & 5) === 5`. Saat menemukan bayangan goresan kuadran lain atau area miring, kode jatuh ke *fallback* `ctx.fillRect(qx, qy, hw, hh)` tanpa penumbra blur.
* **Solusi:** Merombak total `Sprite_SmoothBuildingShadows` menjadi **Unreal Engine Dynamic Soft Shadow Engine**. Seluruh *shadow bits* dipetakan ke buffer kanvas dan diproses menggunakan filter difusi Gaussian *separable 3-pass* berkecepatan tinggi (~15ms) dengan kurva *smoothstep S-curve* PCSS dan proyeksi arah datang sinar matahari/rembulan (`castOffset`), serta menambahkan `Sprite_YureCharacterShadow` untuk bayangan kontak elips di bawah kaki karakter yang bereaksi terhadap fisika melompat.

---

## BAGIAN 8: STANDAR KUALITAS & ARSITEKTUR TEKNIS

1. **Paritas Direktori 100% Byte-for-Byte:**  
   Setiap perubahan pada kode sumber, aset, maupun konfigurasi database selalu diselaraskan secara instan antara direktori utama dan direktori `#3` dengan verifikasi hash SHA256.
2. **Pembersihan Memori Otomatis (Anti-Memory Leak):**  
   Setiap sprite, bitmap, partikel debu, dan node Web Audio selalu dibersihkan dan diputus (*disconnect*) dari memory bus saat transisi scene berlangsung.
3. **Pengujian Simulator Headless:**  
   Fitur baru wajib lolos uji simulasi headless Node.js di folder `scratch/` untuk memastikan logika bisnis, penanganan input, dan status jendela berjalan tanpa cela sebelum diuji secara visual di RPG Maker MV.

---
*Dokumen ini merupakan panduan resmi pengembangan game Yure Party. Seluruh isi dokumen ini menjadi acuan mutlak bagi penambahan fitur, balancing pertarungan, dan ekspansi naratif di masa depan.* 🎮✨


### 4.7 Living Town NPC & Atmospheric Ambient Life (Map 006)
- **Otonomi Warga Kota**: Menghadirkan NPC warga kota yang berlalu lalang dengan rute patroli bolak-balik maupun acak santai (*wander*).
- **Preset Roster**: Jon (`jon.png`), Rudi (`People1`), Tina (`People1`), dan Kakek Somad (`People2`).
- **Interaktivitas Penuh**: Karakter dapat diajak berinteraksi dengan tombol aksi (Z/Spasi/Klik), menoleh menghadap pemain, dan menampilkan percakapan ramah dengan efek suara gibberish prosedural.
- **Fisika Bayangan Konsisten**: Terkoneksi ke sistem `Sprite_YureCharacterShadow` yang melacak sudut matahari 24 jam.


### 4.8 Title Screen Animated Video Background Engine (v0.12)
- **Kompatibilitas Multi-Resolusi**: Mendukung file video `.webm` / `.mp4` dari 720p hingga 4K UHD, rasio 4:3, 16:9, dan 21:9 ultrawide.
- **Mode Skala Otomatis**: Fitur `cover` cerdas yang memastikan video mengisi 100% layar 1280x720 tanpa garis hitam (*anti-letterbox*).
- **Integrasi UI Terpadu**: Tombol perintah Moghunter, tombol Galeri, transisi lingkaran kartun, dan kursor custom tetap mengambang responsif di atas video.
- **Pembersihan Bersih (Garbage Collection)**: Otomatis melepaskan sumber daya video dan WebGL saat masuk ke scene permainan.

### 4.9 Occult Living Wheel & Dynamic Menu Atmosphere (v0.13)
- **Koreksi Jangkar Tombol (Anchor Pivot Geometry)**:
  - Mengatasi cacat visual di mana tombol perintah menu aktif tampak bergeser terlalu jauh ke kanan dan terpotong di sebelah kiri di balik rahang tengkorak.
  - Anchor diatur presisi pada poros lencana lingkaran (`x ≈ 0.104`), mempertahankan jarak aman >73px dari tengkorak tanpa penetrasi.
  - Skala aktif dirampingkan dari 1.60 menjadi 1.18 dengan efek pop geser halus (+12px ke kanan) saat disorot.
  - Backlight magenta dikunci mengikuti posisi dan skala 1.05x tombol aktif.
- **Tengkorak Supranatural Bernapas (*Floating Occult Skull*)**:
  - Animasi mengambang sinusoidal pada sprite tengkorak dan mata api berkedip, menghadirkan impresi entitas gaib penjaga menu yang bernapas.
- **Bara Arwah & Ledakan Navigasi (`Sprite_MenuWheelEmbers`)**:
  - Efek partikel bara arwah halus di sekitar roda busur menu dan semburan 8 percikan cahaya saat pemain menavigasi opsi.
