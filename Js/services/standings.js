import { AppState } from '../núcleo/state.js';
import { MatchRepo } from '../datos/matchRepo.js';
import { TeamRepo } from '../datos/teamRepo.js';

export const PosicionesService = {
    calcular: async () => {
        const categoriaId = AppState.getCategory();
        const equipos = await TeamRepo.obtenerPorCategoria(categoriaId);
        const partidos = await MatchRepo.obtenerPorTorneo();

        const tabla = equipos.map(e => ({
            id: e.id,
            nombre: e.nombre,
            zona_id: e.zona_id,
            jugados: 0,
            ganados: 0,
            perdidos: 0,
            puntos: 0
        }));

        const partidosFinalizados = partidos.filter(p => 
            p.categoria_id === categoriaId && p.estado === 'finalizado'
        );

        partidosFinalizados.forEach(p => {
            const local = tabla.find(t => t.id === p.equipo_local_id);
            const visitante = tabla.find(t => t.id === p.equipo_visitante_id);
            if (!local || !visitante) return;

            local.jugados++;
            visitante.jugados++;

            if (p.sets_local === 2 && p.sets_visitante === 0) {
                local.ganados++; local.puntos += 3;
                visitante.perdidos++; visitante.puntos += 1;
            } else if (p.sets_local === 2 && p.sets_visitante === 1) {
                local.ganados++; local.puntos += 2;
                visitante.perdidos++; visitante.puntos += 1;
            } else if (p.sets_local === 0 && p.sets_visitante === 2) {
                visitante.ganados++; visitante.puntos += 3;
                local.perdidos++; local.puntos += 1;
            } else if (p.sets_local === 1 && p.sets_visitante === 2) {
                visitante.ganados++; visitante.puntos += 2;
                local.perdidos++; local.puntos += 1;
            }
        });

        return tabla.sort((a, b) => b.puntos - a.puntos || b.ganados - a.ganados);
    }
};