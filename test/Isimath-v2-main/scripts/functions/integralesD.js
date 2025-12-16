document.addEventListener('DOMContentLoaded', () => {
            // Referencias a elementos del DOM con los nuevos IDs
            const integralesD__functionInput = document.getElementById('integralesD__function-input');
            const integralesD__lowerLimitInput = document.getElementById('integralesD__lower-limit-input');
            const integralesD__upperLimitInput = document.getElementById('integralesD__upper-limit-input');
            const integralesD__subintervalsInput = document.getElementById('integralesD__subintervals-input');
            const integralesD__solveBtn = document.getElementById('integralesD__solve-btn');
            const integralesD__resultDiv = document.getElementById('integralesD__result');
            const integralesD__functionGraphCanvas = document.getElementById('integralesD__function-graph');
            const integralesD__ctx = integralesD__functionGraphCanvas.getContext('2d');

            const integralesD__functionError = document.getElementById('integralesD__function-error');
            const integralesD__lowerLimitError = document.getElementById('integralesD__lower-limit-error');
            const integralesD__upperLimitError = document.getElementById('integralesD__upper-limit-error');
            const integralesD__subintervalsError = document.getElementById('integralesD__subintervals-error');

            // Configuración inicial del canvas
            let integralesD__scaleX = 50; // Píxeles por unidad en el eje X
            let integralesD__scaleY = 50; // Píxeles por unidad en el eje Y
            let integralesD__originX = integralesD__functionGraphCanvas.width / 2;
            let integralesD__originY = integralesD__functionGraphCanvas.height / 2;

            // Función para limpiar el canvas
            const integralesD__clearCanvas = () => {
                integralesD__ctx.clearRect(0, 0, integralesD__functionGraphCanvas.width, integralesD__functionGraphCanvas.height);
                integralesD__drawAxes();
            };

            // Función para dibujar los ejes
            const integralesD__drawAxes = () => {
                integralesD__ctx.beginPath();
                // Obtener el color de la variable CSS para el modo claro/oscuro
                integralesD__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-text-muted-light');
                if (document.body.classList.contains('dark')) {
                    integralesD__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-text-muted-dark');
                }
                integralesD__ctx.lineWidth = 1;

                // Eje X
                integralesD__ctx.moveTo(0, integralesD__originY);
                integralesD__ctx.lineTo(integralesD__functionGraphCanvas.width, integralesD__originY);
                // Eje Y
                integralesD__ctx.moveTo(integralesD__originX, 0);
                integralesD__ctx.lineTo(integralesD__originX, integralesD__functionGraphCanvas.height);
                integralesD__ctx.stroke();

                // Dibujar marcas en los ejes
                integralesD__ctx.font = '10px Arial';
                integralesD__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-text-light');
                if (document.body.classList.contains('dark')) {
                    integralesD__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-text-dark');
                }
                integralesD__ctx.textAlign = 'center';
                integralesD__ctx.textBaseline = 'top';

                // Marcas en X
                for (let i = -Math.floor(integralesD__originX / integralesD__scaleX); i * integralesD__scaleX < integralesD__functionGraphCanvas.width - integralesD__originX; i++) {
                    if (i === 0) continue;
                    integralesD__ctx.fillText(i, integralesD__originX + i * integralesD__scaleX, integralesD__originY + 5);
                    integralesD__ctx.beginPath();
                    integralesD__ctx.moveTo(integralesD__originX + i * integralesD__scaleX, integralesD__originY - 3);
                    integralesD__ctx.lineTo(integralesD__originX + i * integralesD__scaleX, integralesD__originY + 3);
                    integralesD__ctx.stroke();
                }

                integralesD__ctx.textAlign = 'right';
                integralesD__ctx.textBaseline = 'middle';
                // Marcas en Y
                for (let i = -Math.floor(integralesD__originY / integralesD__scaleY); i * integralesD__scaleY < integralesD__functionGraphCanvas.height - integralesD__originY; i++) {
                    if (i === 0) continue;
                    integralesD__ctx.fillText(-i, integralesD__originX - 5, integralesD__originY + i * integralesD__scaleY);
                    integralesD__ctx.beginPath();
                    integralesD__ctx.moveTo(integralesD__originX - 3, integralesD__originY + i * integralesD__scaleY);
                    integralesD__ctx.lineTo(integralesD__originX + 3, integralesD__originY + i * integralesD__scaleY);
                    integralesD__ctx.stroke();
                }
            };

            // Ajustar el tamaño del canvas al contenedor
            const integralesD__resizeCanvas = () => {
                const integralesD__container = integralesD__functionGraphCanvas.parentElement;
                integralesD__functionGraphCanvas.width = integralesD__container.clientWidth - 30; // Ajustar por padding
                integralesD__functionGraphCanvas.height = 300; // Mantener altura fija
                integralesD__originX = integralesD__functionGraphCanvas.width / 2;
                integralesD__originY = integralesD__functionGraphCanvas.height / 2;
                integralesD__clearCanvas(); // Redibujar los ejes al cambiar el tamaño
            };

            // Event listener para redimensionar el canvas
            window.addEventListener('resize', integralesD__resizeCanvas);
            integralesD__resizeCanvas(); // Llamar al inicio para establecer el tamaño inicial

            // Función para parsear y evaluar la función de forma segura
            const integralesD__evaluateFunction = (funcStr, xVal) => {
                try {
                    let parsedFunc = funcStr
                        .replace(/sin\(/g, 'Math.sin(')
                        .replace(/cos\(/g, 'Math.cos(')
                        .replace(/tan\(/g, 'Math.tan(')
                        .replace(/log\(/g, 'Math.log(')
                        .replace(/exp\(/g, 'Math.exp(')
                        .replace(/sqrt\(/g, 'Math.sqrt(')
                        .replace(/pow\(/g, 'Math.pow(')
                        .replace(/\^/g, '**');

                    parsedFunc = parsedFunc.replace(/([0-9.]+)\s*([a-zA-Z])/g, '$1*$2');
                    parsedFunc = parsedFunc.replace(/([a-zA-Z])\s*([0-9.]+)/g, '$1*$2');
                    parsedFunc = parsedFunc.replace(/([a-zA-Z])([a-zA-Z])/g, '$1*$2');
                    
                    const x = xVal;
                    return eval(parsedFunc);
                } catch (e) {
                    console.error("Error al evaluar la función:", e);
                    return NaN;
                }
            };

            // Función para calcular la integral definida usando el Método de Simpson
            const integralesD__calculateIntegralSimpson = (funcStr, a, b, n) => {
                if (n % 2 !== 0) {
                    console.error("El número de subintervalos (n) debe ser par para el Método de Simpson.");
                    return NaN;
                }

                const h = (b - a) / n;
                let sum = integralesD__evaluateFunction(funcStr, a) + integralesD__evaluateFunction(funcStr, b);

                for (let i = 1; i < n; i++) {
                    const x_i = a + i * h;
                    if (i % 2 === 0) { // Coeficiente 2 para índices pares
                        sum += 2 * integralesD__evaluateFunction(funcStr, x_i);
                    } else { // Coeficiente 4 para índices impares
                        sum += 4 * integralesD__evaluateFunction(funcStr, x_i);
                    }
                }
                return (h / 3) * sum;
            };

            // Función para dibujar la gráfica de la función y el área bajo la curva
            const integralesD__drawGraph = (funcStr, a, b) => {
                integralesD__clearCanvas(); // Limpiar y redibujar ejes

                // Dibujar la función original
                integralesD__ctx.beginPath();
                integralesD__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-secondary-light');
                if (document.body.classList.contains('dark')) {
                    integralesD__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-secondary-dark');
                }
                integralesD__ctx.lineWidth = 2;

                const step = 0.1; // Incremento para dibujar la curva
                const minX = -integralesD__originX / integralesD__scaleX;
                const maxX = (integralesD__functionGraphCanvas.width - integralesD__originX) / integralesD__scaleX;

                let firstPoint = true;

                for (let x = minX; x <= maxX; x += step) {
                    const y = integralesD__evaluateFunction(funcStr, x);

                    if (isNaN(y) || !isFinite(y)) {
                        firstPoint = true; // Reiniciar la línea si hay un valor inválido
                        continue;
                    }

                    const canvasX = integralesD__originX + x * integralesD__scaleX;
                    const canvasY = integralesD__originY - y * integralesD__scaleY; // Y en canvas es invertido

                    if (firstPoint) {
                        integralesD__ctx.moveTo(canvasX, canvasY);
                        firstPoint = false;
                    } else {
                        integralesD__ctx.lineTo(canvasX, canvasY);
                    }
                }
                integralesD__ctx.stroke();

                // Rellenar el área bajo la curva entre 'a' y 'b'
                if (!isNaN(a) && !isNaN(b)) {
                    integralesD__ctx.beginPath();
                    integralesD__ctx.moveTo(integralesD__originX + a * integralesD__scaleX, integralesD__originY); // Mover al eje X en 'a'

                    for (let x = a; x <= b; x += step) {
                        const y = integralesD__evaluateFunction(funcStr, x);
                        const canvasX = integralesD__originX + x * integralesD__scaleX;
                        const canvasY = integralesD__originY - y * integralesD__scaleY;
                        integralesD__ctx.lineTo(canvasX, canvasY);
                    }
                    integralesD__ctx.lineTo(integralesD__originX + b * integralesD__scaleX, integralesD__originY); // Volver al eje X en 'b'
                    integralesD__ctx.closePath();

                    integralesD__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-primary-light') + '33'; /* 20% opacidad */
                    if (document.body.classList.contains('dark')) {
                        integralesD__ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-primary-dark') + '33';
                    }
                    integralesD__ctx.fill();

                    integralesD__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-primary-light');
                    if (document.body.classList.contains('dark')) {
                        integralesD__ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--integralesD-primary-dark');
                    }
                    integralesD__ctx.lineWidth = 1;
                    integralesD__ctx.stroke();
                }
            };

            // Event listener para el botón de resolver
            integralesD__solveBtn.addEventListener('click', () => {
                const funcStr = integralesD__functionInput.value.trim();
                const lowerLimitStr = integralesD__lowerLimitInput.value.trim();
                const upperLimitStr = integralesD__upperLimitInput.value.trim();
                const subintervalsStr = integralesD__subintervalsInput.value.trim();

                // Limpiar errores previos
                integralesD__functionError.textContent = '';
                integralesD__lowerLimitError.textContent = '';
                integralesD__upperLimitError.textContent = '';
                integralesD__subintervalsError.textContent = '';
                integralesD__resultDiv.textContent = 'Calculando...';
                integralesD__clearCanvas();

                if (!funcStr) {
                    integralesD__functionError.textContent = 'Por favor, introduce una función.';
                    integralesD__resultDiv.textContent = 'Error: Falta la función.';
                    return;
                }

                let lowerLimit = parseFloat(lowerLimitStr);
                if (isNaN(lowerLimit)) {
                    integralesD__lowerLimitError.textContent = 'El límite inferior debe ser un número.';
                    integralesD__resultDiv.textContent = 'Error: Límite inferior inválido.';
                    return;
                }

                let upperLimit = parseFloat(upperLimitStr);
                if (isNaN(upperLimit)) {
                    integralesD__upperLimitError.textContent = 'El límite superior debe ser un número.';
                    integralesD__resultDiv.textContent = 'Error: Límite superior inválido.';
                    return;
                }

                let subintervals = parseInt(subintervalsStr);
                if (isNaN(subintervals) || subintervals <= 0 || subintervals % 2 !== 0) {
                    integralesD__subintervalsError.textContent = 'El número de subintervalos (n) debe ser un número entero par y positivo.';
                    integralesD__resultDiv.textContent = 'Error: Subintervalos inválidos.';
                    return;
                }

                if (lowerLimit >= upperLimit) {
                    integralesD__lowerLimitError.textContent = 'El límite inferior debe ser menor que el límite superior.';
                    integralesD__resultDiv.textContent = 'Error: Límites incorrectos.';
                    return;
                }

                // Dibujar la gráfica y el área
                integralesD__drawGraph(funcStr, lowerLimit, upperLimit);

                // Calcular y mostrar la integral
                const integralResult = integralesD__calculateIntegralSimpson(funcStr, lowerLimit, upperLimit, subintervals);
                if (!isNaN(integralResult)) {
                    integralesD__resultDiv.textContent = `Integral de f(x) de ${lowerLimit} a ${upperLimit} (n=${subintervals}): ${integralResult.toFixed(6)}`;
                } else {
                    integralesD__resultDiv.textContent = `No se pudo calcular la integral. Verifica la función y los límites.`;
                }
            });

            // Lógica para el tema oscuro/claro (tomada de tu documento original)
            const integralesD__applyTheme = (theme) => {
                const body = document.body;
                const integralesD__iconSun = document.querySelector('.integralesD__icon-sun');
                const integralesD__iconMoon = document.querySelector('.integralesD__icon-moon');
                if (theme === 'dark') {
                    body.classList.add('dark');
                    if (integralesD__iconSun) integralesD__iconSun.classList.add('integralesD__hidden');
                    if (integralesD__iconMoon) integralesD__iconMoon.classList.remove('integralesD__hidden');
                } else {
                    body.classList.remove('dark');
                    if (integralesD__iconSun) integralesD__iconSun.classList.remove('integralesD__hidden');
                    if (integralesD__iconMoon) integralesD__iconMoon.classList.add('integralesD__hidden');
                }
                // Redibujar la gráfica para actualizar los colores de los ejes y el área
                const funcStr = integralesD__functionInput.value.trim();
                const lowerLimit = parseFloat(integralesD__lowerLimitInput.value.trim());
                const upperLimit = parseFloat(integralesD__upperLimitInput.value.trim());
                if (funcStr && !isNaN(lowerLimit) && !isNaN(upperLimit)) {
                    integralesD__drawGraph(funcStr, lowerLimit, upperLimit);
                } else {
                    integralesD__clearCanvas(); // Solo redibujar ejes
                }
            };

            // Cargar tema guardado
            const savedTheme = localStorage.getItem('theme') || 'light';
            integralesD__applyTheme(savedTheme);

            // Listener para el botón de cambio de tema (si existe en el HTML padre)
            const themeToggleButton = document.getElementById('app__theme-toggle'); // Mantener el ID original si está fuera
            if (themeToggleButton) {
                themeToggleButton.addEventListener('click', () => {
                    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    integralesD__applyTheme(newTheme);
                });
            }
        });