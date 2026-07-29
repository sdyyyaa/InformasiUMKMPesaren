-- DATABASE DDL FOR PESONA DESA PESAREN WEBSITE
-- Database: db_pesona_pesaren

CREATE DATABASE IF NOT EXISTS db_pesona_pesaren;
USE db_pesona_pesaren;

-- 1. Table: users
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'superadmin') NOT NULL DEFAULT 'admin',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: kategori_umkm
CREATE TABLE IF NOT EXISTS `kategori_umkm` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nama_kategori` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(100) NOT NULL, -- Menyimpan nama class icon (misal: fa-utensils, fa-shirt, dll)
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: umkm
CREATE TABLE IF NOT EXISTS `umkm` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `kategori_id` BIGINT UNSIGNED NOT NULL,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `nama_umkm` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL UNIQUE,
    `pemilik` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,
    `alamat` TEXT NOT NULL,
    `maps` TEXT NULL, -- Menyimpan link embed Google Maps atau koordinat
    `logo` VARCHAR(255) NULL,
    `foto_cover` VARCHAR(255) NULL,
    `status` ENUM('Aktif', 'Tidak Aktif') NOT NULL DEFAULT 'Aktif',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_umkm_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_umkm` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_umkm_users` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: produk
CREATE TABLE IF NOT EXISTS `produk` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `umkm_id` BIGINT UNSIGNED NOT NULL,
    `nama_produk` VARCHAR(150) NOT NULL,
    `deskripsi` TEXT NULL,
    `harga` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `stok` INT NOT NULL DEFAULT 0,
    `foto_produk` VARCHAR(255) NULL,
    `status` ENUM('Aktif', 'Tidak Aktif') NOT NULL DEFAULT 'Aktif',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_produk_umkm` FOREIGN KEY (`umkm_id`) REFERENCES `umkm` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: galeri_umkm
CREATE TABLE IF NOT EXISTS `galeri_umkm` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `umkm_id` BIGINT UNSIGNED NOT NULL,
    `foto` VARCHAR(255) NOT NULL,
    `keterangan` VARCHAR(150) NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_galeri_umkm` FOREIGN KEY (`umkm_id`) REFERENCES `umkm` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: sosial_media
CREATE TABLE IF NOT EXISTS `sosial_media` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `umkm_id` BIGINT UNSIGNED NOT NULL,
    `jenis` ENUM('Instagram', 'Facebook', 'TikTok', 'WhatsApp', 'Shopee', 'Tokopedia', 'YouTube', 'Lainnya') NOT NULL,
    `link` TEXT NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_sosial_media_umkm` FOREIGN KEY (`umkm_id`) REFERENCES `umkm` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: pengajuan
CREATE TABLE IF NOT EXISTS `pengajuan` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nama_pengaju` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `no_hp` VARCHAR(15) NOT NULL,
    `jenis` ENUM('Tambah UMKM', 'Edit Data', 'Lainnya') NOT NULL,
    `pesan` TEXT NOT NULL,
    `status` ENUM('Menunggu', 'Diproses', 'Selesai') NOT NULL DEFAULT 'Menunggu',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- INSERT DEFAULT DATA FOR DEMO / SEEDING (Matches wireframe)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Admin Pesona', 'admin@pesaren.desa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin'); -- password: password

INSERT INTO `kategori_umkm` (`id`, `nama_kategori`, `icon`) VALUES
(1, 'Makanan & Minuman', 'fa-utensils'),
(2, 'Fashion', 'fa-shirt'),
(3, 'Kerajinan Tangan', 'fa-hand-holding-heart');

INSERT INTO `umkm` (`id`, `kategori_id`, `created_by`, `nama_umkm`, `slug`, `pemilik`, `deskripsi`, `alamat`, `maps`, `logo`, `foto_cover`, `status`) VALUES
(1, 1, 1, 'Keripik Tempe Bu Siti', 'keripik-tempe-bu-siti', 'Siti Nurhayati', 'Keripik tempe homemade dengan bahan pilihan dan tanpa pengawet. Renyah, gurih, dan cocok untuk semua usia. Dibuat secara higienis menggunakan tempe berkualitas terbaik.', 'Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15848.125633834375!2d111.0543603!3d-6.7660605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70d4bc0b2c3fa5%3A0xc0cbb76ec85c9ee1!2sPesaren%2C%20Wedarijaksa%2C%20Pati%20Regency%2C%20Central%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid', 'logo_tempe.png', 'cover_tempe.jpg', 'Aktif'),
(2, 2, 1, 'Batik Pesaren', 'batik-pesaren', 'Ahmad Fauzi', 'Menyediakan batik tulis dan cap khas Desa Pesaren dengan motif tradisional kontemporer yang elegan. Setiap helai kain batik dibuat secara manual dengan teknik tradisional.', 'Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15848.125633834375!2d111.0543603!3d-6.7660605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70d4bc0b2c3fa5%3A0xc0cbb76ec85c9ee1!2sPesaren%2C%20Wedarijaksa%2C%20Pati%20Regency%2C%20Central%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid', 'logo_batik.png', 'cover_batik.jpg', 'Aktif'),
(3, 1, 1, 'Madurasa Alami', 'madurasa-alami', 'Rina Lestari', 'Madu hutan murni 100% tanpa bahan campuran kimia. Diambil langsung dari peternakan lebah hutan Desa Pesaren untuk menjaga kualitas dan khasiat kesehatannya.', 'Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15848.125633834375!2d111.0543603!3d-6.7660605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70d4bc0b2c3fa5%3A0xc0cbb76ec85c9ee1!2sPesaren%2C%20Wedarijaksa%2C%20Pati%20Regency%2C%20Central%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid', 'logo_madu.png', 'cover_madu.jpg', 'Aktif'),
(4, 3, 1, 'Eco Craft Pesaren', 'eco-craft-pesaren', 'Dwi Setyawan', 'Kerajinan anyaman bambu dan eceng gondok ramah lingkungan. Menjual aneka tas, keranjang, dan dekorasi rumah bernilai seni tinggi buatan tangan pengrajin lokal.', 'Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15848.125633834375!2d111.0543603!3d-6.7660605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70d4bc0b2c3fa5%3A0xc0cbb76ec85c9ee1!2sPesaren%2C%20Wedarijaksa%2C%20Pati%20Regency%2C%20Central%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid', 'logo_craft.png', 'cover_craft.jpg', 'Aktif'),
(5, 1, 1, 'Dapur Mbak Rini', 'dapur-mbak-rini', 'Rini Astuti', 'Menyediakan berbagai macam kue basah tradisional dan katering makanan untuk keperluan hajatan. Rasa otentik dengan harga bersahabat.', 'Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15848.125633834375!2d111.0543603!3d-6.7660605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70d4bc0b2c3fa5%3A0xc0cbb76ec85c9ee1!2sPesaren%2C%20Wedarijaksa%2C%20Pati%20Regency%2C%20Central%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid', 'logo_dapur.png', 'cover_dapur.jpg', 'Aktif'),
(6, 1, 1, 'Kopi Pesaren', 'kopi-pesaren', 'Joko Susilo', 'Kopi robusta khas Desa Pesaren yang diolah dari biji kopi pilihan lereng Muria. Disangrai secara merata untuk menghasilkan cita rasa aroma yang kuat dan mantap.', 'Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15848.125633834375!2d111.0543603!3d-6.7660605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70d4bc0b2c3fa5%3A0xc0cbb76ec85c9ee1!2sPesaren%2C%20Wedarijaksa%2C%20Pati%20Regency%2C%20Central%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid', 'logo_kopi.png', 'cover_kopi.jpg', 'Aktif');

INSERT INTO `produk` (`id`, `umkm_id`, `nama_produk`, `deskripsi`, `harga`, `stok`, `foto_produk`, `status`) VALUES
(1, 1, 'Keripik Tempe Original', 'Keripik tempe gurih renyah rasa bawang ketumbar original.', 15000.00, 100, 'tempe_ori.jpg', 'Aktif'),
(2, 1, 'Keripik Tempe Pedas', 'Keripik tempe pedas dengan taburan cabai kering dan daun jeruk asli.', 15000.00, 80, 'tempe_pedas.jpg', 'Aktif'),
(3, 1, 'Keripik Tempe Balado', 'Keripik tempe dengan bumbu balado manis pedas melimpah.', 15000.00, 90, 'tempe_balado.jpg', 'Aktif'),
(4, 1, 'Keripik Tempe Keju', 'Keripik tempe dengan keju premium rasa gurih manis.', 15000.00, 50, 'tempe_keju.jpg', 'Aktif'),
(5, 2, 'Kain Batik Tulis Pesaren', 'Kain batik tulis katun primisima ukuran 2x1.15 meter dengan motif khas.', 250000.00, 5, 'batik_tulis.jpg', 'Aktif'),
(6, 2, 'Kemeja Batik Cap Pria', 'Kemeja batik cap premium berlapis furing halus, nyaman dipakai formal.', 125000.00, 20, 'batik_kemeja.jpg', 'Aktif'),
(7, 3, 'Madu Hutan Randu 250ml', 'Madu murni nektar bunga pohon randu berkhasiat tinggi.', 65000.00, 40, 'madu_randu.jpg', 'Aktif'),
(8, 4, 'Tas Anyaman Eceng Gondok', 'Tas jinjing wanita anyaman eceng gondok estetik dengan pelapis kain.', 85000.00, 15, 'tas_eceng.jpg', 'Aktif'),
(9, 6, 'Kopi Bubuk Robusta 200g', 'Bubuk kopi robusta murni kemasan premium.', 25000.00, 50, 'kopi_robusta.jpg', 'Aktif');

INSERT INTO `galeri_umkm` (`id`, `umkm_id`, `foto`, `keterangan`) VALUES
(1, 1, 'galeri_tempe_1.jpg', 'Proses pemotongan tempe tipis manual'),
(2, 1, 'galeri_tempe_2.jpg', 'Proses penggorengan menggunakan minyak bersih'),
(3, 2, 'galeri_batik_1.jpg', 'Proses membatik tulis menggunakan canting');

INSERT INTO `sosial_media` (`id`, `umkm_id`, `jenis`, `link`) VALUES
(1, 1, 'WhatsApp', '081234567890'),
(2, 1, 'Instagram', 'https://instagram.com/keripiktempe.busiti'),
(3, 2, 'Instagram', 'https://instagram.com/batik_pesaren'),
(4, 3, 'WhatsApp', '081234567891'),
(5, 4, 'Instagram', 'https://instagram.com/ecocraft.pesaren');

INSERT INTO `pengajuan` (`id`, `nama_pengaju`, `email`, `no_hp`, `jenis`, `pesan`, `status`) VALUES
(1, 'Budi Santoso', 'budi@gmail.com', '085647382910', 'Tambah UMKM', 'Mohon daftarkan UMKM Keripik Pisang Berkah saya.', 'Menunggu'),
(2, 'Ani Wijaya', 'ani@gmail.com', '081392847563', 'Edit Data', 'Ingin mengubah nomor WhatsApp Batik Pesaren karena nomor lama tidak aktif.', 'Diproses');
