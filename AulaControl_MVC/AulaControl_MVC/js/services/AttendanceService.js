'use strict';
(function(AC) {
  class AttendanceService {
    constructor(repository) {
      this.repository=repository;
      this.reload();
      if(repository.isFirstRun()) { this.loadDemoStudents(); }
    }
    reload() {
      const {students,records}=this.repository.load();
      this.students=students;
      this.records=records;
    }
    persist() { this.repository.save(this.students,this.records); }
    getStudent(id) { return this.students.find(s=>s.id===id); }
    count(id,state) { return this.records.filter(r=>r.estudianteId===id && r.estado===state).length; }
    totals() {
      return {present:this.records.filter(r=>r.estado==='Asistencia').length,
              late:this.records.filter(r=>r.estado==='Retardo').length,
              absent:this.records.filter(r=>r.estado==='Falla').length};
    }
    loadDemoStudents() {
      const codes=new Set(this.students.map(s=>AC.utils.normalize(s.codigo)));
      const documents=new Set(this.students.map(s=>AC.utils.normalize(s.documento)));
      let added=0;
      AC.DEMO_STUDENTS.forEach(([codigo,nombres,apellidos,documento,curso],i)=>{
        if(codes.has(AC.utils.normalize(codigo)) || documents.has(AC.utils.normalize(documento))) return;
        this.students.push(new AC.Student({codigo,nombres,apellidos,documento,curso,correo:`alumno${String(i+1).padStart(2,'0')}@example.com`}));
        codes.add(AC.utils.normalize(codigo));documents.add(AC.utils.normalize(documento));added++;
      });
      if(added) this.persist();
      return added;
    }
    saveStudent(data) {
      const student=new AC.Student(data);
      if(this.students.some(s=>s.id!==student.id && AC.utils.normalize(s.codigo)===AC.utils.normalize(student.codigo))) throw new Error('Ya existe un estudiante con ese código.');
      if(this.students.some(s=>s.id!==student.id && AC.utils.normalize(s.documento)===AC.utils.normalize(student.documento))) throw new Error('Ya existe un estudiante con ese documento.');
      const index=this.students.findIndex(s=>s.id===student.id);
      if(data.id && index===-1) throw new Error('El estudiante no existe.');
      if(index>=0) this.students[index]=student; else this.students.push(student);
      this.persist();
      return student;
    }
    deleteStudent(id) {
      this.students=this.students.filter(s=>s.id!==id);
      this.records=this.records.filter(r=>r.estudianteId!==id);
      this.persist();
    }
    mark(id,fecha,estado) {
      if(!this.getStudent(id)) throw new Error('El estudiante no existe.');
      const record=new AC.AttendanceRecord({estudianteId:id,fecha,estado});
      const existing=this.records.find(r=>r.estudianteId===id&&r.fecha===fecha);
      const previous=existing?.estado || null;
      if(existing) existing.estado=estado; else this.records.push(record);
      this.persist();
      return {previous,failures:this.count(id,'Falla')};
    }
    deleteRecord(id) { this.records=this.records.filter(r=>r.id!==id); this.persist(); }
    filteredHistory({term='',fecha='',estado=''}) {
      term=AC.utils.normalize(term);
      return this.records.filter(r=>{
        const s=this.getStudent(r.estudianteId);
        return s&&(!fecha||fecha===r.fecha)&&(!estado||estado===r.estado)&&
          (!term||[s.codigo,s.nombres,s.apellidos,s.curso,s.documento,s.correo,`${s.nombres} ${s.apellidos}`].some(v=>AC.utils.normalize(v).includes(term)));
      }).sort((a,b)=>b.fecha.localeCompare(a.fecha)||String(b.id).localeCompare(String(a.id)));
    }
  }
  AC.AttendanceService=AttendanceService;
})(AulaControl);
