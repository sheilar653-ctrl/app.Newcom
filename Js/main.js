// js/main.js
import { Navigation } from './núcleo/navigation.js';
import { initTorneosVer } from './vistas/torneosVer.js';
import { initEquiposView } from './vistas/equiposView.js';
import { initZonasView } from './vistas/zonasView.js';
import { initCalendarView } from './vistas/calendarView.js';
import { initScheduleView } from './vistas/scheduleView.js';
import { initResultadosView } from './vistas/resultadosView.js';
import { initStandingsView } from './vistas/standingsView.js';
import { initPlayoffsView } from './vistas/playoffsView.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar navegación (cambia clases active y muestra/oculta vistas)
    Navigation.init();

    // Cargar la vista de Torneos por defecto
    initTorneosVer();

    // Asignar cada botón a su función de carga
    document.getElementById('btn-nav-torneos').addEventListener('click', initTorneosVer);
    document.getElementById('btn-nav-equipos').addEventListener('click', initEquiposView);
    document.getElementById('btn-nav-zonas').addEventListener('click', initZonasView);
    document.getElementById('btn-nav-calendario').addEventListener('click', initCalendarView);
    document.getElementById('btn-nav-programacion').addEventListener('click', initScheduleView);
    document.getElementById('btn-nav-resultados').addEventListener('click', initResultadosView);
    document.getElementById('btn-nav-posiciones').addEventListener('click', initStandingsView);
    
    const btnEliminatorias = document.getElementById('btn-nav-eliminatorias');
    if (btnEliminatorias) {
        btnEliminatorias.addEventListener('click', initPlayoffsView);
    }
});