// --- CONFIGURACIÓN Y VARIABLES GLOBALES ---
const CONFIG = {
    PREFIJOS: {
        "Automovil": "P",
        "Moto": "M",
        "Camioneta": "C",
        "Bicicleta": "B",
        "Camion": "T"
    },
    GRACIA_MINUTOS: 10
};
let listaHistorial = JSON.parse(localStorage.getItem('historialParqueo')) || [];


let listaTiposVehiculos = JSON.parse(localStorage.getItem('tiposVehiculos')) || [
    { codigo: "V-01", nombre: "Automovil", tarifa: 40 },
    { codigo: "V-02", nombre: "Moto", tarifa: 20 },
    { codigo: "V-03", nombre: "Camioneta", tarifa: 50 },
    { codigo: "V-04", nombre: "Bicicleta", tarifa: 10 },
    { codigo: "V-05", nombre: "Camion", tarifa: 60 }
];


let listaRegistrosParqueo = JSON.parse(localStorage.getItem('registrosParqueo')) || [];


// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    actualizarSelectorTipos();
    renderizarTabla();
    actualizarResumen();
    cargarDatosUsuario();
    // Automatización: Fecha y hora por defecto
    const hoy = new Date();
    document.getElementById('reg-fecha').value = hoy.toISOString().split('T')[0];
    document.getElementById('reg-hora').value = hoy.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false });
});


// --- LÓGICA DE VALIDACIÓN (CENTRALIZADA) ---
function validarRegistro(placa, tipo, espacio, idActual, fecha) {
    const placaLimpia = placa.toUpperCase().trim();
    const prefijoEsperado = CONFIG.PREFIJOS[tipo];
    const hoy = new Date().toISOString().split('T')[0];


    // 1. Validar prefijo de placa
    if (prefijoEsperado && !placaLimpia.startsWith(prefijoEsperado)) {
        return { valido: false, mensaje: `La placa de un ${tipo} debe comenzar con '${prefijoEsperado}'.` };
    }


    // 2. Validación de Fecha (No futura/pasada incorrecta)
    if (fecha < hoy) {
        return { valido: false, mensaje: "La fecha de ingreso no puede ser anterior a hoy." };
    }


    // 3. Validación de Espacio Ocupado
    const espacioOcupado = listaRegistrosParqueo.some(reg => reg.espacio === espacio && reg.id.toString() !== idActual.toString());
    if (espacioOcupado) return { valido: false, mensaje: `El espacio #${espacio} ya está ocupado.` };


    // 4. Validación de Duplicidad de Placa
    const placaDuplicada = listaRegistrosParqueo.some(reg => reg.placa === placaLimpia && reg.id.toString() !== idActual.toString());
    if (placaDuplicada) return { valido: false, mensaje: `La placa ${placaLimpia} ya tiene un registro activo.` };


    return { valido: true };
}




// --- FUNCIONES DE USUARIO Y PERFIL ---
function cargarDatosUsuario() {
    const datos = localStorage.getItem("usuarioRegistrado");
    if (datos) {
        const usuario = JSON.parse(datos);
        const nombreDisplay = document.getElementById("nombre-usuario-display");
        if (nombreDisplay) nombreDisplay.textContent = usuario.username;
    }
}


function abrirPerfil() {
    const datos = localStorage.getItem("usuarioRegistrado");
    if (datos) {
        const usuario = JSON.parse(datos);
        document.getElementById('perfil-nombre').value = usuario.username;
        document.getElementById('perfil-email').value = usuario.Email;
        document.getElementById('perfil-password').value = usuario.password;
        document.getElementById('perfil-password-confirm').value = usuario.password;
    }
    document.getElementById('modalPerfil').style.display = 'flex';
}


function cerrarPerfil() {
    document.getElementById('modalPerfil').style.display = 'none';
}


document.getElementById('formPerfil').addEventListener('submit', function(e) {
    e.preventDefault();
    const nuevoNombre = document.getElementById('perfil-nombre').value.trim();
    const nuevoEmail = document.getElementById('perfil-email').value.trim();
    const pass = document.getElementById('perfil-password').value;
    const passConfirm = document.getElementById('perfil-password-confirm').value;


    if (pass !== passConfirm) {
        alert("Las contraseñas no coinciden.");
        return;
    }


    const usuarioActualizado = { username: nuevoNombre, Email: nuevoEmail, password: pass };
    localStorage.setItem("usuarioRegistrado", JSON.stringify(usuarioActualizado));
    cargarDatosUsuario();
    alert("Perfil actualizado correctamente.");
    cerrarPerfil();
});


function cerrarSesion() {
    window.location.href = "index.html";
}


// --- NAVEGACIÓN ---
function mostrarSeccion(e, idSeccion) {
    document.querySelectorAll('.modulo-contenido').forEach(seccion => seccion.style.display = 'none');
    const seccionDestino = document.getElementById(idSeccion);
    if (seccionDestino) seccionDestino.style.display = 'block';
   
    document.querySelectorAll('.enlace-nav').forEach(enlace => enlace.classList.remove('activo'));
    if (e && e.currentTarget) e.currentTarget.classList.add('activo');
}


// --- GESTIÓN DE VEHÍCULOS ---
function actualizarSelectorTipos() {
    const selector = document.getElementById('reg-tipo');
    if (!selector) return;
    selector.innerHTML = "";
    listaTiposVehiculos.forEach(tipo => {
        const opcion = document.createElement('option');
        opcion.value = tipo.nombre;
        opcion.textContent = `${tipo.nombre} (Q${tipo.tarifa}/hr)`;
        selector.appendChild(opcion);
    });
}


function registrarIngreso() {
    const idEdicion = document.getElementById('reg-id-edicion').value;
    const placa = document.getElementById('reg-placa').value.trim();
    const tipo = document.getElementById('reg-tipo').value;
    const fecha = document.getElementById('reg-fecha').value;
    const hora = document.getElementById('reg-hora').value;
    const espacio = document.getElementById('reg-espacio').value.trim();


    // 1. Validación de campos vacíos
    if (!placa || !espacio || !fecha || !hora) {
        alert("Completa todos los campos.");
        return;
    }


    // 2. Validación de lógica de negocio (aquí usamos nuestra nueva función)
    const validacion = validarRegistro(placa, tipo, espacio, idEdicion, fecha);
    if (!validacion.valido) {
        alert(validacion.mensaje);
        return;
    }


    // 3. Guardar o Editar
    if (idEdicion) {
        const index = listaRegistrosParqueo.findIndex(reg => reg.id.toString() === idEdicion);
        if (index !== -1) {
            listaRegistrosParqueo[index] = {
                ...listaRegistrosParqueo[index],
                placa: placa.toUpperCase(),
                tipo,
                fechaIngreso: fecha,
                horaIngreso: hora,
                espacio,
                milisegundosEntrada: new Date(`${fecha}T${hora}`).getTime()
            };
            alert("Registro actualizado correctamente.");
        }
    } else {
        listaRegistrosParqueo.push({
            id: Date.now(),
            placa: placa.toUpperCase(),
            tipo,
            fechaIngreso: fecha,
            horaIngreso: hora,
            espacio,
            estado: "En sitio",
            milisegundosEntrada: new Date(`${fecha}T${hora}`).getTime()
        });
        alert(`Vehículo ${placa} registrado.`);
    }


    localStorage.setItem('registrosParqueo', JSON.stringify(listaRegistrosParqueo));
    cancelarEdicion();
    renderizarTabla();
}


function renderizarTabla() {
    const cuerpoTabla = document.getElementById('tabla-cuerpo');
    if (!cuerpoTabla) return;
    cuerpoTabla.innerHTML = "";


    if (listaRegistrosParqueo.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="7" style="text-align: center;">No hay vehículos.</td></tr>`;
        actualizarResumen();
        return;
    }


    listaRegistrosParqueo.forEach(reg => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td data-label="Placa">${reg.placa}</td>
            <td data-label="Tipo">${reg.tipo}</td>
            <td data-label="Fecha de Ingreso">${reg.fechaIngreso}</td>
            <td data-label="Hora de Ingreso">${reg.horaIngreso}</td>
            <td data-label="Espacio">${reg.espacio}</td>
            <td data-label="Estado"><span class="etiqueta-estado">${reg.estado}</span></td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button onclick="procesarSalida(${reg.id})" class="btn-mini" style="background: var(--verde-neon); color: black; border:none; padding:5px 8px; cursor:pointer; border-radius:3px;">Cobrar</button>
                    <button onclick="prepararEdicion(${reg.id})" class="btn-mini" style="background: #3498db; color: white; border:none; padding:5px 8px; cursor:pointer; border-radius:3px;">Editar</button>
                    <button onclick="eliminarRegistro(${reg.id})" class="btn-mini" style="background: #e74c3c; color: white; border:none; padding:5px 8px; cursor:pointer; border-radius:3px;">Eliminar</button>
                </div>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
    actualizarResumen();
}


// función para renderizar el historial
function renderizarHistorial() {
    const cuerpo = document.getElementById('tabla-historial-cuerpo');
    if (!cuerpo) return;
    cuerpo.innerHTML = "";


    listaHistorial.forEach(reg => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td data-label="Placa">${reg.placa}</td>
            <td data-label="Tipo">${reg.tipo}</td>
            <td data-label="Fecha de Ingreso">${reg.fechaIngreso} ${reg.horaIngreso}</td>
            <td data-label="Fecha de Salida">${reg.fechaSalida}</td>
            <td data-label="Total Pagado">Q${reg.totalPagado}</td>
            <td>
            <div style="display: flex; gap: 5px;">
                <button onclick="eliminarRegistro(${reg.id})" class="btn-mini" style="background: #e74c3c; color: white; border:none; padding:5px 8px; cursor:pointer; border-radius:3px;">Eliminar</button>
            </div>
            </td>
        `;
        cuerpo.appendChild(fila);
    });
    actualizarResumen();
}


function prepararEdicion(idRegistro) {
    const registro = listaRegistrosParqueo.find(r => r.id === idRegistro);
    if (!registro) return;


    document.getElementById('reg-id-edicion').value = registro.id;
    document.getElementById('reg-placa').value = registro.placa;
    document.getElementById('reg-tipo').value = registro.tipo;
    document.getElementById('reg-fecha').value = registro.fechaIngreso;
    document.getElementById('reg-hora').value = registro.horaIngreso;
    document.getElementById('reg-espacio').value = registro.espacio;


    document.getElementById('titulo-formulario').textContent = "Editar Vehículo";
    document.getElementById('btn-guardar-registro').textContent = "Actualizar Vehículo";
    document.getElementById('btn-cancelar-edicion').style.display = "block";


    mostrarSeccion(null, 'seccion-registro');
}


function cancelarEdicion() {
    document.getElementById('reg-id-edicion').value = "";
    document.getElementById('formulario-ingreso').reset();
    document.getElementById('titulo-formulario').textContent = "Ingreso de Vehículo";
    document.getElementById('btn-guardar-registro').textContent = "Guardar Registro";
    document.getElementById('btn-cancelar-edicion').style.display = "none";
}


function eliminarRegistro(idRegistro) {
    const registro = listaRegistrosParqueo.find(r => r.id === idRegistro);
    if (!registro) return;


    if (confirm(`¿Seguro que deseas ELIMINAR el vehículo ${registro.placa}?`)) {
        listaRegistrosParqueo = listaRegistrosParqueo.filter(r => r.id !== idRegistro);
        localStorage.setItem('registrosParqueo', JSON.stringify(listaRegistrosParqueo));
        renderizarTabla();
        renderizarHistorial();
        actualizarResumen();
    }
}


function procesarSalida(idRegistro) {
    const registro = listaRegistrosParqueo.find(r => r.id === idRegistro);
    const tipoVehiculo = listaTiposVehiculos.find(t => t.nombre === registro.tipo);
    if (!registro || !tipoVehiculo) return;


    const ahora = Date.now();
    let diferenciaMs = ahora - registro.milisegundosEntrada;
    if (diferenciaMs < 0) diferenciaMs = 0;


    const minutosTotales = Math.floor(diferenciaMs / (1000 * 60));
    const horasCompletas = Math.floor(minutosTotales / 60);
    const minutosExcedentes = minutosTotales % 60;


    const GRACIA_MINUTOS = 10;
    let horasACobrar = horasCompletas;
    if (horasCompletas === 0) horasACobrar = 1;
    else if (minutosExcedentes > GRACIA_MINUTOS) horasACobrar++;


    const totalAPagar = horasACobrar * tipoVehiculo.tarifa;


    const mensaje = `RESUMEN DE SALIDA\nPlaca: ${registro.placa}\nTiempo: ${horasCompletas}h ${minutosExcedentes}m\nTOTAL A PAGAR: Q${totalAPagar}`;


   // ... dentro de tu función procesarSalida, justo donde confirmas el pago ...


    if (confirm(mensaje + "\n¿Confirmar pago y registrar salida?")) {
       
        // 1. Se crea el registro en el historial
        const registroHistorico = {
            ...registro, // Copiamos todos los datos originales
            fechaSalida: new Date().toLocaleString(), // Guardamos el momento exacto
            totalPagado: totalAPagar // Guardamos cuánto pagó
        };


        // 2. LOgica para guardar en el historial
        listaHistorial.push(registroHistorico);
        localStorage.setItem('historialParqueo', JSON.stringify(listaHistorial));


        // 3. eliminando la lista activa
        listaRegistrosParqueo = listaRegistrosParqueo.filter(r => r.id !== idRegistro);
        localStorage.setItem('registrosParqueo', JSON.stringify(listaRegistrosParqueo));
       
        // 4. Con esto se actualizan las funciones
        renderizarTabla();
        renderizarHistorial();
        actualizarResumen();
    }
}


function actualizarResumen() {
    const contador = document.getElementById('contador-vehiculos');
    if (contador) contador.textContent = listaRegistrosParqueo.length;
}

