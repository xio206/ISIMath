document.addEventListener('DOMContentLoaded', () => {
            // Referencias a elementos del DOM con los nuevos IDs
            const derivadas__functionInput = document.getElementById('derivadas__function-input');
            const derivadas__pointInput = document.getElementById('derivadas__point-input');
            const derivadas__solveBtn = document.getElementById('derivadas__solve-btn');
            const derivadas__resultDiv = document.getElementById('derivadas__result');
            const derivadas__functionGraphCanvas = document.getElementById('derivadas__function-graph');
            const derivadas__ctx = derivadas__functionGraphCanvas.getContext('2d');

            const derivadas__functionError = document.getElementById('derivadas__function-error');
            const derivadas__pointError = document.getElementById('derivadas__point-error');

            // Configuración inicial del canvas
            let derivadas__scaleX = 50; // Píxeles por unidad en el eje X
            let derivadas__scaleY = 50; // Píxeles por unidad en el eje Y
            let derivadas__originX = derivadas__functionGraphCanvas.width / 2;
            let derivadas__originY = derivadas__functionGraphCanvas.height / 2;

            // Función para limpiar el canvas
            const derivadas__clearCanvas = () => {
                derivadas__ctx.clearRect(0, 0, derivadas__functionGraphCanvas.width, derivadas__functionGraphCanvas.height);
                derivadas__drawAxes();
            };

            // Función para dibujar los ejes
            const derivadas__drawAxes = () => {
                derivadas__ctx.beginPath();
                // Obtener el color de la variable CSS para el modo claro/oscuro
                derivadas__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-text-muted-light');
                if (document.body.classList.contains('dark')) {
                    derivadas__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-text-muted-dark');
                }
                derivadas__ctx.lineWidth = 1;

                // Eje X
                derivadas__ctx.moveTo(0, derivadas__originY);
                derivadas__ctx.lineTo(derivadas__functionGraphCanvas.width, derivadas__originY);
                // Eje Y
                derivadas__ctx.moveTo(derivadas__originX, 0);
                derivadas__ctx.lineTo(derivadas__originX, derivadas__functionGraphCanvas.height);
                derivadas__ctx.stroke();

                // Dibujar marcas en los ejes
                derivadas__ctx.font = '10px Arial';
                derivadas__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-text-light');
                if (document.body.classList.contains('dark')) {
                    derivadas__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-text-dark');
                }
                derivadas__ctx.textAlign = 'center';
                derivadas__ctx.textBaseline = 'top';

                // Marcas en X
                for (let i = -Math.floor(derivadas__originX / derivadas__scaleX); i * derivadas__scaleX < derivadas__functionGraphCanvas.width - derivadas__originX; i++) {
                    if (i === 0) continue;
                    derivadas__ctx.fillText(i, derivadas__originX + i * derivadas__scaleX, derivadas__originY + 5);
                    derivadas__ctx.beginPath();
                    derivadas__ctx.moveTo(derivadas__originX + i * derivadas__scaleX, derivadas__originY - 3);
                    derivadas__ctx.lineTo(derivadas__originX + i * derivadas__scaleX, derivadas__originY + 3);
                    derivadas__ctx.stroke();
                }

                derivadas__ctx.textAlign = 'right';
                derivadas__ctx.textBaseline = 'middle';
                // Marcas en Y
                for (let i = -Math.floor(derivadas__originY / derivadas__scaleY); i * derivadas__scaleY < derivadas__functionGraphCanvas.height - derivadas__originY; i++) {
                    if (i === 0) continue;
                    derivadas__ctx.fillText(-i, derivadas__originX - 5, derivadas__originY + i * derivadas__scaleY);
                    derivadas__ctx.beginPath();
                    derivadas__ctx.moveTo(derivadas__originX - 3, derivadas__originY + i * derivadas__scaleY);
                    derivadas__ctx.lineTo(derivadas__originX + 3, derivadas__originY + i * derivadas__scaleY);
                    derivadas__ctx.stroke();
                }
            };

            // Ajustar el tamaño del canvas al contenedor
            const derivadas__resizeCanvas = () => {
                const derivadas__container = derivadas__functionGraphCanvas.parentElement;
                derivadas__functionGraphCanvas.width = derivadas__container.clientWidth - 30; // Ajustar por padding
                derivadas__functionGraphCanvas.height = 300; // Mantener altura fija
                derivadas__originX = derivadas__functionGraphCanvas.width / 2;
                derivadas__originY = derivadas__functionGraphCanvas.height / 2;
                derivadas__clearCanvas(); // Redibujar los ejes al cambiar el tamaño
            };

            // Event listener para redimensionar el canvas
            window.addEventListener('resize', derivadas__resizeCanvas);
            derivadas__resizeCanvas(); // Llamar al inicio para establecer el tamaño inicial

            // Función para parsear y evaluar la función de forma segura
            // Permite 'x', 'sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'pow'
            const derivadas__evaluateFunction = (funcStr, xVal) => {
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

            // Función para calcular la derivada numéricamente (método de diferencia central)
            const derivadas__calculateDerivative = (funcStr, x0) => {
                const h = 0.0001; // Un valor pequeño para la aproximación
                const f_x0_plus_h = derivadas__evaluateFunction(funcStr, x0 + h);
                const f_x0_minus_h = derivadas__evaluateFunction(funcStr, x0 - h);

                if (isNaN(f_x0_plus_h) || isNaN(f_x0_minus_h)) {
                    return NaN;
                }

                return (f_x0_plus_h - f_x0_minus_h) / (2 * h);
            };

            // Función para dibujar la gráfica de la función y su tangente
            const derivadas__drawGraph = (funcStr, pointX) => {
                derivadas__clearCanvas(); // Limpiar y redibujar ejes

                // Dibujar la función original
                derivadas__ctx.beginPath();
                derivadas__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-secondary-light');
                if (document.body.classList.contains('dark')) {
                    derivadas__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-secondary-dark');
                }
                derivadas__ctx.lineWidth = 2;

                const step = 0.1; // Incremento para dibujar la curva
                const minX = -derivadas__originX / derivadas__scaleX;
                const maxX = (derivadas__functionGraphCanvas.width - derivadas__originX) / derivadas__scaleX;

                let firstPoint = true;

                for (let x = minX; x <= maxX; x += step) {
                    const y = derivadas__evaluateFunction(funcStr, x);

                    if (isNaN(y) || !isFinite(y)) {
                        firstPoint = true; // Reiniciar la línea si hay un valor inválido
                        continue;
                    }

                    const canvasX = derivadas__originX + x * derivadas__scaleX;
                    const canvasY = derivadas__originY - y * derivadas__scaleY; // Y en canvas es invertido

                    if (firstPoint) {
                        derivadas__ctx.moveTo(canvasX, canvasY);
                        firstPoint = false;
                    } else {
                        derivadas__ctx.lineTo(canvasX, canvasY);
                    }
                }
                derivadas__ctx.stroke();

                // Dibujar el punto de tangencia y la línea tangente
                if (!isNaN(pointX)) {
                    const yAtPoint = derivadas__evaluateFunction(funcStr, pointX);
                    const derivativeAtPoint = derivadas__calculateDerivative(funcStr, pointX);

                    if (!isNaN(yAtPoint) && isFinite(yAtPoint) && !isNaN(derivativeAtPoint) && isFinite(derivativeAtPoint)) {
                        const canvasPointX = derivadas__originX + pointX * derivadas__scaleX;
                        const canvasPointY = derivadas__originY - yAtPoint * derivadas__scaleY;

                        // Dibujar el punto de tangencia
                        derivadas__ctx.beginPath();
                        derivadas__ctx.arc(canvasPointX, canvasPointY, 5, 0, Math.PI * 2, true);
                        derivadas__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-primary-light');
                        if (document.body.classList.contains('dark')) {
                            derivadas__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-primary-dark');
                        }
                        derivadas__ctx.fill();

                        // Dibujar la línea tangente
                        derivadas__ctx.beginPath();
                        derivadas__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-primary-light');
                        if (document.body.classList.contains('dark')) {
                            derivadas__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-primary-dark');
                        }
                        derivadas__ctx.lineWidth = 2;
                        derivadas__ctx.setLineDash([5, 5]); // Línea discontinua para la tangente

                        // Calcular dos puntos para la línea tangente
                        const tangentX1 = pointX - 2;
                        const tangentY1 = derivativeAtPoint * (tangentX1 - pointX) + yAtPoint;
                        const tangentX2 = pointX + 2;
                        const tangentY2 = derivativeAtPoint * (tangentX2 - pointX) + yAtPoint;

                        const canvasTangentX1 = derivadas__originX + tangentX1 * derivadas__scaleX;
                        const canvasTangentY1 = derivadas__originY - tangentY1 * derivadas__scaleY;
                        const canvasTangentX2 = derivadas__originX + tangentX2 * derivadas__scaleX;
                        const canvasTangentY2 = derivadas__originY - tangentY2 * derivadas__scaleY;

                        derivadas__ctx.moveTo(canvasTangentX1, canvasTangentY1);
                        derivadas__ctx.lineTo(canvasTangentX2, canvasTangentY2);
                        derivadas__ctx.stroke();
                        derivadas__ctx.setLineDash([]); // Restablecer a línea sólida

                        // Mostrar coordenadas del punto de tangencia
                        derivadas__ctx.font = '12px Arial';
                        derivadas__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-text-light');
                        if (document.body.classList.contains('dark')) {
                            derivadas__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--derivadas-text-dark');
                        }
                        derivadas__ctx.textAlign = 'left';
                        derivadas__ctx.fillText(`(${pointX.toFixed(2)}, ${yAtPoint.toFixed(2)})`, canvasPointX + 10, canvasPointY - 10);
                    }
                }
            };

            // Event listener para el botón de resolver
            derivadas__solveBtn.addEventListener('click', () => {
                const funcStr = derivadas__functionInput.value.trim();
                const pointStr = derivadas__pointInput.value.trim();

                // Limpiar errores previos
                derivadas__functionError.textContent = '';
                derivadas__pointError.textContent = '';
                derivadas__resultDiv.textContent = 'Calculando...';
                derivadas__clearCanvas();

                if (!funcStr) {
                    derivadas__functionError.textContent = 'Por favor, introduce una función.';
                    derivadas__resultDiv.textContent = 'Error: Falta la función.';
                    return;
                }

                let pointX;
                if (pointStr === '') {
                    derivadas__pointError.textContent = 'Por favor, introduce el punto para la derivada.';
                    derivadas__resultDiv.textContent = 'Error: Falta el punto.';
                    return;
                } else {
                    pointX = parseFloat(pointStr);
                    if (isNaN(pointX)) {
                        derivadas__pointError.textContent = 'El punto debe ser un número.';
                        derivadas__resultDiv.textContent = 'Error: Punto inválido.';
                        return;
                    }
                }

                // Dibujar la gráfica y la tangente
                derivadas__drawGraph(funcStr, pointX);

                // Calcular y mostrar la derivada
                const derivativeResult = derivadas__calculateDerivative(funcStr, pointX);
                if (!isNaN(derivativeResult)) {
                    derivadas__resultDiv.textContent = `Derivada de f(x) en x = ${pointX}: ${derivativeResult.toFixed(4)}`;
                } else {
                    derivadas__resultDiv.textContent = `No se pudo calcular la derivada en x = ${pointX}.`;
                }
            });

            // Lógica para el tema oscuro/claro (tomada de tu documento original)
            const derivadas__applyTheme = (theme) => {
                const body = document.body;
                // Los iconos de sol/luna no están en este documento, pero se mantienen las referencias por si se integra
                const derivadas__iconSun = document.querySelector('.derivadas__icon-sun');
                const derivadas__iconMoon = document.querySelector('.derivadas__icon-moon');
                if (theme === 'dark') {
                    body.classList.add('dark');
                    if (derivadas__iconSun) derivadas__iconSun.classList.add('derivadas__hidden');
                    if (derivadas__iconMoon) derivadas__iconMoon.classList.remove('derivadas__hidden');
                } else {
                    body.classList.remove('dark');
                    if (derivadas__iconSun) derivadas__iconSun.classList.remove('derivadas__hidden');
                    if (derivadas__iconMoon) derivadas__iconMoon.classList.add('derivadas__hidden');
                }
                // Redibujar la gráfica para actualizar los colores de los ejes
                const funcStr = derivadas__functionInput.value.trim();
                const pointX = parseFloat(derivadas__pointInput.value.trim());
                if (funcStr && !isNaN(pointX)) {
                    derivadas__drawGraph(funcStr, pointX);
                } else {
                    derivadas__clearCanvas(); // Solo redibujar ejes
                }
            };

            // Cargar tema guardado
            const savedTheme = localStorage.getItem('theme') || 'light';
            derivadas__applyTheme(savedTheme);

            // Listener para el botón de cambio de tema (si existe en el HTML padre)
            const themeToggleButton = document.getElementById('app__theme-toggle'); // Mantener el ID original si está fuera
            if (themeToggleButton) {
                themeToggleButton.addEventListener('click', () => {
                    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    derivadas__applyTheme(newTheme);
                });
            }
        });