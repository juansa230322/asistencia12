'use strict';
(function (AC) {
  const trim = value => String(value ?? '').trim();
  const normalize = value => trim(value).toLocaleLowerCase('es');
  const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  class Student {
    constructor({id = makeId(), codigo, nombres, apellidos, documento, correo, curso}) {
      this.id = id;
      this.codigo = trim(codigo);
      this.nombres = trim(nombres);
      this.apellidos = trim(apellidos);
      this.documento = trim(documento);
      this.correo = trim(correo);
      this.curso = trim(curso);
      if ([this.codigo,this.nombres,this.apellidos,this.documento,this.correo,this.curso].some(x=>!x))
        throw new Error('Debes completar todos los campos.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo)) throw new Error('Ingresa un correo válido.');
    }
    get fullName() { return `${this.nombres} ${this.apellidos}`; }
  }
  AC.Student = Student;
  AC.utils = {trim, normalize, makeId};
})(AulaControl);
