import { TorneoRepo } from '../datos/torneoRepo.js';
import { LicenciaRepo } from '../datos/licenciaRepo.js';
import { AppState } from '../núcleo/state.js';

const container = document.getElementById('torneos-list');
const btnNuevo = document.getElementById('btn-nuevo-torneo');

export async function initTorneosVer() {
    AppState.clear();
    await cargarEstadoLicencia();
    await cargarTorneos();
    configurarEventos();
}

async function cargarEstadoLicencia() {
    try {
        const licencia = await LicenciaRepo.obtenerActual();
        const disponibles = licencia.cupo_total - licencia.cupo_utilizado;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'panel-control';
        infoDiv.innerHTML = `<p>Torneos disponibles: <strong>${disponibles}</strong></p>`;
        
        const seccion = document.getElementById('view-torneos');
        seccion.insertBefore(infoDiv, btnNuevo);

        if (disponibles <= 0) {
            btnNuevo.disabled = true;
            btnNuevo.textContent = "Sin torneos disponibles";
            infoDiv.innerHTML += `<p style="color: var(--danger);">Contacte al administrador para adquirir más cupos.</p>`;
        }
    } catch (error) {
        console.error("Error al cargar licencia.");
    }
}

async function cargarTorneos() {
    container.innerHTML = '<p>Cargando torneos...</p>';
    try {
        const torneos = await TorneoRepo.obtenerTodos();
        renderizar(torneos);
    } catch (error) {
        container.innerHTML = `<p style="color: var(--danger)">Error al cargar.</p>`;
    }
}

function renderizar(torneos) {
    if (!torneos || torneos.length === 0) {
        container.innerHTML = '<p>No hay torneos activos.</p>';
        return;
    }

    container.innerHTML = torneos.map(t => `
        <div class="card">
            <h3>${t.nombre}</h3>
            <p>Partidos asegurados: ${t.partidos_asegurados}</p>
            <p>Estado: ${t.estado}</p>
            <button class="btn-primary" data-id="${t.id}">Abrir Torneo</button>
        </div>
    `).join('');

    document.querySelectorAll('#torneos-list .btn-primary').forEach(btn => {
        btn.addEventListener('click', (e) => abrirTorneo(e.target.dataset.id));
    });
}

function configurarEventos() {
    btnNuevo.addEventListener('click', async () => {
        const nombre = prompt("Ingrese nombre del torneo:");
        if (!nombre) return;
        
        const asegurados = parseInt(prompt("Cantidad de partidos asegurados:"), 10);
        if (isNaN(asegurados) || asegurados < 1) return;

        try {
            btnNuevo.disabled = true;
            await TorneoRepo.crear(nombre, asegurados);
            location.reload();
        } catch (error) {
            alert(error.message);
            btnNuevo.disabled = false;
        }
    });
}

function abrirTorneo(id) {
    AppState.setTournament(id);
    document.querySelectorAll('.nav-btn').forEach(btn => btn.disabled = false);
    alert("Torneo abierto. Habilitando panel de gestión.");
}