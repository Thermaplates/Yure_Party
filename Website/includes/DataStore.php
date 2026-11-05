<?php
// Website/includes/DataStore.php
// JSON DataStore Engine dengan Atomic Locking dan Helper CRUD

require_once __DIR__ . '/config.php';

class DataStore {
    private static ?DataStore $instance = null;
    private string $filePath;

    private function __construct(string $filePath = DB_FILE) {
        $this->filePath = $filePath;
        $this->initDefaultData();
    }

    public static function getInstance(): DataStore {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Membaca seluruh data JSON dengan file lock
     */
    public function load(): array {
        if (!file_exists($this->filePath)) {
            $this->initDefaultData();
        }

        $fp = fopen($this->filePath, 'rb');
        if (!$fp) {
            return [];
        }

        flock($fp, LOCK_SH);
        $contents = stream_get_contents($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        $data = json_decode($contents, true);
        return is_array($data) ? $data : [];
    }

    /**
     * Menyimpan data JSON secara aman dan atomic
     */
    public function save(array $data): bool {
        $data['updated_at'] = date('c');
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        $tempFile = $this->filePath . '.tmp.' . bin2hex(random_bytes(4));
        $fp = fopen($tempFile, 'wb');
        if (!$fp) {
            return false;
        }

        flock($fp, LOCK_EX);
        fwrite($fp, $json);
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        return rename($tempFile, $this->filePath);
    }

    /**
     * Mengambil koleksi tertentu (misal 'members', 'projects', 'studio')
     */
    public function get(string $key, $default = null) {
        $data = $this->load();
        return $data[$key] ?? $default;
    }

    /**
     * Menyimpan atau memperbarui koleksi tertentu
     */
    public function set(string $key, $value): bool {
        $data = $this->load();
        $data[$key] = $value;
        return $this->save($data);
    }

    /**
     * Mengambil 1 item dari array berdasarkan ID
     */
    public function findById(string $collectionKey, string $id): ?array {
        $items = $this->get($collectionKey, []);
        foreach ($items as $item) {
            if (isset($item['id']) && (string)$item['id'] === (string)$id) {
                return $item;
            }
        }
        return null;
    }

    /**
     * Menambahkan atau memperbarui item dalam koleksi array
     */
    public function upsertItem(string $collectionKey, array $itemData): array {
        $data = $this->load();
        $items = $data[$collectionKey] ?? [];

        if (empty($itemData['id'])) {
            $itemData['id'] = 'item_' . time() . '_' . bin2hex(random_bytes(3));
            $itemData['created_at'] = date('c');
        }
        $itemData['updated_at'] = date('c');

        $found = false;
        foreach ($items as $idx => $existing) {
            if (isset($existing['id']) && (string)$existing['id'] === (string)$itemData['id']) {
                $items[$idx] = array_merge($existing, $itemData);
                $found = true;
                break;
            }
        }

        if (!$found) {
            $items[] = $itemData;
        }

        $data[$collectionKey] = $items;
        $this->save($data);
        return $itemData;
    }

    /**
     * Menghapus item berdasarkan ID
     */
    public function deleteItem(string $collectionKey, string $id): bool {
        $data = $this->load();
        $items = $data[$collectionKey] ?? [];
        $initialCount = count($items);

        $items = array_values(array_filter($items, function($item) use ($id) {
            return !isset($item['id']) || (string)$item['id'] !== (string)$id;
        }));

        if (count($items) !== $initialCount) {
            $data[$collectionKey] = $items;
            return $this->save($data);
        }
        return false;
    }

    /**
     * Inisialisasi data bawaan studio zerobrain & 4 pengembang utama
     */
    public function initDefaultData(bool $force = false): void {
        if (file_exists($this->filePath) && !$force) {
            return;
        }

        $defaultAdminPassword = password_hash('zerobrain2026!', PASSWORD_BCRYPT);

        $defaultData = [
            'studio' => [
                'name' => 'zerobrain',
                'title' => 'zerobrain studio',
                'tagline' => 'Crafting Immersive, Soul-Stirring Indie Experiences',
                'badge' => 'Indie Game Development Studio',
                'description' => 'Kami adalah tim pengembang game independen yang berdedikasi memadukan arsitektur kode yang tangguh, estetika visual memikat, desain aset teliti, dan aransemen musik atmosferik untuk melahirkan karya game yang tak terlupakan.',
                'founded' => '2024',
                'location' => 'Indonesia',
                'hero_subtitle' => 'Architecting worlds through code, art, assets, and sound.',
                'vision' => 'Menciptakan karya game independen yang membekas di hati pemain dengan cerita mendalam, visual berkarakter, dan gameplay adiktif.',
                'stats' => [
                    ['label' => 'Core Developers', 'value' => '4'],
                    ['label' => 'Major Projects', 'value' => '2+'],
                    ['label' => 'Custom Engine Scripts', 'value' => '50+'],
                    ['label' => 'Original Tracks Composed', 'value' => '30+']
                ],
                'socials' => [
                    'discord' => 'https://discord.gg',
                    'steam' => 'https://store.steampowered.com',
                    'itchio' => 'https://itch.io',
                    'github' => 'https://github.com',
                    'twitter' => 'https://x.com',
                    'youtube' => 'https://youtube.com'
                ]
            ],
            'members' => [
                [
                    'id' => 'archelino',
                    'name' => 'Archelino',
                    'role' => 'Game Developer',
                    'title_sub' => 'Lead Gameplay Programmer & Systems Architect',
                    'category' => 'code',
                    'accent_color' => '#3b82f6',
                    'avatar' => 'assets/images/avatar_archelino.svg',
                    'bio' => 'Arsitek sistem game dan motor penggerak mekanik di balik zerobrain. Memprogram logika pertarungan dinamis, custom engine scripts, optimasi performa, dan sinkronisasi sistem gameplay yang mulus.',
                    'quote' => 'Kode yang elegan adalah fondasi dari setiap dunia fantasi yang imersif.',
                    'skills' => [
                        ['name' => 'Core Game Logic', 'level' => 96],
                        ['name' => 'Engine Architecture & JS', 'level' => 94],
                        ['name' => 'System Optimization', 'level' => 90],
                        ['name' => 'Custom Plugin Engineering', 'level' => 92]
                    ],
                    'responsibilities' => [
                        'Arsitektur Game Engine & Core Logic',
                        'Pengembangan Custom HUD & Battle System',
                        'Optimasi Performa & State Management',
                        'Integrasi Script & Audio Engine'
                    ],
                    'socials' => [
                        'github' => 'https://github.com',
                        'twitter' => 'https://x.com'
                    ],
                    'featured' => true,
                    'order' => 1
                ],
                [
                    'id' => 'coby_novaenan',
                    'name' => 'Coby novaenan',
                    'role' => 'Art Director',
                    'title_sub' => 'Lead Visual Concept & Aesthetic Director',
                    'category' => 'art',
                    'accent_color' => '#ec4899',
                    'avatar' => 'assets/images/avatar_coby.svg',
                    'bio' => 'Pengarah visual yang meniupkan jiwa estetika ke dalam game zerobrain. Mengkonsepkan desain karakter orisinal, ilustrasi key art, pencahayaan dramatis, dan komposisi mood visual yang memukau.',
                    'quote' => 'Setiap bayangan dan goresan warna menceritakan emosi yang tak terucap.',
                    'skills' => [
                        ['name' => 'Visual Concept & Direction', 'level' => 98],
                        ['name' => 'Character Design', 'level' => 95],
                        ['name' => 'Key Art & Illustration', 'level' => 93],
                        ['name' => 'Color Grading & Lighting', 'level' => 91]
                    ],
                    'responsibilities' => [
                        'Arah Estetika & Visual Mood Studio',
                        'Perancangan Konsep Karakter & Latar',
                        'Ilustrasi Key Visual & Promosi',
                        'Supervisi Konsistensi Seni Game'
                    ],
                    'socials' => [
                        'artstation' => 'https://artstation.com',
                        'instagram' => 'https://instagram.com'
                    ],
                    'featured' => true,
                    'order' => 2
                ],
                [
                    'id' => 'oonori',
                    'name' => 'oonori',
                    'role' => 'Asset Director',
                    'title_sub' => 'Lead Sprite Artist & Interface / World Decorator',
                    'category' => 'assets',
                    'accent_color' => '#10b981',
                    'avatar' => 'assets/images/avatar_oonori.svg',
                    'bio' => 'Spesialis detail visual game yang merakit dunia permainan menjadi nyata. Menggarap lembaran sprite animasi, tileset peta berdetail tinggi, ikonik HUD, serta elemen UI/UX interaktif yang intuitif.',
                    'quote' => 'Dunia yang hidup tersusun dari ribuan detail kecil yang dikerjakan dengan cinta.',
                    'skills' => [
                        ['name' => 'Sprite & Frame Animation', 'level' => 95],
                        ['name' => 'Tileset World Crafting', 'level' => 92],
                        ['name' => 'HUD / UI/UX Design', 'level' => 94],
                        ['name' => 'In-Game Iconography', 'level' => 89]
                    ],
                    'responsibilities' => [
                        'Penciptaan Lembaran Sprite Animasi Karakter',
                        'Penyusunan Lingkungan Dunia & Tileset',
                        'Desain Antarmuka Pengguna (UI/UX) & HUD',
                        'Manajemen Aset Grafis & Optimalisasi Tekstur'
                    ],
                    'socials' => [
                        'twitter' => 'https://x.com',
                        'behance' => 'https://behance.net'
                    ],
                    'featured' => true,
                    'order' => 3
                ],
                [
                    'id' => 'renpoo',
                    'name' => 'renpoo',
                    'role' => 'Composer Music',
                    'title_sub' => 'Lead Audio Engineer & Sound Designer',
                    'category' => 'music',
                    'accent_color' => '#8b5cf6',
                    'avatar' => 'assets/images/avatar_renpoo.svg',
                    'bio' => 'Maestro audio di balik melodi-melodi berhantu dan mempesona. Menggubah Original Soundtrack (OST), aransemen orkestra, modulasi suara dinamis, serta efek suara foley yang membangun atmosfer imersif.',
                    'quote' => 'Musik bukanlah sekadar latar, melainkan detak jantung dari emosi permainan.',
                    'skills' => [
                        ['name' => 'Original Soundtrack Composition', 'level' => 97],
                        ['name' => 'Atmospheric Audio Design', 'level' => 94],
                        ['name' => 'Sound Effects (SFX) Engineering', 'level' => 91],
                        ['name' => 'Dynamic Audio Mixing & MIDI', 'level' => 95]
                    ],
                    'responsibilities' => [
                        'Komposisi Musik BGM & Main Theme Orisinal',
                        'Desain Sound Effects (SFX) Lingkungan & Pertarungan',
                        'Mixing, Mastering, & Balancing Audio Game',
                        'Pengembangan Sistem Musik Interaktif'
                    ],
                    'socials' => [
                        'soundcloud' => 'https://soundcloud.com',
                        'spotify' => 'https://spotify.com'
                    ],
                    'featured' => true,
                    'order' => 4
                ]
            ],
            'projects' => [
                [
                    'id' => 'yure-party',
                    'title' => 'Yure Party',
                    'status' => 'Active Development',
                    'release_date' => 'Coming Soon',
                    'genre' => 'Psychological Horror / Dark Fantasy RPG',
                    'cover_image' => 'assets/images/project_yure_party.svg',
                    'summary' => 'Proyek kolaborasi unggulan zerobrain. Mengisahkan petualangan misterius dalam pesta arwah dengan sistem pertarungan taktis yang unik, visual menawan, serta iringan komposisi musik yang mencekam.',
                    'description' => 'Yure Party adalah game role-playing bertema misteri gelap yang memadukan eksplorasi atmosferik dengan pertarungan party strategis. Dibangun dengan kustomisasi engine mendalam oleh Archelino, arahan seni memukau oleh Coby novaenan, ribuan aset sprite & tileset detail oleh oonori, serta iringan orkestra gubahan renpoo yang menghanyutkan.',
                    'features' => [
                        'Sistem Pertarungan Taktis Dinamis dengan Actor HUD kustom',
                        'Karakter orisinal dengan latar belakang cerita emosional mendalam',
                        'Soundtrack interaktif yang berevolusi sesuai tensi permainan',
                        'Visual pixel art eksklusif berpadu efek pencahayaan atmosferik'
                    ],
                    'tags' => ['Flagship Title', 'RPG', 'Atmospheric', 'Original Soundtrack'],
                    'links' => [
                        'demo' => '#',
                        'steam' => '#',
                        'trailer' => '#'
                    ],
                    'featured' => true
                ],
                [
                    'id' => 'project-phantom-zero',
                    'title' => 'Project Phantom Zero',
                    'status' => 'Concept / Prototype',
                    'release_date' => 'TBA',
                    'genre' => 'Cyberpunk Action Dungeon Crawler',
                    'cover_image' => 'assets/images/project_phantom_zero.svg',
                    'summary' => 'Eksperimen baru dari zerobrain yang mengusung aksi cepat di labirin cyberpunk bawah tanah dengan synthwave soundtrack dan mekanik hack-and-slash.',
                    'description' => 'Dungeon crawler berkecepatan tinggi dengan pertarungan real-time dan mekanisme manipulasi memori digital.',
                    'features' => [
                        'Mekanisme pertempuran real-time combo beruntun',
                        'Seni visual cyberpunk neon berpadu dark fantasy',
                        'Soundtrack bertenaga synthwave dinamis'
                    ],
                    'tags' => ['Prototype', 'Action RPG', 'Cyberpunk'],
                    'links' => [
                        'demo' => '#',
                        'steam' => '',
                        'trailer' => ''
                    ],
                    'featured' => false
                ]
            ],
            'music_tracks' => [
                [
                    'id' => 'track_1',
                    'title' => 'Echoes of the Phantom Manor',
                    'project' => 'Yure Party OST',
                    'composer' => 'renpoo',
                    'genre' => 'Dark Ambient / Gothic Piano',
                    'duration' => '3:45',
                    'audio_url' => 'assets/audio/echoes_demo.mp3',
                    'description' => 'Tema utama aula pesta terkutuk di Yure Party. Menghadirkan sentuhan tuts piano melankolis yang berbalut gesekan biola bernuansa mencekam.',
                    'featured' => true
                ],
                [
                    'id' => 'track_2',
                    'title' => 'Dance of the Lost Souls',
                    'project' => 'Yure Party OST',
                    'composer' => 'renpoo',
                    'genre' => 'Haunting Waltz Orchestral',
                    'duration' => '2:58',
                    'audio_url' => 'assets/audio/waltz_demo.mp3',
                    'description' => 'Iringan waltz ganjil saat para arwah berkumpul. Nada cepat dengan kontras harpa dan perkusi ritmik.',
                    'featured' => true
                ],
                [
                    'id' => 'track_3',
                    'title' => 'Midnight Resonance',
                    'project' => 'Studio Showcase',
                    'composer' => 'renpoo',
                    'genre' => 'Cyber Ambient & Lo-Fi Synth',
                    'duration' => '4:12',
                    'audio_url' => 'assets/audio/resonance_demo.mp3',
                    'description' => 'Eksplorasi soundscape futuristik zerobrain dengan pad synthesizer analog hangat dan beat lo-fi santai.',
                    'featured' => false
                ]
            ],
            'gallery_items' => [
                [
                    'id' => 'art_1',
                    'title' => 'Yure Party: The Grand Ballroom Key Art',
                    'creator' => 'Coby novaenan',
                    'role' => 'Art Director',
                    'category' => 'Key Visual',
                    'image' => 'assets/images/gallery_ballroom.svg',
                    'caption' => 'Ilustrasi konsep aula besar tempat para tokoh utama terjebak dalam pesta malam terkutuk.'
                ],
                [
                    'id' => 'art_2',
                    'title' => 'Nia & Companion: Character Design Sheet',
                    'creator' => 'Coby novaenan',
                    'role' => 'Art Director',
                    'category' => 'Character Design',
                    'image' => 'assets/images/gallery_nia_concept.svg',
                    'caption' => 'Rancangan busana gothic modern, siluet karakter, dan variasi ekspresi emosional.'
                ],
                [
                    'id' => 'art_3',
                    'title' => 'Custom Actor HUD & Battle Interface',
                    'creator' => 'oonori & Archelino',
                    'role' => 'Asset Director & Game Developer',
                    'category' => 'UI / System',
                    'image' => 'assets/images/gallery_hud_preview.svg',
                    'caption' => 'Antarmuka pertarungan kustom dengan bingkai kaca gelap, meter status kristal, dan tipografi ergonomis.'
                ],
                [
                    'id' => 'art_4',
                    'title' => 'Mystic Mansion Environment Tileset',
                    'creator' => 'oonori',
                    'role' => 'Asset Director',
                    'category' => 'Tileset & Sprites',
                    'image' => 'assets/images/gallery_tileset.svg',
                    'caption' => 'Penyusunan ubin lantai kayu tua, permadani usang, pilar marmer retak, dan ornamen dinding.'
                ]
            ],
            'messages' => [
                [
                    'id' => 'msg_welcome',
                    'name' => 'Zerobrain Studio Bot',
                    'email' => 'contact@zerobrain.local',
                    'subject' => 'Selamat Datang di Website Zerobrain',
                    'message' => 'Halo tim zerobrain! Website profil developer ini siap digunakan untuk memperkenalkan karya hebat Archelino, Coby novaenan, oonori, dan renpoo.',
                    'created_at' => date('c'),
                    'is_read' => true
                ]
            ],
            'admin_auth' => [
                'username' => 'admin',
                'password_hash' => $defaultAdminPassword,
                'updated_at' => date('c')
            ],
            'created_at' => date('c'),
            'updated_at' => date('c')
        ];

        $this->save($defaultData);
    }
}
