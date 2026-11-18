'use strict';
(function(AC) {
  const $=id=>document.getElementById(id);
  const todayLocal=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  class AppController {
    constructor(service,view) {this.service=service;this.view=view;this.bind();this.view.renderAll();}
    execute(action) {try {return action();}catch(error){console.error(error);this.view.toast(error.message || 'No se pudo guardar. Revisa el almacenamiento local.');}}
    bind() {
      $('attendance-date').value=todayLocal();
      document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>this.view.navigate(button.dataset.view)));
      document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>this.view.navigate(button.dataset.go)));
      $('menu-toggle').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
      $('new-student').addEventListener('click',()=>this.view.openStudentModal(null));
      $('load-demo').addEventListener('click',()=>this.execute(()=>{const count=this.service.loadDemoStudents();this.view.renderAll();this.view.toast(count?`${count} estudiantes ficticios agregados.`:'Los 12 estudiantes de prueba ya están registrados.');}));
      $('close-modal').addEventListener('click',()=>this.view.closeStudentModal());
      $('cancel-modal').addEventListener('click',()=>this.view.closeStudentModal());
      $('student-modal').addEventListener('click',event=>{if(event.target===$('student-modal'))this.view.closeStudentModal();});
      document.addEventListener('keydown',event=>{if(event.key==='Escape')this.view.closeStudentModal();});
      $('student-form').addEventListener('submit',event=>{event.preventDefault();this.saveStudent();});
      $('students-body').addEventListener('click',event=>{
        const edit=event.target.closest('[data-edit]'),del=event.target.closest('[data-delete]');
        if(edit)this.view.openStudentModal(this.service.getStudent(edit.dataset.edit));
        if(del)this.deleteStudent(del.dataset.delete);
      });
      $('attendance-body').addEventListener('click',event=>{const button=event.target.closest('[data-mark]');if(button)this.markAttendance(button.dataset.mark,button.dataset.state);});
      $('history-body').addEventListener('click',event=>{const button=event.target.closest('[data-remove-record]');if(button)this.deleteRecord(button.dataset.removeRecord);});
      ['student-search','attendance-search','history-search'].forEach(id=>$(id).addEventListener('input',()=>({'student-search':()=>this.view.renderStudents(),'attendance-search':()=>this.view.renderAttendance(),'history-search':()=>this.view.renderHistory()}[id])()));
      $('student-course-filter').addEventListener('change',()=>this.view.renderStudents());
      $('attendance-course').addEventListener('change',()=>this.view.renderAttendance());
      $('attendance-date').addEventListener('change',()=>this.view.renderAttendance());
      $('history-date').addEventListener('change',()=>this.view.renderHistory());
      $('history-state').addEventListener('change',()=>this.view.renderHistory());
      $('clear-history-filters').addEventListener('click',()=>{$('history-search').value='';$('history-date').value='';$('history-state').value='';this.view.renderHistory();});
      $('export-csv').addEventListener('click',()=>this.exportCSV());
      window.addEventListener('storage',event=>{if([AC.LocalStorageRepository.STUDENTS_KEY,AC.LocalStorageRepository.RECORDS_KEY].includes(event.key)){this.service.reload();this.view.renderAll();}});
    }
    saveStudent() {this.execute(()=>{
      const id=$('student-id').value;
      const student=this.service.saveStudent({...(id?{id}:{}),codigo:$('student-code').value, documento:$('student-document').value,nombres:$('student-firstname').value,apellidos:$('student-lastname').value,correo:$('student-email').value,curso:$('student-course').value});
      this.view.closeStudentModal();this.view.renderAll();this.view.toast(id?'Estudiante actualizado correctamente.':'Estudiante registrado correctamente.');
    });}
    deleteStudent(id) {const student=this.service.getStudent(id);if(!student)return;
      const associated=this.service.records.filter(r=>r.estudianteId===id).length;
      if(!confirm(`¿Eliminar a ${student.nombres} ${student.apellidos}?\nTambién se eliminarán ${associated} registros de asistencia.`))return;
      this.execute(()=>{this.service.deleteStudent(id);this.view.renderAll();this.view.toast('Estudiante y asistencias eliminados.');});
    }
    markAttendance(id,state) {this.execute(()=>{
      const student=this.service.getStudent(id),date=$('attendance-date').value;
      const result=this.service.mark(id,date,state);
      this.view.renderAll();
      if(state==='Falla' && result.previous!=='Falla' && result.failures>=3) this.view.toast(`⚠ Alerta: ${student.nombres} ${student.apellidos} acumula ${result.failures} fallas.`);
      else this.view.toast(result.previous===state?'Estado ya registrado.':`Se ${result.previous?'corrigió':'registró'} ${state.toLowerCase()}.`);
    });}
    deleteRecord(id) {if(!confirm('¿Eliminar este registro de asistencia?'))return;this.execute(()=>{this.service.deleteRecord(id);this.view.renderAll();this.view.toast('Registro eliminado.');});}
    exportCSV() {
      const subset=this.service.filteredHistory({term:$('history-search').value,fecha:$('history-date').value,estado:$('history-state').value});
      if(!subset.length){this.view.toast('No hay registros para exportar.');return;}
      const rows=[['Fecha','Código','Nombres','Apellidos','Documento','Correo','Curso','Estado'],...subset.map(r=>{const s=this.service.getStudent(r.estudianteId);return [r.fecha,s.codigo,s.nombres,s.apellidos,s.documento,s.correo,s.curso,r.estado];})];
      const csv='\uFEFF'+rows.map(row=>row.map(value=>{let text=String(value??'');if(/^[\s]*[=+@\-]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';}).join(';')).join('\r\n');
      const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
      const link=document.createElement('a');link.href=url;link.download=`AulaControl_historial_${todayLocal()}.csv`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
      this.view.toast(`Reporte exportado: ${subset.length} registros.`);
    }
  }
  AC.AppController=AppController;
})(AulaControl);
