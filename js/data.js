/**
 * SISTEM REKAM MEDIS ELEKTRONIK (RME) - DATA LAYER
 * Handles LocalStorage persistence, default dummy seeding, and formatting utilities.
 * (NIK dihapus sesuai permintaan, ditambahkan manajemen dokter & resepsionis)
 */

const STORAGE_KEYS = {
  USERS: 'rme_users',
  DOCTORS: 'rme_doctors',
  RECEPTIONISTS: 'rme_receptionists',
  PATIENTS: 'rme_patients',
  QUEUES: 'rme_queues',
  EXAMINATIONS: 'rme_examinations',
  TRANSACTIONS: 'rme_transactions',
  CURRENT_USER: 'rme_current_user',
  AUDIT_LOGS: 'rme_audit_logs',
  SETTINGS: 'rme_settings'
};

// 1. Initial Dummy Data Configuration
const INITIAL_DOCTORS = [
  {
    id: 'D-001',
    name: 'dr. Budi',
    fullName: 'dr. Budi Santoso, Sp.PD',
    specialty: 'Poli Penyakit Dalam / Umum',
    sip: '446/SIP/2022',
    phone: '081234567801',
    username: 'dokter',
    status: 'Aktif'
  },
  {
    id: 'D-002',
    name: 'dr. Andi',
    fullName: 'dr. Andi Wijaya, Sp.A',
    specialty: 'Poli Anak & Tumbuh Kembang',
    sip: '447/SIP/2021',
    phone: '081234567802',
    username: 'dr_andi',
    status: 'Aktif'
  }
];

const INITIAL_RECEPTIONISTS = [
  {
    id: 'R-001',
    name: 'Siti Rahayu',
    username: 'resepsionis',
    phone: '081398765401',
    shift: 'Pagi (08:00 - 15:00)',
    status: 'Aktif'
  }
];

const INITIAL_USERS = [
  {
    username: 'owner',
    password: 'owner123',
    role: 'owner',
    name: 'Hendra Gunawan',
    title: 'Owner / Pimpinan Klinik'
  },
  {
    username: 'resepsionis',
    password: 'resepsionis123',
    role: 'resepsionis',
    name: 'Siti Rahayu',
    title: 'Resepsionis & Front Desk'
  },
  {
    username: 'dokter',
    password: 'dokter123',
    role: 'dokter',
    name: 'dr. Budi',
    fullName: 'dr. Budi Santoso, Sp.PD',
    title: 'Dokter Pemeriksa'
  },
  {
    username: 'dr_andi',
    password: 'dokter123',
    role: 'dokter',
    name: 'dr. Andi',
    fullName: 'dr. Andi Wijaya, Sp.A',
    title: 'Dokter Spesialis Anak'
  }
];

// Data Pasien Dummy (TANPA NIK)
const INITIAL_PATIENTS = [
  {
    rm: 'RM-0001',
    name: 'Ahmad Fauzi',
    gender: 'Laki-laki',
    dob: '2001-04-12',
    age: 25,
    phone: '081234567890',
    address: 'Jl. Melati No. 12 Jakarta',
    complaint: 'Demam dan sakit kepala',
    service: 'Pemeriksaan Umum',
    registeredAt: '05/10/2026',
    status: 'Aktif'
  },
  {
    rm: 'RM-0002',
    name: 'Siti Rahma',
    gender: 'Perempuan',
    dob: '1996-08-20',
    age: 30,
    phone: '081298765432',
    address: 'Jl. Mawar No. 45 Jakarta',
    complaint: 'Batuk dan flu berkepanjangan',
    service: 'Pemeriksaan Umum',
    registeredAt: '05/10/2026',
    status: 'Aktif'
  },
  {
    rm: 'RM-0003',
    name: 'Budi Santoso',
    gender: 'Laki-laki',
    dob: '1984-01-15',
    age: 42,
    phone: '081311223344',
    address: 'Jl. Kenanga No. 8 Jakarta',
    complaint: 'Nyeri sendi lutut kanan',
    service: 'Pemeriksaan Umum',
    registeredAt: '05/10/2026',
    status: 'Aktif'
  },
  {
    rm: 'RM-0004',
    name: 'Rizky Maulana',
    gender: 'Laki-laki',
    dob: '2007-11-03',
    age: 19,
    phone: '081577889900',
    address: 'Jl. Anggrek No. 19 Jakarta',
    complaint: 'Alergi kulit gatal-gatal',
    service: 'Pemeriksaan Umum',
    registeredAt: '05/10/2026',
    status: 'Aktif'
  },
  {
    rm: 'RM-0005',
    name: 'Nur Aisyah',
    gender: 'Perempuan',
    dob: '1991-06-25',
    age: 35,
    phone: '081644556677',
    address: 'Jl. Cempaka No. 3 Jakarta',
    complaint: 'Sakit maag kronis / nyeri lambung',
    service: 'Pemeriksaan Umum',
    registeredAt: '05/10/2026',
    status: 'Aktif'
  }
];

const INITIAL_QUEUES = [
  {
    id: 'Q-001',
    queueNumber: 'A-001',
    patientRM: 'RM-0001',
    patientName: 'Ahmad Fauzi',
    service: 'Pemeriksaan Umum',
    doctor: 'dr. Budi',
    status: 'Selesai',
    complaint: 'Demam dan sakit kepala',
    time: '08:30',
    date: '05/10/2026'
  },
  {
    id: 'Q-002',
    queueNumber: 'A-002',
    patientRM: 'RM-0002',
    patientName: 'Siti Rahma',
    service: 'Pemeriksaan Umum',
    doctor: 'dr. Budi',
    status: 'Selesai',
    complaint: 'Batuk dan flu berkepanjangan',
    time: '09:15',
    date: '05/10/2026'
  },
  {
    id: 'Q-003',
    queueNumber: 'A-003',
    patientRM: 'RM-0003',
    patientName: 'Budi Santoso',
    service: 'Pemeriksaan Umum',
    doctor: 'dr. Andi',
    status: 'Selesai',
    complaint: 'Nyeri sendi lutut kanan',
    time: '10:00',
    date: '05/10/2026'
  },
  {
    id: 'Q-004',
    queueNumber: 'A-004',
    patientRM: 'RM-0004',
    patientName: 'Rizky Maulana',
    service: 'Pemeriksaan Umum',
    doctor: 'dr. Budi',
    status: 'Dipanggil',
    complaint: 'Alergi kulit gatal-gatal',
    time: '10:45',
    date: '05/10/2026'
  },
  {
    id: 'Q-005',
    queueNumber: 'A-005',
    patientRM: 'RM-0005',
    patientName: 'Nur Aisyah',
    service: 'Pemeriksaan Umum',
    doctor: 'dr. Budi',
    status: 'Menunggu',
    complaint: 'Sakit maag kronis / nyeri lambung',
    time: '11:15',
    date: '05/10/2026'
  }
];

const INITIAL_EXAMINATIONS = [
  {
    id: 'EXAM-001',
    queueNumber: 'A-001',
    patientRM: 'RM-0001',
    patientName: 'Ahmad Fauzi',
    age: 25,
    gender: 'Laki-laki',
    doctor: 'dr. Budi',
    bp: '120/80',
    temp: '38.2',
    weight: '68',
    height: '172',
    complaint: 'Demam dan sakit kepala sejak 2 hari yang lalu',
    diagnosis: 'Febris Pro Evaluasi e.c Viral Infection (A08.4)',
    treatment: 'Edukasi tirah baring & Terapi Antipiretik oral',
    prescription: 'Paracetamol 500mg (3x1 sesudah makan)\nVitamin C 500mg (1x1)',
    doctorNotes: 'Banyak minum air hangat, istirahat minimal 3 hari. Kontrol jika demam > 3 hari.',
    status: 'Selesai',
    date: '05/10/2026'
  },
  {
    id: 'EXAM-002',
    queueNumber: 'A-002',
    patientRM: 'RM-0002',
    age: 30,
    gender: 'Perempuan',
    patientName: 'Siti Rahma',
    doctor: 'dr. Budi',
    bp: '110/70',
    temp: '36.8',
    weight: '55',
    height: '160',
    complaint: 'Batuk berdahak disertai pilek dan hidung tersumbat',
    diagnosis: 'Infeksi Saluran Pernapasan Akut / ISPA (J06.9)',
    treatment: 'Inhalasi uap hangat & Pembersihan sekret',
    prescription: 'Ambroxol tab 30mg (3x1 sesudah makan)\nCetirizine 10mg (1x1 malam)',
    doctorNotes: 'Hindari es dan makanan berminyak. Minum air putih hangat.',
    status: 'Selesai',
    date: '05/10/2026'
  },
  {
    id: 'EXAM-003',
    queueNumber: 'A-003',
    patientRM: 'RM-0003',
    age: 42,
    gender: 'Laki-laki',
    patientName: 'Budi Santoso',
    doctor: 'dr. Andi',
    bp: '130/85',
    temp: '36.6',
    weight: '75',
    height: '168',
    complaint: 'Nyeri pada persendian lutut kanan terasa kaku pagi hari',
    diagnosis: 'Osteoarthritis Genu Dextra (M17.0)',
    treatment: 'Edukasi fisioterapi mandiri & Kompres hangat',
    prescription: 'Meloxicam tab 15mg (1x1 sesudah makan)\nGlucosamine 500mg (2x1)',
    doctorNotes: 'Batasi naik turun tangga dan angkat beban berat.',
    status: 'Selesai',
    date: '05/10/2026'
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'TRX-001',
    patientRM: 'RM-0001',
    patientName: 'Ahmad Fauzi',
    service: 'Pemeriksaan Umum',
    doctor: 'dr. Budi',
    examFee: 100000,
    actionFee: 0,
    otherFee: 0,
    total: 100000,
    paymentMethod: 'Tunai',
    status: 'Lunas',
    date: '05/10/2026',
    receptionist: 'Resepsionis'
  },
  {
    id: 'TRX-002',
    patientRM: 'RM-0002',
    patientName: 'Siti Rahma',
    service: 'Pemeriksaan Umum',
    doctor: 'dr. Budi',
    examFee: 100000,
    actionFee: 50000,
    otherFee: 0,
    total: 150000,
    paymentMethod: 'Tunai',
    status: 'Lunas',
    date: '05/10/2026',
    receptionist: 'Resepsionis'
  },
  {
    id: 'TRX-003',
    patientRM: 'RM-0003',
    patientName: 'Budi Santoso',
    service: 'Pemeriksaan Umum',
    doctor: 'dr. Andi',
    examFee: 100000,
    actionFee: 0,
    otherFee: 0,
    total: 100000,
    paymentMethod: 'Tunai',
    status: 'Belum Lunas',
    date: '05/10/2026',
    receptionist: 'Resepsionis'
  }
];

const INITIAL_HISTORICAL_REVENUE = [
  { date: '29/09', label: '29 Sep', revenue: 850000, patients: 12 },
  { date: '30/09', label: '30 Sep', revenue: 950000, patients: 14 },
  { date: '01/10', label: '01 Okt', revenue: 1100000, patients: 16 },
  { date: '02/10', label: '02 Okt', revenue: 1050000, patients: 15 },
  { date: '03/10', label: '03 Okt', revenue: 1300000, patients: 19 },
  { date: '04/10', label: '04 Okt', revenue: 1150000, patients: 17 },
  { date: '05/10', label: 'Hari Ini', revenue: 1250000, patients: 18 }
];

const INITIAL_AUDIT_LOGS = [
  { time: '11:15', text: 'Pasien baru Nur Aisyah terdaftar dengan antrean A-005', role: 'Resepsionis', type: 'blue' },
  { time: '10:45', text: 'dr. Budi memanggil antrean A-004 (Rizky Maulana)', role: 'Dokter', type: 'emerald' },
  { time: '10:15', text: 'Transaksi TRX-003 diterbitkan untuk Budi Santoso (Belum Lunas)', role: 'Resepsionis', type: 'amber' },
  { time: '09:30', text: 'Pembayaran TRX-002 Siti Rahma berhasil dicatat Tunai Rp150.000 (Lunas)', role: 'Resepsionis', type: 'emerald' },
  { time: '08:45', text: 'Pembayaran TRX-001 Ahmad Fauzi berhasil dicatat Tunai Rp100.000 (Lunas)', role: 'Resepsionis', type: 'emerald' }
];

// 2. LocalStorage Helpers
function getStorage(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// 3. System Initialization
function initDefaultData(forceReset = false) {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
    setStorage(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.RECEPTIONISTS)) {
    setStorage(STORAGE_KEYS.RECEPTIONISTS, INITIAL_RECEPTIONISTS);
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    // Pastikan data pasien tidak mengandung NIK
    const cleanPatients = INITIAL_PATIENTS.map(p => {
      const { nik, ...rest } = p;
      return rest;
    });
    setStorage(STORAGE_KEYS.PATIENTS, cleanPatients);
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.QUEUES)) {
    setStorage(STORAGE_KEYS.QUEUES, INITIAL_QUEUES);
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.EXAMINATIONS)) {
    setStorage(STORAGE_KEYS.EXAMINATIONS, INITIAL_EXAMINATIONS);
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    setStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    setStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
}

// 4. Formatting Utilities
function formatRupiah(number) {
  const num = Number(number) || 0;
  return 'Rp' + num.toLocaleString('id-ID');
}

function parseRupiah(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = val.toString().replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

function calculateAge(dobString) {
  if (!dobString) return 0;
  const today = new Date();
  const birth = new Date(dobString);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
}

function getNextPatientRM() {
  const patients = getStorage(STORAGE_KEYS.PATIENTS, []);
  if (patients.length === 0) return 'RM-0001';
  
  const numbers = patients
    .map(p => {
      const match = (p.rm || '').match(/RM-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
    
  const max = Math.max(0, ...numbers);
  return 'RM-' + String(max + 1).padStart(4, '0');
}

function getNextQueueNumber() {
  const queues = getStorage(STORAGE_KEYS.QUEUES, []);
  if (queues.length === 0) return 'A-001';
  
  const numbers = queues
    .map(q => {
      const match = (q.queueNumber || '').match(/A-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
    
  const max = Math.max(0, ...numbers);
  return 'A-' + String(max + 1).padStart(3, '0');
}

function getNextTransactionID() {
  const trxs = getStorage(STORAGE_KEYS.TRANSACTIONS, []);
  if (trxs.length === 0) return 'TRX-001';
  
  const numbers = trxs
    .map(t => {
      const match = (t.id || '').match(/TRX-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
    
  const max = Math.max(0, ...numbers);
  return 'TRX-' + String(max + 1).padStart(3, '0');
}

function getNextDoctorID() {
  const docs = getStorage(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  if (docs.length === 0) return 'D-001';
  const numbers = docs
    .map(d => {
      const match = (d.id || '').match(/D-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const max = Math.max(0, ...numbers);
  return 'D-' + String(max + 1).padStart(3, '0');
}

function getNextReceptionistID() {
  const recs = getStorage(STORAGE_KEYS.RECEPTIONISTS, INITIAL_RECEPTIONISTS);
  if (recs.length === 0) return 'R-001';
  const numbers = recs
    .map(r => {
      const match = (r.id || '').match(/R-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const max = Math.max(0, ...numbers);
  return 'R-' + String(max + 1).padStart(3, '0');
}

// 5. User Management Data Layer (Dokter & Resepsionis)
const UserManagement = {
  // --- DOCTOR MANAGEMENT ---
  getDoctors() {
    return getStorage(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  },

  getDoctorById(id) {
    const docs = this.getDoctors();
    return docs.find(d => d.id === id) || null;
  },

  createDoctor(data) {
    const docs = this.getDoctors();
    const id = data.id || getNextDoctorID();
    const newDoc = {
      id,
      name: data.name.trim(),
      fullName: data.fullName ? data.fullName.trim() : data.name.trim(),
      specialty: data.specialty || 'Poli Umum',
      sip: data.sip || '448/SIP/2026',
      phone: data.phone || '',
      username: data.username ? data.username.toLowerCase().trim() : ('dr_' + data.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()),
      status: data.status || 'Aktif'
    };
    docs.push(newDoc);
    setStorage(STORAGE_KEYS.DOCTORS, docs);

    // Sync into users table so the doctor can log in
    const users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (!users.find(u => u.username === newDoc.username)) {
      users.push({
        username: newDoc.username,
        password: data.password || 'dokter123',
        role: 'dokter',
        name: newDoc.name,
        fullName: newDoc.fullName,
        title: 'Dokter ' + newDoc.specialty
      });
      setStorage(STORAGE_KEYS.USERS, users);
    }

    addAuditLog(`Owner menambahkan dokter baru: ${newDoc.fullName} (${newDoc.id})`, 'Owner', 'emerald');
    return newDoc;
  },

  updateDoctor(id, data) {
    const docs = this.getDoctors();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return false;

    const old = docs[index];
    docs[index] = {
      ...old,
      name: data.name ? data.name.trim() : old.name,
      fullName: data.fullName ? data.fullName.trim() : (data.name ? data.name.trim() : old.fullName),
      specialty: data.specialty !== undefined ? data.specialty : old.specialty,
      sip: data.sip !== undefined ? data.sip : old.sip,
      phone: data.phone !== undefined ? data.phone : old.phone,
      status: data.status !== undefined ? data.status : old.status
    };
    setStorage(STORAGE_KEYS.DOCTORS, docs);

    // Sync with users table
    const users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const uIndex = users.findIndex(u => u.username === old.username);
    if (uIndex !== -1) {
      users[uIndex].name = docs[index].name;
      users[uIndex].fullName = docs[index].fullName;
      if (data.password) {
        users[uIndex].password = data.password;
      }
      setStorage(STORAGE_KEYS.USERS, users);
    }

    addAuditLog(`Owner memperbarui data dokter ${docs[index].fullName} (${id})`, 'Owner', 'blue');
    return docs[index];
  },

  deleteDoctor(id) {
    let docs = this.getDoctors();
    const target = docs.find(d => d.id === id);
    if (!target) return false;

    docs = docs.filter(d => d.id !== id);
    setStorage(STORAGE_KEYS.DOCTORS, docs);

    // Remove from users if not default 'dokter'
    if (target.username !== 'dokter') {
      let users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
      users = users.filter(u => u.username !== target.username);
      setStorage(STORAGE_KEYS.USERS, users);
    }

    addAuditLog(`Owner menghapus data dokter ${target.fullName} (${id})`, 'Owner', 'amber');
    return true;
  },

  // --- RECEPTIONIST MANAGEMENT ---
  getReceptionists() {
    return getStorage(STORAGE_KEYS.RECEPTIONISTS, INITIAL_RECEPTIONISTS);
  },

  getReceptionistById(id) {
    const recs = this.getReceptionists();
    return recs.find(r => r.id === id) || null;
  },

  createReceptionist(data) {
    const recs = this.getReceptionists();
    const id = data.id || getNextReceptionistID();
    const newRec = {
      id,
      name: data.name.trim(),
      username: data.username ? data.username.toLowerCase().trim() : ('staff_' + data.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()),
      phone: data.phone || '',
      shift: data.shift || 'Pagi (08:00 - 15:00)',
      status: data.status || 'Aktif'
    };
    recs.push(newRec);
    setStorage(STORAGE_KEYS.RECEPTIONISTS, recs);

    // Sync into users table
    const users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (!users.find(u => u.username === newRec.username)) {
      users.push({
        username: newRec.username,
        password: data.password || 'resepsionis123',
        role: 'resepsionis',
        name: newRec.name,
        title: 'Resepsionis & Kasir'
      });
      setStorage(STORAGE_KEYS.USERS, users);
    }

    addAuditLog(`Owner menambahkan resepsionis baru: ${newRec.name} (${newRec.id})`, 'Owner', 'emerald');
    return newRec;
  },

  updateReceptionist(id, data) {
    const recs = this.getReceptionists();
    const index = recs.findIndex(r => r.id === id);
    if (index === -1) return false;

    const old = recs[index];
    recs[index] = {
      ...old,
      name: data.name ? data.name.trim() : old.name,
      phone: data.phone !== undefined ? data.phone : old.phone,
      shift: data.shift !== undefined ? data.shift : old.shift,
      status: data.status !== undefined ? data.status : old.status
    };
    setStorage(STORAGE_KEYS.RECEPTIONISTS, recs);

    // Sync with users table
    const users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const uIndex = users.findIndex(u => u.username === old.username);
    if (uIndex !== -1) {
      users[uIndex].name = recs[index].name;
      if (data.password) {
        users[uIndex].password = data.password;
      }
      setStorage(STORAGE_KEYS.USERS, users);
    }

    addAuditLog(`Owner memperbarui data resepsionis ${recs[index].name} (${id})`, 'Owner', 'blue');
    return recs[index];
  },

  deleteReceptionist(id) {
    let recs = this.getReceptionists();
    const target = recs.find(r => r.id === id);
    if (!target) return false;

    recs = recs.filter(r => r.id !== id);
    setStorage(STORAGE_KEYS.RECEPTIONISTS, recs);

    // Remove from users if not default 'resepsionis'
    if (target.username !== 'resepsionis') {
      let users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
      users = users.filter(u => u.username !== target.username);
      setStorage(STORAGE_KEYS.USERS, users);
    }

    addAuditLog(`Owner menghapus data resepsionis ${target.name} (${id})`, 'Owner', 'amber');
    return true;
  }
};

function addAuditLog(text, role = 'Sistem', type = 'emerald') {
  const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, []);
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  
  logs.unshift({
    time: `${hours}:${mins}`,
    text,
    role,
    type
  });
  
  if (logs.length > 30) logs.pop();
  setStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
}

// Pastikan data awal diinisialisasi
initDefaultData();
