'use strict';
(function(AC) {
  class AttendanceRecord {
    static STATES = Object.freeze(['Asistencia','Retardo','Falla']);
    constructor({id=AC.utils.makeId(), estudianteId, fecha, estado}) {
      if (!estudianteId) throw new Error('Estudiante inválido.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(new Date(`${fecha}T12:00:00`).getTime()) || new Date(`${fecha}T12:00:00`).toLocaleDateString('en-CA') === 'invalid')
        throw new Error('Selecciona una fecha válida.');
      const [year, month, day] = fecha.split('-').map(Number);
      const parsed = new Date(year, month-1, day);
      if (parsed.getFullYear()!==year || parsed.getMonth()!==month-1 || parsed.getDate()!==day) throw new Error('Selecciona una fecha válida.');
      if (!AttendanceRecord.STATES.includes(estado)) throw new Error('Estado inválido.');
      Object.assign(this, {id, estudianteId, fecha, estado});
    }
  }
  AC.AttendanceRecord = AttendanceRecord;
})(AulaControl);
