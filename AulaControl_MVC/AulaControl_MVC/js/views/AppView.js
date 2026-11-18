'use strict';
(function(AC) {
  const $ = id=>document.getElementById(id);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const norm=AC.utils.normalize;
  const fullName=s=>`${s.nombres} ${s.apellidos}`;
  const fmtDate=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value || ''))return value || ''; const [y,m,d]=value.split('-');return `${d}/${m}/${y}`;};
  const statusBadge=state=>`<span class="chip ${state==='Asistencia'?'chip-green':state==='Retardo'?'chip-amber':'chip-red'}">${safe(state)}</span>`;
  const avatar=s=>`<span class="avatar">${safe(((s.nombres[0]||'')+(s.apellidos[0]||'')).toUpperCase())}</span>`;
  const empty=(title,desc,col=7)=>`<tr><td class="empty" colspan="${col}"><div class="empty-icon">▤</div><strong>${safe(title)}</strong><p>${safe(desc)}</p></td></tr>`;
  let service,students=[],records=[];
  const studentById=id=>service.getStudent(id);
  const countByStudent=(id,state)=>service.count(id,state);
  const totals=()=>service.totals();
  const filteredHistory=()=>service.filteredHistory({term:$('history-search').value,fecha:$('history-date').value,estado:$('history-state').value});
function renderDashboard() {
 const t=totals(); $('stat-students').textContent=students.length; $('stat-present').textContent=t.present; $('stat-late').textContent=t.late; $('stat-absent').textContent=t.absent;
 const recent=[...records].sort((a,b)=>b.fecha.localeCompare(a.fecha)||String(b.id).localeCompare(String(a.id))).slice(0,6);
 $('recent-activity').innerHTML=recent.length?recent.map(r=>{const s=studentById(r.estudianteId);return s?`<div class="activity-row">${avatar(s)}<div class="item-main"><strong>${safe(fullName(s))}</strong><small>${fmtDate(r.fecha)} · ${safe(s.curso)}</small></div>${statusBadge(r.estado)}</div>`:'';}).join(''):'<div class="empty"><div class="empty-icon">▤</div><strong>No hay actividad todavía</strong><p>Los registros aparecerán aquí.</p></div>';
 const alerts=students.map(s=>({s,n:countByStudent(s.id,'Falla')})).filter(x=>x.n>=3).sort((a,b)=>b.n-a.n);
 $('dashboard-alerts').innerHTML=alerts.length?alerts.map(({s,n})=>`<div class="alert-row">${avatar(s)}<div class="item-main"><strong>${safe(fullName(s))}</strong><small>${safe(s.curso)} · Requiere seguimiento</small></div><span class="chip chip-red">${n} fallas</span></div>`).join(''):'<div class="empty"><div class="empty-icon">✓</div><strong>Sin alertas por ahora</strong><p>Ningún estudiante acumula 3 o más fallas.</p></div>';
}
function refreshCourseFilters() { const courses=[...new Set(students.map(s=>s.curso))].sort((a,b)=>a.localeCompare(b,'es')); ['student-course-filter','attendance-course'].forEach(id=>{const select=$(id),value=select.value; select.innerHTML='<option value="">Todos los cursos</option>'+courses.map(c=>`<option value="${safe(c)}">${safe(c)}</option>`).join('');select.value=courses.includes(value)?value:'';}); }
function renderStudents() {const term=norm($('student-search').value),course=$('student-course-filter').value;const subset=students.filter(s=>(!course||s.curso===course)&&(!term||[s.codigo,s.documento,s.nombres,s.apellidos,s.correo,s.curso,fullName(s)].some(x=>norm(x).includes(term)))).sort((a,b)=>fullName(a).localeCompare(fullName(b),'es')); $('student-count').textContent=students.length; $('students-body').innerHTML=subset.map(s=>{const faults=countByStudent(s.id,'Falla');return `<tr><td><div class="student-cell">${avatar(s)}<div><strong>${safe(fullName(s))}</strong><small>${safe(s.curso)}</small></div></div></td><td>${safe(s.codigo)}</td><td>${safe(s.documento)}</td><td>${safe(s.correo)}</td><td>${safe(s.curso)}</td><td>${faults>=3?`<span class="chip chip-red">${faults} · Alerta</span>`:faults}</td><td><div class="actions"><button class="action-btn" data-edit="${safe(s.id)}">Editar</button><button class="action-btn danger" data-delete="${safe(s.id)}">Eliminar</button></div></td></tr>`;}).join('')||empty('No hay estudiantes', 'Registra un estudiante o ajusta la búsqueda.'); }
function renderAttendance() { const date=$('attendance-date').value,term=norm($('attendance-search').value),course=$('attendance-course').value; const subset=students.filter(s=>(!course||s.curso===course)&&(!term||[s.codigo,s.nombres,s.apellidos,s.curso,fullName(s)].some(x=>norm(x).includes(term)))).sort((a,b)=>fullName(a).localeCompare(fullName(b),'es')); const day=records.filter(r=>r.fecha===date); $('attendance-progress').textContent=`${day.length} de ${students.length} registrados en la fecha`; $('attendance-body').innerHTML=subset.map(s=>{const record=day.find(r=>r.estudianteId===s.id),faults=countByStudent(s.id,'Falla');return `<tr><td><div class="student-cell">${avatar(s)}<div><strong>${safe(fullName(s))}</strong><small>${safe(s.codigo)}</small></div></div></td><td>${safe(s.curso)}</td>${['Asistencia','Retardo','Falla'].map(state=>`<td><button class="status-btn ${record?.estado===state?'active':''}" data-mark="${safe(s.id)}" data-state="${state}" aria-pressed="${record?.estado===state?'true':'false'}">${state==='Asistencia'?'✓':state==='Retardo'?'◷':'×'} ${state}</button></td>`).join('')}<td>${faults>=3?`<span class="chip chip-red">${faults} fallas</span>`:`${faults} fallas`}</td></tr>`;}).join('')||empty('Sin estudiantes', 'Registra estudiantes o cambia los filtros para tomar asistencia.',6); }
function renderHistory() {const subset=filteredHistory();$('history-count').textContent=`${subset.length} registro${subset.length!==1?'s':''} encontrado${subset.length!==1?'s':''}`;$('history-body').innerHTML=subset.map(r=>{const s=studentById(r.estudianteId);return `<tr><td>${fmtDate(r.fecha)}</td><td><div class="student-cell">${avatar(s)}<strong>${safe(fullName(s))}</strong></div></td><td>${safe(s.codigo)}</td><td>${safe(s.curso)}</td><td>${statusBadge(r.estado)}</td><td><button class="action-btn danger" data-remove-record="${safe(r.id)}">Eliminar</button></td></tr>`;}).join('')||empty('Sin registros', 'No hay asistencias para los filtros seleccionados.',6);}
function renderAll() { refreshCourseFilters();renderDashboard();renderStudents();renderAttendance();renderHistory(); }

  class AppView {
    constructor(svc) { service=svc; }
    renderAll() { students=service.students; records=service.records; renderAll(); }
    renderStudents() { students=service.students;records=service.records;refreshCourseFilters();renderStudents(); }
    renderAttendance() { students=service.students;records=service.records;renderAttendance(); }
    renderHistory() { students=service.students;records=service.records;renderHistory(); }
    navigate(name) { document.querySelectorAll('.view').forEach(node=>node.classList.toggle('active',node.id===`view-${name}`)); document.querySelectorAll('[data-view]').forEach(node=>node.classList.toggle('active',node.dataset.view===name)); $('sidebar').classList.remove('open');this.renderAll(); }
    openStudentModal(student) { $('student-form').reset(); $('student-id').value=student?.id||''; $('modal-title').textContent=student?'Editar estudiante':'Nuevo estudiante'; if(student){ $('student-code').value=student.codigo;$('student-document').value=student.documento;$('student-firstname').value=student.nombres;$('student-lastname').value=student.apellidos;$('student-email').value=student.correo;$('student-course').value=student.curso; } $('student-modal').hidden=false;$('student-code').focus(); }
    closeStudentModal() { $('student-modal').hidden=true; }
    toast(message) {const node=$('toast');node.textContent=message;node.classList.add('show');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>node.classList.remove('show'),3300);}
  }
  AC.AppView=AppView;
})(AulaControl);
