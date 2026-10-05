/**
 * SISTEM REKAM MEDIS ELEKTRONIK (RME) - MODUL ANTREAN
 * Manages queue lifecycles: Menunggu -> Dipanggil -> Sedang Diperiksa -> Selesai
 * Includes audio calling chime and Indonesian text-to-speech announcement.
 */

const AntreanModule = {
  getAllQueues() {
    return getStorage(STORAGE_KEYS.QUEUES, []);
  },

  getQueueById(id) {
    const list = this.getAllQueues();
    return list.find(q => q.id === id || q.queueNumber === id) || null;
  },

  updateQueueStatus(queueId, newStatus) {
    const queues = this.getAllQueues();
    const index = queues.findIndex(q => q.id === queueId || q.queueNumber === queueId);
    if (index === -1) return false;

    const oldStatus = queues[index].status;
    queues[index].status = newStatus;
    setStorage(STORAGE_KEYS.QUEUES, queues);

    addAuditLog(
      `Status antrean ${queues[index].queueNumber} (${queues[index].patientName}) diubah: ${oldStatus} ➔ ${newStatus}`,
      'Sistem',
      newStatus === 'Selesai' ? 'emerald' : 'blue'
    );
    return queues[index];
  },

  callPatient(queueId) {
    const queue = this.updateQueueStatus(queueId, 'Dipanggil');
    if (!queue) return null;

    // Trigger Audio chime and speech synthesis announcement
    this.playCallAnnouncement(queue.queueNumber, queue.patientName, queue.doctor);
    return queue;
  },

  startExamination(queueId) {
    return this.updateQueueStatus(queueId, 'Sedang Diperiksa');
  },

  completeQueue(queueId) {
    return this.updateQueueStatus(queueId, 'Selesai');
  },

  cancelQueue(queueId) {
    let queues = this.getAllQueues();
    const target = queues.find(q => q.id === queueId || q.queueNumber === queueId);
    if (!target) return false;

    queues = queues.filter(q => q.id !== queueId && q.queueNumber !== queueId);
    setStorage(STORAGE_KEYS.QUEUES, queues);
    addAuditLog(`Antrean ${target.queueNumber} (${target.patientName}) dibatalkan`, 'Resepsionis', 'amber');
    return true;
  },

  getActiveDoctorQueue(doctorName = '') {
    const queues = this.getAllQueues();
    // Prioritize 'Sedang Diperiksa', then 'Dipanggil', then 'Menunggu'
    let filtered = queues.filter(q => q.status !== 'Selesai');
    if (doctorName) {
      filtered = filtered.filter(q => !q.doctor || q.doctor.includes(doctorName));
    }

    const inProgress = filtered.find(q => q.status === 'Sedang Diperiksa');
    if (inProgress) return inProgress;

    const called = filtered.find(q => q.status === 'Dipanggil');
    if (called) return called;

    return filtered.find(q => q.status === 'Menunggu') || null;
  },

  playCallAnnouncement(queueNo, patientName, doctorName) {
    // 1. Play pleasant clinic chime using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.3); // E5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.35); // G5
      gain2.gain.setValueAtTime(0.3, now + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.95);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.35);
      osc2.stop(now + 0.95);
    } catch (e) {
      // AudioContext may be blocked or unsupported; silent fallback
    }

    // 2. Browser Speech Synthesis in Indonesian
    if ('speechSynthesis' in window) {
      try {
        const text = `Nomor antrean ${queueNo.replace('-', ' ')}, atas nama ${patientName}, silakan menuju ruang ${doctorName || 'pemeriksaan'}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        // Delay slightly after the chime
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 500);
      } catch (err) {
        // Speech synthesis fallback
      }
    }
  }
};
