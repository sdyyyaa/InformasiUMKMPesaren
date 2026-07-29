// PESONA - APP LOGIC & SUPABASE CLOUD DATABASE
// Integrated directly with Supabase Cloud Database & Local Media Upload System

window.SUPABASE_URL = 'https://ccyvckgritpqaowujnxk.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_zWUttIaaPmmOvMUTduyqSA_BRzl9vui';

let supabaseClient = null;

// Local RAM cache representing database state
let dbCache = {
    users: [],
    kategori_umkm: [],
    umkm: [],
    produk: [],
    galeri_umkm: [],
    sosial_media: [],
    pengajuan: []
};

// In-memory fallback image store if localStorage is full
const memoryImageStore = {};

// --- DEFAULT DATA FOR INITIAL DATABASE SEEDING IF TABLES ARE EMPTY ---
const DEFAULT_CATEGORIES = [
    { id: 1, nama_kategori: "Makanan & Minuman", icon: "fa-utensils" },
    { id: 2, nama_kategori: "Fashion", icon: "fa-shirt" },
    { id: 3, nama_kategori: "Kerajinan Tangan", icon: "fa-hand-holding-heart" }
];

const DEFAULT_USERS = [
    { id: 1, name: "Admin Pesona", email: "admin@pesaren.desa.id", password: "password", role: "superadmin" }
];

const DEFAULT_UMKM = [
    {
        id: 1,
        kategori_id: 1,
        created_by: 1,
        nama_umkm: "Keripik Tempe Bu Siti",
        slug: "keripik-tempe-bu-siti",
        pemilik: "Siti Nurhayati",
        deskripsi: "Keripik tempe homemade dengan bahan pilihan dan tanpa pengawet. Renyah, gurih, dan cocok untuk semua usia. Dibuat secara higienis menggunakan tempe berkualitas terbaik.",
        alamat: "Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah",
        maps: "https://maps.google.com/maps?q=Desa%20Pesaren%2C%20Wedarijaksa%2C%20Pati&output=embed",
        logo: "https://images.unsplash.com/photo-1621510456681-23a23cfb5f57?q=80&w=300&auto=format&fit=crop",
        foto_cover: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
        status: "Aktif"
    },
    {
        id: 2,
        kategori_id: 2,
        created_by: 1,
        nama_umkm: "Batik Pesaren",
        slug: "batik-pesaren",
        pemilik: "Ahmad Fauzi",
        deskripsi: "Menyediakan batik tulis dan cap khas Desa Pesaren dengan motif tradisional kontemporer yang elegan. Setiap helai kain batik dibuat secara manual dengan teknik canting lilin malam tradisional.",
        alamat: "Desa Pesaren, RT 02/RW 01, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah",
        maps: "https://maps.google.com/maps?q=Desa%20Pesaren%2C%20Wedarijaksa%2C%20Pati&output=embed",
        logo: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=300&auto=format&fit=crop",
        foto_cover: "https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1000&auto=format&fit=crop",
        status: "Aktif"
    },
    {
        id: 3,
        kategori_id: 1,
        created_by: 1,
        nama_umkm: "Madurasa Alami",
        slug: "madurasa-alami",
        pemilik: "Rina Lestari",
        deskripsi: "Madu hutan murni 100% tanpa bahan campuran kimia. Diambil langsung dari peternakan lebah hutan pilihan Desa Pesaren untuk menjaga kualitas alami.",
        alamat: "Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah",
        maps: "https://maps.google.com/maps?q=Desa%20Pesaren%2C%20Wedarijaksa%2C%20Pati&output=embed",
        logo: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=300&auto=format&fit=crop",
        foto_cover: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1000&auto=format&fit=crop",
        status: "Aktif"
    },
    {
        id: 4,
        kategori_id: 3,
        created_by: 1,
        nama_umkm: "Eco Craft Pesaren",
        slug: "eco-craft-pesaren",
        pemilik: "Dwi Setyawan",
        deskripsi: "Kerajinan anyaman serat alam (bambu, rotan, dan eceng gondok) ramah lingkungan. Menjual aneka tas jinjing dan dekorasi rumah bernilai seni tinggi.",
        alamat: "Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah",
        maps: "https://maps.google.com/maps?q=Desa%20Pesaren%2C%20Wedarijaksa%2C%20Pati&output=embed",
        logo: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop",
        foto_cover: "https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?q=80&w=1000&auto=format&fit=crop",
        status: "Aktif"
    }
];

const DEFAULT_PRODUCTS = [
    { id: 1, umkm_id: 1, nama_produk: "Keripik Tempe Original", deskripsi: "Keripik tempe tipis renyah rasa bawang ketumbar yang khas dan gurih alami.", harga: 15000, stok: 100, foto_produk: "https://images.unsplash.com/photo-1621510456681-23a23cfb5f57?q=80&w=300", status: "Aktif" },
    { id: 2, umkm_id: 1, nama_produk: "Keripik Tempe Pedas", deskripsi: "Keripik tempe pedas dengan taburan cabai kering dan racikan daun jeruk.", harga: 15000, stok: 80, foto_produk: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=300", status: "Aktif" },
    { id: 3, umkm_id: 2, nama_produk: "Kain Batik Tulis Pesaren", deskripsi: "Kain katun primisima premium ukuran 2 meter x 1.15 meter.", harga: 250000, stok: 5, foto_produk: "https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=300", status: "Aktif" },
    { id: 4, umkm_id: 3, nama_produk: "Madu Randu Murni 250ml", deskripsi: "Madu randu asli tanpa campuran pemanis, kaya enzim alami.", harga: 65000, stok: 45, foto_produk: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=300", status: "Aktif" },
    { id: 5, umkm_id: 4, nama_produk: "Tas Anyaman Eceng Gondok", deskripsi: "Tas tangan estetik ramah lingkungan berlapis kain satin di bagian dalam.", harga: 85000, stok: 12, foto_produk: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300", status: "Aktif" }
];

const DEFAULT_SOCIALS = [
    { id: 1, umkm_id: 1, jenis: "WhatsApp", link: "081234567890" },
    { id: 2, umkm_id: 1, jenis: "Instagram", link: "https://instagram.com/keripiktempe.busiti" },
    { id: 3, umkm_id: 2, jenis: "Instagram", link: "https://instagram.com/batik_pesaren" },
    { id: 4, umkm_id: 3, jenis: "WhatsApp", link: "081234567891" },
    { id: 5, umkm_id: 4, jenis: "Instagram", link: "https://instagram.com/ecocraft.pesaren" }
];

// --- 1. DATABASE INITIALIZATION & RELOAD ---
async function initDatabase() {
    if (window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
            console.log('Supabase client initialized.');
            await reloadCache();

            // Auto seed if tables are empty
            if (dbCache.users.length === 0 || dbCache.kategori_umkm.length === 0 || dbCache.umkm.length === 0) {
                console.log('Supabase tables empty, performing initial seed...');
                await seedInitialData();
                await reloadCache();
            }
            return;
        } catch (e) {
            console.error('Failed to initialize Supabase client:', e);
        }
    }
}

async function reloadCache() {
    if (!supabaseClient) return;

    const tables = ['users', 'kategori_umkm', 'umkm', 'produk', 'galeri_umkm', 'sosial_media', 'pengajuan'];
    const promises = tables.map(async (table) => {
        const { data, error } = await supabaseClient.from(table).select('*').order('id', { ascending: true });
        if (!error && data) {
            dbCache[table] = data;
        } else {
            console.warn(`Could not load ${table} from Supabase:`, error);
        }
    });

    await Promise.all(promises);
}

async function seedInitialData() {
    if (!supabaseClient) return;
    try {
        if (dbCache.users.length === 0) {
            await supabaseClient.from('users').upsert(DEFAULT_USERS);
        }
        if (dbCache.kategori_umkm.length === 0) {
            await supabaseClient.from('kategori_umkm').upsert(DEFAULT_CATEGORIES);
        }
        if (dbCache.umkm.length === 0) {
            await supabaseClient.from('umkm').upsert(DEFAULT_UMKM);
        }
        if (dbCache.produk.length === 0) {
            await supabaseClient.from('produk').upsert(DEFAULT_PRODUCTS);
        }
        if (dbCache.sosial_media.length === 0) {
            await supabaseClient.from('sosial_media').upsert(DEFAULT_SOCIALS);
        }
    } catch (err) {
        console.error('Error seeding initial data:', err);
    }
}

// Dynamic helper to resolve the exact next ID from Supabase to prevent PKEY collisions
async function getNextTableId(tableName) {
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.from(tableName).select('id').order('id', { ascending: false }).limit(1);
            if (!error && data && data.length > 0 && typeof data[0].id === 'number') {
                return data[0].id + 1;
            }
        } catch (e) {
            console.warn(`Could not query max id for ${tableName}:`, e);
        }
    }
    const currentList = dbCache[tableName] || [];
    return currentList.length > 0 ? Math.max(...currentList.map(item => item.id || 0)) + 1 : 1;
}

// Getters for RAM cache
const db = {
    users: () => dbCache.users,
    kategori_umkm: () => dbCache.kategori_umkm,
    umkm: () => dbCache.umkm,
    produk: () => dbCache.produk,
    galeri_umkm: () => dbCache.galeri_umkm,
    sosial_media: () => dbCache.sosial_media,
    pengajuan: () => dbCache.pengajuan
};

// --- IMAGE CANVAS COMPRESSOR FOR LOCAL FILE UPLOADS ---
function compressImage(file, maxWidth = 600, quality = 0.8) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = () => resolve(e.target.result);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
    });
}

// --- IMAGE RESOLVER: GETS UPLOADED MEDIA OR WEB URL ---
function getImageUrl(dbValue, itemKey, fallbackUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300') {
    if (itemKey) {
        const localUpload = localStorage.getItem('uploaded_img_' + itemKey) || memoryImageStore['uploaded_img_' + itemKey];
        if (localUpload) return localUpload;
    }

    if (!dbValue || typeof dbValue !== 'string') return fallbackUrl;
    dbValue = dbValue.trim();

    if (dbValue.startsWith('local:')) {
        const key = dbValue.replace('local:', '');
        const stored = localStorage.getItem('uploaded_img_' + key) || memoryImageStore['uploaded_img_' + key];
        if (stored) return stored;
        return fallbackUrl;
    }

    if (dbValue.startsWith('data:image')) {
        return dbValue;
    }

    if (dbValue.startsWith('http') || dbValue.endsWith('.png') || dbValue.endsWith('.jpg') || dbValue.endsWith('.jpeg')) {
        return dbValue;
    }

    return fallbackUrl;
}

function saveUploadedImage(key, dataUrl) {
    if (!key || !dataUrl) return;
    try {
        localStorage.setItem('uploaded_img_' + key, dataUrl);
    } catch (e) {
        console.warn('LocalStorage limit reached, saving to memory store:', e);
    }
    memoryImageStore['uploaded_img_' + key] = dataUrl;
}

// --- MAP EMBED FORMATTER ---
function formatMapEmbedUrl(mapsInput, addressInput) {
    if (!mapsInput || typeof mapsInput !== 'string') mapsInput = '';
    mapsInput = mapsInput.trim();

    if (mapsInput.includes('<iframe')) {
        const match = mapsInput.match(/src=["']([^"']+)["']/i);
        if (match && match[1]) {
            mapsInput = match[1];
        }
    }

    if (mapsInput.includes('/maps/embed')) {
        return mapsInput;
    }

    const targetQuery = mapsInput || addressInput || 'Desa Pesaren, Kec. Wedarijaksa, Kab. Pati, Jawa Tengah';
    return `https://maps.google.com/maps?q=${encodeURIComponent(targetQuery)}&output=embed`;
}

// --- HELPER FUNCTIONS ---
function getCategoryMap() {
    const cats = db.kategori_umkm();
    const map = {};
    cats.forEach(c => map[c.id] = c);
    return map;
}

function generateSlug(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 flex items-center space-x-3 px-5 py-4 rounded-xl shadow-xl transition-all duration-300 transform translate-y-10 opacity-0 ${type === 'success' ? 'bg-forest-800 text-white' : 'bg-rose-600 text-white'
        }`;

    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon} text-lg"></i><span class="font-medium text-sm">${message}</span>`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// --- ADMIN AUTHENTICATION LOGIC ---
function loginAdmin(email, password) {
    const users = db.users();
    const adminUser = users.find(u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        (u.role === 'admin' || u.role === 'superadmin')
    );

    if (adminUser) {
        const session = { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: adminUser.role };
        sessionStorage.setItem('admin_logged_in', JSON.stringify(session));
        showToast(`Login admin berhasil! Selamat datang, ${adminUser.name}.`, 'success');
        renderAdmin();
        updateAdminNavHeader();
    } else {
        showToast('Login admin gagal: email atau kata sandi tidak ditemukan/bukan admin.', 'error');
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('admin_logged_in');
    showToast('Anda telah keluar dari panel admin.', 'info');
    renderAdmin();
    updateAdminNavHeader();
}

// --- ROUTER IMPLEMENTATION ---
const pages = {
    'beranda': { el: document.getElementById('page-beranda'), render: renderBeranda },
    'umkm': { el: document.getElementById('page-umkm-list'), render: renderUMKMList },
    'umkm-detail': { el: document.getElementById('page-umkm-detail'), render: renderUMKMDetail },
    'kontak': { el: document.getElementById('page-kontak'), render: renderKontak },
    'admin': { el: document.getElementById('page-admin'), render: renderAdmin }
};

function handleRouteChange() {
    const hash = window.location.hash || '#/beranda';
    const parts = hash.split('/');
    const pageName = parts[1] || 'beranda';
    const param = parts[2] || null;

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('border-forest-800', 'text-forest-800');
        link.classList.add('border-transparent', 'text-slate-700');
    });

    const activeNavLink = document.getElementById(`nav-${pageName}`);
    if (activeNavLink) {
        activeNavLink.classList.remove('border-transparent', 'text-slate-700');
        activeNavLink.classList.add('border-forest-800', 'text-forest-800');
    }

    updateAdminNavHeader();

    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    if (mobileMenu && menuIcon) {
        mobileMenu.classList.add('hidden');
        menuIcon.className = 'fa-solid fa-bars text-xl';
    }

    Object.keys(pages).forEach(key => {
        if (pages[key].el) {
            pages[key].el.classList.add('hidden-page');
            pages[key].el.classList.remove('active');
        }
    });

    const targetPage = pages[pageName];
    if (targetPage && targetPage.el) {
        targetPage.el.classList.remove('hidden-page');
        setTimeout(() => {
            targetPage.el.classList.add('active');
        }, 50);
        targetPage.render(param);
        window.scrollTo(0, 0);
    } else {
        window.location.hash = '#/beranda';
    }
}

// --- PAGE RENDERING LOGIC ---

// 1. BERANDA (HOME)
function renderBeranda() {
    const umkms = db.umkm().filter(u => u.status === 'Aktif');
    const categories = getCategoryMap();
    const container = document.getElementById('featured-umkm-list');
    if (!container) return;

    const featured = umkms.slice(0, 4);

    if (featured.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400">
                <p class="text-sm">Belum ada UMKM aktif yang terdaftar.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = featured.map(item => {
        const cat = categories[item.kategori_id] || { nama_kategori: 'Umum' };
        const logoUrl = getImageUrl(item.logo, 'logo_' + item.id);
        const coverUrl = getImageUrl(item.foto_cover, 'cover_' + item.id);

        return `
            <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover-lift h-full">
                <div class="relative h-48 bg-slate-100 overflow-hidden">
                    <img src="${coverUrl}" alt="${item.nama_umkm}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
                    <span class="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-forest-800 border border-white/50 shadow-sm">
                        ${cat.nama_kategori}
                    </span>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <div class="flex items-center space-x-3 mb-3">
                        <img src="${logoUrl}" alt="Logo" class="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm">
                        <h3 class="font-bold text-slate-800 text-lg line-clamp-1">${item.nama_umkm}</h3>
                    </div>
                    <p class="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed">${item.deskripsi}</p>
                    <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-xs font-medium text-slate-400">Pemilik: <strong class="text-slate-700">${item.pemilik}</strong></span>
                        <a href="#/umkm-detail/${item.slug}" class="text-forest-850 hover:text-forest-700 text-xs font-bold flex items-center space-x-1">
                            <span>Detail</span>
                            <i class="fa-solid fa-arrow-right text-[10px]"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 2. UMKM LIST
let currentSearchQuery = '';
let currentCategoryFilter = '';
let currentListPage = 1;
const ITEMS_PER_PAGE = 6;

function renderUMKMList() {
    const categories = db.kategori_umkm();
    const catFilter = document.getElementById('umkm-category-filter');
    if (catFilter && catFilter.children.length === 1) {
        catFilter.innerHTML = '<option value="">Semua Kategori</option>' +
            categories.map(c => `<option value="${c.id}">${c.nama_kategori}</option>`).join('');
    }

    const searchInput = document.getElementById('umkm-search');
    if (searchInput && !searchInput.dataset.listener) {
        searchInput.dataset.listener = 'true';
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            currentListPage = 1;
            filterAndRenderUMKMs();
        });

        if (catFilter) {
            catFilter.addEventListener('change', (e) => {
                currentCategoryFilter = e.target.value;
                currentListPage = 1;
                filterAndRenderUMKMs();
            });
        }
    }

    filterAndRenderUMKMs();
}

function filterAndRenderUMKMs() {
    const umkms = db.umkm().filter(u => u.status === 'Aktif');
    const catMap = getCategoryMap();
    const grid = document.getElementById('umkm-cards-grid');
    const pagination = document.getElementById('umkm-pagination');
    if (!grid) return;

    let filtered = umkms.filter(item => {
        const matchesSearch = item.nama_umkm.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            item.pemilik.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            (item.deskripsi && item.deskripsi.toLowerCase().includes(currentSearchQuery.toLowerCase()));

        const matchesCat = currentCategoryFilter === '' || item.kategori_id == currentCategoryFilter;

        return matchesSearch && matchesCat;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    if (currentListPage > totalPages) currentListPage = totalPages;

    const startIdx = (currentListPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    if (totalItems === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 flex flex-col items-center justify-center text-center">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <i class="fa-solid fa-store-slash text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-700 mb-1">UMKM Tidak Ditemukan</h3>
                <p class="text-sm text-slate-500">Coba ganti filter atau kata kunci pencarian Anda.</p>
            </div>
        `;
        if (pagination) pagination.innerHTML = '';
        return;
    }

    grid.innerHTML = paginatedItems.map(item => {
        const cat = catMap[item.kategori_id] || { nama_kategori: 'Umum' };
        const logoUrl = getImageUrl(item.logo, 'logo_' + item.id);
        const coverUrl = getImageUrl(item.foto_cover, 'cover_' + item.id);

        return `
            <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover-lift">
                <div class="relative h-48 bg-slate-100 overflow-hidden">
                    <img src="${coverUrl}" alt="${item.nama_umkm}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
                    <span class="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-forest-800 border border-white/50 shadow-sm">
                        ${cat.nama_kategori}
                    </span>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <div class="flex items-center space-x-3 mb-3">
                        <img src="${logoUrl}" alt="Logo" class="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm">
                        <h3 class="font-bold text-slate-800 text-lg line-clamp-1">${item.nama_umkm}</h3>
                    </div>
                    <p class="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed">${item.deskripsi}</p>
                    <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-xs font-medium text-slate-400">Pemilik: <strong class="text-slate-700">${item.pemilik}</strong></span>
                        <a href="#/umkm-detail/${item.slug}" class="text-forest-850 hover:text-forest-700 text-xs font-bold flex items-center space-x-1">
                            <span>Detail Profil</span>
                            <i class="fa-solid fa-arrow-right text-[10px]"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (pagination) {
        let pagHtml = `
            <button onclick="changeListPage(${currentListPage - 1})" ${currentListPage === 1 ? 'disabled' : ''} class="w-10 h-10 flex items-center justify-center border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentListPage;
            pagHtml += `
                <button onclick="changeListPage(${i})" class="w-10 h-10 flex items-center justify-center font-semibold text-sm rounded-xl border ${isActive
                    ? 'bg-forest-800 text-white border-forest-800 shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                } transition-all">
                    ${i}
                </button>
            `;
        }

        pagHtml += `
            <button onclick="changeListPage(${currentListPage + 1})" ${currentListPage === totalPages ? 'disabled' : ''} class="w-10 h-10 flex items-center justify-center border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>
        `;

        pagination.innerHTML = pagHtml;
    }
}

window.changeListPage = function (page) {
    currentListPage = page;
    filterAndRenderUMKMs();
    window.scrollTo({ top: 300, behavior: 'smooth' });
};

// 3. DETAIL PROFIL UMKM
function renderUMKMDetail(slug) {
    const umkm = db.umkm().find(u => u.slug === slug && u.status === 'Aktif');
    const container = document.getElementById('umkm-detail-content');
    const breadcrumbTitle = document.getElementById('detail-breadcrumb-title');
    if (!container) return;

    if (!umkm) {
        if (breadcrumbTitle) breadcrumbTitle.innerText = "Tidak Ditemukan";
        container.innerHTML = `
            <div class="py-24 text-center max-w-md mx-auto">
                <i class="fa-solid fa-face-frown text-5xl text-slate-350 mb-4"></i>
                <h2 class="text-2xl font-bold text-slate-700 mb-2">Profil Tidak Ditemukan</h2>
                <p class="text-slate-500 mb-6">Profil UMKM yang Anda cari tidak tersedia atau dinonaktifkan sementara.</p>
                <a href="#/umkm" class="inline-flex items-center space-x-2 bg-forest-800 hover:bg-forest-700 text-white font-medium px-6 py-3 rounded-xl transition-all">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Kembali ke Daftar</span>
                </a>
            </div>
        `;
        return;
    }

    if (breadcrumbTitle) breadcrumbTitle.innerText = umkm.nama_umkm;

    const cat = getCategoryMap()[umkm.kategori_id] || { nama_kategori: 'Umum' };
    const products = db.produk().filter(p => p.umkm_id === umkm.id && p.status === 'Aktif');
    const gallery = db.galeri_umkm().filter(g => g.umkm_id === umkm.id);
    const socialMedia = db.sosial_media().filter(s => s.umkm_id === umkm.id);

    const waLink = socialMedia.find(s => s.jenis === 'WhatsApp');
    const igLink = socialMedia.find(s => s.jenis === 'Instagram');

    let headerActionButtons = '';
    if (waLink) {
        const cleanedNumber = waLink.link.replace(/[^0-9]/g, '');
        const finalWaUrl = cleanedNumber.startsWith('62') ? cleanedNumber : (cleanedNumber.startsWith('0') ? '62' + cleanedNumber.slice(1) : cleanedNumber);
        headerActionButtons += `
            <a href="https://wa.me/${finalWaUrl}" target="_blank" class="flex-grow sm:flex-grow-0 inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all text-sm">
                <i class="fa-brands fa-whatsapp text-lg"></i>
                <span>WhatsApp</span>
            </a>
        `;
    }
    if (igLink) {
        const finalIgUrl = igLink.link.startsWith('http') ? igLink.link : 'https://instagram.com/' + igLink.link.replace('@', '');
        headerActionButtons += `
            <a href="${finalIgUrl}" target="_blank" class="flex-grow sm:flex-grow-0 inline-flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all text-sm">
                <i class="fa-brands fa-instagram text-lg"></i>
                <span>Instagram</span>
            </a>
        `;
    }

    const embedMapUrl = formatMapEmbedUrl(umkm.maps, umkm.alamat);
    headerActionButtons += `
        <a href="${embedMapUrl.replace('&output=embed', '')}" target="_blank" class="flex-grow sm:flex-grow-0 inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all text-sm">
            <i class="fa-solid fa-map-location-dot text-lg"></i>
            <span>Buka Maps</span>
        </a>
    `;

    let productsHtml = '';
    if (products.length === 0) {
        productsHtml = `
            <div class="col-span-full py-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                <p class="text-slate-400 text-sm">Belum ada daftar produk yang ditambahkan untuk UMKM ini.</p>
            </div>
        `;
    } else {
        productsHtml = products.map(p => {
            const prodImgUrl = getImageUrl(p.foto_produk, 'prod_' + p.id);
            return `
                <div class="bg-white rounded-2xl overflow-hidden border border-slate-150 shadow-sm flex flex-col hover-lift">
                    <div class="relative h-48 bg-slate-50 overflow-hidden flex items-center justify-center">
                        <img src="${prodImgUrl}" alt="${p.nama_produk}" class="w-full h-full object-cover">
                    </div>
                    <div class="p-5 flex flex-col flex-grow">
                        <h4 class="font-bold text-slate-800 text-base mb-1">${p.nama_produk}</h4>
                        <p class="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">${p.deskripsi || ''}</p>
                        <div class="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                            <div>
                                <span class="block text-xs text-slate-400 font-medium">Harga</span>
                                <span class="block text-emerald-700 font-bold text-lg">Rp ${Number(p.harga).toLocaleString('id-ID')}<span class="text-xs text-slate-400 font-normal">/pcs</span></span>
                            </div>
                            <span class="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-medium">Stok: ${p.stok}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    let galleryHtml = '';
    if (gallery.length > 0) {
        galleryHtml = `
            <div class="mt-12 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h3 class="text-2xl font-bold text-forest-800 mb-6">Galeri & Dokumentasi</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${gallery.map(g => {
            const galImgUrl = getImageUrl(g.foto, 'gal_' + g.id);
            return `
                            <div class="group relative rounded-2xl overflow-hidden shadow-sm bg-slate-100 aspect-video">
                                <img src="${galImgUrl}" alt="${g.keterangan || 'Galeri'}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                                    <p class="text-white text-xs font-semibold leading-snug">${g.keterangan || ''}</p>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    let socialsHtml = '';
    if (socialMedia.length > 0) {
        socialsHtml = socialMedia.map(s => {
            let iconClass = 'fa-link';
            let label = s.jenis;
            let link = s.link;

            if (s.jenis === 'Instagram') {
                iconClass = 'fa-brands fa-instagram text-pink-600';
                link = s.link.startsWith('http') ? s.link : 'https://instagram.com/' + s.link.replace('@', '');
                label = s.link.startsWith('@') ? s.link : '@' + s.link.split('/').pop();
            } else if (s.jenis === 'WhatsApp') {
                iconClass = 'fa-brands fa-whatsapp text-emerald-600';
                link = `https://wa.me/${s.link.replace(/[^0-9]/g, '')}`;
                label = s.link;
            } else if (s.jenis === 'Facebook') {
                iconClass = 'fa-brands fa-facebook text-blue-600';
            } else if (s.jenis === 'TikTok') {
                iconClass = 'fa-brands fa-tiktok text-slate-800';
            }

            return `
                <a href="${link}" target="_blank" class="flex items-center space-x-3 p-4 bg-slate-50 border border-slate-100 hover:border-forest-800/30 rounded-xl transition-all">
                    <span class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <i class="${iconClass} text-lg"></i>
                    </span>
                    <div>
                        <span class="block text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">${s.jenis}</span>
                        <span class="block text-sm font-semibold text-slate-700 truncate max-w-[150px] leading-tight">${label}</span>
                    </div>
                </a>
            `;
        }).join('');
    } else {
        socialsHtml = '<p class="text-slate-400 text-sm">Belum ada akun sosial media yang ditautkan.</p>';
    }

    const mainLogoUrl = getImageUrl(umkm.logo, 'logo_' + umkm.id);
    const mainCoverUrl = getImageUrl(umkm.foto_cover, 'cover_' + umkm.id);

    container.innerHTML = `
        <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-100/50 mb-12">
            <div class="relative h-64 sm:h-96 w-full bg-slate-900 overflow-hidden">
                <img src="${mainCoverUrl}" alt="Cover Image" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <span class="absolute top-6 left-6 bg-emerald-500 text-forest-900 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider">
                    ${cat.nama_kategori}
                </span>
            </div>

            <div class="relative px-6 sm:px-10 pb-8 pt-4">
                <div class="absolute -top-16 left-6 sm:left-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white p-1 shadow-lg border border-slate-100">
                    <img src="${mainLogoUrl}" alt="Logo" class="w-full h-full object-cover rounded-xl">
                </div>

                <div class="h-10 sm:h-12 w-full"></div>

                <div class="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
                    <div class="max-w-3xl">
                        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-800 font-serif mb-3">${umkm.nama_umkm}</h2>

                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm text-slate-500 mb-6">
                            <div class="flex items-center space-x-2">
                                <i class="fa-solid fa-user text-forest-800"></i>
                                <span>Pemilik: <strong class="text-slate-700">${umkm.pemilik}</strong></span>
                            </div>
                            <div class="flex items-center space-x-2 col-span-1 sm:col-span-2">
                                <i class="fa-solid fa-location-dot text-forest-800 flex-shrink-0"></i>
                                <span class="line-clamp-1">Alamat: <strong class="text-slate-700">${umkm.alamat}</strong></span>
                            </div>
                        </div>

                        <p class="text-slate-650 leading-relaxed text-sm font-light">${umkm.deskripsi}</p>
                    </div>

                    <div class="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                        ${headerActionButtons}
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div class="lg:col-span-2">
                <h3 class="text-2xl font-bold text-forest-800 mb-6 flex items-center space-x-3">
                    <i class="fa-solid fa-bag-shopping text-xl text-forest-800"></i>
                    <span>Produk yang Dijual</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    ${productsHtml}
                </div>
            </div>

            <div class="lg:col-span-1 space-y-8">
                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 class="text-lg font-bold text-forest-800 mb-4 flex items-center space-x-2">
                        <i class="fa-solid fa-map-marked-alt text-forest-800"></i>
                        <span>Lokasi Usaha</span>
                    </h3>
                    <p class="text-xs text-slate-500 mb-4">${umkm.alamat}</p>
                    <div class="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative">
                        <iframe src="${embedMapUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>

                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 class="text-lg font-bold text-forest-800 mb-4 flex items-center space-x-2">
                        <i class="fa-solid fa-share-nodes text-forest-800"></i>
                        <span>Ikuti Kami</span>
                    </h3>
                    <div class="grid grid-cols-1 gap-3">
                        ${socialsHtml}
                    </div>
                </div>
            </div>
        </div>

        ${galleryHtml}
    `;
}

// 4. NARAHUBUNG / KONTAK FORM
function renderKontak() {
    const form = document.getElementById('form-pengajuan');
    if (form && !form.dataset.listener) {
        form.dataset.listener = 'true';
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nama = document.getElementById('input-nama').value;
            const email = document.getElementById('input-email').value;
            const no_hp = document.getElementById('input-no_hp').value;
            const jenis = document.getElementById('input-jenis').value;
            const pesan = document.getElementById('input-pesan').value;

            try {
                // Dynamically fetch exact next ID from Supabase table to avoid PKEY collisions
                const nextPengajuanId = await getNextTableId('pengajuan');

                const { error } = await supabaseClient.from('pengajuan').insert([{
                    id: nextPengajuanId,
                    nama_pengaju: nama,
                    email: email,
                    no_hp: no_hp,
                    jenis: jenis,
                    pesan: pesan,
                    status: 'Menunggu'
                }]);

                if (error) throw error;

                await reloadCache();
                showToast('Pesan pengajuan Anda berhasil dikirim! Silakan tunggu konfirmasi admin.');
                form.reset();
            } catch (err) {
                console.error(err);
                showToast('Gagal mengirim pesan pengajuan: ' + err.message, 'error');
            }
        });
    }
}

// --- ADMIN NAVIGATION HEADER UPDATE ---
function updateAdminNavHeader() {
    const adminSession = sessionStorage.getItem('admin_logged_in');
    const desktopContainer = document.getElementById('nav-admin-profile-container');
    const mobileContainer = document.getElementById('mobile-nav-admin-profile-container');
    const mobileMenuContainer = document.getElementById('mobile-menu-admin-container');
    const isActive = window.location.hash.startsWith('#/admin');

    if (adminSession) {
        const loggedAdmin = JSON.parse(adminSession);
        const initial = loggedAdmin.name ? loggedAdmin.name.charAt(0).toUpperCase() : 'A';

        if (desktopContainer) {
            desktopContainer.innerHTML = `
                <a href="#/admin" class="relative group flex items-center justify-center" title="Dashboard Admin (${loggedAdmin.name})">
                    <div class="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center font-bold transition-all shadow-md border ${isActive ? 'ring-4 ring-emerald-500/30 border-emerald-300 bg-emerald-600' : 'border-emerald-400/30'
                }">
                        ${initial}
                    </div>
                </a>
            `;
        }
        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <a href="#/admin" class="relative block" title="Dashboard Admin (${loggedAdmin.name})">
                    <div class="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm border ${isActive ? 'ring-2 ring-emerald-500/30 border-emerald-300' : 'border-emerald-400/30'
                }">
                        ${initial}
                    </div>
                </a>
            `;
        }
        if (mobileMenuContainer) {
            mobileMenuContainer.innerHTML = `
                <a href="#/admin" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-base font-semibold text-emerald-700 ${isActive ? 'bg-emerald-100 text-emerald-850' : 'bg-emerald-50 hover:bg-emerald-100'
                } transition-colors">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                        ${initial}
                    </div>
                    <div>
                        <span class="block text-sm font-bold text-slate-800">${loggedAdmin.name}</span>
                        <span class="block text-xxs text-emerald-650 uppercase font-semibold">Admin (Online)</span>
                    </div>
                </a>
            `;
        }
    } else {
        if (desktopContainer) {
            desktopContainer.innerHTML = `
                <a href="#/admin" class="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm group ${isActive
                    ? 'bg-forest-50 border-forest-500 text-forest-800 ring-4 ring-forest-850/10'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                } border" title="Login Admin">
                    <i class="fa-solid fa-user text-base group-hover:scale-105 transition-transform"></i>
                </a>
            `;
        }
        if (mobileContainer) {
            mobileContainer.innerHTML = `
                <a href="#/admin" class="w-9 h-9 rounded-full flex items-center justify-center transition-all border ${isActive ? 'bg-forest-50 border-forest-500 text-forest-850' : 'bg-slate-100 border-slate-200 text-slate-650'
                }" title="Login Admin">
                    <i class="fa-solid fa-user text-sm"></i>
                </a>
            `;
        }
        if (mobileMenuContainer) {
            mobileMenuContainer.innerHTML = `
                <a href="#/admin" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-forest-50 text-forest-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }">
                    <i class="fa-solid fa-user-shield text-lg w-5 ${isActive ? 'text-forest-800' : 'text-slate-400'}"></i>
                    <span>Dashboard Admin</span>
                </a>
            `;
        }
    }
}

// --- ADMIN PORTAL VIEW & MANAGEMENT ---
let activeAdminView = 'dashboard';
let editingUMKMId = null;
let managingProductsUMKMId = null;

function renderAdmin() {
    updateAdminNavHeader();
    const adminSession = sessionStorage.getItem('admin_logged_in');
    const container = document.getElementById('admin-view-content');
    if (!container) return;

    if (!adminSession) {
        container.innerHTML = `
            <div class="min-h-[500px] flex items-center justify-center px-4 py-12">
                <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
                    <div class="text-center">
                        <div class="mx-auto w-12 h-12 bg-forest-800 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                            <i class="fa-solid fa-lock text-xl"></i>
                        </div>
                        <h2 class="text-3xl font-extrabold text-forest-800 font-serif">Login Administrator</h2>
                        <p class="mt-2 text-sm text-slate-500">Gunakan akun admin yang terdaftar di database.</p>
                    </div>

                    <form id="admin-login-form" class="mt-8 space-y-6">
                        <div class="space-y-4">
                            <div>
                                <label for="login-email" class="block text-sm font-semibold text-slate-700 mb-1">Email Admin</label>
                                <input type="email" id="login-email" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700" placeholder="admin@pesaren.desa.id">
                            </div>
                            <div>
                                <label for="login-password" class="block text-sm font-semibold text-slate-700 mb-1">Kata Sandi</label>
                                <input type="password" id="login-password" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700" placeholder="••••••••">
                            </div>
                        </div>

                        <div>
                            <button type="submit" class="w-full bg-forest-800 hover:bg-forest-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2">
                                <i class="fa-solid fa-right-to-bracket"></i>
                                <span>Masuk ke Dashboard</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('admin-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const pass = document.getElementById('login-password').value.trim();
            loginAdmin(email, pass);
        });
        return;
    }

    const loggedAdmin = JSON.parse(adminSession);

    container.innerHTML = `
        <div class="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
            <aside class="w-full lg:w-64 bg-forest-900 text-emerald-50 flex-shrink-0 flex flex-col border-r border-forest-800">
                <div class="p-6 border-b border-forest-800 flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold border border-emerald-400/30">
                        ${loggedAdmin.name ? loggedAdmin.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                        <span class="block text-sm font-bold text-white">${loggedAdmin.name}</span>
                        <span class="block text-xxs text-emerald-300 tracking-wider uppercase font-semibold">${loggedAdmin.role}</span>
                    </div>
                </div>

                <nav class="flex-grow p-4 space-y-1.5">
                    <button onclick="switchAdminView('dashboard')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeAdminView === 'dashboard' ? 'bg-emerald-500 text-forest-950 font-bold' : 'hover:bg-forest-800 text-emerald-100/80'
        }">
                        <i class="fa-solid fa-chart-pie w-5"></i>
                        <span>Dashboard</span>
                    </button>

                    <button onclick="switchAdminView('umkm')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeAdminView === 'umkm' || activeAdminView === 'umkm-form' ? 'bg-emerald-500 text-forest-950 font-bold' : 'hover:bg-forest-800 text-emerald-100/80'
        }">
                        <i class="fa-solid fa-store w-5"></i>
                        <span>Semua UMKM</span>
                    </button>

                    <button onclick="switchAdminView('kategori')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeAdminView === 'kategori' ? 'bg-emerald-500 text-forest-950 font-bold' : 'hover:bg-forest-800 text-emerald-100/80'
        }">
                        <i class="fa-solid fa-tags w-5"></i>
                        <span>Kategori</span>
                    </button>

                    <button onclick="switchAdminView('pengajuan')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeAdminView === 'pengajuan' ? 'bg-emerald-500 text-forest-950 font-bold' : 'hover:bg-forest-800 text-emerald-100/80'
        }">
                        <i class="fa-solid fa-inbox w-5"></i>
                        <span>Kontak Masuk</span>
                        ${db.pengajuan().filter(p => p.status === 'Menunggu').length > 0 ? `<span class="bg-rose-500 text-white font-bold text-xxs px-2 py-0.5 rounded-full ml-auto">${db.pengajuan().filter(p => p.status === 'Menunggu').length}</span>` : ''}
                    </button>
                </nav>

                <div class="p-4 border-t border-forest-800">
                    <button onclick="logoutAdmin()" class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/10 transition-colors">
                        <i class="fa-solid fa-right-from-bracket w-5"></i>
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            <main class="flex-grow p-6 sm:p-10" id="admin-main-panel">
            </main>
        </div>
    `;

    renderAdminPanel();
}

window.switchAdminView = function (view) {
    activeAdminView = view;
    editingUMKMId = null;
    managingProductsUMKMId = null;
    renderAdmin();
};

function renderAdminPanel() {
    const mainEl = document.getElementById('admin-main-panel');
    if (!mainEl) return;

    switch (activeAdminView) {
        case 'dashboard':
            renderAdminDashboard(mainEl);
            break;
        case 'umkm':
            renderAdminUMKMList(mainEl);
            break;
        case 'umkm-form':
            renderAdminUMKMForm(mainEl);
            break;
        case 'products':
            renderAdminProductsList(mainEl);
            break;
        case 'kategori':
            renderAdminKategoriList(mainEl);
            break;
        case 'pengajuan':
            renderAdminPengajuanList(mainEl);
            break;
    }
}

// 6.1 ADMIN DASHBOARD
function renderAdminDashboard(el) {
    const umkms = db.umkm();
    const products = db.produk();
    const pengajuans = db.pengajuan();
    const pendingPengajuan = pengajuans.filter(p => p.status === 'Menunggu');

    el.innerHTML = `
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800">Ringkasan Statistik</h1>
            <p class="text-slate-500">Gambaran umum data operasional website PESONA Desa Pesaren (Supabase Cloud).</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total UMKM</span>
                    <span class="block text-3xl font-bold text-slate-800">${umkms.length}</span>
                </div>
                <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-800">
                    <i class="fa-solid fa-store text-xl"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Produk</span>
                    <span class="block text-3xl font-bold text-slate-800">${products.length}</span>
                </div>
                <div class="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                    <i class="fa-solid fa-bag-shopping text-xl"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Pengajuan</span>
                    <span class="block text-3xl font-bold text-slate-800">${pengajuans.length}</span>
                </div>
                <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <i class="fa-solid fa-inbox text-xl"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Menunggu Tindakan</span>
                    <span class="block text-3xl font-bold text-rose-600">${pendingPengajuan.length}</span>
                </div>
                <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-650">
                    <i class="fa-solid fa-clock-rotate-left text-xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-slate-800">Pengajuan Masuk Terbaru</h3>
                <button onclick="switchAdminView('pengajuan')" class="text-xs font-bold text-forest-800 hover:underline">Lihat Semua Kontak</button>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 font-semibold text-left">
                            <th class="px-6 py-3 rounded-l-xl">Pengaju</th>
                            <th class="px-6 py-3">Jenis</th>
                            <th class="px-6 py-3">Pesan</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 rounded-r-xl">Tgl</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                        ${pengajuans.length === 0 ? `
                                <tr>
                                    <td colspan="5" class="px-6 py-8 text-center text-slate-400">Tidak ada pengajuan masuk.</td>
                                </tr>
                            ` : pengajuans.slice(-3).reverse().map(p => `
                                <tr>
                                    <td class="px-6 py-4">
                                        <span class="block font-bold text-slate-800">${p.nama_pengaju}</span>
                                        <span class="block text-xs text-slate-400">${p.email}</span>
                                    </td>
                                    <td class="px-6 py-4">${p.jenis}</td>
                                    <td class="px-6 py-4 max-w-xs truncate">${p.pesan}</td>
                                    <td class="px-6 py-4">
                                        <span class="px-2 py-1 rounded text-xxs font-bold bg-amber-100 text-amber-800">${p.status}</span>
                                    </td>
                                    <td class="px-6 py-4 text-xs text-slate-400">${new Date(p.created_at || Date.now()).toLocaleDateString('id-ID')}</td>
                                </tr>
                            `).join('')
        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 6.2 ADMIN UMKM LIST
function renderAdminUMKMList(el) {
    const umkms = db.umkm();
    const categories = getCategoryMap();

    el.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 class="text-3xl font-bold text-slate-800">Manajemen Data UMKM</h1>
                <p class="text-slate-500">Kelola informasi pelaku UMKM Desa Pesaren langsung di Supabase.</p>
            </div>

            <button onclick="openUMKMForm()" class="bg-forest-800 hover:bg-forest-700 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-colors text-sm flex items-center space-x-2">
                <i class="fa-solid fa-plus text-xs"></i>
                <span>Tambah UMKM Baru</span>
            </button>
        </div>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 font-semibold text-left">
                            <th class="px-6 py-3 rounded-l-xl">No</th>
                            <th class="px-6 py-3">Nama UMKM</th>
                            <th class="px-6 py-3">Kategori</th>
                            <th class="px-6 py-3">Pemilik</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 rounded-r-xl text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                        ${umkms.length === 0 ? `
                                <tr>
                                    <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                                        <i class="fa-solid fa-store-slash text-3xl mb-3"></i>
                                        <p class="text-sm font-semibold">Belum ada data UMKM.</p>
                                    </td>
                                </tr>
                            ` : umkms.map((u, index) => {
        const cat = categories[u.kategori_id] || { nama_kategori: 'Umum' };
        const logoUrl = getImageUrl(u.logo, 'logo_' + u.id);
        return `
                                    <tr>
                                        <td class="px-6 py-4 font-semibold text-slate-400">${index + 1}</td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center space-x-3">
                                                <img src="${logoUrl}" alt="Logo" class="w-8 h-8 rounded-lg object-cover border border-slate-100">
                                                <div>
                                                    <span class="block font-bold text-slate-800">${u.nama_umkm}</span>
                                                    <span class="block text-xxs text-slate-400">slug: ${u.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 font-medium text-slate-600">${cat.nama_kategori}</td>
                                        <td class="px-6 py-4 font-medium text-slate-700">${u.pemilik}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-2 py-1 rounded text-xxs font-bold ${u.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">${u.status}</span>
                                        </td>
                                        <td class="px-6 py-4 text-center">
                                            <div class="flex items-center justify-center space-x-2">
                                                <button onclick="manageUMKMProducts(${u.id})" class="text-sky-600 hover:bg-sky-50 p-2 rounded-lg transition-colors border border-sky-100" title="Kelola Produk Jualan">
                                                    <i class="fa-solid fa-bag-shopping text-sm"></i>
                                                </button>
                                                <button onclick="openUMKMForm(${u.id})" class="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors border border-amber-100" title="Edit Profil UMKM">
                                                    <i class="fa-regular fa-edit text-sm"></i>
                                                </button>
                                                <button onclick="deleteUMKM(${u.id})" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors border border-rose-100" title="Hapus UMKM">
                                                    <i class="fa-regular fa-trash-can text-sm"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
    }).join('')
        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

window.openUMKMForm = function (id = null) {
    editingUMKMId = id;
    activeAdminView = 'umkm-form';
    renderAdmin();
};

window.manageUMKMProducts = function (id) {
    managingProductsUMKMId = id;
    activeAdminView = 'products';
    renderAdmin();
};

window.deleteUMKM = async function (id) {
    if (confirm('Apakah Anda yakin ingin menghapus data UMKM ini? Data produk dan sosial media terkait juga akan terhapus.')) {
        try {
            await supabaseClient.from('sosial_media').delete().eq('umkm_id', id);
            await supabaseClient.from('produk').delete().eq('umkm_id', id);
            await supabaseClient.from('galeri_umkm').delete().eq('umkm_id', id);
            const { error } = await supabaseClient.from('umkm').delete().eq('id', id);

            if (error) throw error;

            await reloadCache();
            showToast('Data UMKM berhasil dihapus dari database.');
            renderAdmin();
        } catch (err) {
            console.error(err);
            showToast('Gagal menghapus UMKM: ' + err.message, 'error');
        }
    }
};

// 6.3 ADD/EDIT UMKM FORM WITH SOCIAL MEDIA & AUTOMATIC PRODUCT INSERTION
function renderAdminUMKMForm(el) {
    const categories = db.kategori_umkm();
    const isEdit = editingUMKMId !== null;
    let title = isEdit ? 'Edit Data Profil UMKM' : 'Tambah UMKM Baru';

    let data = {
        nama_umkm: '', kategori_id: categories.length > 0 ? categories[0].id : 1, pemilik: '', deskripsi: '', alamat: '', maps: '', logo: '', foto_cover: '', status: 'Aktif'
    };
    let socialLinks = { WhatsApp: '', Instagram: '' };

    if (isEdit) {
        const found = db.umkm().find(u => u.id === editingUMKMId);
        if (found) {
            data = { ...found };
            const socials = db.sosial_media().filter(s => s.umkm_id === editingUMKMId);
            const wa = socials.find(s => s.jenis === 'WhatsApp');
            const ig = socials.find(s => s.jenis === 'Instagram');
            if (wa) socialLinks.WhatsApp = wa.link;
            if (ig) socialLinks.Instagram = ig.link;
        }
    }

    const currentLogoUrl = isEdit ? getImageUrl(data.logo, 'logo_' + data.id) : (data.logo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300');
    const currentCoverUrl = isEdit ? getImageUrl(data.foto_cover, 'cover_' + data.id) : (data.foto_cover || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000');

    el.innerHTML = `
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800">${title}</h1>
            <p class="text-slate-500">Lengkapi isian data berikut. Data akan langsung tersimpan di Supabase.</p>
        </div>

        <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm max-w-4xl">
            <form id="admin-umkm-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="form-nama_umkm" class="block text-sm font-semibold text-slate-700 mb-1">Nama UMKM <span class="text-rose-500">*</span></label>
                        <input type="text" id="form-nama_umkm" required value="${data.nama_umkm}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700">
                    </div>
                    <div>
                        <label for="form-kategori" class="block text-sm font-semibold text-slate-700 mb-1">Kategori UMKM <span class="text-rose-500">*</span></label>
                        <select id="form-kategori" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 cursor-pointer">
                            <option value="">Pilih Kategori</option>
                            ${categories.map(c => `<option value="${c.id}" ${data.kategori_id == c.id ? 'selected' : ''}>${c.nama_kategori}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="form-pemilik" class="block text-sm font-semibold text-slate-700 mb-1">Nama Pemilik <span class="text-rose-500">*</span></label>
                        <input type="text" id="form-pemilik" required value="${data.pemilik}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700">
                    </div>
                    <div>
                        <label for="form-status" class="block text-sm font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                        <select id="form-status" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 cursor-pointer">
                            <option value="Aktif" ${data.status === 'Aktif' ? 'selected' : ''}>Aktif (Muncul di Website)</option>
                            <option value="Tidak Aktif" ${data.status === 'Tidak Aktif' ? 'selected' : ''}>Tidak Aktif (Disembunyikan)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label for="form-deskripsi" class="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Ringkas Usaha <span class="text-rose-500">*</span></label>
                    <textarea id="form-deskripsi" required rows="4" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700">${data.deskripsi}</textarea>
                </div>

                <div class="border-t border-slate-100 pt-6">
                    <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center"><i class="fa-solid fa-share-nodes mr-2 text-forest-800"></i>Sosial Media & Kontak</h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label for="form-whatsapp" class="block text-sm font-semibold text-slate-700 mb-1">Nomor WhatsApp Usaha</label>
                            <input type="text" id="form-whatsapp" value="${socialLinks.WhatsApp}" placeholder="Contoh: 08123456789" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700">
                        </div>
                        <div>
                            <label for="form-instagram" class="block text-sm font-semibold text-slate-700 mb-1">Link Instagram Usaha</label>
                            <input type="text" id="form-instagram" value="${socialLinks.Instagram}" placeholder="Contoh: https://instagram.com/nama_umkm" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="form-alamat" class="block text-sm font-semibold text-slate-700 mb-1">Alamat Lengkap Usaha <span class="text-rose-500">*</span></label>
                            <input type="text" id="form-alamat" required value="${data.alamat}" placeholder="Desa Pesaren, Kec. Wedarijaksa" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700">
                        </div>
                        <div>
                            <label for="form-maps" class="block text-sm font-semibold text-slate-700 mb-1">Link / Iframe Google Maps</label>
                            <input type="text" id="form-maps" value="${data.maps}" placeholder="https://maps.google.com/maps?q=..." class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700">
                        </div>
                    </div>
                </div>

                <div class="border-t border-slate-100 pt-6">
                    <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center"><i class="fa-regular fa-image mr-2 text-forest-800"></i>Logo & Foto Profil</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Unggah File / Input URL Logo UMKM</label>
                            <input type="text" id="form-logo" required value="${currentLogoUrl}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 mb-2">
                            <input type="file" id="form-logo-file" accept="image/*" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest-50 file:text-forest-800 hover:file:bg-forest-100 transition-all cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-1">
                            <div class="mt-3 flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <img id="form-logo-preview" src="${currentLogoUrl}" class="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm">
                                <span class="text-xxs text-slate-400">Pratinjau logo UMKM.</span>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Unggah File / Input URL Sampul Cover</label>
                            <input type="text" id="form-cover" required value="${currentCoverUrl}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 mb-2">
                            <input type="file" id="form-cover-file" accept="image/*" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest-50 file:text-forest-800 hover:file:bg-forest-100 transition-all cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-1">
                            <div class="mt-3 flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <img id="form-cover-preview" src="${currentCoverUrl}" class="w-20 h-12 rounded-lg object-cover border border-slate-200 shadow-sm">
                                <span class="text-xxs text-slate-400">Pratinjau foto sampul.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="border-t border-slate-100 pt-6 flex justify-end space-x-4">
                    <button type="button" onclick="switchAdminView('umkm')" class="px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-750 font-semibold text-sm transition-colors">Batal</button>
                    <button type="submit" id="btn-submit-umkm" class="px-8 py-3 bg-forest-800 hover:bg-forest-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors">Simpan Profil UMKM</button>
                </div>
            </form>
        </div>
    `;

    const logoFileInput = document.getElementById('form-logo-file');
    if (logoFileInput) {
        logoFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const compressed = await compressImage(file, 400, 0.8);
                document.getElementById('form-logo').value = compressed;
                const preview = document.getElementById('form-logo-preview');
                if (preview) preview.src = compressed;
            }
        });
    }

    const coverFileInput = document.getElementById('form-cover-file');
    if (coverFileInput) {
        coverFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const compressed = await compressImage(file, 800, 0.8);
                document.getElementById('form-cover').value = compressed;
                const preview = document.getElementById('form-cover-preview');
                if (preview) preview.src = compressed;
            }
        });
    }

    document.getElementById('admin-umkm-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('btn-submit-umkm');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Menyimpan...';

        const nama_umkm = document.getElementById('form-nama_umkm').value.trim();
        const kategori_id = parseInt(document.getElementById('form-kategori').value);
        const pemilik = document.getElementById('form-pemilik').value.trim();
        const status = document.getElementById('form-status').value;
        const deskripsi = document.getElementById('form-deskripsi').value.trim();
        const alamat = document.getElementById('form-alamat').value.trim();
        const mapsRaw = document.getElementById('form-maps').value.trim();
        const maps = formatMapEmbedUrl(mapsRaw, alamat);
        const rawLogo = document.getElementById('form-logo').value.trim();
        const rawCover = document.getElementById('form-cover').value.trim();

        const waVal = document.getElementById('form-whatsapp').value.trim();
        const igVal = document.getElementById('form-instagram').value.trim();

        const adminSession = JSON.parse(sessionStorage.getItem('admin_logged_in') || '{}');
        const createdBy = adminSession.id || 1;

        try {
            let targetId = editingUMKMId;

            if (!targetId) {
                targetId = await getNextTableId('umkm');
            }

            // Save image locally if base64 data URL
            let dbLogo = rawLogo;
            const logoKey = `logo_${targetId}`;
            if (rawLogo.startsWith('data:image') || rawLogo.length > 200) {
                saveUploadedImage(logoKey, rawLogo);
                dbLogo = `local:${logoKey}`;
            }

            let dbCover = rawCover;
            const coverKey = `cover_${targetId}`;
            if (rawCover.startsWith('data:image') || rawCover.length > 200) {
                saveUploadedImage(coverKey, rawCover);
                dbCover = `local:${coverKey}`;
            }

            if (isEdit) {
                const { error: updateErr } = await supabaseClient
                    .from('umkm')
                    .update({
                        nama_umkm,
                        kategori_id,
                        pemilik,
                        status,
                        deskripsi,
                        alamat,
                        maps,
                        logo: dbLogo,
                        foto_cover: dbCover,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', targetId);

                if (updateErr) throw updateErr;

                await supabaseClient.from('sosial_media').delete().eq('umkm_id', targetId);
            } else {
                const { data: inserted, error: insertErr } = await supabaseClient
                    .from('umkm')
                    .insert([{
                        id: targetId,
                        kategori_id,
                        created_by: createdBy,
                        nama_umkm,
                        slug: generateSlug(nama_umkm) + '-' + Date.now().toString().slice(-4),
                        pemilik,
                        deskripsi,
                        alamat,
                        maps,
                        logo: dbLogo,
                        foto_cover: dbCover,
                        status
                    }])
                    .select();

                if (insertErr) throw insertErr;
                if (inserted && inserted.length > 0) targetId = inserted[0].id;
            }

            let nextSocId = await getNextTableId('sosial_media');

            const socialInserts = [];
            if (waVal) {
                socialInserts.push({ id: nextSocId++, umkm_id: targetId, jenis: 'WhatsApp', link: waVal });
            }
            if (igVal) {
                socialInserts.push({ id: nextSocId++, umkm_id: targetId, jenis: 'Instagram', link: igVal });
            }
            if (socialInserts.length > 0) {
                const { error: socErr } = await supabaseClient.from('sosial_media').insert(socialInserts);
                if (socErr) console.warn('Peringatan insert sosial media:', socErr);
            }

            // Automatic product insertion
            const { data: existingProds } = await supabaseClient.from('produk').select('id').eq('umkm_id', targetId);
            if (!existingProds || existingProds.length === 0) {
                const nextProdId = await getNextTableId('produk');
                const prodKey = `prod_${nextProdId}`;

                if (rawLogo.startsWith('data:image')) {
                    saveUploadedImage(prodKey, rawLogo);
                }

                const { error: prodErr } = await supabaseClient.from('produk').insert([{
                    id: nextProdId,
                    umkm_id: targetId,
                    nama_produk: 'Produk Utama ' + nama_umkm,
                    deskripsi: 'Produk unggulan dari ' + nama_umkm,
                    harga: 20000,
                    stok: 50,
                    foto_produk: `local:${prodKey}`,
                    status: 'Aktif'
                }]);
                if (prodErr) console.warn('Peringatan insert produk otomatis:', prodErr);
            }

            await reloadCache();
            showToast(isEdit ? 'Profil UMKM berhasil diperbarui di Supabase.' : 'Profil UMKM baru & produk otomatis berhasil dibuat!');
            switchAdminView('umkm');
        } catch (err) {
            console.error(err);
            showToast('Gagal menyimpan UMKM: ' + err.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Simpan Profil UMKM';
        }
    });
}

// 6.4 ADMIN PRODUCTS MANAGEMENT VIEW
function renderAdminProductsList(el) {
    const umkmId = managingProductsUMKMId;
    const umkm = db.umkm().find(u => u.id === umkmId);
    if (!umkm) {
        switchAdminView('umkm');
        return;
    }

    const products = db.produk().filter(p => p.umkm_id === umkmId);
    const defaultProductFoto = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300';

    el.innerHTML = `
        <div class="mb-8">
            <button onclick="switchAdminView('umkm')" class="text-xs font-semibold text-forest-800 hover:underline mb-2 flex items-center space-x-1">
                <i class="fa-solid fa-arrow-left"></i>
                <span>Kembali ke Daftar UMKM</span>
            </button>
            <h1 class="text-3xl font-bold text-slate-800">Manajemen Produk: <span class="text-forest-800">${umkm.nama_umkm}</span></h1>
            <p class="text-slate-500">Kelola katalog produk yang dipromosikan untuk usaha ini.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
                <h3 class="text-lg font-bold text-slate-800 mb-6" id="product-form-title">Tambah Produk Baru</h3>

                <form id="admin-product-form" class="space-y-4">
                    <input type="hidden" id="form-product-id" value="">
                    <div>
                        <label for="form-product-nama" class="block text-sm font-semibold text-slate-750 mb-1">Nama Produk <span class="text-rose-500">*</span></label>
                        <input type="text" id="form-product-nama" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 text-sm">
                    </div>
                    <div>
                        <label for="form-product-harga" class="block text-sm font-semibold text-slate-750 mb-1">Harga (Rp) <span class="text-rose-500">*</span></label>
                        <input type="number" id="form-product-harga" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 text-sm">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="form-product-stok" class="block text-sm font-semibold text-slate-750 mb-1">Stok <span class="text-rose-500">*</span></label>
                            <input type="number" id="form-product-stok" required value="10" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 text-sm">
                        </div>
                        <div>
                            <label for="form-product-status" class="block text-sm font-semibold text-slate-750 mb-1">Status</label>
                            <select id="form-product-status" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 text-sm">
                                <option value="Aktif">Aktif</option>
                                <option value="Tidak Aktif">Tidak Aktif</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-750 mb-1">Unggah Foto File / Input Link</label>
                        <input type="text" id="form-product-foto" value="${defaultProductFoto}" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 text-sm mb-2">
                        <input type="file" id="form-product-foto-file" accept="image/*" class="w-full text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-1 mb-2">
                        <div class="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <img id="form-product-foto-preview" src="${defaultProductFoto}" class="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm">
                            <span class="text-[10px] text-slate-400">Pratinjau foto produk unggahan.</span>
                        </div>
                    </div>
                    <div>
                        <label for="form-product-deskripsi" class="block text-sm font-semibold text-slate-750 mb-1">Deskripsi Singkat</label>
                        <textarea id="form-product-deskripsi" rows="3" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 text-sm"></textarea>
                    </div>

                    <div class="pt-4 flex items-center justify-end space-x-2">
                        <button type="button" onclick="cancelProductEdit()" id="btn-product-cancel" class="hidden px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-750 font-semibold text-xs transition-colors">Batal</button>
                        <button type="submit" class="px-6 py-2.5 bg-forest-800 hover:bg-forest-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors">Simpan Produk</button>
                    </div>
                </form>
            </div>

            <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="text-lg font-bold text-slate-800 mb-6">Daftar Produk Saat Ini</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100 text-sm">
                        <thead>
                            <tr class="bg-slate-50 text-slate-500 font-semibold text-left">
                                <th class="px-4 py-3 rounded-l-xl">Foto</th>
                                <th class="px-4 py-3">Nama Produk</th>
                                <th class="px-4 py-3 text-right">Harga</th>
                                <th class="px-4 py-3 text-center">Stok</th>
                                <th class="px-4 py-3 text-center">Status</th>
                                <th class="px-4 py-3 rounded-r-xl text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            ${products.length === 0 ? `
                                    <tr>
                                        <td colspan="6" class="px-4 py-10 text-center text-slate-450">Katalog produk masih kosong.</td>
                                    </tr>
                                ` : products.map(p => {
        const prodImgUrl = getImageUrl(p.foto_produk, 'prod_' + p.id);
        return `
                                        <tr>
                                            <td class="px-4 py-3">
                                                <img src="${prodImgUrl}" alt="${p.nama_produk}" class="w-12 h-12 rounded-lg object-cover border border-slate-100">
                                            </td>
                                            <td class="px-4 py-3">
                                                <span class="block font-bold text-slate-800">${p.nama_produk}</span>
                                                <span class="block text-xxs text-slate-400 line-clamp-1">${p.deskripsi || ''}</span>
                                            </td>
                                            <td class="px-4 py-3 text-right font-bold text-emerald-800">Rp ${Number(p.harga).toLocaleString('id-ID')}</td>
                                            <td class="px-4 py-3 text-center">${p.stok}</td>
                                            <td class="px-4 py-3 text-center">
                                                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">${p.status}</span>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                                <div class="flex items-center justify-center space-x-1">
                                                    <button onclick="editProduct(${p.id})" class="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg border border-amber-100" title="Edit Produk">
                                                        <i class="fa-regular fa-edit text-xs"></i>
                                                    </button>
                                                    <button onclick="deleteProduct(${p.id})" class="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg border border-rose-100" title="Hapus Produk">
                                                        <i class="fa-regular fa-trash-can text-xs"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
    }).join('')
        }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    const productFileInput = document.getElementById('form-product-foto-file');
    if (productFileInput) {
        productFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const compressed = await compressImage(file, 600, 0.8);
                document.getElementById('form-product-foto').value = compressed;
                const preview = document.getElementById('form-product-foto-preview');
                if (preview) preview.src = compressed;
            }
        });
    }

    document.getElementById('admin-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const productIdVal = document.getElementById('form-product-id').value;
        const nama_produk = document.getElementById('form-product-nama').value.trim();
        const harga = parseFloat(document.getElementById('form-product-harga').value);
        const stok = parseInt(document.getElementById('form-product-stok').value);
        const status = document.getElementById('form-product-status').value;
        const rawFoto = document.getElementById('form-product-foto').value.trim();
        const deskripsi = document.getElementById('form-product-deskripsi').value.trim();

        try {
            let targetProdId = productIdVal ? parseInt(productIdVal) : null;
            if (!targetProdId) {
                targetProdId = await getNextTableId('produk');
            }

            let dbFoto = rawFoto;
            const itemKey = `prod_${targetProdId}`;

            // Store uploaded base64 image locally
            if (rawFoto.startsWith('data:image') || rawFoto.length > 200) {
                saveUploadedImage(itemKey, rawFoto);
                dbFoto = `local:${itemKey}`;
            }

            if (productIdVal) {
                const { error } = await supabaseClient.from('produk').update({
                    nama_produk,
                    harga,
                    stok,
                    status,
                    foto_produk: dbFoto,
                    deskripsi,
                    updated_at: new Date().toISOString()
                }).eq('id', targetProdId);

                if (error) throw error;
                showToast('Produk berhasil diperbarui.');
            } else {
                const { error } = await supabaseClient.from('produk').insert([{
                    id: targetProdId,
                    umkm_id: umkmId,
                    nama_produk,
                    harga,
                    stok,
                    status,
                    foto_produk: dbFoto,
                    deskripsi
                }]);

                if (error) throw error;
                showToast('Produk baru berhasil ditambahkan!');
            }

            await reloadCache();
            cancelProductEdit();
            renderAdmin();
        } catch (err) {
            console.error(err);
            showToast('Gagal menyimpan produk: ' + err.message, 'error');
        }
    });
}

window.editProduct = function (id) {
    const product = db.produk().find(p => p.id === id);
    if (!product) return;

    const prodImgUrl = getImageUrl(product.foto_produk, 'prod_' + product.id);

    document.getElementById('form-product-id').value = product.id;
    document.getElementById('form-product-nama').value = product.nama_produk;
    document.getElementById('form-product-harga').value = product.harga;
    document.getElementById('form-product-stok').value = product.stok;
    document.getElementById('form-product-status').value = product.status;
    document.getElementById('form-product-foto').value = prodImgUrl;
    document.getElementById('form-product-deskripsi').value = product.deskripsi || '';

    const preview = document.getElementById('form-product-foto-preview');
    if (preview) preview.src = prodImgUrl;

    document.getElementById('product-form-title').innerText = 'Edit Produk';
    document.getElementById('btn-product-cancel').classList.remove('hidden');
};

window.cancelProductEdit = function () {
    const form = document.getElementById('admin-product-form');
    if (form) form.reset();
    document.getElementById('form-product-id').value = '';
    const defaultFoto = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300';
    document.getElementById('form-product-foto').value = defaultFoto;
    const preview = document.getElementById('form-product-foto-preview');
    if (preview) preview.src = defaultFoto;
    document.getElementById('product-form-title').innerText = 'Tambah Produk Baru';
    document.getElementById('btn-product-cancel').classList.add('hidden');
};

window.deleteProduct = async function (id) {
    if (confirm('Yakin ingin menghapus produk ini?')) {
        try {
            const { error } = await supabaseClient.from('produk').delete().eq('id', id);
            if (error) throw error;
            await reloadCache();
            showToast('Produk berhasil dihapus.');
            renderAdmin();
        } catch (err) {
            console.error(err);
            showToast('Gagal menghapus produk: ' + err.message, 'error');
        }
    }
};

// 6.5 ADMIN CATEGORIES MANAGEMENT VIEW
function renderAdminKategoriList(el) {
    const categories = db.kategori_umkm();

    el.innerHTML = `
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800">Manajemen Kategori UMKM</h1>
            <p class="text-slate-500">Kelola kategori bisnis di database Supabase.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
                <h3 class="text-lg font-bold text-slate-800 mb-6" id="category-form-title">Tambah Kategori Baru</h3>

                <form id="admin-category-form" class="space-y-4">
                    <input type="hidden" id="form-category-id" value="">
                    <div>
                        <label for="form-category-nama" class="block text-sm font-semibold text-slate-750 mb-1">Nama Kategori <span class="text-rose-500">*</span></label>
                        <input type="text" id="form-category-nama" required placeholder="Contoh: Makanan Olahan" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 text-sm">
                    </div>
                    <div>
                        <label for="form-category-icon" class="block text-sm font-semibold text-slate-750 mb-1">FontAwesome Icon Class <span class="text-rose-500">*</span></label>
                        <input type="text" id="form-category-icon" required value="fa-circle" placeholder="Contoh: fa-utensils" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all text-slate-700 text-sm">
                    </div>

                    <div class="pt-4 flex items-center justify-end space-x-2">
                        <button type="button" onclick="cancelCategoryEdit()" id="btn-category-cancel" class="hidden px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-755 font-semibold text-xs transition-colors">Batal</button>
                        <button type="submit" class="px-6 py-2.5 bg-forest-800 hover:bg-forest-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors">Simpan Kategori</button>
                    </div>
                </form>
            </div>

            <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="text-lg font-bold text-slate-800 mb-6">Daftar Kategori Saat Ini</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100 text-sm">
                        <thead>
                            <tr class="bg-slate-50 text-slate-500 font-semibold text-left">
                                <th class="px-6 py-3 rounded-l-xl">No</th>
                                <th class="px-6 py-3">Ikon Preview</th>
                                <th class="px-6 py-3">Nama Kategori</th>
                                <th class="px-6 py-3">Icon Class</th>
                                <th class="px-6 py-3 rounded-r-xl text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            ${categories.map((c, index) => `
                                    <tr>
                                        <td class="px-6 py-4 font-semibold text-slate-400">${index + 1}</td>
                                        <td class="px-6 py-4 text-center">
                                            <span class="inline-flex w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 items-center justify-center border border-emerald-100">
                                                <i class="fa-solid ${c.icon}"></i>
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 font-bold text-slate-800">${c.nama_kategori}</td>
                                        <td class="px-6 py-4 font-mono text-xs text-slate-400">${c.icon}</td>
                                        <td class="px-6 py-4 text-center">
                                            <div class="flex items-center justify-center space-x-2">
                                                <button onclick="editCategory(${c.id})" class="text-amber-600 hover:bg-amber-50 p-2 rounded-lg border border-amber-100" title="Edit Kategori">
                                                    <i class="fa-regular fa-edit text-xs"></i>
                                                </button>
                                                <button onclick="deleteCategory(${c.id})" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg border border-rose-100" title="Hapus Kategori">
                                                    <i class="fa-regular fa-trash-can text-xs"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')
        }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById('admin-category-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const catIdVal = document.getElementById('form-category-id').value;
        const nama_kategori = document.getElementById('form-category-nama').value.trim();
        const icon = document.getElementById('form-category-icon').value.trim();

        try {
            if (catIdVal) {
                const { error } = await supabaseClient.from('kategori_umkm').update({
                    nama_kategori,
                    icon,
                    updated_at: new Date().toISOString()
                }).eq('id', parseInt(catIdVal));

                if (error) throw error;
                showToast('Kategori berhasil diperbarui.');
            } else {
                const nextCatId = await getNextTableId('kategori_umkm');

                const { error } = await supabaseClient.from('kategori_umkm').insert([{
                    id: nextCatId,
                    nama_kategori,
                    icon
                }]);

                if (error) throw error;
                showToast('Kategori baru ditambahkan.');
            }

            await reloadCache();
            cancelCategoryEdit();
            renderAdmin();
        } catch (err) {
            console.error(err);
            showToast('Gagal menyimpan kategori: ' + err.message, 'error');
        }
    });
}

window.editCategory = function (id) {
    const cat = db.kategori_umkm().find(c => c.id === id);
    if (!cat) return;

    document.getElementById('form-category-id').value = cat.id;
    document.getElementById('form-category-nama').value = cat.nama_kategori;
    document.getElementById('form-category-icon').value = cat.icon;
    document.getElementById('category-form-title').innerText = 'Edit Kategori';
    document.getElementById('btn-category-cancel').classList.remove('hidden');
};

window.cancelCategoryEdit = function () {
    const form = document.getElementById('admin-category-form');
    if (form) form.reset();
    document.getElementById('form-category-id').value = '';
    document.getElementById('category-form-title').innerText = 'Tambah Kategori Baru';
    document.getElementById('btn-category-cancel').classList.add('hidden');
};

window.deleteCategory = async function (id) {
    const inUse = db.umkm().some(u => u.kategori_id === id);
    if (inUse) {
        showToast('Gagal menghapus! Kategori sedang digunakan oleh data UMKM.', 'error');
        return;
    }

    if (confirm('Yakin ingin menghapus kategori ini?')) {
        try {
            const { error } = await supabaseClient.from('kategori_umkm').delete().eq('id', id);
            if (error) throw error;
            await reloadCache();
            showToast('Kategori berhasil dihapus.');
            renderAdmin();
        } catch (err) {
            console.error(err);
            showToast('Gagal menghapus kategori: ' + err.message, 'error');
        }
    }
};

// 6.6 ADMIN PENGAJUAN / CONTACT SUBMISSIONS LIST
function renderAdminPengajuanList(el) {
    const pengajuans = db.pengajuan();

    el.innerHTML = `
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800">Daftar Kontak & Pengajuan Masuk</h1>
            <p class="text-slate-500">Lihat usulan penambahan UMKM atau perubahan data dari pengunjung website.</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 font-semibold text-left">
                            <th class="px-6 py-3 rounded-l-xl">No</th>
                            <th class="px-6 py-3">Tgl Masuk</th>
                            <th class="px-6 py-3">Informasi Pengaju</th>
                            <th class="px-6 py-3">Jenis Layanan</th>
                            <th class="px-6 py-3">Pesan Detail</th>
                            <th class="px-6 py-3">Ubah Status</th>
                            <th class="px-6 py-3 rounded-r-xl text-center">Hapus</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                        ${pengajuans.length === 0 ? `
                                <tr>
                                    <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                                        <i class="fa-solid fa-inbox text-3xl mb-3"></i>
                                        <p class="text-sm font-semibold">Tidak ada data kontak/pengajuan masuk.</p>
                                    </td>
                                </tr>
                            ` : pengajuans.map((p, index) => `
                                <tr>
                                    <td class="px-6 py-4 font-semibold text-slate-400">${index + 1}</td>
                                    <td class="px-6 py-4 text-xs text-slate-400">${new Date(p.created_at || Date.now()).toLocaleString('id-ID')}</td>
                                    <td class="px-6 py-4">
                                        <span class="block font-bold text-slate-850">${p.nama_pengaju}</span>
                                        <span class="block text-xs text-slate-450">${p.email}</span>
                                        <a href="https://wa.me/${(p.no_hp || '').replace(/[^0-9]/g, '')}" target="_blank" class="inline-flex items-center text-xxs font-semibold text-emerald-600 mt-1 hover:underline">
                                            <i class="fa-brands fa-whatsapp mr-1 text-[10px]"></i> Hubungi WA
                                        </a>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="inline-block px-2.5 py-1 rounded-full text-xxs font-semibold ${p.jenis === 'Tambah UMKM' ? 'bg-forest-50 text-forest-800 border border-forest-100' : 'bg-slate-100 text-slate-650'}">${p.jenis}</span>
                                    </td>
                                    <td class="px-6 py-4 max-w-sm">
                                        <p class="whitespace-pre-line text-xs leading-relaxed text-slate-600">${p.pesan}</p>
                                    </td>
                                    <td class="px-6 py-4">
                                        <select onchange="updatePengajuanStatus(${p.id}, this.value)" class="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-800 bg-white cursor-pointer">
                                            <option value="Menunggu" ${p.status === 'Menunggu' ? 'selected' : ''}>Menunggu</option>
                                            <option value="Diproses" ${p.status === 'Diproses' ? 'selected' : ''}>Diproses</option>
                                            <option value="Selesai" ${p.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                                        </select>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <button onclick="deletePengajuan(${p.id})" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg border border-rose-100" title="Hapus Pengajuan">
                                            <i class="fa-regular fa-trash-can text-sm"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')
        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

window.updatePengajuanStatus = async function (id, newStatus) {
    try {
        const { error } = await supabaseClient.from('pengajuan').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        await reloadCache();
        showToast(`Status pengajuan diperbarui.`);
        renderAdmin();
    } catch (err) {
        console.error(err);
        showToast('Gagal memperbarui status: ' + err.message, 'error');
    }
};

window.deletePengajuan = async function (id) {
    if (confirm('Yakin ingin menghapus data pengajuan ini?')) {
        try {
            const { error } = await supabaseClient.from('pengajuan').delete().eq('id', id);
            if (error) throw error;
            await reloadCache();
            showToast('Data pengajuan berhasil dihapus.');
            renderAdmin();
        } catch (err) {
            console.error(err);
            showToast('Gagal menghapus pengajuan: ' + err.message, 'error');
        }
    }
};

// 7. APP INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('featured-umkm-list');
    if (grid) {
        grid.innerHTML = `
            <div class="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-forest-800 mb-3"></div>
                <p class="text-sm text-slate-500">Memuat data dari Supabase...</p>
            </div>
        `;
    }

    await initDatabase();

    window.addEventListener('hashchange', handleRouteChange);

    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (menuBtn && mobileMenu && menuIcon) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                menuIcon.className = 'fa-solid fa-xmark text-xl';
            } else {
                mobileMenu.classList.add('hidden');
                menuIcon.className = 'fa-solid fa-bars text-xl';
            }
        });
    }

    handleRouteChange();
});
