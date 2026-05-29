// Configuración de tiempos (en segundos)
const TIEMPOS = {
    pomodoro: 40 * 60,
    short: 5 * 60,
    long: 1 * 60
};

// Elementos del DOM
let minutosSpan = document.getElementById('minutos');
let segundosSpan = document.getElementById('segundos');
let modoTexto = document.getElementById('modo-texto');
let contadorSpan = document.getElementById('contador');
let btnIniciar = document.getElementById('iniciar');
let btnPausar = document.getElementById('pausar');
let btnReset = document.getElementById('reset');
let botonesModo = document.querySelectorAll('.modo-btn');

// Estado
let tiempoActual = TIEMPOS.pomodoro;
let modoActual = 'pomodoro';
let intervalo = null;
let corriendo = false;
let ciclos = 0;

// Actualizar display del reloj (BIEN CORREGIDO)
function actualizarDisplay() {
    let minutos = Math.floor(tiempoActual / 60);
    let segundos = tiempoActual % 60;
    
    // Formato con dos dígitos
    minutosSpan.textContent = minutos < 10 ? '0' + minutos : minutos;
    segundosSpan.textContent = segundos < 10 ? '0' + segundos : segundos;
}

// Cambiar el texto según el modo
function actualizarModoTexto() {
    switch(modoActual) {
        case 'pomodoro':
            modoTexto.textContent = '📘 Tiempo de enfoque - Trabaja';
            break;
        case 'short':
            modoTexto.textContent = '☕ Descanso corto - Relájate 5 min';
            break;
        case 'long':
            modoTexto.textContent = '🌿 Descanso largo - Toma 15 min';
            break;
    }
}

// Marcar botón activo
function marcarBotonActivo() {
    botonesModo.forEach(btn => {
        if(btn.getAttribute('data-modo') === modoActual) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Detener el temporizador
function detenerTimer() {
    if(intervalo) {
        clearInterval(intervalo);
        intervalo = null;
    }
    corriendo = false;
}

// Cuando se completa un ciclo
function terminarCiclo() {
    detenerTimer();
    
    if(modoActual === 'pomodoro') {
        ciclos++;
        contadorSpan.textContent = ciclos;
        
        // Notificación
        if(Notification.permission === 'granted') {
            new Notification('🎉 Pomodoro completado!', {
                body: `¡Bien hecho! Llevas ${ciclos} ciclo(s) completados.`
            });
        }
        
        // Cambiar automáticamente a descanso
        if(ciclos % 4 === 0) {
            cambiarModo('long');
        } else {
            cambiarModo('short');
        }
    } else {
        // Terminó un descanso
        if(Notification.permission === 'granted') {
            new Notification('⏰ Descanso terminado', {
                body: 'Vuelve al trabajo!'
            });
        }
        cambiarModo('pomodoro');
    }
    
    // Auto-iniciar el siguiente ciclo
    iniciarTimer();
}

// Iniciar el temporizador (VERSIÓN CORREGIDA)
function iniciarTimer() {
    if(corriendo) return;
    if(tiempoActual <= 0) {
        terminarCiclo();
        return;
    }
    
    corriendo = true;
    intervalo = setInterval(() => {
        if(tiempoActual > 0) {
            tiempoActual--;
            actualizarDisplay();
            
            // Cuando llega a 0
            if(tiempoActual === 0) {
                detenerTimer();
                terminarCiclo();
            }
        }
    }, 1000);
}

// Pausar timer
function pausarTimer() {
    detenerTimer();
}

// Resetear al tiempo del modo actual
function resetearTiempo() {
    detenerTimer();
    tiempoActual = TIEMPOS[modoActual];
    actualizarDisplay();
    corriendo = false;
}

// Cambiar entre modos
function cambiarModo(nuevoModo) {
    detenerTimer();
    modoActual = nuevoModo;
    tiempoActual = TIEMPOS[modoActual];
    actualizarDisplay();
    actualizarModoTexto();
    marcarBotonActivo();
    corriendo = false;
}

// Eventos
btnIniciar.addEventListener('click', iniciarTimer);
btnPausar.addEventListener('click', pausarTimer);
btnReset.addEventListener('click', resetearTiempo);

botonesModo.forEach(btn => {
    btn.addEventListener('click', () => {
        let modo = btn.getAttribute('data-modo');
        if(modoActual !== modo) {
            cambiarModo(modo);
        }
    });
});

// Inicializar la app
function init() {
    // Pedir permiso para notificaciones
    if(Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    tiempoActual = TIEMPOS.pomodoro;
    modoActual = 'pomodoro';
    ciclos = 0;
    contadorSpan.textContent = '0';
    actualizarDisplay();
    actualizarModoTexto();
    marcarBotonActivo();
    detenerTimer();
}

init();