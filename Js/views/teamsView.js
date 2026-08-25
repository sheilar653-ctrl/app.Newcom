import { AppState } from '../núcleo/state.js';
import { supabaseFetch } from '../datos/db.js';
import { TeamRepo } from '../datos/teamRepo.js';

// Objeto local para manejar categorías (podrías crear un categoryRepo si lo deseas)
const CategoryRepo = {
    obtenerPorTorneo: async () => {
        const torneoId = AppState.getTournament();
        return await supabaseFetch(`categorias?torneo_id=eq.${torneoId}&select=*`);
    },
    crear: async (nombre, genero) => {
        const torneoId = AppState.getTournament();
        const nuevaCategoria = { torneo_id: torneoId, nombre, genero };
        return await supabaseFetch('categorias', 'POST', nuevaCategoria);
    }
};

const selectorCategorias = document.getElementById('selector-categorias');
const panelCategoria = document.getElementById('panel-categoria-activa');
const tituloCategoria = document.getElementById('titulo-categoria-activa');
const contenedorEquipos = document.getElementById('equipos-list');
const btnNuevaCategoria = document.getElementById('btn-nueva-categoria');
const btnNuevoEquipo = document.getElementById('btn-nuevo-equipo');

export async function initEquiposView() {
    await cargarCategorias();
    configurarEventosEquipos();
}

async function cargarCategorias() {
    selectorCategorias.innerHTML = '<p>Cargando categorías...</p>';
    try {
        const categorias = await CategoryRepo.obtenerPorTorneo();
        renderizarCategorias(categorias);
    } catch (error) {
        selectorCategorias.innerHTML = '<p style="color: var(--danger)">Error al cargar categorías.</p>';
    }
}

function renderizarCategorias(categorias) {
    if (!categorias || categorias.length === 0) {
        selectorCategorias.innerHTML = '<p>No hay categorías creadas.</p>';
        panelCategoria.style.display = 'none';
        return;
    }

    selectorCategorias.innerHTML = categorias.map(c => `
        <button class="btn-tab ${AppState.getCategory() === c.id ? 'active' : ''}" data-id="${c.id}" data-nombre="${c.nombre} (${c.genero})">
            ${c.nombre} - ${c.genero}
        </button>
    `).join('');

    document.querySelectorAll('.btn-tab').forEach(btn => {
        btn.addEventListener('click', (e) => seleccionarCategoria(e.target.dataset.id, e.target.dataset.nombre));
    });
}

async function seleccionarCategoria(id, nombre) {
    AppState.setCategory(id);
    tituloCategoria.textContent = nombre;
    panelCategoria.style.display = 'block';
    
    document.querySelectorAll('.btn-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.btn-tab[data-id="${id}"]`).classList.add('active');

    await cargarEquipos(id);
}

async function cargarEquipos(categoriaId) {
    contenedorEquipos.innerHTML = '<p>Cargando equipos...</p>';
    try {
        const equipos = await TeamRepo.obtenerPorCategoria(categoriaId);
        renderizarEquipos(equipos);
    } catch (error) {
        contenedorEquipos.innerHTML = '<p style="color: var(--danger)">Error al cargar equipos.</p>';
    }
}

function renderizarEquipos(equipos) {
    if (!equipos || equipos.length === 0) {
        contenedorEquipos.innerHTML = '<p>No hay equipos en esta categoría.</p>';
        return;
    }

    contenedorEquipos.innerHTML = equipos.map(e => `
        <div class="card">
            <h3>${e.nombre}</h3>
            <p>Zona: ${e.zona_id ? 'Asignada' : 'Sin asignar'}</p>
        </div>
    `).join('');
}

function configurarEventosEquipos() {
    btnNuevaCategoria.addEventListener('click', async () => {
        const nombre = prompt("Nombre de categoría (Ej: +40, +50):");
        if (!nombre) return;
        const genero = prompt("Género (Masculino, Femenino, Mixto):");
        if (!genero) return;

        await CategoryRepo.crear(nombre, genero);
        await cargarCategorias();
    });

    btnNuevoEquipo.addEventListener('click', async () => {
        const categoriaId = AppState.getCategory();
        if (!categoriaId) {
            alert("Seleccione una categoría primero.");
            return;
        }

        const nombre = prompt("Nombre del equipo:");
        if (!nombre) return;

        await TeamRepo.crear(nombre, categoriaId);
        await cargarEquipos(categoriaId);
    });
}