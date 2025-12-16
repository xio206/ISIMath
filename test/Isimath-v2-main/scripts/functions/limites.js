document.addEventListener('DOMContentLoaded', () => {
            // Referencias a elementos del DOM con los nuevos IDs
            const limites__functionInput = document.getElementById('limites__function-input');
            const limites__limitPointInput = document.getElementById('limites__limit-point-input');
            const limites__solveLimitBtn = document.getElementById('limites__solve-limit-btn');
            const limites__limitResultDiv = document.getElementById('limites__limit-result');
            const limites__functionGraphCanvas = document.getElementById('limites__function-graph');
            const limites__ctx = limites__functionGraphCanvas.getContext('2d');

            const limites__functionError = document.getElementById('limites__function-error');
            const limites__limitPointError = document.getElementById('limites__limit-point-error');

            // Configuración inicial del canvas
            let limites__scaleX = 50; // Píxeles por unidad en el eje X
            let limites__scaleY = 50; // Píxeles por unidad en el eje Y
            let limites__originX = limites__functionGraphCanvas.width / 2;
            let limites__originY = limites__functionGraphCanvas.height / 2;

            // Función para limpiar el canvas
            const limites__clearCanvas = () => {
                limites__ctx.clearRect(0, 0, limites__functionGraphCanvas.width, limites__functionGraphCanvas.height);
                limites__drawAxes();
            };

            // Función para dibujar los ejes
            const limites__drawAxes = () => {
                limites__ctx.beginPath();
                // Obtener el color de la variable CSS para el modo claro/oscuro
                limites__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--limites-text-muted-light');
                if (document.body.classList.contains('dark')) {
                    limites__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--limites-text-muted-dark');
                }
                limites__ctx.lineWidth = 1;

                // Eje X
                limites__ctx.moveTo(0, limites__originY);
                limites__ctx.lineTo(limites__functionGraphCanvas.width, limites__originY);
                // Eje Y
                limites__ctx.moveTo(limites__originX, 0);
                limites__ctx.lineTo(limites__originX, limites__functionGraphCanvas.height);
                limites__ctx.stroke();

                // Dibujar marcas en los ejes
                limites__ctx.font = '10px Arial';
                limites__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--limites-text-light');
                if (document.body.classList.contains('dark')) {
                    limites__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--limites-text-dark');
                }
                limites__ctx.textAlign = 'center';
                limites__ctx.textBaseline = 'top';

                // Marcas en X
                for (let i = -Math.floor(limites__originX / limites__scaleX); i * limites__scaleX < limites__functionGraphCanvas.width - limites__originX; i++) {
                    if (i === 0) continue;
                    limites__ctx.fillText(i, limites__originX + i * limites__scaleX, limites__originY + 5);
                    limites__ctx.beginPath();
                    limites__ctx.moveTo(limites__originX + i * limites__scaleX, limites__originY - 3);
                    limites__ctx.lineTo(limites__originX + i * limites__scaleX, limites__originY + 3);
                    limites__ctx.stroke();
                }

                limites__ctx.textAlign = 'right';
                limites__ctx.textBaseline = 'middle';
                // Marcas en Y
                for (let i = -Math.floor(limites__originY / limites__scaleY); i * limites__scaleY < limites__functionGraphCanvas.height - limites__originY; i++) {
                    if (i === 0) continue;
                    limites__ctx.fillText(-i, limites__originX - 5, limites__originY + i * limites__scaleY);
                    limites__ctx.beginPath();
                    limites__ctx.moveTo(limites__originX - 3, limites__originY + i * limites__scaleY);
                    limites__ctx.lineTo(limites__originX + 3, limites__originY + i * limites__scaleY);
                    limites__ctx.stroke();
                }
            };

            // Ajustar el tamaño del canvas al contenedor
            const limites__resizeCanvas = () => {
                const limites__container = limites__functionGraphCanvas.parentElement;
                limites__functionGraphCanvas.width = limites__container.clientWidth - 30; // Ajustar por padding
                limites__functionGraphCanvas.height = 300; // Mantener altura fija
                limites__originX = limites__functionGraphCanvas.width / 2;
                limites__originY = limites__functionGraphCanvas.height / 2;
                limites__clearCanvas(); // Redibujar los ejes al cambiar el tamaño
            };

            // Event listener para redimensionar el canvas
            window.addEventListener('resize', limites__resizeCanvas);
            limites__resizeCanvas(); // Llamar al inicio para establecer el tamaño inicial

            // Función para parsear y evaluar la función de forma segura
            // Permite 'x', 'sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'pow'
            const limites__evaluateFunction = (funcStr, xVal) => {
                try {
                    // Reemplazar operadores matemáticos y funciones
                    let parsedFunc = funcStr
                        .replace(/sin\(/g, 'Math.sin(')
                        .replace(/cos\(/g, 'Math.cos(')
                        .replace(/tan\(/g, 'Math.tan(')
                        .replace(/log\(/g, 'Math.log(') // log natural
                        .replace(/exp\(/g, 'Math.exp(')
                        .replace(/sqrt\(/g, 'Math.sqrt(')
                        .replace(/pow\(/g, 'Math.pow(')
                        .replace(/\^/g, '**'); // Convertir ^ a ** para exponenciación

                    // Asegurarse de que 'x' se interprete correctamente para multiplicaciones implícitas
                    // Ej: 2x -> 2*x, x^2 es manejado por el reemplazo de ^
                    parsedFunc = parsedFunc.replace(/([0-9.]+)\s*([a-zA-Z])/g, '$1*$2'); // 2x -> 2*x
                    parsedFunc = parsedFunc.replace(/([a-zA-Z])\s*([0-9.]+)/g, '$1*$2'); // x2 -> x*2
                    parsedFunc = parsedFunc.replace(/([a-zA-Z])([a-zA-Z])/g, '$1*$2'); // xx -> x*x (para casos como x*x)

                    // Evaluar la función con 'x' como la variable
                    const x = xVal; // eslint-disable-line no-unused-vars
                    return eval(parsedFunc); // Usar eval con precaución y control de entrada
                } catch (e) {
                    console.error("Error al evaluar la función:", e);
                    return NaN; // Retorna NaN si hay un error en la evaluación
                }
            };

            // Función para dibujar la gráfica
            const limites__drawGraph = (funcStr, limitPoint) => {
                limites__clearCanvas(); // Limpiar y redibujar ejes

                limites__ctx.beginPath();
                limites__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--limites-secondary-light');
                if (document.body.classList.contains('dark')) {
                    limites__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--limites-secondary-dark');
                }
                limites__ctx.lineWidth = 2;

                const step = 0.1; // Incremento para dibujar la curva
                const minX = -limites__originX / limites__scaleX;
                const maxX = (limites__functionGraphCanvas.width - limites__originX) / limites__scaleX;

                let firstPoint = true;

                for (let x = minX; x <= maxX; x += step) {
                    const y = limites__evaluateFunction(funcStr, x);

                    if (isNaN(y) || !isFinite(y)) {
                        firstPoint = true; // Reiniciar la línea si hay un valor inválido
                        continue;
                    }

                    const canvasX = limites__originX + x * limites__scaleX;
                    const canvasY = limites__originY - y * limites__scaleY; // Y en canvas es invertido

                    if (firstPoint) {
                        limites__ctx.moveTo(canvasX, canvasY);
                        firstPoint = false;
                    } else {
                        limites__ctx.lineTo(canvasX, canvasY);
                    }
                }
                limites__ctx.stroke();

                // Marcar el punto de límite en la gráfica
                if (!isNaN(limitPoint)) {
                    const yLimit = limites__evaluateFunction(funcStr, limitPoint);
                    if (!isNaN(yLimit) && isFinite(yLimit)) {
                        const canvasLimitX = limites__originX + limitPoint * limites__scaleX;
                        const canvasLimitY = limites__originY - yLimit * limites__scaleY;

                        limites__ctx.beginPath();
                        limites__ctx.arc(canvasLimitX, canvasLimitY, 5, 0, Math.PI * 2, true);
                        limites__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--limites-primary-light');
                        if (document.body.classList.contains('dark')) {
                            limites__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--limites-primary-dark');
                        }
                        limites__ctx.fill();

                        limites__ctx.font = '12px Arial';
                        limites__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--limites-text-light');
                        if (document.body.classList.contains('dark')) {
                            limites__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--limites-text-dark');
                        }
                        limites__ctx.textAlign = 'left';
                        limites__ctx.fillText(`(${limitPoint.toFixed(2)}, ${yLimit.toFixed(2)})`, canvasLimitX + 10, canvasLimitY - 10);
                    }
                }
            };

            // Función para calcular el límite numéricamente
            const limites__calculateLimit = (funcStr, limitPoint) => {
                const epsilon = 0.0001; // Un valor pequeño para aproximación

                // Evaluar la función un poco a la izquierda y un poco a la derecha del punto
                const yLeft = limites__evaluateFunction(funcStr, limitPoint - epsilon);
                const yRight = limites__evaluateFunction(funcStr, limitPoint + epsilon);

                if (isNaN(yLeft) || isNaN(yRight)) {
                    return "Indefinido";
                }

                // Si los valores se acercan a un mismo número, ese es el límite
                if (Math.abs(yLeft - yRight) < epsilon * 100) { // Tolerancia para la igualdad
                    return yLeft.toFixed(4); // Redondear para una mejor visualización
                } else {
                    return "No existe (límites laterales diferentes o infinito)";
                }
            };

            // Event listener para el botón de resolver
            limites__solveLimitBtn.addEventListener('click', () => {
                const funcStr = limites__functionInput.value.trim();
                const limitPointStr = limites__limitPointInput.value.trim();

                // Limpiar errores previos
                limites__functionError.textContent = '';
                limites__limitPointError.textContent = '';
                limites__limitResultDiv.textContent = 'Calculando...';
                limites__clearCanvas();

                if (!funcStr) {
                    limites__functionError.textContent = 'Por favor, introduce una función.';
                    limites__limitResultDiv.textContent = 'Error: Falta la función.';
                    return;
                }

                let limitPoint;
                if (limitPointStr === '') {
                    limites__limitPointError.textContent = 'Por favor, introduce el punto de límite.';
                    limites__limitResultDiv.textContent = 'Error: Falta el punto de límite.';
                    return;
                } else {
                    limitPoint = parseFloat(limitPointStr);
                    if (isNaN(limitPoint)) {
                        limites__limitPointError.textContent = 'El punto de límite debe ser un número.';
                        limites__limitResultDiv.textContent = 'Error: Punto de límite inválido.';
                        return;
                    }
                }

                // Dibujar la gráfica
                limites__drawGraph(funcStr, limitPoint);

                // Calcular y mostrar el límite
                const result = limites__calculateLimit(funcStr, limitPoint);
                limites__limitResultDiv.textContent = `Límite de f(x) cuando x tiende a ${limitPoint}: ${result}`;
            });

            // Lógica para el tema oscuro/claro (tomada de tu documento original)
            const limites__applyTheme = (theme) => {
                const body = document.body;
                // Los iconos de sol/luna no están en este documento, pero se mantienen las referencias por si se integra
                const limites__iconSun = document.querySelector('.limites__icon-sun');
                const limites__iconMoon = document.querySelector('.limites__icon-moon');
                if (theme === 'dark') {
                    body.classList.add('dark');
                    if (limites__iconSun) limites__iconSun.classList.add('limites__hidden');
                    if (limites__iconMoon) limites__iconMoon.classList.remove('limites__hidden');
                } else {
                    body.classList.remove('dark');
                    if (limites__iconSun) limites__iconSun.classList.remove('limites__hidden');
                    if (limites__iconMoon) limites__iconMoon.classList.add('limites__hidden');
                }
                // Redibujar la gráfica para actualizar los colores de los ejes
                const funcStr = limites__functionInput.value.trim();
                const limitPoint = parseFloat(limites__limitPointInput.value.trim());
                if (funcStr && !isNaN(limitPoint)) {
                    limites__drawGraph(funcStr, limitPoint);
                } else {
                    limites__clearCanvas(); // Solo redibujar ejes
                }
            };

            // Cargar tema guardado
            const savedTheme = localStorage.getItem('theme') || 'light';
            limites__applyTheme(savedTheme);

            // Listener para el botón de cambio de tema (si existe en el HTML padre)
            // Se asume que este botón está fuera de este div específico de límites
            const themeToggleButton = document.getElementById('app__theme-toggle'); // Mantener el ID original si está fuera
            if (themeToggleButton) {
                themeToggleButton.addEventListener('click', () => {
                    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    limites__applyTheme(newTheme);
                });
            }
        });