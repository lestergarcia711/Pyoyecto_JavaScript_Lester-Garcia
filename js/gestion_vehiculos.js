// --- CONFIGURACIÓN Y VARIABLES GLOBALES ---
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
});

// --- FUNCIONES DE USUARIO Y PERFIL ---
function cargarDatosUsuario() {
    const datos = localStorage.getItem("usuarioRegistrado");
    if (datos) {
        const usuario = JSON.parse(datos);
        const nombreDisplay = document.getElementById("nombre-usuario-display");
        if (nombreDisplay) {
            nombreDisplay.textContent = usuario.username;
        }
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

    const usuarioActualizado = {
        username: nuevoNombre,
        Email: nuevoEmail,
        password: pass
    };

    localStorage.setItem("usuarioRegistrado", JSON.stringify(usuarioActualizado));
    cargarDatosUsuario();
    alert("Perfil actualizado correctamente.");
    cerrarPerfil();
});

function cerrarSesion() {
    window.location.href = "index.html";
}

// --- NAVEGACIÓN CORREGIDA ---
function mostrarSeccion(e, idSeccion) {
    document.querySelectorAll('.modulo-contenido').forEach(seccion => {
        seccion.style.display = 'none';
    });
    
    const seccionDestino = document.getElementById(idSeccion);
    if (seccionDestino) seccionDestino.style.display = 'block';

    document.querySelectorAll('.enlace-nav').forEach(enlace => {
        enlace.classList.remove('activo');
    });
    
    if (e && e.currentTarget) {
        e.currentTarget.classList.add('activo');
    } else {
        const botonCorrespondiente = document.querySelector(`.enlace-nav[onclick*="${idSeccion}"]`);
        if (botonCorrespondiente) botonCorrespondiente.classList.add('activo');
    }
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

// ESTA FUNCIÓN AHORA MANEJA TANTO EL INGRESO NUEVO COMO LA EDICIÓN
function registrarIngreso() {
    const idEdicion = document.getElementById('reg-id-edicion').value;
    const placa = document.getElementById('reg-placa').value.trim();
    const tipo = document.getElementById('reg-tipo').value;
    const fecha = document.getElementById('reg-fecha').value;
    const hora = document.getElementById('reg-hora').value;
    const espacio = document.getElementById('reg-espacio').value.trim();

    if (placa && espacio && fecha && hora) {
        
        // Validar puesto ocupado (excluyendo el vehículo actual si estamos editando)
        const puestoOcupado = listaRegistrosParqueo.some(reg => reg.espacio === espacio && reg.id.toString() !== idEdicion);
        if (puestoOcupado) {
            alert(`El espacio #${espacio} ya está ocupado.`);
            return;
        }

        if (idEdicion) {
            // --- MODO EDICIÓN ---
            const index = listaRegistrosParqueo.findIndex(reg => reg.id.toString() === idEdicion);
            if (index !== -1) {
                listaRegistrosParqueo[index].placa = placa.toUpperCase();
                listaRegistrosParqueo[index].tipo = tipo;
                listaRegistrosParqueo[index].fechaIngreso = fecha;
                listaRegistrosParqueo[index].horaIngreso = hora;
                listaRegistrosParqueo[index].espacio = espacio;
                // Calculamos de nuevo los milisegundos basados en la fecha modificada
                listaRegistrosParqueo[index].milisegundosEntrada = new Date(`${fecha}T${hora}`).getTime();
                
                alert("Registro actualizado correctamente.");
            }
        } else {
            // --- MODO INGRESO NUEVO ---
            const nuevoRegistro = {
                id: Date.now(),
                placa: placa.toUpperCase(),
                tipo: tipo,
                fechaIngreso: fecha,
                horaIngreso: hora,
                espacio: espacio,
                estado: "En sitio",
                milisegundosEntrada: new Date(`${fecha}T${hora}`).getTime()
            };
            listaRegistrosParqueo.push(nuevoRegistro);
            alert(`Vehículo ${placa} registrado.`);
        }

        // Guardar y resetear UI
        localStorage.setItem('registrosParqueo', JSON.stringify(listaRegistrosParqueo));
        cancelarEdicion(); // Limpia el formulario y reestablece los botones
        renderizarTabla();
    } else {
        alert("Completa todos los campos.");
    }
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

// LÓGICA DE EDICIÓN: EXTRAE LOS DATOS Y PASA AL FORMULARIO
function prepararEdicion(idRegistro) {
    const registro = listaRegistrosParqueo.find(r => r.id === idRegistro);
    if (!registro) return;

    // 1. Mandar los datos de este vehículo al formulario
    document.getElementById('reg-id-edicion').value = registro.id;
    document.getElementById('reg-placa').value = registro.placa;
    document.getElementById('reg-tipo').value = registro.tipo;
    document.getElementById('reg-fecha').value = registro.fechaIngreso;
    document.getElementById('reg-hora').value = registro.horaIngreso;
    document.getElementById('reg-espacio').value = registro.espacio;

    // 2. Modificar la interfaz para avisar que está editando
    document.getElementById('titulo-formulario').textContent = "Editar Vehículo";
    document.getElementById('btn-guardar-registro').textContent = "Actualizar Vehículo";
    document.getElementById('btn-cancelar-edicion').style.display = "block";

    // 3. Mover la pantalla automáticamente a la pestaña del formulario
    mostrarSeccion(null, 'seccion-registro');
}

// RESTABLECE EL FORMULARIO A SU ESTADO NORMAL
function cancelarEdicion() {
    document.getElementById('reg-id-edicion').value = "";
    document.getElementById('formulario-ingreso').reset();
    
    document.getElementById('titulo-formulario').textContent = "Ingreso de Vehículo";
    document.getElementById('btn-guardar-registro').textContent = "Guardar Registro";
    document.getElementById('btn-cancelar-edicion').style.display = "none";
}

// ELIMINAR DIRECTAMENTE SIN HACER COBROS
function eliminarRegistro(idRegistro) {
    const registro = listaRegistrosParqueo.find(r => r.id === idRegistro);
    if (!registro) return;

    if (confirm(`¿Seguro que deseas ELIMINAR el vehículo con placa ${registro.placa}?\nEsto cancelará el registro sin realizar cobros.`)) {
        listaRegistrosParqueo = listaRegistrosParqueo.filter(r => r.id !== idRegistro);
        localStorage.setItem('registrosParqueo', JSON.stringify(listaRegistrosParqueo));
        
        renderizarTabla();
        actualizarResumen();
    }
}

function procesarSalida(idRegistro) {
    // 1. Buscar el vehículo en el arreglo
    const registro = listaRegistrosParqueo.find(r => r.id === idRegistro);
    if (!registro) {
        alert("Error: No se encontró el registro del vehículo.");
        return; 
    }

    // 2. Buscar la tarifa correspondiente al tipo de vehículo
    const tipoVehiculo = listaTiposVehiculos.find(t => t.nombre === registro.tipo);
    if (!tipoVehiculo) {
        alert("Error: No se encontró la tarifa para este tipo de vehículo.");
        return;
    }

    // 3. Cálculos de tiempo exactos
    const ahora = Date.now();
    
    // CORRECCIÓN LÓGICA: Controlamos si la fecha de entrada quedó en el futuro por error
    let diferenciaMs = ahora - registro.milisegundosEntrada;
    if (diferenciaMs < 0) {
        diferenciaMs = 0; // Evitamos que el tiempo y los cobros den números negativos
    }
    
    const minutosTotales = Math.floor(diferenciaMs / (1000 * 60));
    const horasCompletas = Math.floor(minutosTotales / 60);
    const minutosExcedentes = minutosTotales % 60;

    // 4. Aplicación de la Regla de Negocio Justa (10 min de gracia)
    const GRACIA_MINUTOS = 10;
    let horasACobrar = horasCompletas;

    if (horasCompletas === 0) {
        // Cobro mínimo: la primera hora siempre se paga entera
        horasACobrar = 1;
    } else if (minutosExcedentes > GRACIA_MINUTOS) {
        // Solo si se pasa de los 10 minutos de gracia, se cobra la siguiente hora
        horasACobrar++;
    }

    // 5. Cálculo del total a pagar
    const totalAPagar = horasACobrar * tipoVehiculo.tarifa;
    const tiempoEstanciaFormateado = `${horasCompletas}h ${minutosExcedentes}m`;

    // 6. Construcción del mensaje de la factura
    const mensaje = `
    RESUMEN DE SALIDA 
    -----------------------
    Placa: ${registro.placa}
    Tipo: ${registro.tipo}
    Tiempo Exacto: ${tiempoEstanciaFormateado}
    Horas a Cobrar: ${horasACobrar} hr(s) ${minutosExcedentes > 0 && minutosExcedentes <= GRACIA_MINUTOS ? '(Gracia aplicada)' : ''}
    Tarifa: Q${tipoVehiculo.tarifa}/hr
    
    TOTAL A PAGAR: Q${totalAPagar}
`;

    // 7. Confirmación del pago, eliminación y actualización
    if (confirm(mensaje + "\n¿Confirmar pago y registrar salida?")) {
        // Eliminar de la lista en memoria
        listaRegistrosParqueo = listaRegistrosParqueo.filter(r => r.id !== idRegistro);
        // Guardar la lista actualizada en LocalStorage
        localStorage.setItem('registrosParqueo', JSON.stringify(listaRegistrosParqueo));
        
        // Refrescar la interfaz visual
        renderizarTabla();
        actualizarResumen();
    }
}

function actualizarResumen() {
    const contador = document.getElementById('contador-vehiculos');
    if (contador) contador.textContent = listaRegistrosParqueo.length;
}