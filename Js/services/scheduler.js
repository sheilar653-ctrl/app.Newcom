import { AppState } from '../núcleo/state.js';
import { CalendarRepo } from '../datos/calendarRepo.js';
import { TeamRepo } from '../datos/teamRepo.js';
import { ZoneRepo } from '../datos/zoneRepo.js'; // Asumo que zoneRepo.js existe
import { TorneoRepo } from '../datos/torneoRepo.js';

export const SchedulerService = {
    generar: async () => {
        const torneoId = AppState.getTournament();
        const torneos = await TorneoRepo.obtenerTodos();
        const torneo = torneos.find(t => t.id === torneoId);
        const fechasObj = await CalendarRepo.obtenerPorTorneo();
        
        if (!fechasObj || fechasObj.length === 0) {
            throw new Error("Debe configurar el calendario primero.");
        }

        const fechas = fechasObj.map(f => f.fecha).sort();
        const diasFaseGrupos = fechas.length > 1 ? fechas.slice(0, -1) : fechas;
        
        const categoriaId = AppState.getCategory();
        if (!categoriaId) throw new Error("Seleccione una categoría en Equipos.");

        const zonas = await ZoneRepo.obtenerPorCategoria(categoriaId);
        const equipos = await TeamRepo.obtenerPorCategoria(categoriaId);

        let partidosGenerados = [];
        let slotIndex = 0;
        const horasBase = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];
        const canchas = ["Cancha 1", "Cancha 2"];

        for (const zona of zonas) {
            const equiposZona = equipos.filter(e => e.zona_id === zona.id);
            const cantidadAsegurada = torneo.partidos_asegurados;
            
            if (equiposZona.length <= cantidadAsegurada) {
                throw new Error(`La ${zona.nombre} necesita más equipos para garantizar ${cantidadAsegurada} partidos.`);
            }

            // Round-robin simple (todos contra todos)
            for (let i = 0; i < equiposZona.length; i++) {
                for (let j = i + 1; j < equiposZona.length; j++) {
                    const diaActual = diasFaseGrupos[slotIndex % diasFaseGrupos.length];
                    const horaActual = horasBase[Math.floor((slotIndex / canchas.length)) % horasBase.length];
                    const canchaActual = canchas[slotIndex % canchas.length];
                    slotIndex++;

                    partidosGenerados.push({
                        torneo_id: torneoId,
                        categoria_id: categoriaId,
                        zona_id: zona.id,
                        tipo: 'grupo',
                        equipo_local_id: equiposZona[i].id,
                        equipo_visitante_id: equiposZona[j].id,
                        local_nombre: equiposZona[i].nombre,
                        visitante_nombre: equiposZona[j].nombre,
                        zona_nombre: zona.nombre,
                        fecha: diaActual,
                        hora: horaActual,
                        cancha: canchaActual,
                        estado: 'pendiente'
                    });
                }
            }
        }

        return partidosGenerados;
    }
};