/**
 * SISTEM REKAM MEDIS ELEKTRONIK (RME) - MODUL PASIEN
 * Handles patient registration, patient list, search, filter, detail, edit, and deletion.
 * (NIK dihapus sesuai ketentuan)
 */

const PasienModule = {
  getAllPatients() {
    return getStorage(STORAGE_KEYS.PATIENTS, []);
  },

  getPatientByRM(rm) {
    const list = this.getAllPatients();
    return list.find(p => p.rm === rm) || null;
  },

  registerPatient(formData) {
    const patients = this.getAllPatients();
    
    // Auto-generate RM if not provided
    const rm = formData.rm || getNextPatientRM();
    const age = calculateAge(formData.dob);
    
    const newPatient = {
      rm,
      name: formData.name.trim(),
      gender: formData.gender || 'Laki-laki',
      dob: formData.dob || '',
      age: age || parseInt(formData.age, 10) || 0,
      phone: formData.phone || '',
      address: formData.address || '',
      complaint: formData.complaint || '',
      service: formData.service || 'Pemeriksaan Umum',
      registeredAt: new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      }),
      status: 'Aktif'
    };

    patients.push(newPatient);
    setStorage(STORAGE_KEYS.PATIENTS, patients);

    // Otomatis masukkan ke Antrean (Section 8.3 & 23.1)
    const queueNo = getNextQueueNumber();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newQueue = {
      id: 'Q-' + Date.now().toString().slice(-4),
      queueNumber: queueNo,
      patientRM: newPatient.rm,
      patientName: newPatient.name,
      service: newPatient.service,
      doctor: formData.doctor || 'dr. Budi',
      status: 'Menunggu',
      complaint: newPatient.complaint,
      time: timeStr,
      date: newPatient.registeredAt
    };

    const queues = getStorage(STORAGE_KEYS.QUEUES, []);
    queues.push(newQueue);
    setStorage(STORAGE_KEYS.QUEUES, queues);

    addAuditLog(`Pendaftaran pasien baru: ${newPatient.name} (${newPatient.rm}), Antrean ${queueNo}`, 'Resepsionis', 'emerald');

    return {
      patient: newPatient,
      queue: newQueue
    };
  },

  updatePatient(rm, updatedFields) {
    const patients = this.getAllPatients();
    const index = patients.findIndex(p => p.rm === rm);
    if (index === -1) return false;

    if (updatedFields.dob) {
      updatedFields.age = calculateAge(updatedFields.dob);
    }

    // Pastikan tidak ada NIK tersisa
    delete updatedFields.nik;

    patients[index] = { ...patients[index], ...updatedFields };
    setStorage(STORAGE_KEYS.PATIENTS, patients);
    addAuditLog(`Data pasien ${patients[index].name} (${rm}) diperbarui`, 'Resepsionis', 'blue');
    return true;
  },

  deletePatient(rm) {
    let patients = this.getAllPatients();
    const target = patients.find(p => p.rm === rm);
    if (!target) return false;

    patients = patients.filter(p => p.rm !== rm);
    setStorage(STORAGE_KEYS.PATIENTS, patients);
    addAuditLog(`Pasien ${target.name} (${rm}) dihapus dari sistem`, 'Resepsionis', 'amber');
    return true;
  },

  filterPatients(query = '', genderFilter = 'all', statusFilter = 'all') {
    let list = this.getAllPatients();
    
    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.rm && p.rm.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q))
      );
    }

    if (genderFilter && genderFilter !== 'all') {
      list = list.filter(p => p.gender === genderFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(p => p.status === statusFilter);
    }

    return list;
  }
};
