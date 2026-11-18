# AulaControl — Sistema de asistencia con arquitectura MVC

Proyecto académico basado en la documentación «Sistema de registro de estudiantes». Desarrollado con **HTML, CSS y JavaScript puro**, sin backend, sin librerías externas y sin instalación.

## Cómo ejecutar

1. Descomprime `AulaControl_MVC.zip`.
2. Abre la carpeta `AulaControl_MVC`.
3. Haz doble clic en `index.html` (Chrome, Edge o Firefox).
4. Se cargarán 12 estudiantes **ficticios** en un navegador sin datos previos.
5. Si ya usaste una versión anterior, entra a **Estudiantes → Cargar estudiantes de prueba**; los existentes se conservan.
6. Registra asistencias por fecha y consulta reportes y alertas desde el menú.

## Estructura del proyecto

```text
AulaControl_MVC/
├── index.html                         # Interfaz: las cuatro pantallas
├── css/
│   └── styles.css                    # Diseño adaptable
├── js/
│   ├── app.js                        # Punto de entrada e inyección de dependencias
│   ├── models/                       # MODELO: entidades y validaciones
│   │   ├── Student.js
│   │   └── AttendanceRecord.js
│   ├── services/                     # MODELO: reglas y acceso a datos
│   │   ├── AttendanceService.js
│   │   └── LocalStorageRepository.js
│   ├── views/
│   │   └── AppView.js                # VISTA: tablas, tarjetas y formularios
│   ├── controllers/
│   │   └── AppController.js          # CONTROLADOR: eventos y acciones
│   └── data/
│       └── demoStudents.js           # Estudiantes ficticios
├── tests/
│   └── pruebas.js                    # Pruebas de lógica (Node.js opcional)
└── README.md
```

## Responsabilidades MVC

- **Modelo (`models/`, `services/`)**: define estudiantes y registros; valida campos, evita código/documento duplicados, aplica un único estado por estudiante y fecha, cuenta faltas y accede a `localStorage`.
- **Vista (`views/`, `index.html`, `css/`)**: presenta formularios, tablas, panel, alertas, estados e historial. No accede a `localStorage`.
- **Controlador (`controllers/`)**: recibe interacciones del usuario y llama al modelo; actualiza la vista y prepara exportación CSV.
- **`app.js`**: conecta dependencias. Los scripts clásicos cargan con `defer` y en orden para permitir abrir `index.html` sin servidor.

## Funcionalidades

| Código | Funcionalidad |
|---|---|
| RF-01 | Registrar código, nombres, apellidos, documento, correo y curso |
| RF-02 | Consultar, buscar, editar y eliminar estudiantes |
| RF-03 | Marcar Asistencia, Retardo o Falla por fecha |
| RF-04 | Corregir sin duplicar una asistencia de la misma fecha |
| RF-05 | Contar estados automáticamente |
| RF-06 | Alertar a partir de tres fallas |
| RF-07 | Filtrar historial por estudiante, fecha o estado |
| RF-08 | Exportar el historial filtrado en CSV |
| RF-09 | Conservar información en el navegador con `localStorage` |

## Prueba sugerida para la exposición

1. Abre **Estudiantes**; revisa los 12 registros.
2. Intenta agregar `EST001` de nuevo: se rechaza el código duplicado.
3. Marca **Falla** a Valentina en tres fechas diferentes.
4. Ve al **Panel general**: aparece alerta de tres fallas.
5. Corrige la primera fecha por **Asistencia**: quedan dos fallas sin duplicaciones.
6. Filtra en **Historial** por **Falla** y pulsa **Exportar CSV**.
7. Cierra y abre el navegador en el mismo perfil; los registros siguen guardados.

## Pruebas automáticas opcionales

Si tienes Node.js instalado, abre una terminal dentro de la carpeta y ejecuta:

```bash
node tests/pruebas.js
```

Se comprueban: datos de ejemplo, validación de duplicados, conteo de fallas, corrección sin duplicación, filtros, persistencia local y eliminación en cascada.

## Persistencia y límites

Se reutilizan las claves `aulacontrol_students_v1` y `aulacontrol_records_v1`, compatibles con versiones previas abiertas en el **mismo origen y perfil de navegador**. La información se guarda localmente; no hay cuentas, servidor, conexión a la nube ni sincronización entre dispositivos. Borrar datos del sitio o usar incógnito puede eliminar la información. No introducir datos personales reales sin autorización.
