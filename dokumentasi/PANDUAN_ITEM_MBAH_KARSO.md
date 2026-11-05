# 🧓 PANDUAN LENGKAP SISTEM & ITEM TOKO MBAH KARSO
> **Dokumentasi Resmi 27 Item Mbah Karso, Konfigurasi Database, & Logika Sistem**  
> *Sesuai Master Desain Google Sheets (`karso item.pdf`) & Spritesheet `img/pictures/items/karso.png`*  
> *Plugin Mesin:* `Yure_KarsoShop.js`, `Yure_KarsoItemSystem.js`, `Yure_CustomIcon.js`  

---

## 1. 🌟 IKHTISAR TOKO LESEHAN MBAH KARSO

Mbah Karso adalah kakek misterius penjual pusaka, ramuan gaib, dan batu akik keramat. Tokonya menggunakan antarmuka *overhead view* di atas matras kain biru (`ground.png`) dengan sepasang kaki bersila (`sikil.png`) dan 12 slot barang dagangan berserakan acak (*scattered goods*).

### Fitur Otomatisasi Stok:
- **Pool Otomatis (`generateKarsoGoods`):** Jika event toko dibuka, sistem mengumpulkan seluruh item/armor yang memiliki tag `<karso shop>` dan harga > 0.
- **Pengacakan Harian:** Stok 12 slot di atas matras kain otomatis di-acak dan diperbarui setiap malam/hari berganti (`Day_X_Night`).
- **Antarmuka Invoice & Scrapbook:** Klik barang memunculkan kertas detail (`Left page.png`) dari bawah dengan foto Polaroid 130x130 px. Tekan `[TAB]` meluncurkan buku inventori pemain dari kanan untuk menjual barang.

---

## 2. 🎨 SPRITESHEET IKON KUSTOM (`karso.png`)

- **File Sumber:** `img/pictures/items/karso.png` (900 x 1350 px).
- **Grid:** 10 kolom x 15 baris (Total 150 slot ikon, masing-masing 90 x 90 px).
- **Format Pemanggilan di Database:**
  ```text
  <Item Icon: Index>    atau    <Karso Icon: Index>
  ```
  *(Index dihitung dari 0 = Baris 0 Kolom 0, hingga 149 = Baris 14 Kolom 9).*

---

## 3. 📋 DAFTAR LENGKAP 27 ITEM MBAH KARSO

### Kategori A: Ramuan & Obat Gaib (Consumables - `data/Items.json`)

| ID | Nama Item | Harga | Ikon Sheet | Efek & Mekanika Utama | Efek Samping / Karakteristik |
| :-: | :--- | :-: | :---: | :--- | :--- |
| **8** | **Adrenaline syringe** | 150 G | `<Item Icon: 0>` | +25% Rage / TP seketika. | Mengurangi Sanity. Penalti konsumsi Sanity meningkat **x1.5 lipat** per pemakaian di hari yang sama. |
| **9** | **Karso's powerful strength potion** | 220 G | `<Item Icon: 1>` | +20% Damage fisik selama 5 giliran. | 25% risiko terkena status **Diarrhea** (Mules: -30% AGI selama 3 turn). |
| **10** | **Karso's powerful magic potion** | 200 G | `<Item Icon: 2>` | +25% Pemulihan Energy (MP). | 25% risiko terkena status **Headache** (Pusing: -20% MAT selama 3 turn). |
| **11** | **Karso's powerful green potion** | 250 G | `<Item Icon: 3>` | +10% Pemulihan Sanity energi mental. | 20% risiko terkena status **Nausea** (Mual: -15% HIT selama 3 turn). |
| **12** | **Suspicious rainbow potion** | 400 G | `<Item Icon: 4>` | +15% HP, +15% MP, +15 TP, +10% Damage, +1 Buff Acak (DEF/MAT/AGI). | Efek buff tidak bisa distack. Jika dipakai > 1x sehari: 60% Nausea, 40% Diare, 35% Halusinasi/Blind. |
| **13** | **Buddha's hand fruit** | 180 G | `<Item Icon: 18>` | Memberikan berkah buff peningkatan atribut acak (+30% ATK, DEF, MAT, atau AGI). | Efek berkah bertahan 5 giliran. |
| **14** | **Incense stick (Dupa Keramat)** | 150 G | `<Item Icon: 19>` | Menenangkan arwah & hantu agresif selama 1 hari penuh. | Mengurangi laju perjumpaan hantu (encounter steps berlipat ganda) dan menenangkan agresi. |
| **15** | **Rawa rontek stone (Batu Aji)** | 650 G | `<Item Icon: 17>` | Membangkitkan rekan party yang gugur dengan 17% HP. | Target: 1 Dead Ally. Animasi: Revive 1. |
| **16** | **Semar mesem (Pusaka Pemikat)** | 500 G | `<Item Icon: 14>` | Menghipnotis dan memikat musuh dalam kebingungan gaib. | Target: 1 Musuh. 85% peluang memicu status **Fascination / Charm**. |

---

### Kategori B: Material Tempa Jiwa (Mob Drops - `data/Items.json`)

| ID | Nama Item | Tipe | Ikon Sheet | Deskripsi & Kegunaan |
| :-: | :--- | :---: | :---: | :--- |
| **7** | **Soul of the timid** | Material | `<Item Icon: 6>` | Pendaran jiwa penakut. Digunakan untuk menempa skill rasi bintang (*Constellation*). |
| **17** | **Soul of the brave** | Material | `<Item Icon: 5>` | Jiwa keberanian murni. Bahan tempa skill rasi bintang. |
| **18** | **Soul of the sadness** | Material | `<Item Icon: 7>` | Jiwa kesedihan mistis. Bahan tempa skill rasi bintang. |
| **19** | **Soul of the Light** | Material | `<Item Icon: 8>` | Pendaran jiwa cahaya suci. Bahan tempa skill rasi bintang. |
| **20** | **Soul of Green** | Material | `<Item Icon: 9>` | Pendaran jiwa hijau alami. Bahan tempa rahasia rasi bintang. |

---

### Kategori C: Gulungan Rajah Segel (Seals - `data/Armors.json` - Slot Jurnal `Seal I / II`)

| ID | Nama Item | Slot Equip | Harga | Ikon Sheet | Atribut & Efek Pasif |
| :-: | :--- | :---: | :-: | :---: | :--- |
| **5** | **Rajah (red seal)** | Seal (Etype 3) | 300 G | `<Item Icon: 10>` | **+15 ATK (Strength)**. Memperkuat daya hancur serangan fisik. |
| **6** | **Rajah (blue seal)** | Seal (Etype 3) | 300 G | `<Item Icon: 11>` | **+40 Max MP, +10 MAT**. Meningkatkan kapasitas dan kekuatan mantra batin. |
| **7** | **Rajah (green seal)** | Seal (Etype 3) | 300 G | `<Item Icon: 12>` | **+120 Max HP, +10 DEF**. Menopang ketahanan fisik raga pemakainya. |
| **8** | **Rajah (gold seal)** | Seal (Etype 3) | 550 G | `<Item Icon: 13>` | **+50 HP, +20 MP, +8 Semua Parameter**. Keseimbangan seluruh atribut. |

---

### Kategori D: Batu Akik Katalis Gaib (Spirit Catalysts - `data/Armors.json` - Slot `Catalyst I / II`)

| ID | Nama Item | Slot Equip | Harga | Ikon Sheet | Atribut & Kemampuan Khusus |
| :-: | :--- | :---: | :-: | :---: | :--- |
| **9** | **Common pomegranate akik** *(Merah Delima)* | Catalyst (Etype 4) | 450 G | `<Item Icon: 20>` | **+12 ATK**. Akumulasi kekuatan: Serangan fisik bertambah **+2% setiap giliran** pertempuran! |
| **10** | **Common lapiz akik** *(Lapis Lazuli)* | Catalyst (Etype 4) | 420 G | `<Item Icon: 21>` | **+60 MP, +6 MAT, +6 MDF**. Mengalirkan **regenerasi 3% MP** di setiap akhir giliran. |
| **11** | **Common turquoise akik** *(Batu Pirus)* | Catalyst (Etype 4) | 450 G | `<Item Icon: 22>` | **+250 Max HP, +10 DEF**. Menambah tebal darah maksimal secara signifikan. |
| **12** | **Common amber akik** *(Batu Amber)* | Catalyst (Etype 4) | 480 G | `<Item Icon: 23>` | **+6 ATK, +5 AGI**. **+25% Akumulasi TP/Rage** (*TP Charge Rate*). |
| **13** | **Sperm white akik** *(Mani Gajah)* | Catalyst (Etype 4) | 950 G | `<Item Icon: 24>` | **+50 HP, +20 MP, +15 LUK**. Saat menerima serangan mematikan, ada **peluang 1/15 (~6.7%) bangkit seketika dengan 50% HP**! |
| **14** | **Bloodstone akik** | Catalyst (Etype 4) | 600 G | `<Item Icon: 25>` | **+10 ATK**. Serangan fisik memiliki **35% peluang menimbulkan status Bleed** (-5% HP musuh per turn). |
| **15** | **Sunstone akik** *(Batu Surya)* | Catalyst (Etype 4) | 600 G | `<Item Icon: 26>` | **+8 ATK, +8 MAT**. Serangan memiliki **35% peluang menimbulkan status Burn** (-6% HP api per turn). |
| **16** | **Mangostone akik** *(Batu Manggis)* | Catalyst (Etype 4) | 500 G | `<Item Icon: 27>` | **+18 DEF, +18 MDF**. Menambah pertahanan tebal dan **+20% Resistansi Racun & Pendarahan**. |

---

### Kategori E: Jimat & Pusaka Mistis (Accessories - `data/Armors.json` - Slot `Accessory I / II`)

| ID | Nama Item | Slot Equip | Harga | Ikon Sheet | Atribut & Efek Khusus |
| :-: | :--- | :---: | :-: | :---: | :--- |
| **17** | **Semar mesem (Pusaka)** | Accessory (Etype 5) | 550 G | `<Item Icon: 14>` | **+10 ATK, +15 LUK**. Jimat pemikat yang meningkatkan daya rusak fisik dan keberuntungan. |
| **18** | **Jenglot (Figurine Kuno)** | Accessory (Etype 5) | 800 G | `<Item Icon: 16>` | **+15 ATK, +15 MAT, +5 AGI, -10 LUK**. Setiap giliran: 50% memberi **Berkah Gaib** (+ATK/AGI), 50% memberi **Kutukan Ringan** (slip 4% HP). |
| **19** | **Rawa rontek stone (Pusaka)** | Accessory (Etype 5) | 750 G | `<Item Icon: 17>` | **+100 HP, +5 ATK, +5 DEF**. Jika pemakai gugur, **otomatis bangkit kembali dengan 17% HP** (pasti aktif 1x per battle). |

---

## 4. 🛡️ STATUS EFEK BARU DI DATABASE (`data/States.json`)

Untuk mendukung efek samping ramuan dan kemampuan kutukan/akik, 6 status baru telah ditambahkan:
- **ID 15: Diarrhea (Mules / Diare):** -30% AGI selama 2-3 giliran.
- **ID 16: Headache (Pusing Kepala):** -20% MAT selama 2-3 giliran.
- **ID 17: Nausea (Mual):** -15% Akurasi Serangan (HIT) selama 2-3 giliran.
- **ID 18: Bleed (Pendarahan):** -5% HP tiap akhir giliran selama 3 giliran.
- **ID 19: Burn (Terbakar):** -6% HP api tiap akhir giliran selama 3 giliran.
- **ID 20: Ghost Calmed (Dupa Pelindung):** Menandakan aura dupa penenang aktif di tubuh party.

---

## 5. 🧩 ARSITEKTUR PLUGIN SISTEM (`Yure_KarsoItemSystem.js`)

Plugin ini beroperasi secara transparan dan terintegrasi penuh:
1. **Universal Equip Hook:** Meng-override `Game_BattlerBase.prototype.canEquipArmor` agar semua karakter party dapat melengkapi Rajah, Akik, dan Jimat tanpa konflik batasan kelas (*Class traits*).
2. **Combat Hooks:**
   - Menghubungkan pemeriksaan `_Game_Action_executeHpDamage` untuk eksekusi kebangkitan Rawa Rontek (17% HP pasti, 1x battle) dan Mani Gajah (1/15 peluang 50% HP).
   - Menghubungkan `BattleManager.startTurn` untuk akumulasi kekuatan batu akik merah delima (+2% ATK) dan siklus berkah/kutukan Jenglot.
3. **Daily Cycle Integration:** Terhubung dengan sistem hari in-game (`$gameVariables.value(11)`) untuk menghitung batas aman konsumsi Suspicious Rainbow Potion dan durasi dupa penenang hantu.

