document.addEventListener('DOMContentLoaded', () => {
            // --- Referencias a elementos del DOM ---
            const determinantes__methodButtons = {
                sarrus: document.getElementById('determinantes__btn-sarrus'),
                cofactor: document.getElementById('determinantes__btn-cofactor'),
                gauss: document.getElementById('determinantes__btn-gauss') // Nuevo botón
            };

            const determinantes__methodInputSections = {
                sarrus: document.getElementById('determinantes__sarrus-inputs'),
                cofactor: document.getElementById('determinantes__cofactor-inputs'),
                gauss: document.getElementById('determinantes__gauss-inputs') // Nueva sección
            };

            const determinantes__resultDisplay = document.getElementById('determinantes__result-display');
            const determinantes__stepsDisplay = document.getElementById('determinantes__steps-display');
            const determinantes__gaussShowStepsCheckbox = document.getElementById('determinantes__gauss-show-steps');

            // --- Funciones de Utilidad ---

            /**
             * Muestra la sección de inputs para el método seleccionado y oculta las demás.
             * @param {string} methodType - El tipo de método ('sarrus', 'cofactor', 'gauss').
             */
            const determinantes__showMethodInputs = (methodType) => {
                for (const key in determinantes__methodInputSections) {
                    if (determinantes__methodInputSections.hasOwnProperty(key)) {
                        if (key === methodType) {
                            determinantes__methodInputSections[key].classList.remove('determinantes__hidden');
                        } else {
                            determinantes__methodInputSections[key].classList.add('determinantes__hidden');
                        }
                    }
                }
                determinantes__resultDisplay.innerHTML = 'El determinante aparecerá aquí.'; // Limpiar resultado
                determinantes__stepsDisplay.classList.add('determinantes__hidden'); // Ocultar pasos
                determinantes__stepsDisplay.innerHTML = '<h4>Pasos de la Operación:</h4>'; // Limpiar pasos
            };

            /**
             * Genera dinámicamente los campos de entrada para una matriz.
             * @param {string} containerId - El ID del contenedor donde se insertarán los inputs.
             * @param {number} rows - Número de filas de la matriz.
             * @param {number} cols - Número de columnas de la matriz.
             * @param {string} matrixPrefix - Prefijo para los IDs de los inputs (ej. 'sarrus', 'cofactor', 'gauss').
             */
            const determinantes__generateMatrixInputs = (containerId, rows, cols, matrixPrefix) => {
                const container = document.getElementById(containerId);
                container.innerHTML = ''; // Limpiar inputs anteriores

                if (rows <= 0 || cols <= 0) {
                    container.innerHTML = '<p class="determinantes__error-message">Las dimensiones deben ser mayores que 0.</p>';
                    return;
                }
                if (rows !== cols) {
                    container.innerHTML = '<p class="determinantes__error-message">La matriz debe ser cuadrada (Filas = Columnas).</p>';
                    return;
                }

                for (let i = 0; i < rows; i++) {
                    const rowDiv = document.createElement('div');
                    rowDiv.classList.add('determinantes__matrix-row');
                    for (let j = 0; j < cols; j++) {
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.classList.add('determinantes__input-text', 'determinantes__matrix-input');
                        input.id = `${matrixPrefix}-matrix-${i}-${j}`;
                        input.placeholder = `[${i+1},${j+1}]`;
                        input.value = '0'; // Valor por defecto
                        rowDiv.appendChild(input);
                    }
                    container.appendChild(rowDiv);
                }
            };

            /**
             * Lee los valores de los inputs de una matriz y los devuelve como un array 2D.
             * @param {string} containerId - El ID del contenedor de los inputs de la matriz.
             * @param {number} rows - Número de filas esperado.
             * @param {number} cols - Número de columnas esperado.
             * @param {string} matrixPrefix - Prefijo de los IDs de los inputs.
             * @param {string} errorElementId - ID del elemento donde mostrar errores.
             * @returns {number[][]|null} La matriz como array 2D o null si hay errores.
             */
            const determinantes__getMatrixValues = (containerId, rows, cols, matrixPrefix, errorElementId) => {
                const errorElement = document.getElementById(errorElementId);
                errorElement.textContent = ''; // Limpiar errores previos
                const matrix = [];
                for (let i = 0; i < rows; i++) {
                    const row = [];
                    for (let j = 0; j < cols; j++) {
                        const input = document.getElementById(`${matrixPrefix}-matrix-${i}-${j}`);
                        if (!input) {
                            errorElement.textContent = `Error: No se encontró el input ${matrixPrefix}-matrix-${i}-${j}. Genera la matriz primero.`;
                            return null;
                        }
                        const value = parseFloat(input.value);
                        if (isNaN(value)) {
                            errorElement.textContent = `Error: El valor en [${i+1},${j+1}] no es un número.`;
                            return null;
                        }
                        row.push(value);
                    }
                    matrix.push(row);
                }
                return matrix;
            };

            /**
             * Muestra el resultado del determinante y opcionalmente los pasos.
             * @param {number|string} result - El valor del determinante o un mensaje de error.
             * @param {string} title - Título a mostrar.
             * @param {string[]} [steps] - Array de strings con los pasos (opcional).
             */
            const determinantes__displayResult = (result, title = "Determinante", steps = []) => {
                let html = `<h4>${title}</h4>`;
                if (typeof result === 'number') {
                    html += `<div class="determinantes__result-value">${result.toFixed(4)}</div>`; // Redondear para visualización
                } else {
                    html += `<p class="determinantes__error-message">${result}</p>`;
                }
                determinantes__resultDisplay.innerHTML = html;

                if (steps.length > 0) {
                    let stepsHtml = '<h4>Pasos de la Operación:</h4>';
                    steps.forEach((step, index) => {
                        stepsHtml += `<p>${index + 1}. ${step}</p>`;
                    });
                    determinantes__stepsDisplay.innerHTML = stepsHtml;
                    determinantes__stepsDisplay.classList.remove('determinantes__hidden');
                } else {
                    determinantes__stepsDisplay.classList.add('determinantes__hidden');
                    determinantes__stepsDisplay.innerHTML = '<h4>Pasos de la Operación:</h4>';
                }
            };

            // --- Lógica de cálculo de Determinantes ---

            /**
             * Calcula el determinante de una matriz 2x2 o 3x3 usando la Regla de Sarrus.
             * @param {number[][]} matrix - La matriz.
             * @returns {number|string} El determinante o un mensaje de error.
             */
            const determinantes__calculateDeterminantSarrus = (matrix) => {
                const rows = matrix.length;
                const cols = matrix[0].length;

                if (rows !== cols) {
                    return "Error: La matriz debe ser cuadrada para calcular el determinante.";
                }
                if (rows < 2 || rows > 3) {
                    return "Error: La Regla de Sarrus solo aplica para matrices 2x2 o 3x3.";
                }

                if (rows === 2) {
                    return (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0]);
                } else if (rows === 3) {
                    return (
                        (matrix[0][0] * matrix[1][1] * matrix[2][2]) +
                        (matrix[0][1] * matrix[1][2] * matrix[2][0]) +
                        (matrix[0][2] * matrix[1][0] * matrix[2][1])
                    ) - (
                        (matrix[0][2] * matrix[1][1] * matrix[2][0]) +
                        (matrix[0][0] * matrix[1][2] * matrix[2][1]) +
                        (matrix[0][1] * matrix[1][0] * matrix[2][2])
                    );
                }
            };

            /**
             * Obtiene la submatriz (menor) para la expansión por cofactores.
             * @param {number[][]} matrix - La matriz original.
             * @param {number} rowToRemove - Índice de la fila a remover.
             * @param {number} colToRemove - Índice de la columna a remover.
             * @returns {number[][]} La submatriz.
             */
            const determinantes__getMinor = (matrix, rowToRemove, colToRemove) => {
                return matrix.filter((row, rowIndex) => rowIndex !== rowToRemove)
                             .map(row => row.filter((col, colIndex) => colIndex !== colToRemove));
            };

            /**
             * Calcula el determinante de una matriz NxN usando la Expansión por Cofactores (recursivo).
             * @param {number[][]} matrix - La matriz.
             * @returns {number|string} El determinante o un mensaje de error.
             */
            const determinantes__calculateDeterminantCofactor = (matrix) => {
                const n = matrix.length;
                if (n === 0) return 0;
                if (matrix[0].length !== n) {
                    return "Error: La matriz debe ser cuadrada para calcular el determinante.";
                }

                if (n === 1) {
                    return matrix[0][0];
                }
                if (n === 2) {
                    return (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0]);
                }

                let det = 0;
                for (let j = 0; j < n; j++) {
                    const minor = determinantes__getMinor(matrix, 0, j);
                    const cofactor = matrix[0][j] * determinantes__calculateDeterminantCofactor(minor);
                    det += (j % 2 === 0 ? 1 : -1) * cofactor;
                }
                return det;
            };

            /**
             * Calcula el determinante de una matriz NxN usando Eliminación Gaussiana.
             * @param {number[][]} matrix - La matriz.
             * @param {boolean} showSteps - Si se deben registrar los pasos.
             * @returns {{determinant: number|string, steps: string[]}} Objeto con el determinante y los pasos.
             */
            const determinantes__calculateDeterminantGauss = (matrix, showSteps) => {
                const n = matrix.length;
                const steps = [];
                let detMultiplier = 1;

                if (n === 0) return { determinant: 0, steps: ["Matriz vacía."] };
                if (matrix[0].length !== n) {
                    return { determinant: "Error: La matriz debe ser cuadrada para calcular el determinante.", steps: [] };
                }

                // Crear una copia profunda de la matriz para no modificar la original
                const A = matrix.map(row => [...row]);

                if (showSteps) {
                    steps.push("Matriz inicial:");
                    steps.push(determinantes__formatMatrixForSteps(A));
                }

                for (let k = 0; k < n; k++) {
                    // Encontrar el pivote (elemento más grande en la columna actual)
                    let pivotRow = k;
                    for (let i = k + 1; i < n; i++) {
                        if (Math.abs(A[i][k]) > Math.abs(A[pivotRow][k])) {
                            pivotRow = i;
                        }
                    }

                    // Intercambiar filas si el pivote no está en la posición actual
                    if (pivotRow !== k) {
                        [A[k], A[pivotRow]] = [A[pivotRow], A[k]];
                        detMultiplier *= -1; // Intercambio de filas cambia el signo del determinante
                        if (showSteps) {
                            steps.push(`Intercambio de filas R${k + 1} <-> R${pivotRow + 1}. Determinante multiplicado por -1.`);
                            steps.push(determinantes__formatMatrixForSteps(A));
                        }
                    }

                    // Si el pivote es cero, el determinante es cero
                    if (A[k][k] === 0) {
                        return { determinant: 0, steps: showSteps ? [...steps, `Pivote A[${k+1}][${k+1}] es 0. El determinante es 0.`] : [] };
                    }

                    // Eliminar elementos debajo del pivote
                    for (let i = k + 1; i < n; i++) {
                        const factor = A[i][k] / A[k][k];
                        if (factor !== 0) {
                            if (showSteps) {
                                steps.push(`R${i + 1} = R${i + 1} - (${factor.toFixed(4)}) * R${k + 1}`);
                            }
                            for (let j = k; j < n; j++) {
                                A[i][j] -= factor * A[k][j];
                            }
                            if (showSteps) {
                                steps.push(determinantes__formatMatrixForSteps(A));
                            }
                        }
                    }
                }

                // El determinante es el producto de los elementos de la diagonal principal
                // multiplicado por el factor de cambio de signo por los intercambios de filas.
                let determinant = detMultiplier;
                for (let i = 0; i < n; i++) {
                    determinant *= A[i][i];
                }

                if (showSteps) {
                    steps.push("Matriz en forma escalonada por filas:");
                    steps.push(determinantes__formatMatrixForSteps(A));
                    steps.push(`Determinante = ${detMultiplier} * (${A.map(row => row[row.indexOf(row.find(val => val !== 0))]).filter(val => val !== undefined).join(' * ') || '1'}) = ${determinant.toFixed(4)}`);
                }

                return { determinant: determinant, steps: steps };
            };

            /**
             * Formatea una matriz para mostrarla en los pasos.
             * @param {number[][]} matrix - La matriz a formatear.
             * @returns {string} Representación de la matriz en string.
             */
            const determinantes__formatMatrixForSteps = (matrix) => {
                let formatted = "";
                matrix.forEach(row => {
                    formatted += "[ " + row.map(val => val.toFixed(2)).join(", ") + " ]<br>";
                });
                return formatted;
            };


            // --- Event Listeners para botones de método ---
            determinantes__methodButtons.sarrus.addEventListener('click', () => {
                determinantes__showMethodInputs('sarrus');
                // Generar matriz 3x3 por defecto al seleccionar Sarrus
                document.getElementById('determinantes__sarrus-rows').value = 3;
                document.getElementById('determinantes__sarrus-cols').value = 3;
                determinantes__generateMatrixInputs('determinantes__sarrus-matrix-container', 3, 3, 'sarrus');
            });

            determinantes__methodButtons.cofactor.addEventListener('click', () => {
                determinantes__showMethodInputs('cofactor');
                // Generar matriz 3x3 por defecto al seleccionar Cofactores
                document.getElementById('determinantes__cofactor-rows').value = 3;
                document.getElementById('determinantes__cofactor-cols').value = 3;
                determinantes__generateMatrixInputs('determinantes__cofactor-matrix-container', 3, 3, 'cofactor');
            });

            determinantes__methodButtons.gauss.addEventListener('click', () => {
                determinantes__showMethodInputs('gauss');
                // Generar matriz 3x3 por defecto al seleccionar Gauss
                document.getElementById('determinantes__gauss-rows').value = 3;
                document.getElementById('determinantes__gauss-cols').value = 3;
                determinantes__generateMatrixInputs('determinantes__gauss-matrix-container', 3, 3, 'gauss');
            });

            // --- Event Listeners para generar matrices ---
            document.getElementById('determinantes__sarrus-generate').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('determinantes__sarrus-rows').value);
                const cols = parseInt(document.getElementById('determinantes__sarrus-cols').value);
                document.getElementById('determinantes__sarrus-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows < 2 || rows > 3 || cols < 2 || cols > 3 || rows !== cols) {
                    document.getElementById('determinantes__sarrus-error').textContent = 'Dimensiones inválidas. Sarrus solo para 2x2 o 3x3 cuadradas.';
                    return;
                }
                determinantes__generateMatrixInputs('determinantes__sarrus-matrix-container', rows, cols, 'sarrus');
            });

            document.getElementById('determinantes__cofactor-generate').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('determinantes__cofactor-rows').value);
                const cols = parseInt(document.getElementById('determinantes__cofactor-cols').value);
                document.getElementById('determinantes__cofactor-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0 || rows !== cols) {
                    document.getElementById('determinantes__cofactor-error').textContent = 'Dimensiones inválidas. La matriz debe ser cuadrada y > 0.';
                    return;
                }
                determinantes__generateMatrixInputs('determinantes__cofactor-matrix-container', rows, cols, 'cofactor');
            });

            document.getElementById('determinantes__gauss-generate').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('determinantes__gauss-rows').value);
                const cols = parseInt(document.getElementById('determinantes__gauss-cols').value);
                document.getElementById('determinantes__gauss-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0 || rows !== cols) {
                    document.getElementById('determinantes__gauss-error').textContent = 'Dimensiones inválidas. La matriz debe ser cuadrada y > 0.';
                    return;
                }
                determinantes__generateMatrixInputs('determinantes__gauss-matrix-container', rows, cols, 'gauss');
            });


            // --- Event Listeners para resolver determinantes ---
            document.getElementById('determinantes__solve-sarrus').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('determinantes__sarrus-rows').value);
                const cols = parseInt(document.getElementById('determinantes__sarrus-cols').value);
                const matrix = determinantes__getMatrixValues('determinantes__sarrus-matrix-container', rows, cols, 'sarrus', 'determinantes__sarrus-error');

                if (matrix) {
                    const result = determinantes__calculateDeterminantSarrus(matrix);
                    determinantes__displayResult(result, 'Determinante (Sarrus)');
                }
            });

            document.getElementById('determinantes__solve-cofactor').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('determinantes__cofactor-rows').value);
                const cols = parseInt(document.getElementById('determinantes__cofactor-cols').value);
                const matrix = determinantes__getMatrixValues('determinantes__cofactor-matrix-container', rows, cols, 'cofactor', 'determinantes__cofactor-error');

                if (matrix) {
                    const result = determinantes__calculateDeterminantCofactor(matrix);
                    determinantes__displayResult(result, 'Determinante (Cofactores)');
                }
            });

            document.getElementById('determinantes__solve-gauss').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('determinantes__gauss-rows').value);
                const cols = parseInt(document.getElementById('determinantes__gauss-cols').value);
                const showSteps = determinantes__gaussShowStepsCheckbox.checked;
                const matrix = determinantes__getMatrixValues('determinantes__gauss-matrix-container', rows, cols, 'gauss', 'determinantes__gauss-error');

                if (matrix) {
                    const { determinant, steps } = determinantes__calculateDeterminantGauss(matrix, showSteps);
                    determinantes__displayResult(determinant, 'Determinante (Gaussiana)', steps);
                }
            });


            // --- Lógica para el tema oscuro/claro (tomada de tu documento original) ---
            const determinantes__applyTheme = (theme) => {
                const body = document.body;
                const determinantes__iconSun = document.querySelector('.determinantes__icon-sun');
                const determinantes__iconMoon = document.querySelector('.determinantes__icon-moon');
                if (theme === 'dark') {
                    body.classList.add('dark');
                    if (determinantes__iconSun) determinantes__iconSun.classList.add('determinantes__hidden');
                    if (determinantes__iconMoon) determinantes__iconMoon.classList.remove('determinantes__hidden');
                } else {
                    body.classList.remove('dark');
                    if (determinantes__iconSun) determinantes__iconSun.classList.remove('determinantes__hidden');
                    if (determinantes__iconMoon) determinantes__iconMoon.classList.add('determinantes__hidden');
                }
            };

            // Cargar tema guardado
            const savedTheme = localStorage.getItem('theme') || 'light';
            determinantes__applyTheme(savedTheme);

            // Listener para el botón de cambio de tema (si existe en el HTML padre)
            const themeToggleButton = document.getElementById('app__theme-toggle'); // Mantener el ID original si está fuera
            if (themeToggleButton) {
                themeToggleButton.addEventListener('click', () => {
                    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    determinantes__applyTheme(newTheme);
                });
            }

            // Mostrar la sección de Sarrus por defecto al cargar
            determinantes__showMethodInputs('sarrus');
            document.getElementById('determinantes__sarrus-generate').click(); // Simular clic para generar inputs iniciales
        });