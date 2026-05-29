const TIEMPOS = {
    pomodoro: 40 * 60,
    short: 5 * 60,
    long: 15 * 60
};

let minutosSpan = document.getElementById('minutos');
let segundosSpan = document.getElementById('segundos');
let modoTexto = document.getElementById('modo-texto');
let contadorSpan = document.getElementById('contador');
let btnIniciar = document.getElementById('iniciar');
let btnPausar = document.getElementById('pausar');
let btnReset = document.getElementById('reset');
let botonesModo = document.querySelectorAll('.modo-btn');
let btnSilenciar = document.getElementById('silenciar');
let indicadorSonido = document.getElementById('indicador-sonido');

let tiempoActual = TIEMPOS.pomodoro;
let modoActual = 'pomodoro';
let intervalo = null;
let corriendo = false;
let ciclos = 0;
let sonidoActivado = true;
let alarmaSonando = false;

// Crear elemento de audio
const audioAlarma = new Audio('alarma.mp3');
audioAlarma.loop = true; // La alarma suena continuamente hasta que la silencies

function actualizarDisplay() {
    let minutos = Math.floor(tiempoActual / 60);
    let segundos = tiempoActual % 60;
    minutosSpan.textContent = minutos < 10 ? '0' + minutos : minutos;
    segundosSpan.textContent = segundos < 10 ? '0' + segundos : segundos;
}

function actualizarModoTexto() {
    switch(modoActual) {
        case 'pomodoro':
            modoTexto.textContent = ' Tiempo de enfoque - Trabaja';
            break;
        case 'short':
            modoTexto.textContent = ' Descanso corto - Relájate 5 min';
            break;
        case 'long':
            modoTexto.textContent = ' Descanso largo - Toma 15 min';
            break;
    }
}

function marcarBotonActivo() {
    botonesModo.forEach(btn => {
        if(btn.getAttribute('data-modo') === modoActual) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function detenerTimer() {
    if(intervalo) {
        clearInterval(intervalo);
        intervalo = null;
    }
    corriendo = false;
}

// Detener la alarma
function detenerAlarma() {
    if (!audioAlarma.paused) {
        audioAlarma.pause();
        audioAlarma.currentTime = 0;
    }
    alarmaSonando = false;
    if (indicadorSonido) {
        indicadorSonido.textContent = '🔊';
        indicadorSonido.style.opacity = '0.5';
    }
}

// Iniciar la alarma
function iniciarAlarma() {
    if (sonidoActivado) {
        audioAlarma.play().catch(error => {
            console.log('Error reproduciendo audio:', error);
        });
        alarmaSonando = true;
        if (indicadorSonido) {
            indicadorSonido.textContent = '🔔🔊';
            indicadorSonido.style.opacity = '1';
            indicadorSonido.style.animation = 'pulse 1s infinite';
        }
    } else {
        // Si está silenciado, solo mostrar notificación visual
        if (indicadorSonido) {
            indicadorSonido.textContent = '🔕';
            indicadorSonido.style.opacity = '0.8';
        }
    }
}

// Cuando se completa un ciclo
function terminarCiclo() {
    detenerTimer();
    
    if (modoActual === 'pomodoro') {
        ciclos++;
        contadorSpan.textContent = ciclos;
        
        if (Notification.permission === 'granted') {
            new Notification('🎉 Pomodoro completado!', {
                body: `¡Bien hecho! Llevas ${ciclos} ciclo(s) completados.`
            });
        }
        
        // INICIAR ALARMA
        iniciarAlarma();
        
        // NO cambiar automáticamente, esperar a que el usuario silencie o cambie de modo
        modoTexto.textContent = '🔔 ¡TIEMPO COMPLETADO! Silencia la alarma para continuar 🔔';
        
    } else {
        // Terminó un descanso
        if (Notification.permission === 'granted') {
            new Notification('⏰ Descanso terminado', {
                body: '¡El descanso terminó! Silencia la alarma para continuar.'
            });
        }
        
        // INICIAR ALARMA
        iniciarAlarma();
        
        modoTexto.textContent = '🔔 ¡DESCANSO TERMINADO! Silencia para continuar 🔔';
    }
}

function iniciarTimer() {
    if(corriendo) return;
    if(tiempoActual <= 0) {
        // No hacer nada, esperar a que el usuario silencie la alarma
        return;
    }
    
    corriendo = true;
    intervalo = setInterval(() => {
        if(tiempoActual > 0) {
            tiempoActual--;
            actualizarDisplay();
            
            if(tiempoActual === 0) {
                detenerTimer();
                terminarCiclo();
            }
        }
    }, 1000);
}

function pausarTimer() {
    detenerTimer();
}

function resetearTiempo() {
    // Si hay alarma sonando, detenerla
    detenerAlarma();
    detenerTimer();
    tiempoActual = TIEMPOS[modoActual];
    actualizarDisplay();
    corriendo = false;
    actualizarModoTexto();
}

// Silenciar la alarma y continuar con el siguiente ciclo
function silenciarYContinuar() {
    // Detener la alarma
    detenerAlarma();
    
    // Si estábamos en un ciclo completado, pasar al siguiente
    if (tiempoActual === 0) {
        if (modoActual === 'pomodoro') {
            // Después de pomodoro, ir a descanso
            if (ciclos % 4 === 0) {
                cambiarModo('long');
            } else {
                cambiarModo('short');
            }
        } else {
            // Después de descanso, ir a pomodoro
            cambiarModo('pomodoro');
        }
        
        // Auto-iniciar el siguiente ciclo
        iniciarTimer();
    } else {
        // Si por alguna razón se llama sin que haya terminado, solo reiniciar el modo
        resetearTiempo();
    }
}

// Cambiar entre modos
function cambiarModo(nuevoModo) {
    // Detener alarma si está sonando
    detenerAlarma();
    detenerTimer();
    modoActual = nuevoModo;
    tiempoActual = TIEMPOS[modoActual];
    actualizarDisplay();
    actualizarModoTexto();
    marcarBotonActivo();
    corriendo = false;
}

// Alternar silencio global
function toggleSilencio() {
    sonidoActivado = !sonidoActivado;
    
    if (btnSilenciar) {
        if (sonidoActivado) {
            btnSilenciar.textContent = '🔊 Silenciar alarma';
            btnSilenciar.style.background = '#34495e';
        } else {
            btnSilenciar.textContent = '🔕 Alarma silenciada';
            btnSilenciar.style.background = '#7f8c8d';
        }
    }
    
    // Si la alarma está sonando y se silencia, detenerla
    if (!sonidoActivado && alarmaSonando) {
        detenerAlarma();
    }
}

// Eventos
btnIniciar.addEventListener('click', iniciarTimer);
btnPausar.addEventListener('click', pausarTimer);
btnReset.addEventListener('click', resetearTiempo);
btnSilenciar.addEventListener('click', toggleSilencio);

botonesModo.forEach(btn => {
    btn.addEventListener('click', () => {
        let modo = btn.getAttribute('data-modo');
        if(modoActual !== modo) {
            cambiarModo(modo);
        }
    });
});

// Agregar CSS para la animación del indicador
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
    }
    .boton-silenciar {
        margin-top: 10px;
        padding: 8px 15px;
        font-size: 0.9rem;
        background: #34495e;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s;
    }
    .boton-silenciar:hover {
        transform: scale(1.02);
    }
    #indicador-sonido {
        margin-left: 10px;
        font-size: 1.2rem;
        display: inline-block;
    }
`;
document.head.appendChild(style);

function init() {
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
    sonidoActivado = true;
    
    if (btnSilenciar) {
        btnSilenciar.textContent = '🔊 Silenciar alarma';
    }
}

init();