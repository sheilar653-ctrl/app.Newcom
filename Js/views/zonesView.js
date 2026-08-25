import { ZoneRepo } from '../datos/zoneRepo.js';
import { TeamRepo } from '../datos/teamRepo.js';
import { AppState } from '../núcleo/state.js';

const panelActivo = document.getElementById('panel-zonas-activo');
const alertaZonas = document.getElementById('alerta-zonas');
const tituloCategoria = document.getElementById('titulo-categoria-zonas');
const btnNuevaZona = document.getElementById('btn-nueva-zona');
const contenedorZonas = document.getElementById('zonas-list');
const contenedorLibres = document.getElementById('equipos-libres-list');

export async function initZonasView() {
    const categoriaId = AppState.getCategory();
    
    if (!categoriaId) {
        panelActivo.style.display = 'none';
        alertaZonas.style.display = 'block';
        return;
    }

    panelActivo.style.display = 'block';
    alertaZonas.style.display = 'none';
    tituloCategoria.textContent = "Gestionando categoría actual";
    
    await recargarTableros(categoriaId);
    configurarEventosZonas(categoriaId);
}

async function recargarTableros(categoriaId) {
    contenedorZonas.innerHTML = '<p>Cargando...</p>';
    contenedorLibres.innerHTML = '<p>Cargando...</p>';

    try {
        const zonas = await ZoneRepo.obtenerPorCategoria(categoriaId);
        const equipos = await TeamRepo.obtenerPorCategoria(categoriaId);
        
        renderizarEquiposLibres(equipos, zonas);
        renderizarZonas(zonas, equipos);
    } catch (error) {
        contenedorZonas.innerHTML = '<p style="color: red;">Error al cargar datos.</p>';
    }
}

function renderizarEquiposLibres(equipos, zonas) {
    const libres = equipos.filter(e => !e.zona_id);
    
    if (libres.length === 0) {
        contenedorLibres.innerHTML = '<p>Todos los equipos tienen zona asignada.</p>';
        return;
    }

    const opcionesZonas = zonas.map(z => `<option value="${z.id}">${z.nombre}</option>`).join('');

    contenedorLibres.innerHTML = libres.map(e => `
        <div class="card">
            <h4>${e.nombre}</h4>
            ${zonas.length > 0 ? `
                <select id="select-zona-${e.id}">
                    <option value="">Elegir zona...</option>
                    ${opcionesZonas}
                </select>
                <button class="btn-asignar" data-equipo="${e.id}">Asignar</button>
            ` : '<p>Cree una zona primero</p>'}
        </div>
    `).join('');

    document.querySelectorAll('.btn-asignar').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const equipoId = e.target.dataset.equipo;
            const select = document.getElementById(`select-zona-${equipoId}`);
            const zonaId = select.value;
            if (!zonaId) return;
            await ZoneRepo.asignarEquipo(equipoId, zonaId);
            await recargarTableros(AppState.getCategory());
        });
    });
}

function renderizarZonas(zonas, equipos) {
    if (zonas.length === 0) {
        contenedorZonas.innerHTML = '<p>No hay zonas creadas.</p>';
        return;
    }

    contenedorZonas.innerHTML = zonas.map(z => {
        const equiposZona = equipos.filter(e => e.zona_id === z.id);
        const listaEquipos = equiposZona.map(e => `
            <li>
                ${e.nombre} 
                <button style="color:red; cursor:pointer; border:none; background:none;" class="btn-quitar" data-equipo="${e.id}">[x]</button>
            </li>
        `).join('');

        return `
            <div class="card">
                <h3>${z.nombre}</h3>
                <p>Equipos: ${equiposZona.length}</p>
                <ul style="text-align: left; margin-top: 10px;">
                    ${listaEquipos}
                </ul>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.btn-quitar').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const equipoId = e.target.dataset.equipo;
            await ZoneRepo.removerEquipo(equipoId);
            await recargarTableros(AppState.getCategory());
        });
    });
}

function configurarEventosZonas(categoriaId) {
    btnNuevaZona.replaceWith(btnNuevaZona.cloneNode(true));
    const btnLimpio = document.getElementById('btn-nueva-zona');

    btnLimpio.addEventListener('click', async () => {
        const nombre = prompt("Nombre de la Zona (Ej: Zona A):");
        if (!nombre) return;
        await ZoneRepo.crear(nombre, categoriaId);
        await recargarTableros(categoriaId);
    });
}