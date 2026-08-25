import { PosicionesService } from '../servicios/posiciones.js';
import { ZoneRepo } from '../datos/zoneRepo.js';
import { AppState } from '../núcleo/state.js';

const contenedorPosiciones = document.getElementById('posiciones-list');

export async function initStandingsView() {
    await renderizarTablas();
}

async function renderizarTablas() {
    contenedorPosiciones.innerHTML = '<p>Calculando posiciones...</p>';
    
    try {
        const categoriaId = AppState.getCategory();
        if (!categoriaId) {
            contenedorPosiciones.innerHTML = '<p>Seleccione una categoría en Equipos.</p>';
            return;
        }

        const posiciones = await PosicionesService.calcular();
        const zonas = await ZoneRepo.obtenerPorCategoria(categoriaId);

        let html = '';
        zonas.forEach(z => {
            const equiposZona = posiciones.filter(p => p.zona_id === z.id);
            
            html += `
                <h3 style="margin-top: 30px;">${z.nombre}</h3>
                <table style="width: 100%; border-collapse: collapse; background: var(--bg-card); margin-bottom: 20px; text-align: left;">
                    <thead>
                        <tr style="background: var(--primary-color); color: white;">
                            <th style="padding: 12px;">Equipo</th>
                            <th style="padding: 12px; text-align: center;">PJ</th>
                            <th style="padding: 12px; text-align: center;">PG</th>
                            <th style="padding: 12px; text-align: center;">PP</th>
                            <th style="padding: 12px; text-align: center;">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            equiposZona.forEach(e => {
                html += `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 12px;">${e.nombre}</td>
                        <td style="padding: 12px; text-align: center;">${e.jugados}</td>
                        <td style="padding: 12px; text-align: center;">${e.ganados}</td>
                        <td style="padding: 12px; text-align: center;">${e.perdidos}</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold;">${e.puntos}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
        });

        contenedorPosiciones.innerHTML = html;
    } catch (error) {
        contenedorPosiciones.innerHTML = '<p style="color: var(--danger);">Error al calcular posiciones.</p>';
    }
}