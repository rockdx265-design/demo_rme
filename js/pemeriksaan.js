/**
 * SISTEM REKAM MEDIS ELEKTRONIK (RME) - MODUL PEMERIKSAAN DOKTER
 * Handles clinical examination records, SOAP documentation, diagnosis, prescriptions, and status completion.
 */

const PemeriksaanModule = {
  getAllExaminations() {
    return getStorage(STORAGE_KEYS.EXAMINATIONS, []);
  },

  getExaminationById(id) {
    const list = this.getAllExaminations();
    return list.find(e => e.id === id) || null;
  },

  getExaminationByQueue(queueNumber) {
    const list = this.getAllExaminations();
    return list.find(e => e.queueNumber === queueNumber) || null;
  },

  getExaminationsByPatientRM(rm) {
    const list = this.getAllExaminations();
    return list.filter(e => e.patientRM === rm);
  },

  saveExamination(examData, isComplete = false) {
    const exams = this.getAllExaminations();
    let examId = examData.id;
    let existingIndex = -1;

    if (examId) {
      existingIndex = exams.findIndex(e => e.id === examId);
    } else if (examData.queueNumber) {
      existingIndex = exams.findIndex(e => e.queueNumber === examData.queueNumber);
    }

    const finalStatus = isComplete ? 'Selesai' : (examData.status || 'Draft');
    const record = {
      id: examId || (existingIndex !== -1 ? exams[existingIndex].id : 'EXAM-' + Date.now().toString().slice(-4)),
      queueNumber: examData.queueNumber || '',
      patientRM: examData.patientRM,
      patientName: examData.patientName,
      age: examData.age || 0,
      gender: examData.gender || '',
      doctor: examData.doctor || 'dr. Budi',
      bp: examData.bp || '120/80',
      temp: examData.temp || '36.5',
      weight: examData.weight || '60',
      height: examData.height || '165',
      complaint: examData.complaint || '',
      diagnosis: examData.diagnosis || '',
      treatment: examData.treatment || '',
      prescription: examData.prescription || '',
      doctorNotes: examData.doctorNotes || '',
      status: finalStatus,
      date: examData.date || new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      }),
      completedAt: isComplete ? new Date().toISOString() : null
    };

    if (existingIndex !== -1) {
      exams[existingIndex] = record;
    } else {
      exams.push(record);
    }

    setStorage(STORAGE_KEYS.EXAMINATIONS, exams);

    // Update queue status
    if (examData.queueNumber) {
      if (isComplete) {
        AntreanModule.completeQueue(examData.queueNumber);
        addAuditLog(`Pemeriksaan antrean ${examData.queueNumber} (${record.patientName}) SELESAI oleh ${record.doctor}`, 'Dokter', 'emerald');
      } else {
        AntreanModule.startExamination(examData.queueNumber);
        addAuditLog(`Hasil pemeriksaan draft disimpan untuk ${record.patientName} (${examData.queueNumber})`, 'Dokter', 'blue');
      }
    }

    return record;
  }
};
