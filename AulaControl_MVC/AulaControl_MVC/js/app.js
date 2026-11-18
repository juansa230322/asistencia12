'use strict';
// Punto de entrada: inyección de dependencias entre repositorio, servicio, vista y controlador.
(function(AC) {
  const repository=new AC.LocalStorageRepository();
  const service=new AC.AttendanceService(repository);
  const view=new AC.AppView(service);
  AC.app=new AC.AppController(service,view);
})(AulaControl);
