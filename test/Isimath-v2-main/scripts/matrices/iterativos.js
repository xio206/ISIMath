document.addEventListener('DOMContentLoaded', () => {
            // --- Referencias a elementos del DOM ---
            const iterativos__methodButtons = {
                jacobi: document.getElementById('iterativos__btn-jacobi'),
                gaussSeidel: document.getElementById('iterativos__btn-gauss-seidel')
            };

            const iterativos__methodInputSections = {
                jacobi: document.getElementById('iterativos__jacobi-inputs'),
                gaussSeidel: document.getElementById('iterativos__gauss-seidel-inputs')
            };

            const iterativos__resultDisplay = document.getElementById('iterativos__result-display');
            const iterativos__stepsDisplay = document.getElementById('iterativos__steps-display');

            // Jacobi elements
            const iterativos__jacobiSizeInput = document.getElementById('iterativos__jacobi-size-input');
            const iterativos__jacobiGenerateSystemBtn = document.getElementById('iterativos__jacobi-generate-system');
            const iterativos__jacobiMatrixAContainer = document.getElementById('iterativos__jacobi-matrix-a-container');
            const iterativos__jacobiVectorBContainer = document.getElementById('iterativos__jacobi-vector-b-container');
            const iterativos__jacobiVectorX0Container = document.getElementById('iterativos__jacobi-vector-x0-container');
            const iterativos__jacobiToleranceInput = document.getElementById('iterativos__jacobi-tolerance-input');
            const iterativos__jacobiMaxIterationsInput = document.getElementById('iterativos__jacobi-max-iterations-input');
            const iterativos__jacobiShowStepsCheckbox = document.getElementById('iterativos__jacobi-show-steps');
            const iterativos__solveJacobiBtn = document.getElementById('iterativos__solve-jacobi');
            const iterativos__jacobiSizeError = document.getElementById('iterativos__jacobi-size-error');
            const iterativos__jacobiMatrixAError = document.getElementById('iterativos__jacobi-matrix-a-error');
            const iterativos__jacobiVectorBError = document.getElementById('iterativos__jacobi-vector-b-error');
            const iterativos__jacobiVectorX0Error = document.getElementById('iterativos__jacobi-vector-x0-error');
            const iterativos__jacobiToleranceError = document.getElementById('iterativos__jacobi-tolerance-error');
            const iterativos__jacobiMaxIterationsError = document.getElementById('iterativos__jacobi-max-iterations-error');


            // Gauss-Seidel elements
            const iterativos__gaussSeidelSizeInput = document.getElementById('iterativos__gauss-seidel-size-input');
            const iterativos__gaussSeidelGenerateSystemBtn = document.getElementById('iterativos__gauss-seidel-generate-system');
            const iterativos__gaussSeidelMatrixAContainer = document.getElementById('iterativos__gauss-seidel-matrix-a-container');
            const iterativos__gaussSeidelVectorBContainer = document.getElementById('iterativos__gauss-seidel-vector-b-container');
            const iterativos__gaussSeidelVectorX0Container = document.getElementById('iterativos__gauss-seidel-vector-x0-container');
            const iterativos__gaussSeidelToleranceInput = document.getElementById('iterativos__gauss-seidel-tolerance-input');
            const iterativos__gaussSeidelMaxIterationsInput = document.getElementById('iterativos__gauss-seidel-max-iterations-input');
            const iterativos__gaussSeidelShowStepsCheckbox = document.getElementById('iterativos__gauss-seidel-show-steps');
            const iterativos__solveGaussSeidelBtn = document.getElementById('iterativos__solve-gauss-seidel');
            const iterativos__gaussSeidelSizeError = document.getElementById('iterativos__gauss-seidel-size-error');
            const iterativos__gaussSeidelMatrixAError = document.getElementById('iterativos__gauss-seidel-matrix-a-error');
            const iterativos__gaussSeidelVectorBError = document.getElementById('iterativos__gauss-seidel-vector-b-error');
            const iterativos__gaussSeidelVectorX0Error = document.getElementById('iterativos__gauss-seidel-vector-x0-error');
            const iterativos__gaussSeidelToleranceError = document.getElementById('iterativos__gauss-seidel-tolerance-error');
            const iterativos__gaussSeidelMaxIterationsError = document.getElementById('iterativos__gauss-seidel-max-iterations-error');


            // --- Funciones de Utilidad ---

            /**
             * Muestra la sección de inputs para el método seleccionado y oculta las demás.
             * @param {string} methodType - El tipo de método ('jacobi', 'gaussSeidel').
             */
            const iterativos__showMethodInputs = (methodType) => {
                for (const key in iterativos__methodInputSections) {
                    if (iterativos__methodInputSections.hasOwnProperty(key)) {
                        if (key === methodType) {
                            iterativos__methodInputSections[key].classList.remove('iterativos__hidden');
                        } else {
                            iterativos__methodInputSections[key].classList.add('iterativos__hidden');
                        }
                    }
                }
                iterativos__resultDisplay.innerHTML = 'La solución del sistema aparecerá aquí.'; // Limpiar resultado
                iterativos__stepsDisplay.classList.add('iterativos__hidden'); // Ocultar pasos
                iterativos__stepsDisplay.innerHTML = '<h4>Pasos de la Operación:</h4>'; // Limpiar pasos
            };

            /**
             * Genera dinámicamente los campos de entrada para una matriz.
             * @param {string} containerId - El ID del contenedor donde se insertarán los inputs.
             * @param {number} size - Dimensión de la matriz (N x N).
             * @param {string} prefix - Prefijo para los IDs de los inputs (ej. 'jacobi-a').
             */
            const iterativos__generateMatrixInputs = (containerId, size, prefix) => {
                const container = document.getElementById(containerId);
                container.innerHTML = ''; // Limpiar inputs anteriores

                if (size <= 0) {
                    container.innerHTML = '<p class="iterativos__error-message">El tamaño debe ser mayor que 0.</p>';
                    return;
                }

                for (let i = 0; i < size; i++) {
                    const rowDiv = document.createElement('div');
                    rowDiv.classList.add('iterativos__matrix-row');
                    for (let j = 0; j < size; j++) {
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.classList.add('iterativos__input-text', 'iterativos__matrix-input');
                        input.id = `${prefix}-matrix-${i}-${j}`;
                        input.placeholder = `A[${i+1},${j+1}]`;
                        input.value = (i === j) ? '1' : '0'; // Default to identity-like for A
                        rowDiv.appendChild(input);
                    }
                    container.appendChild(rowDiv);
                }
            };

            /**
             * Genera dinámicamente los campos de entrada para un vector.
             * @param {string} containerId - El ID del contenedor donde se insertarán los inputs.
             * @param {number} size - Dimensión del vector.
             * @param {string} prefix - Prefijo para los IDs de los inputs (ej. 'jacobi-b').
             * @param {number} defaultValue - Valor por defecto para los inputs.
             */
            const iterativos__generateVectorInputs = (containerId, size, prefix, defaultValue = 0) => {
                const container = document.getElementById(containerId);
                container.innerHTML = ''; // Limpiar inputs anteriores

                if (size <= 0) {
                    container.innerHTML = '<p class="iterativos__error-message">El tamaño debe ser mayor que 0.</p>';
                    return;
                }

                const rowDiv = document.createElement('div');
                rowDiv.classList.add('iterativos__vector-row');
                for (let i = 0; i < size; i++) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.classList.add('iterativos__input-text', 'iterativos__vector-input');
                    input.id = `${prefix}-vector-${i}`;
                    input.placeholder = `${prefix.toUpperCase()}[${i+1}]`;
                    input.value = defaultValue.toString();
                    rowDiv.appendChild(input);
                }
                container.appendChild(rowDiv);
            };

            /**
             * Lee los valores de los inputs de una matriz y los devuelve como un array 2D.
             * @param {string} containerId - El ID del contenedor de los inputs de la matriz.
             * @param {number} size - Dimensión de la matriz.
             * @param {string} prefix - Prefijo de los IDs de los inputs.
             * @param {string} errorElementId - ID del elemento donde mostrar errores.
             * @returns {number[][]|null} La matriz como array 2D o null si hay errores.
             */
            const iterativos__getMatrixValues = (containerId, size, prefix, errorElementId) => {
                const errorElement = document.getElementById(errorElementId);
                errorElement.textContent = '';
                const matrix = [];
                for (let i = 0; i < size; i++) {
                    const row = [];
                    for (let j = 0; j < size; j++) {
                        const input = document.getElementById(`${prefix}-matrix-${i}-${j}`);
                        if (!input) {
                            errorElement.textContent = `Error: No se encontró el input ${prefix}-matrix-${i}-${j}. Genera el sistema primero.`;
                            return null;
                        }
                        const value = parseFloat(input.value);
                        if (isNaN(value)) {
                            errorElement.textContent = `Error: El valor en A[${i+1},${j+1}] no es un número.`;
                            return null;
                        }
                        row.push(value);
                    }
                    matrix.push(row);
                }
                return matrix;
            };

            /**
             * Lee los valores de los inputs de un vector y los devuelve como un array 1D.
             * @param {string} containerId - El ID del contenedor de los inputs del vector.
             * @param {number} size - Dimensión del vector.
             * @param {string} prefix - Prefijo de los IDs de los inputs.
             * @param {string} errorElementId - ID del elemento donde mostrar errores.
             * @returns {number[]|null} El vector como array 1D o null si hay errores.
             */
            const iterativos__getVectorValues = (containerId, size, prefix, errorElementId) => {
                const errorElement = document.getElementById(errorElementId);
                errorElement.textContent = '';
                const vector = [];
                for (let i = 0; i < size; i++) {
                    const input = document.getElementById(`${prefix}-vector-${i}`);
                    if (!input) {
                        errorElement.textContent = `Error: No se encontró el input ${prefix}-vector-${i}. Genera el sistema primero.`;
                        return null;
                    }
                    const value = parseFloat(input.value);
                    if (isNaN(value)) {
                        errorElement.textContent = `Error: El valor en ${prefix.toUpperCase()}[${i+1}] no es un número.`;
                        return null;
                    }
                    vector.push(value);
                }
                return vector;
            };

            /**
             * Muestra el resultado del vector solución.
             * @param {number[]|string} result - El vector solución o un mensaje de error.
             * @param {string} title - Título del resultado.
             * @param {string[]} [steps] - Array de strings con los pasos (opcional).
             */
            const iterativos__displayVectorResult = (result, title = "Solución del Sistema", steps = []) => {
                let html = `<h4>${title}</h4>`;
                if (Array.isArray(result)) {
                    html += `<div class="iterativos__result-value">X = [${result.map(val => val.toFixed(6)).join(', ')}]</div>`;
                } else {
                    html += `<p class="iterativos__error-message">${result}</p>`;
                }
                iterativos__resultDisplay.innerHTML = html;

                if (steps.length > 0) {
                    let stepsHtml = '<h4>Pasos de la Operación:</h4>';
                    steps.forEach((step, index) => {
                        stepsHtml += `<p>${index + 1}. ${step}</p>`;
                    });
                    iterativos__stepsDisplay.innerHTML = stepsHtml;
                    iterativos__stepsDisplay.classList.remove('iterativos__hidden');
                } else {
                    iterativos__stepsDisplay.classList.add('iterativos__hidden');
                    iterativos__stepsDisplay.innerHTML = '<h4>Pasos de la Operación:</h4>';
                }
            };

            /**
             * Formatea una matriz para mostrarla en los pasos.
             * @param {number[][]} matrix - La matriz a formatear.
             * @returns {string} Representación de la matriz en string.
             */
            const iterativos__formatMatrixForSteps = (matrix) => {
                let formatted = "";
                matrix.forEach(row => {
                    formatted += "[ " + row.map(val => val.toFixed(4)).join(", ") + " ]<br>";
                });
                return formatted;
            };

            /**
             * Formatea un vector para mostrarlo en los pasos.
             * @param {number[]} vector - El vector a formatear.
             * @returns {string} Representación del vector en string.
             */
            const iterativos__formatVectorForSteps = (vector) => {
                return "[ " + vector.map(val => val.toFixed(4)).join(", ") + " ]";
            };

            // --- Métodos Iterativos para Sistemas de Ecuaciones ---

            /**
             * Calcula la norma infinita de un vector (máximo valor absoluto).
             * @param {number[]} vector - El vector.
             * @returns {number} La norma infinita.
             */
            const iterativos__normInf = (vector) => {
                let max = 0;
                for (let i = 0; i < vector.length; i++) {
                    if (Math.abs(vector[i]) > max) {
                        max = Math.abs(vector[i]);
                    }
                }
                return max;
            };

            /**
             * Resta dos vectores.
             * @param {number[]} v1 - Primer vector.
             * @param {number[]} v2 - Segundo vector.
             * @returns {number[]} Vector resultado.
             */
            const iterativos__subtractVectors = (v1, v2) => {
                return v1.map((val, i) => val - v2[i]);
            };

            /**
             * Método de Jacobi para resolver sistemas de ecuaciones lineales.
             * @param {number[][]} A - Matriz de coeficientes.
             * @param {number[]} b - Vector de términos constantes.
             * @param {number[]} x0 - Vector de estimación inicial.
             * @param {number} tol - Tolerancia de error.
             * @param {number} maxIter - Número máximo de iteraciones.
             * @param {boolean} showSteps - Mostrar pasos detallados.
             * @returns {{solution: number[]|string, steps: string[]}}
             */
            const iterativos__solveJacobi = (A, b, x0, tol, maxIter, showSteps) => {
                const n = A.length;
                const steps = [];
                let x_k = [...x0]; // x^(k)
                let x_k_plus_1 = new Array(n).fill(0); // x^(k+1)

                if (showSteps) {
                    steps.push("Matriz A:");
                    steps.push(iterativos__formatMatrixForSteps(A));
                    steps.push("Vector b:");
                    steps.push(iterativos__formatVectorForSteps(b));
                    steps.push(`Estimación inicial x^(0): ${iterativos__formatVectorForSteps(x0)}`);
                    steps.push("----------------------------------------------------------------------------------------------------");
                    steps.push("Iter | x^(k)                      | x^(k+1)                    | Error");
                    steps.push("----------------------------------------------------------------------------------------------------");
                }

                for (let k = 0; k < maxIter; k++) {
                    for (let i = 0; i < n; i++) {
                        if (A[i][i] === 0) {
                            return { solution: "Error: Elemento diagonal cero. El método de Jacobi no puede continuar.", steps: steps };
                        }
                        let sum = 0;
                        for (let j = 0; j < n; j++) {
                            if (i !== j) {
                                sum += A[i][j] * x_k[j];
                            }
                        }
                        x_k_plus_1[i] = (b[i] - sum) / A[i][i];
                    }

                    const errorVector = iterativos__subtractVectors(x_k_plus_1, x_k);
                    const error = iterativos__normInf(errorVector);

                    if (showSteps) {
                        steps.push(`${(k + 1).toString().padEnd(4)} | ${iterativos__formatVectorForSteps(x_k).padEnd(26)} | ${iterativos__formatVectorForSteps(x_k_plus_1).padEnd(26)} | ${error.toFixed(6)}`);
                    }

                    if (error < tol) {
                        if (showSteps) steps.push("----------------------------------------------------------------------------------------------------");
                        return { solution: x_k_plus_1, steps: steps };
                    }

                    x_k = [...x_k_plus_1]; // Actualizar x^(k) para la siguiente iteración
                }

                return { solution: `No se encontró la solución dentro de la tolerancia en ${maxIter} iteraciones. Última aproximación: ${iterativos__formatVectorForSteps(x_k_plus_1)}`, steps: steps };
            };

            /**
             * Método de Gauss-Seidel para resolver sistemas de ecuaciones lineales.
             * @param {number[][]} A - Matriz de coeficientes.
             * @param {number[]} b - Vector de términos constantes.
             * @param {number[]} x0 - Vector de estimación inicial.
             * @param {number} tol - Tolerancia de error.
             * @param {number} maxIter - Número máximo de iteraciones.
             * @param {boolean} showSteps - Mostrar pasos detallados.
             * @returns {{solution: number[]|string, steps: string[]}}
             */
            const iterativos__solveGaussSeidel = (A, b, x0, tol, maxIter, showSteps) => {
                const n = A.length;
                const steps = [];
                let x_k = [...x0]; // x^(k)
                let x_k_plus_1 = new Array(n).fill(0); // x^(k+1)

                if (showSteps) {
                    steps.push("Matriz A:");
                    steps.push(iterativos__formatMatrixForSteps(A));
                    steps.push("Vector b:");
                    steps.push(iterativos__formatVectorForSteps(b));
                    steps.push(`Estimación inicial x^(0): ${iterativos__formatVectorForSteps(x0)}`);
                    steps.push("----------------------------------------------------------------------------------------------------");
                    steps.push("Iter | x^(k)                      | x^(k+1)                    | Error");
                    steps.push("----------------------------------------------------------------------------------------------------");
                }

                for (let k = 0; k < maxIter; k++) {
                    const prev_x_k = [...x_k]; // Guardar x^(k) para calcular el error al final de la iteración
                    for (let i = 0; i < n; i++) {
                        if (A[i][i] === 0) {
                            return { solution: "Error: Elemento diagonal cero. El método de Gauss-Seidel no puede continuar.", steps: steps };
                        }
                        let sum1 = 0; // Suma de términos con x_j ya actualizados (i < j)
                        let sum2 = 0; // Suma de términos con x_j de la iteración anterior (i > j)
                        for (let j = 0; j < i; j++) {
                            sum1 += A[i][j] * x_k[j]; // Usar el valor ya actualizado en esta iteración
                        }
                        for (let j = i + 1; j < n; j++) {
                            sum2 += A[i][j] * prev_x_k[j]; // Usar el valor de la iteración anterior
                        }
                        x_k[i] = (b[i] - sum1 - sum2) / A[i][i];
                    }
                    x_k_plus_1 = [...x_k]; // x_k ya contiene los valores de x^(k+1)

                    const errorVector = iterativos__subtractVectors(x_k_plus_1, prev_x_k);
                    const error = iterativos__normInf(errorVector);

                    if (showSteps) {
                        steps.push(`${(k + 1).toString().padEnd(4)} | ${iterativos__formatVectorForSteps(prev_x_k).padEnd(26)} | ${iterativos__formatVectorForSteps(x_k_plus_1).padEnd(26)} | ${error.toFixed(6)}`);
                    }

                    if (error < tol) {
                        if (showSteps) steps.push("----------------------------------------------------------------------------------------------------");
                        return { solution: x_k_plus_1, steps: steps };
                    }
                }

                return { solution: `No se encontró la solución dentro de la tolerancia en ${maxIter} iteraciones. Última aproximación: ${iterativos__formatVectorForSteps(x_k_plus_1)}`, steps: steps };
            };


            // --- Event Listeners para botones de método ---
            iterativos__methodButtons.jacobi.addEventListener('click', () => {
                iterativos__showMethodInputs('jacobi');
                const size = parseInt(iterativos__jacobiSizeInput.value);
                iterativos__generateMatrixInputs('iterativos__jacobi-matrix-a-container', size, 'jacobi-a');
                iterativos__generateVectorInputs('iterativos__jacobi-vector-b-container', size, 'jacobi-b', 1);
                iterativos__generateVectorInputs('iterativos__jacobi-vector-x0-container', size, 'jacobi-x0', 0);
            });

            iterativos__methodButtons.gaussSeidel.addEventListener('click', () => {
                iterativos__showMethodInputs('gaussSeidel');
                const size = parseInt(iterativos__gaussSeidelSizeInput.value);
                iterativos__generateMatrixInputs('iterativos__gauss-seidel-matrix-a-container', size, 'gauss-seidel-a');
                iterativos__generateVectorInputs('iterativos__gauss-seidel-vector-b-container', size, 'gauss-seidel-b', 1);
                iterativos__generateVectorInputs('iterativos__gauss-seidel-vector-x0-container', size, 'gauss-seidel-x0', 0);
            });

            // --- Event Listeners para generar sistemas ---
            iterativos__jacobiGenerateSystemBtn.addEventListener('click', () => {
                const size = parseInt(iterativos__jacobiSizeInput.value);
                iterativos__jacobiSizeError.textContent = '';
                if (isNaN(size) || size < 2) {
                    iterativos__jacobiSizeError.textContent = 'El tamaño debe ser un número entero >= 2.';
                    return;
                }
                iterativos__generateMatrixInputs('iterativos__jacobi-matrix-a-container', size, 'jacobi-a');
                iterativos__generateVectorInputs('iterativos__jacobi-vector-b-container', size, 'jacobi-b', 1);
                iterativos__generateVectorInputs('iterativos__jacobi-vector-x0-container', size, 'jacobi-x0', 0);
            });

            iterativos__gaussSeidelGenerateSystemBtn.addEventListener('click', () => {
                const size = parseInt(iterativos__gaussSeidelSizeInput.value);
                iterativos__gaussSeidelSizeError.textContent = '';
                if (isNaN(size) || size < 2) {
                    iterativos__gaussSeidelSizeError.textContent = 'El tamaño debe ser un número entero >= 2.';
                    return;
                }
                iterativos__generateMatrixInputs('iterativos__gauss-seidel-matrix-a-container', size, 'gauss-seidel-a');
                iterativos__generateVectorInputs('iterativos__gauss-seidel-vector-b-container', size, 'gauss-seidel-b', 1);
                iterativos__generateVectorInputs('iterativos__gauss-seidel-vector-x0-container', size, 'gauss-seidel-x0', 0);
            });


            // --- Event Listeners para resolver métodos ---
            iterativos__solveJacobiBtn.addEventListener('click', () => {
                const size = parseInt(iterativos__jacobiSizeInput.value);
                const tol = parseFloat(iterativos__jacobiToleranceInput.value);
                const maxIter = parseInt(iterativos__jacobiMaxIterationsInput.value);
                const showSteps = iterativos__jacobiShowStepsCheckbox.checked;

                // Clear previous errors
                iterativos__jacobiSizeError.textContent = '';
                iterativos__jacobiMatrixAError.textContent = '';
                iterativos__jacobiVectorBError.textContent = '';
                iterativos__jacobiVectorX0Error.textContent = '';
                iterativos__jacobiToleranceError.textContent = '';
                iterativos__jacobiMaxIterationsError.textContent = '';
                iterativos__resultDisplay.innerHTML = 'Calculando...';
                iterativos__stepsDisplay.classList.add('iterativos__hidden');
                iterativos__stepsDisplay.innerHTML = '<h4>Pasos de la Operación:</h4>';

                let isValid = true;
                if (isNaN(size) || size < 2) { iterativos__jacobiSizeError.textContent = 'Tamaño >= 2 requerido.'; isValid = false; }
                if (isNaN(tol) || tol <= 0) { iterativos__jacobiToleranceError.textContent = 'Tolerancia > 0 requerida.'; isValid = false; }
                if (isNaN(maxIter) || maxIter <= 0) { iterativos__jacobiMaxIterationsError.textContent = 'Iteraciones > 0 requeridas.'; isValid = false; }
                
                if (!isValid) {
                    iterativos__resultDisplay.innerHTML = '<p class="iterativos__error-message">Por favor, corrige los errores en los campos de entrada.</p>';
                    return;
                }

                const A = iterativos__getMatrixValues('iterativos__jacobi-matrix-a-container', size, 'jacobi-a', 'iterativos__jacobi-matrix-a-error');
                const b = iterativos__getVectorValues('iterativos__jacobi-vector-b-container', size, 'jacobi-b', 'iterativos__jacobi-vector-b-error');
                const x0 = iterativos__getVectorValues('iterativos__jacobi-vector-x0-container', size, 'jacobi-x0', 'iterativos__jacobi-vector-x0-error');

                if (!A || !b || !x0) {
                    iterativos__resultDisplay.innerHTML = '<p class="iterativos__error-message">Error al leer los valores de la matriz o los vectores.</p>';
                    return;
                }

                const { solution, steps } = iterativos__solveJacobi(A, b, x0, tol, maxIter, showSteps);
                iterativos__displayVectorResult(solution, 'Solución del Sistema (Jacobi)', steps);
            });

            iterativos__solveGaussSeidelBtn.addEventListener('click', () => {
                const size = parseInt(document.getElementById('iterativos__gauss-seidel-size-input').value);
                const tol = parseFloat(document.getElementById('iterativos__gauss-seidel-tolerance-input').value);
                const maxIter = parseInt(document.getElementById('iterativos__gauss-seidel-max-iterations-input').value);
                const showSteps = document.getElementById('iterativos__gauss-seidel-show-steps').checked;

                // Clear previous errors
                iterativos__gaussSeidelSizeError.textContent = '';
                iterativos__gaussSeidelMatrixAError.textContent = '';
                iterativos__gaussSeidelVectorBError.textContent = '';
                iterativos__gaussSeidelVectorX0Error.textContent = '';
                iterativos__gaussSeidelToleranceError.textContent = '';
                iterativos__gaussSeidelMaxIterationsError.textContent = '';
                iterativos__resultDisplay.innerHTML = 'Calculando...';
                iterativos__stepsDisplay.classList.add('iterativos__hidden');
                iterativos__stepsDisplay.innerHTML = '<h4>Pasos de la Operación:</h4>';

                let isValid = true;
                if (isNaN(size) || size < 2) { iterativos__gaussSeidelSizeError.textContent = 'Tamaño >= 2 requerido.'; isValid = false; }
                if (isNaN(tol) || tol <= 0) { iterativos__gaussSeidelToleranceError.textContent = 'Tolerancia > 0 requerida.'; isValid = false; }
                if (isNaN(maxIter) || maxIter <= 0) { iterativos__gaussSeidelMaxIterationsError.textContent = 'Iteraciones > 0 requeridas.'; isValid = false; }
                
                if (!isValid) {
                    iterativos__resultDisplay.innerHTML = '<p class="iterativos__error-message">Por favor, corrige los errores en los campos de entrada.</p>';
                    return;
                }

                const A = iterativos__getMatrixValues('iterativos__gauss-seidel-matrix-a-container', size, 'gauss-seidel-a', 'iterativos__gauss-seidel-matrix-a-error');
                const b = iterativos__getVectorValues('iterativos__gauss-seidel-vector-b-container', size, 'gauss-seidel-b', 'iterativos__gauss-seidel-vector-b-error');
                const x0 = iterativos__getVectorValues('iterativos__gauss-seidel-vector-x0-container', size, 'gauss-seidel-x0', 'iterativos__gauss-seidel-vector-x0-error');

                if (!A || !b || !x0) {
                    iterativos__resultDisplay.innerHTML = '<p class="iterativos__error-message">Error al leer los valores de la matriz o los vectores.</p>';
                    return;
                }

                const { solution, steps } = iterativos__solveGaussSeidel(A, b, x0, tol, maxIter, showSteps);
                iterativos__displayVectorResult(solution, 'Solución del Sistema (Gauss-Seidel)', steps);
            });


            // --- Lógica para el tema oscuro/claro (tomada de tu documento original) ---
            const iterativos__applyTheme = (theme) => {
                const body = document.body;
                const iterativos__iconSun = document.querySelector('.iterativos__icon-sun');
                const iterativos__iconMoon = document.querySelector('.iterativos__icon-moon');
                if (theme === 'dark') {
                    body.classList.add('dark');
                    if (iterativos__iconSun) iterativos__iconSun.classList.add('iterativos__hidden');
                    if (iterativos__iconMoon) iterativos__iconMoon.classList.remove('iterativos__hidden');
                } else {
                    body.classList.remove('dark');
                    if (iterativos__iconSun) iterativos__iconSun.classList.remove('iterativos__hidden');
                    if (iterativos__iconMoon) iterativos__iconMoon.classList.add('iterativos__hidden');
                }
            };

            // Cargar tema guardado
            const savedTheme = localStorage.getItem('theme') || 'light';
            iterativos__applyTheme(savedTheme);

            // Listener para el botón de cambio de tema (si existe en el HTML padre)
            const themeToggleButton = document.getElementById('app__theme-toggle'); // Mantener el ID original si está fuera
            if (themeToggleButton) {
                themeToggleButton.addEventListener('click', () => {
                    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    iterativos__applyTheme(newTheme);
                });
            }

            // Mostrar la sección de Jacobi por defecto al cargar y generar inputs iniciales
            iterativos__showMethodInputs('jacobi');
            iterativos__jacobiGenerateSystemBtn.click(); // Simulate click to generate initial inputs
        });