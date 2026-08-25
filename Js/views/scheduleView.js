import { SchedulerService } from '../servicios/scheduler.js';
import { MatchRepo } from '../datos/matchRepo.js';

const btnGenerar = document.getElementById('btn-generar-programacion');
const contenedorProgramacion = document.getElementById('programacion-list');

export async function initScheduleView() {
    await cargarProgramacionExistente();
    configurarEventos();
}

async function cargarProgramacionExistente() {
    contenedorProgramacion.innerHTML = '<p>Cargando programación...</p>';
    try {
        const partidos = await MatchRepo.obtenerPorTorneo();
        renderizarProgramacion(partidos);
    } catch (error) {
        contenedorProgramacion.innerHTML = '<p>No hay programación generada aún.</p>';
    }
}

function renderizarProgramacion(partidos) {
    if (!partidos || partidos.length === 0) {
        contenedorProgramacion.innerHTML = '<p>No hay partidos programados.</p>';
        return;
    }

    const porFecha = partidos.reduce((acc, p) => {
        if (!acc[p.fecha]) acc[p.fecha] = [];
        acc[p.fecha].push(p);
        return acc;
    }, {});

    let html = '';
    for (const [fecha, lista] of Object.entries(porFecha)) {
        html += `<h3 style="margin-top: 30px; border-bottom: 2px solid var(--primary-color);">${fecha}</h3>`;
        html += `<div class="grid-cards">`;
        lista.forEach(p => {
            html += `
                <div class="card">
                    <p><strong>${p.hora}</strong> - ${p.cancha}</p>
                    <p style="color: var(--text-muted); font-size: 0.9em;">${p.zona_nombre}</p>
                    <h4 style="margin: 10px 0;">${p.local_nombre} vs ${p.visitante_nombre}</h4>
                    <p>Estado: ${p.estado}</p>
                </div>
            `;
        });
        html += `</div>`;
    }

    contenedorProgramacion.innerHTML = html;
}

function configurarEventos() {
    btnGenerar.replaceWith(btnGenerar.cloneNode(true));
    const btnLimpio = document.getElementById('btn-generar-programacion');

    btnLimpio.addEventListener('click', async () => {
        const confirmar = confirm("¿Generar programación? Esto sobrescribirá la programación actual.");
        if (!confirmar) return;

        try {
            btnLimpio.disabled = true;
            btnLimpio.textContent = "Generando...";
            const nuevosPartidos = await SchedulerService.generar();
            await MatchRepo.guardarMultiples(nuevosPartidos);
            alert("Programación generada con éxito.");
            await cargarProgramacionExistente();
        } catch (error) {
            alert(error.message);
        } finally {
            btnLimpio.disabled = false;
            btnLimpio.textContent = "Generar Programación Automática";
        }
    });
}