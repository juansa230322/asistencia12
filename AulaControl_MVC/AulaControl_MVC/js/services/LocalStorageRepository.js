'use strict';
(function(AC) {
  class LocalStorageRepository {
    // Claves compatibles con el proyecto anterior: conserva los registros existentes.
    static STUDENTS_KEY = 'aulacontrol_students_v1';
    static RECORDS_KEY = 'aulacontrol_records_v1';
    static INITIALIZED_KEY = 'aulacontrol_initialized_v1';
    read(key) {
      try { const raw=localStorage.getItem(key); const data=JSON.parse(raw || '[]'); return Array.isArray(data)?data:[]; }
      catch { return []; }
    }
    load() { return {students:this.read(LocalStorageRepository.STUDENTS_KEY), records:this.read(LocalStorageRepository.RECORDS_KEY)}; }
    save(students, records) {
      // La persistencia es local, como establece el alcance del prototipo académico.
      localStorage.setItem(LocalStorageRepository.STUDENTS_KEY,JSON.stringify(students));
      localStorage.setItem(LocalStorageRepository.RECORDS_KEY,JSON.stringify(records));
      localStorage.setItem(LocalStorageRepository.INITIALIZED_KEY,'true');
    }
    isFirstRun() { return localStorage.getItem(LocalStorageRepository.STUDENTS_KEY) === null && localStorage.getItem(LocalStorageRepository.INITIALIZED_KEY) === null; }
  }
  AC.LocalStorageRepository = LocalStorageRepository;
})(AulaControl);
