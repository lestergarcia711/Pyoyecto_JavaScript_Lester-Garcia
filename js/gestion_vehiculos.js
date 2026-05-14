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
});

// --- FUNCIONES DE NAVEGACIÓN ---
function mostrarSeccion(idSeccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.modulo-contenido').forEach(seccion => {
        seccion.style.display = 'none';
    });
    // Mostrar la seleccionada
    document.getElementById(idSeccion).style.display = 'block';

    // Actualizar estado activo en el menú
    document.querySelectorAll('.enlace-nav').forEach(enlace => {
        enlace.classList.remove('activo');
    });
    event.currentTarget.classList.add('activo');
}

// --- GESTIÓN DE TIPOS DE VEHÍCULOS ---
function guardarNuevoTipo() {
    const codigo = document.getElementById('codigo-vehiculo').value;
    const nombre = document.getElementById('nombre-vehiculo').value;
    const tarifa = parseFloat(document.getElementById('tarifa-vehiculo').value);

    if (codigo && nombre && tarifa) {
        const nuevoTipo = { codigo, nombre, tarifa };
        listaTiposVehiculos.push(nuevoTipo);
        localStorage.setItem('tiposVehiculos', JSON.stringify(listaTiposVehiculos));
        
        actualizarSelectorTipos();
        alert("Tipo de vehículo guardado exitosamente");
        document.getElementById('form-tipo-vehiculo').reset();
    } else {
        alert("Por favor, completa todos los campos del tipo.");
    }
}

function actualizarSelectorTipos() {
    const selector = document.querySelector('#seccion-registro select');
    selector.innerHTML = ""; // Limpiar
    listaTiposVehiculos.forEach(tipo => {
        const opcion = document.createElement('option');
        opcion.value = tipo.nombre;
        opcion.textContent = `${tipo.nombre} (Q${tipo.tarifa}/hr)`;
        selector.appendChild(opcion);
    });
}

// --- GESTIÓN DE REGISTROS (INGRESOS) ---
function registrarIngreso() {
    const formulario = document.querySelector('.formulario-parqueo');
    const placa = formulario.querySelector('input[type="text"]').value;
    const tipo = formulario.querySelector('select').value;
    const fecha = formulario.querySelectorAll('input')[1].value;
    const hora = formulario.querySelectorAll('input')[2].value;
    const espacio = formulario.querySelector('input[type="number"]').value;

    if (placa && espacio && fecha && hora) {
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
        localStorage.setItem('registrosParqueo', JSON.stringify(listaRegistrosParqueo));
        
        alert(`Vehículo ${placa} registrado en espacio ${espacio}`);
        formulario.reset();
        renderizarTabla();
        actualizarResumen();
    } else {
        alert("Completa todos los datos de ingreso.");
    }
}

// --- CÁLCULOS Y TABLA ---
function renderizarTabla() {
    const cuerpoTabla = document.getElementById('tabla-cuerpo');
    cuerpoTabla.innerHTML = "";

    if (listaRegistrosParqueo.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay vehículos.</td></tr>`;
        return;
    }

    listaRegistrosParqueo.forEach(reg => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${reg.placa}</td>
            <td>${reg.tipo}</td>
            <td>${reg.fechaIngreso}</td>
            <td>${reg.horaIngreso}</td>
            <td>${reg.espacio}</td>
            <td><span class="etiqueta-estado">${reg.estado}</span></td>
            <td>
                <button onclick="procesarSalida(${reg.id})" class="btn-mini" style="background: var(--verde-neon); color: black;">Cobrar</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

function procesarSalida(idRegistro) {
    const registro = listaRegistrosParqueo.find(r => r.id === idRegistro);
    const tipoVehiculo = listaTiposVehiculos.find(t => t.nombre === registro.tipo);
    
    const ahora = new Date();
    const milisegundosSalida = ahora.getTime();
    const diferenciaMilisegundos = milisegundosSalida - registro.milisegundosEntrada;
    
    // Calcular horas (mínimo 1 hora de cobro)
    const horasEstancia = Math.max(1, Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60)));
    const totalAPagar = horasEstancia * tipoVehiculo.tarifa;

    const mensaje = `
        RESUMEN DE SALIDA
        -----------------
        Vehículo: ${registro.placa}
        Tiempo: ${horasEstancia} hora(s)
        Tarifa: Q${tipoVehiculo.tarifa}/hr
        TOTAL A PAGAR: Q${totalAPagar}
    `;

    if (confirm(mensaje + "\n\n¿Confirmar pago y salida?")) {
        listaRegistrosParqueo = listaRegistrosParqueo.filter(r => r.id !== idRegistro);
        localStorage.setItem('registrosParqueo', JSON.stringify(listaRegistrosParqueo));
        renderizarTabla();
        actualizarResumen();
    }
}

// --- UTILIDADES ---
function actualizarResumen() {
    // Aquí podrías actualizar contadores en el HTML si los agregas
    console.log("Vehículos en parqueo:", listaRegistrosParqueo.length);
}

function abrirPerfil() {
    document.getElementById('modalPerfil').style.display = 'flex';
}

function cerrarPerfil() {
    document.getElementById('modalPerfil').style.display = 'none';
}