// ===========================
// VARIABLES GLOBALES
// ===========================
let chart;
let eventSource;
let ultimoPesoRecibido = null;
let timeoutDebounce = null;
let pesoTemporal = null;

// ===========================
// INICIALIZACIÓN DE GRÁFICA
// ===========================
function inicializarGrafica() {
    const ctx = document.getElementById('chartPeso').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Peso (kg)',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// ===========================
// ACTUALIZAR GRÁFICA
// ===========================
function actualizarGrafica(datos) {
    const ultimas50 = datos.slice(0, 50).reverse();

    chart.data.labels = ultimas50.map((d, i) => {
        const fecha = new Date(d.fecha);
        return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    });

    chart.data.datasets[0].data = ultimas50.map(d => parseFloat(d.peso));
    chart.update();
}

// ===========================
// ACTUALIZAR TABLA DE HISTORIAL
// ===========================
function actualizarTabla(datos) {
    const tbody = document.getElementById('tabla-historial');

    if (datos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay datos</td></tr>';
        return;
    }

    tbody.innerHTML = datos.slice(0, 50).map(d => {
        const usuario = d.usuario || '<span style="color: #999;">Sin nombre</span>';
        const altura = d.altura ? `${d.altura} m` : '<span style="color: #999;">-</span>';
        const tieneRecomendacion = d.recomendacion ? true : false;

        // Formatear fecha
        const fecha = new Date(d.fecha);
        const fechaFormateada = fecha.toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const botonRecomendacion = tieneRecomendacion
            ? `<button class="btn-ver-recomendacion" onclick="verRecomendacion(${d.id})">Ver recomendación</button>`
            : '<span style="color: #999;">Sin recomendación</span>';

        return `
            <tr>
                <td>${usuario}</td>
                <td>${d.peso} kg</td>
                <td>${altura}</td>
                <td>${fechaFormateada}</td>
                <td>${botonRecomendacion}</td>
            </tr>
        `;
    }).join('');
}

// ===========================
// CARGAR HISTORIAL DESDE API
// ===========================
function cargarHistorial() {
    fetch('/api/lecturas')
        .then(res => res.json())
        .then(data => {
            actualizarGrafica(data);
            actualizarTabla(data);
        })
        .catch(err => console.error('Error cargando historial:', err));
}

// ===========================
// CONECTAR AL STREAM (SSE)
// ===========================
function conectarStream() {
    eventSource = new EventSource('/api/stream');

    eventSource.onopen = function () {
        console.log('✅ Conectado al stream');
        document.getElementById('status-conexion').textContent = 'Conectado';
        document.getElementById('status-conexion').className = 'status conectado';
    };

    eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log('📥 Nueva lectura recibida:', data);

        // Actualizar panel de última lectura
        document.getElementById('peso-actual').textContent = data.peso + ' kg';
        document.getElementById('fecha-actual').textContent = data.fecha;

        if (data.usuario) {
            document.getElementById('usuario-actual').textContent = data.usuario;
            // Solo recargar historial si la lectura tiene nombre de usuario
            cargarHistorial();
        } else {
            document.getElementById('usuario-actual').textContent = 'Sin seleccionar';
        }

        // Implementar debounce: solo mostrar modal si no hay más lecturas en 3 segundos
        if (timeoutDebounce) {
            clearTimeout(timeoutDebounce);
        }

        pesoTemporal = data.peso;

        timeoutDebounce = setTimeout(() => {
            // Si el peso no ha cambiado en 3 segundos, es una lectura única
            if (pesoTemporal && pesoTemporal !== ultimoPesoRecibido) {
                ultimoPesoRecibido = pesoTemporal;
                mostrarModalNombre(pesoTemporal);
            }
        }, 3000); // 3 segundos de espera
    };

    eventSource.onerror = function (err) {
        console.error('❌ Error en el stream:', err);
        document.getElementById('status-conexion').textContent = 'Desconectado';
        document.getElementById('status-conexion').className = 'status desconectado';

        // Intentar reconectar después de 3 segundos
        setTimeout(() => {
            console.log('🔄 Intentando reconectar...');
            eventSource.close();
            conectarStream();
        }, 3000);
    };
}

// ===========================
// CHATBOT - ENVIAR PREGUNTA
// ===========================
async function enviarPregunta() {
    const input = document.getElementById('chat-input');
    const mensaje = input.value.trim();

    if (!mensaje) return;

    const chatMessages = document.getElementById('chat-messages');

    // Limpiar mensaje inicial si existe
    if (chatMessages.innerHTML.includes('Haz una pregunta')) {
        chatMessages.innerHTML = '';
    }

    // Agregar mensaje del usuario
    chatMessages.innerHTML += `
        <div class="chat-message user">
            <strong>Tú:</strong> ${mensaje}
        </div>
    `;

    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Procesar la pregunta
    const respuesta = await procesarPregunta(mensaje);

    // Agregar respuesta del bot
    chatMessages.innerHTML += `
        <div class="chat-message bot">
            <strong>Bot:</strong> ${respuesta}
        </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===========================
// CHATBOT - PROCESAR PREGUNTA LOCAL
// ===========================
async function procesarPregunta(pregunta) {
    try {
        const preguntaLower = pregunta.toLowerCase().trim();

        // Respuestas sobre el peso
        if (preguntaLower.includes('peso') && (preguntaLower.includes('ideal') || preguntaLower.includes('normal'))) {
            return "El peso ideal depende de tu altura. Un IMC saludable está entre 18.5 y 25. Usa la calculadora registrando tu peso y altura para obtener recomendaciones personalizadas.";
        }

        // Respuestas sobre IMC
        if (preguntaLower.includes('imc') || preguntaLower.includes('índice de masa corporal')) {
            return "El IMC (Índice de Masa Corporal) se calcula dividiendo tu peso en kg entre tu altura en metros al cuadrado. Es un indicador para clasificar si estás en bajo peso, peso normal, sobrepeso u obesidad.";
        }

        // Respuestas sobre alimentación
        if (preguntaLower.includes('comer') || preguntaLower.includes('dieta') || preguntaLower.includes('aliment')) {
            return "Para obtener un plan alimenticio personalizado basado en tu peso y altura, registra una medición. El sistema generará recomendaciones específicas para tu situación.";
        }

        // Respuestas sobre ejercicio
        if (preguntaLower.includes('ejercicio') || preguntaLower.includes('entrenar') || preguntaLower.includes('actividad física')) {
            return "Las recomendaciones de ejercicio varían según tu IMC. Registra tu peso y altura para recibir un plan de actividad física adaptado a tus necesidades.";
        }

        // Respuestas sobre la báscula
        if (preguntaLower.includes('báscula') || preguntaLower.includes('bascula') || preguntaLower.includes('pesar')) {
            return "La báscula envía lecturas en tiempo real. Cuando te pesas, espera 3 segundos y se abrirá un modal para registrar tu nombre y altura, luego recibirás recomendaciones personalizadas.";
        }

        // Respuestas sobre historial
        if (preguntaLower.includes('historial') || preguntaLower.includes('registro') || preguntaLower.includes('anterior')) {
            return "Puedes ver tu historial en la tabla inferior. Cada registro con nombre y altura tiene un botón para ver las recomendaciones que se generaron en ese momento.";
        }

        // Respuesta por defecto
        return "Puedo ayudarte con información sobre:\n- Peso ideal e IMC\n- Alimentación y dietas\n- Ejercicios y actividad física\n- Cómo usar la báscula\n- Consultar tu historial\n\n¿Sobre qué te gustaría saber más?";

    } catch (error) {
        console.error('Error en chatbot:', error);
        return "❌ Error al procesar la pregunta. Intenta de nuevo.";
    }
}

// ===========================
// MODALES - FUNCIONES
// ===========================
function mostrarModalNombre(peso) {
    const modal = document.getElementById('modal-nombre');
    const pesoDisplay = document.getElementById('modal-peso-display');
    const inputNombre = document.getElementById('input-nombre');

    pesoDisplay.textContent = `${peso} kg`;
    inputNombre.value = '';
    modal.classList.remove('hidden');

    // Focus en el input
    setTimeout(() => inputNombre.focus(), 100);
}

function cerrarModalNombre() {
    const modal = document.getElementById('modal-nombre');
    modal.classList.add('hidden');
}

async function guardarNombre() {
    const inputNombre = document.getElementById('input-nombre');
    const inputAltura = document.getElementById('input-altura');
    const nombre = inputNombre.value.trim();
    const altura = inputAltura.value.trim();
    const peso = pesoTemporal;

    // Validaciones
    if (!nombre) {
        alert('Por favor ingresa el nombre completo');
        inputNombre.focus();
        return;
    }

    if (!altura) {
        alert('Por favor ingresa la altura en metros (Ej: 1.75)');
        inputAltura.focus();
        return;
    }

    const alturaFloat = parseFloat(altura);
    if (isNaN(alturaFloat) || alturaFloat < 1.00 || alturaFloat > 2.50) {
        alert('La altura debe estar entre 1.00 y 2.50 metros');
        inputAltura.focus();
        return;
    }

    const btnGuardar = document.getElementById('btn-guardar-nombre');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<div class="loading-spinner"></div> Guardando...';

    try {
        // Guardar la lectura con nombre y altura
        const response = await fetch('/api/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ peso, usuario: nombre, altura: alturaFloat })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Datos guardados correctamente');
            cerrarModalNombre();

            // Obtener el ID de la lectura recién creada
            const lecturaId = data.lectura ? data.lectura.id : null;

            // Mostrar modal de sugerencias
            mostrarModalSugerencias(peso, alturaFloat, nombre, lecturaId);
        } else {
            const errorData = await response.json();
            alert('Error: ' + (errorData.error || 'No se pudo guardar'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar los datos');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar y ver sugerencias';
    }
}

async function mostrarModalSugerencias(peso, altura, usuario, lecturaId) {
    const modal = document.getElementById('modal-sugerencias');
    const loading = document.getElementById('sugerencias-loading');
    const contenido = document.getElementById('sugerencias-contenido');

    // Obtener icono SVG y mensaje personalizado según IMC
    const icono = obtenerIconoIMC(peso, altura);
    const mensaje = obtenerMensajeIMC(peso, altura);

    // Mostrar modal con loading personalizado
    modal.classList.remove('hidden');
    loading.classList.remove('hidden');
    contenido.classList.add('hidden');

    // Actualizar el contenido del loading con icono SVG y mensaje
    loading.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="avatar-icon">${icono}</div>
            <p style="margin-top: 20px; font-size: 16px; color: #ffffff;">${mensaje}</p>
        </div>
    `;

    try {
        // Llamar al endpoint de sugerencias locales
        const response = await fetch('/api/sugerencias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ peso, altura, usuario, lectura_id: lecturaId })
        });

        const data = await response.json();

        if (response.ok && data.sugerencias) {
            // Mostrar sugerencias con icono SVG
            loading.classList.add('hidden');
            contenido.classList.remove('hidden');

            const iconoHeader = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div class="avatar-icon-result">${icono}</div>
                </div>
            `;

            contenido.innerHTML = iconoHeader + formatearSugerencias(data.sugerencias);
        } else {
            loading.classList.add('hidden');
            contenido.classList.remove('hidden');
            const errorMsg = data.error || 'No se pudieron generar sugerencias';
            contenido.innerHTML = `<p style="color: #ef4444; font-weight: bold;">❌ Error al generar sugerencias</p>
                <p style="margin-top: 15px; color: #666;">${errorMsg}</p>
                <p style="margin-top: 10px; color: #666;">Por favor, intenta de nuevo.</p>`;
        }
    } catch (error) {
        console.error('Error completo:', error);
        loading.classList.add('hidden');
        contenido.classList.remove('hidden');
        contenido.innerHTML = `<p style="color: #ef4444; font-weight: bold;">❌ Error de conexión</p>
            <p style="margin-top: 15px; color: #666;">Detalles: ${error.message}</p>
            <p style="margin-top: 10px; color: #666;">Verifica que el servidor esté funcionando.</p>`;
    }
}

function cerrarModalSugerencias() {
    const modal = document.getElementById('modal-sugerencias');
    modal.classList.add('hidden');

    // Recargar el historial para mostrar el nuevo registro con recomendación
    cargarHistorial();
}

function formatearSugerencias(texto) {
    // Convertir markdown básico a HTML
    let html = texto
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/#{1,3}\s(.+)/g, '<h3>$1</h3>');

    return html;
}

// ===========================
// OBTENER ICONO SVG SEGÚN IMC
// ===========================
function obtenerIconoIMC(peso, altura) {
    if (!peso || !altura || altura <= 0) {
        // Icono de análisis
        return `<svg viewBox="0 0 100 100" class="svg-icon">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FFC107" stroke-width="4"/>
            <circle cx="35" cy="40" r="5" fill="#FFC107"/>
            <circle cx="65" cy="40" r="5" fill="#FFC107"/>
            <path d="M 35 60 Q 50 70 65 60" stroke="#FFC107" stroke-width="4" fill="none"/>
        </svg>`;
    }

    const imc = peso / (altura * altura);

    if (imc < 18.5) {
        // Icono preocupado - bajo peso
        return `<svg viewBox="0 0 100 100" class="svg-icon">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FFC107" stroke-width="4"/>
            <circle cx="35" cy="40" r="5" fill="#FFC107"/>
            <circle cx="65" cy="40" r="5" fill="#FFC107"/>
            <path d="M 35 70 Q 50 60 65 70" stroke="#FFC107" stroke-width="4" fill="none"/>
            <path d="M 30 30 L 40 35" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
            <path d="M 70 30 L 60 35" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
        </svg>`;
    } else if (imc < 25) {
        // Icono feliz - peso normal
        return `<svg viewBox="0 0 100 100" class="svg-icon">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FFC107" stroke-width="4"/>
            <circle cx="35" cy="40" r="5" fill="#FFC107"/>
            <circle cx="65" cy="40" r="5" fill="#FFC107"/>
            <path d="M 30 60 Q 50 75 70 60" stroke="#FFC107" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>`;
    } else if (imc < 30) {
        // Icono neutral - sobrepeso
        return `<svg viewBox="0 0 100 100" class="svg-icon">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FFC107" stroke-width="4"/>
            <circle cx="35" cy="40" r="5" fill="#FFC107"/>
            <circle cx="65" cy="40" r="5" fill="#FFC107"/>
            <line x1="30" y1="65" x2="70" y2="65" stroke="#FFC107" stroke-width="4" stroke-linecap="round"/>
        </svg>`;
    } else {
        // Icono preocupado - obesidad
        return `<svg viewBox="0 0 100 100" class="svg-icon">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FFC107" stroke-width="4"/>
            <circle cx="35" cy="40" r="5" fill="#FFC107"/>
            <circle cx="65" cy="40" r="5" fill="#FFC107"/>
            <path d="M 30 70 Q 50 55 70 70" stroke="#FFC107" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M 25 25 Q 30 30 35 35" stroke="#FFC107" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 75 25 Q 70 30 65 35" stroke="#FFC107" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>`;
    }
}

function obtenerMensajeIMC(peso, altura) {
    if (!peso || !altura || altura <= 0) {
        return 'Analizando tus datos...';
    }

    const imc = peso / (altura * altura);

    if (imc < 18.5) {
        return 'Preparando recomendaciones para aumentar masa muscular...';
    } else if (imc < 25) {
        return '¡Excelente! Preparando tu plan de mantenimiento...';
    } else if (imc < 30) {
        return 'Generando plan personalizado para mejorar tu salud...';
    } else {
        return 'Creando recomendaciones para tu bienestar...';
    }
}

// ===========================
// VER RECOMENDACIÓN GUARDADA
// ===========================
async function verRecomendacion(lecturaId) {
    const modal = document.getElementById('modal-recomendacion-guardada');
    const loading = document.getElementById('recomendacion-loading');
    const contenido = document.getElementById('recomendacion-contenido');

    // Mostrar modal con loading
    modal.classList.remove('hidden');
    loading.classList.remove('hidden');
    contenido.classList.add('hidden');

    // Actualizar loading con icono SVG genérico
    const iconoCarga = `<svg viewBox="0 0 100 100" class="svg-icon">
        <rect x="30" y="20" width="40" height="50" fill="none" stroke="#FFC107" stroke-width="4" rx="2"/>
        <line x1="40" y1="30" x2="60" y2="30" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
        <line x1="40" y1="40" x2="60" y2="40" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
        <line x1="40" y1="50" x2="55" y2="50" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
    </svg>`;

    loading.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="avatar-icon">${iconoCarga}</div>
            <p style="margin-top: 20px; font-size: 16px; color: #ffffff;">Cargando tu recomendación anterior...</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/recomendacion/${lecturaId}`);
        const data = await response.json();

        if (response.ok && data.recomendacion) {
            // Obtener icono SVG basado en los datos
            const icono = obtenerIconoIMC(data.peso, data.altura);

            // Mostrar recomendación
            loading.classList.add('hidden');
            contenido.classList.remove('hidden');

            const iconoHeader = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div class="avatar-icon-result">${icono}</div>
                </div>
            `;

            const infoHeader = `
                <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #FFC107;">
                    <p style="color: #ffffff;"><strong style="color: #FFC107;">Usuario:</strong> ${data.usuario || 'Sin nombre'}</p>
                    <p style="color: #ffffff;"><strong style="color: #FFC107;">Peso:</strong> ${data.peso} kg</p>
                    <p style="color: #ffffff;"><strong style="color: #FFC107;">Altura:</strong> ${data.altura ? data.altura + ' m' : 'No especificada'}</p>
                    <p style="color: #ffffff;"><strong style="color: #FFC107;">Fecha:</strong> ${data.fecha}</p>
                </div>
            `;

            contenido.innerHTML = iconoHeader + infoHeader + formatearSugerencias(data.recomendacion);
        } else {
            loading.classList.add('hidden');
            contenido.classList.remove('hidden');
            const errorMsg = data.error || 'No se pudo cargar la recomendación';
            contenido.innerHTML = `<p style="color: #ef4444; font-weight: bold;">❌ ${errorMsg}</p>`;
        }
    } catch (error) {
        console.error('Error al cargar recomendación:', error);
        loading.classList.add('hidden');
        contenido.classList.remove('hidden');
        contenido.innerHTML = `<p style="color: #ef4444; font-weight: bold;">❌ Error de conexión</p>
            <p style="margin-top: 15px; color: #666;">No se pudo cargar la recomendación.</p>`;
    }
}

function cerrarModalRecomendacionGuardada() {
    const modal = document.getElementById('modal-recomendacion-guardada');
    modal.classList.add('hidden');
}

// ===========================
// EVENT LISTENERS
// ===========================
document.addEventListener('DOMContentLoaded', function () {
    // Permitir enviar con Enter en el chat
    document.getElementById('chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            enviarPregunta();
        }
    });

    // Permitir guardar con Enter en el modal de nombre
    document.getElementById('input-nombre').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            guardarNombre();
        }
    });

    // Inicializar todo
    inicializarGrafica();
    cargarHistorial();
    conectarStream();
});

// ===========================
// CLEANUP AL CERRAR
// ===========================
window.onbeforeunload = function () {
    if (eventSource) {
        eventSource.close();
    }
};
