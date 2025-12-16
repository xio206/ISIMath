document.addEventListener('DOMContentLoaded', () => {
            // --- Referencias a elementos del DOM ---
            const inversa__methodButtons = {
                gaussJordan: document.getElementById('inversa__btn-gauss-jordan'),
                adjunta: document.getElementById('inversa__btn-adjunta')
            };

            const inversa__methodInputSections = {
                gaussJordan: document.getElementById('inversa__gauss-jordan-inputs'),
                adjunta: document.getElementById('inversa__adjunta-inputs')
            };

            const inversa__resultDisplay = document.getElementById('inversa__result-display');
            const inversa__stepsDisplay = document.getElementById('inversa__steps-display');
            const inversa__gaussJordanShowStepsCheckbox = document.getElementById('inversa__gauss-jordan-show-steps');
            const inversa__adjuntaShowStepsCheckbox = document.getElementById('inversa__adjunta-show-steps');


            // --- Funciones de Utilidad ---

            /**
             * Muestra la sección de inputs para el método seleccionado y oculta las demás.
             * @param {string} methodType - El tipo de método ('gaussJordan', 'adjunta').
             */
            const inversa__showMethodInputs = (methodType) => {
                for (const key in inversa__methodInputSections) {
                    if (inversa__methodInputSections.hasOwnProperty(key)) {
                        if (key === methodType) {
                            inversa__methodInputSections[key].classList.remove('inversa__hidden');
                        } else {
                            inversa__methodInputSections[key].classList.add('inversa__hidden');
                        }
                    }
                }
                inversa__resultDisplay.innerHTML = 'La matriz inversa aparecerá aquí.'; // Limpiar resultado
                inversa__stepsDisplay.classList.add('inversa__hidden'); // Ocultar pasos
                inversa__stepsDisplay.innerHTML = '<h4>Pasos de la Operación:</h4>'; // Limpiar pasos
            };

            /**
             * Genera dinámicamente los campos de entrada para una matriz.
             * @param {string} containerId - El ID del contenedor donde se insertarán los inputs.
             * @param {number} rows - Número de filas de la matriz.
             * @param {number} cols - Número de columnas de la matriz.
             * @param {string} matrixPrefix - Prefijo para los IDs de los inputs (ej. 'gauss-jordan', 'adjunta').
             */
            const inversa__generateMatrixInputs = (containerId, rows, cols, matrixPrefix) => {
                const container = document.getElementById(containerId);
                container.innerHTML = ''; // Limpiar inputs anteriores

                if (rows <= 0 || cols <= 0) {
                    container.innerHTML = '<p class="inversa__error-message">Las dimensiones deben ser mayores que 0.</p>';
                    return;
                }
                if (rows !== cols) {
                    container.innerHTML = '<p class="inversa__error-message">La matriz debe ser cuadrada (Filas = Columnas).</p>';
                    return;
                }

                for (let i = 0; i < rows; i++) {
                    const rowDiv = document.createElement('div');
                    rowDiv.classList.add('inversa__matrix-row');
                    for (let j = 0; j < cols; j++) {
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.classList.add('inversa__input-text', 'inversa__matrix-input');
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
            const inversa__getMatrixValues = (containerId, rows, cols, matrixPrefix, errorElementId) => {
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
             * Muestra una matriz en el div de resultados.
             * @param {number[][]} matrix - La matriz a mostrar.
             * @param {string} title - Título a mostrar encima de la matriz.
             */
            const inversa__displayMatrix = (matrix, title = "Matriz Resultado") => {
                let html = `<h4>${title}</h4>`;
                if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
                    html += '<p>Matriz vacía o inválida.</p>';
                } else {
                    html += '<table class="inversa__matrix-table">';
                    for (let i = 0; i < matrix.length; i++) {
                        html += '<tr>';
                        for (let j = 0; j < matrix[i].length; j++) {
                            html += `<td>${matrix[i][j].toFixed(4)}</td>`; // Redondear para visualización
                        }
                        html += '</tr>';
                    }
                    html += '</table>';
                }
                return html;
            };

            /**
             * Muestra el resultado de la inversa y opcionalmente los pasos.
             * @param {number[][]|string} result - La matriz inversa o un mensaje de error.
             * @param {string} title - Título a mostrar.
             * @param {string[]} [steps] - Array de strings con los pasos (opcional).
             */
            const inversa__displayResult = (result, title = "Matriz Inversa", steps = []) => {
                if (typeof result === 'string') {
                    inversa__resultDisplay.innerHTML = `<p class="inversa__error-message">${result}</p>`;
                } else {
                    inversa__resultDisplay.innerHTML = inversa__displayMatrix(result, title);
                }

                if (steps.length > 0) {
                    let stepsHtml = '<h4>Pasos de la Operación:</h4>';
                    steps.forEach((step, index) => {
                        stepsHtml += `<p>${index + 1}. ${step}</p>`;
                    });
                    inversa__stepsDisplay.innerHTML = stepsHtml;
                    inversa__stepsDisplay.classList.remove('inversa__hidden');
                } else {
                    inversa__stepsDisplay.classList.add('inversa__hidden');
                    inversa__stepsDisplay.innerHTML = '<h4>Pasos de la Operación:</h4>';
                }
            };

            /**
             * Formatea una matriz para mostrarla en los pasos.
             * @param {number[][]} matrix - La matriz a formatear.
             * @returns {string} Representación de la matriz en string.
             */
            const inversa__formatMatrixForSteps = (matrix) => {
                let formatted = "";
                matrix.forEach(row => {
                    formatted += "[ " + row.map(val => val.toFixed(4)).join(", ") + " ]<br>";
                });
                return formatted;
            };

            /**
             * Formatea una matriz aumentada para mostrarla en los pasos.
             * @param {number[][]} matrix - La matriz aumentada a formatear.
             * @param {number} n - Dimensión de la matriz original (para separar A de I).
             * @returns {string} Representación de la matriz aumentada en string.
             */
            const inversa__formatAugmentedMatrixForSteps = (matrix, n) => {
                let formatted = "";
                matrix.forEach(row => {
                    const leftPart = row.slice(0, n).map(val => val.toFixed(4)).join(", ");
                    const rightPart = row.slice(n).map(val => val.toFixed(4)).join(", ");
                    formatted += `[ ${leftPart} | ${rightPart} ]<br>`;
                });
                return formatted;
            };

            // --- Lógica de cálculo de Inversas ---

            /**
             * Calcula la inversa de una matriz NxN usando el método de Gauss-Jordan.
             * @param {number[][]} matrix - La matriz original.
             * @param {boolean} showSteps - Si se deben registrar los pasos.
             * @returns {{inverse: number[][]|string, steps: string[]}} Objeto con la inversa y los pasos.
             */
            const inversa__calculateInverseGaussJordan = (matrix, showSteps) => {
                const n = matrix.length;
                const steps = [];

                if (n === 0) return { inverse: "Error: Matriz vacía.", steps: [] };
                if (matrix[0].length !== n) {
                    return { inverse: "Error: La matriz debe ser cuadrada.", steps: [] };
                }

                // Crear la matriz aumentada [A | I]
                const augmentedMatrix = Array(n).fill(0).map((_, i) =>
                    Array(2 * n).fill(0).map((_, j) => {
                        if (j < n) return matrix[i][j];
                        return (j - n === i) ? 1 : 0;
                    })
                );

                if (showSteps) {
                    steps.push("Matriz aumentada inicial [A | I]:");
                    steps.push(inversa__formatAugmentedMatrixForSteps(augmentedMatrix, n));
                }

                // Aplicar eliminación de Gauss-Jordan
                for (let k = 0; k < n; k++) {
                    // Encontrar el pivote (elemento más grande en la columna k, desde la fila k)
                    let pivotRow = k;
                    for (let i = k + 1; i < n; i++) {
                        if (Math.abs(augmentedMatrix[i][k]) > Math.abs(augmentedMatrix[pivotRow][k])) {
                            pivotRow = i;
                        }
                    }

                    // Intercambiar filas si el pivote no está en la posición actual
                    if (pivotRow !== k) {
                        [augmentedMatrix[k], augmentedMatrix[pivotRow]] = [augmentedMatrix[pivotRow], augmentedMatrix[k]];
                        if (showSteps) {
                            steps.push(`Intercambio de filas R${k + 1} <-> R${pivotRow + 1}`);
                            steps.push(inversa__formatAugmentedMatrixForSteps(augmentedMatrix, n));
                        }
                    }

                    // Si el pivote es cero, la matriz es singular
                    const pivot = augmentedMatrix[k][k];
                    if (Math.abs(pivot) < 1e-9) { // Usar una pequeña tolerancia para cero
                        return { inverse: "Error: La matriz es singular (determinante cero), no tiene inversa.", steps: showSteps ? [...steps, `Pivote A[${k+1}][${k+1}] es cero o muy cercano a cero. Matriz singular.`] : [] };
                    }

                    // Normalizar la fila del pivote (hacer que el pivote sea 1)
                    if (pivot !== 1) {
                        if (showSteps) {
                            steps.push(`Normalizar R${k + 1} (dividir por ${pivot.toFixed(4)}):`);
                        }
                        for (let j = k; j < 2 * n; j++) {
                            augmentedMatrix[k][j] /= pivot;
                        }
                        if (showSteps) {
                            steps.push(inversa__formatAugmentedMatrixForSteps(augmentedMatrix, n));
                        }
                    }

                    // Hacer ceros los elementos por encima y por debajo del pivote
                    for (let i = 0; i < n; i++) {
                        if (i !== k) {
                            const factor = augmentedMatrix[i][k];
                            if (Math.abs(factor) > 1e-9) { // Usar una pequeña tolerancia para cero
                                if (showSteps) {
                                    steps.push(`R${i + 1} = R${i + 1} - (${factor.toFixed(4)}) * R${k + 1}`);
                                }
                                for (let j = k; j < 2 * n; j++) {
                                    augmentedMatrix[i][j] -= factor * augmentedMatrix[k][j];
                                }
                                if (showSteps) {
                                    steps.push(inversa__formatAugmentedMatrixForSteps(augmentedMatrix, n));
                                }
                            }
                        }
                    }
                }

                // La parte derecha de la matriz aumentada es la inversa
                const inverseMatrix = augmentedMatrix.map(row => row.slice(n));

                if (showSteps) {
                    steps.push("Matriz final [I | A⁻¹]:");
                    steps.push(inversa__formatAugmentedMatrixForSteps(augmentedMatrix, n));
                    steps.push("Matriz Inversa A⁻¹:");
                    steps.push(inversa__formatMatrixForSteps(inverseMatrix));
                }

                return { inverse: inverseMatrix, steps: steps };
            };


            // --- Funciones auxiliares para el método de la Adjunta (copiadas y renombradas) ---

            /**
             * Obtiene la submatriz (menor) para la expansión por cofactores.
             * @param {number[][]} matrix - La matriz original.
             * @param {number} rowToRemove - Índice de la fila a remover.
             * @param {number} colToRemove - Índice de la columna a remover.
             * @returns {number[][]} La submatriz.
             */
            const inversa__getMinor = (matrix, rowToRemove, colToRemove) => {
                return matrix.filter((row, rowIndex) => rowIndex !== rowToRemove)
                             .map(row => row.filter((col, colIndex) => colIndex !== colToRemove));
            };

            /**
             * Calcula el determinante de una matriz NxN usando la Expansión por Cofactores (recursivo).
             * @param {number[][]} matrix - La matriz.
             * @returns {number|string} El determinante o un mensaje de error.
             */
            const inversa__calculateDeterminantCofactor = (matrix) => {
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
                    const minor = inversa__getMinor(matrix, 0, j);
                    const cofactor = matrix[0][j] * inversa__calculateDeterminantCofactor(minor);
                    det += (j % 2 === 0 ? 1 : -1) * cofactor;
                }
                return det;
            };

            /**
             * Calcula la inversa de una matriz NxN usando el método de la Matriz Adjunta.
             * @param {number[][]} matrix - La matriz original.
             * @param {boolean} showSteps - Si se deben registrar los pasos.
             * @returns {{inverse: number[][]|string, steps: string[]}} Objeto con la inversa y los pasos.
             */
            const inversa__calculateInverseAdjoint = (matrix, showSteps) => {
                const n = matrix.length;
                const steps = [];

                if (n === 0) return { inverse: "Error: Matriz vacía.", steps: [] };
                if (matrix[0].length !== n) {
                    return { inverse: "Error: La matriz debe ser cuadrada.", steps: [] };
                }

                if (showSteps) {
                    steps.push("Matriz inicial:");
                    steps.push(inversa__formatMatrixForSteps(matrix));
                }

                // 1. Calcular el determinante
                const det = inversa__calculateDeterminantCofactor(matrix);
                if (typeof det !== 'number' || Math.abs(det) < 1e-9) { // Usar tolerancia para cero
                    return { inverse: "Error: La matriz es singular (determinante cero), no tiene inversa.", steps: showSteps ? [...steps, `Determinante es 0 o muy cercano a 0. Matriz singular.`] : [] };
                }
                if (showSteps) {
                    steps.push(`1. Calcular el determinante: det(A) = ${det.toFixed(4)}`);
                }

                // 2. Calcular la matriz de cofactores
                const cofactorMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
                if (showSteps) {
                    steps.push("2. Calcular la matriz de cofactores:");
                }
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        const minor = inversa__getMinor(matrix, i, j);
                        const minorDet = inversa__calculateDeterminantCofactor(minor);
                        cofactorMatrix[i][j] = ((i + j) % 2 === 0 ? 1 : -1) * minorDet;
                    }
                }
                if (showSteps) {
                    steps.push(inversa__formatMatrixForSteps(cofactorMatrix));
                }

                // 3. Calcular la matriz adjunta (traspuesta de la matriz de cofactores)
                const adjointMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
                if (showSteps) {
                    steps.push("3. Calcular la matriz adjunta (traspuesta de la matriz de cofactores):");
                }
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        adjointMatrix[j][i] = cofactorMatrix[i][j]; // Traspuesta
                    }
                }
                if (showSteps) {
                    steps.push(inversa__formatMatrixForSteps(adjointMatrix));
                }

                // 4. Calcular la inversa: A⁻¹ = (1/det(A)) * adj(A)
                const inverseMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
                if (showSteps) {
                    steps.push("4. Calcular la inversa: A⁻¹ = (1/det(A)) * adj(A)");
                    steps.push(`A⁻¹ = (1 / ${det.toFixed(4)}) * adj(A)`);
                }
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        inverseMatrix[i][j] = adjointMatrix[i][j] / det;
                    }
                }
                if (showSteps) {
                    steps.push(inversa__formatMatrixForSteps(inverseMatrix));
                }

                return { inverse: inverseMatrix, steps: steps };
            };


            // --- Event Listeners para botones de método ---
            inversa__methodButtons.gaussJordan.addEventListener('click', () => {
                inversa__showMethodInputs('gaussJordan');
                // Generar matriz 3x3 por defecto al seleccionar Gauss-Jordan
                document.getElementById('inversa__gauss-jordan-rows').value = 3;
                document.getElementById('inversa__gauss-jordan-cols').value = 3;
                inversa__generateMatrixInputs('inversa__gauss-jordan-matrix-container', 3, 3, 'gauss-jordan');
            });

            inversa__methodButtons.adjunta.addEventListener('click', () => {
                inversa__showMethodInputs('adjunta');
                // Generar matriz 3x3 por defecto al seleccionar Adjunta
                document.getElementById('inversa__adjunta-rows').value = 3;
                document.getElementById('inversa__adjunta-cols').value = 3;
                inversa__generateMatrixInputs('inversa__adjunta-matrix-container', 3, 3, 'adjunta');
            });

            // --- Event Listeners para generar matrices ---
            document.getElementById('inversa__gauss-jordan-generate').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('inversa__gauss-jordan-rows').value);
                const cols = parseInt(document.getElementById('inversa__gauss-jordan-cols').value);
                document.getElementById('inversa__gauss-jordan-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0 || rows !== cols) {
                    document.getElementById('inversa__gauss-jordan-error').textContent = 'Dimensiones inválidas. La matriz debe ser cuadrada y > 0.';
                    return;
                }
                inversa__generateMatrixInputs('inversa__gauss-jordan-matrix-container', rows, cols, 'gauss-jordan');
            });

            document.getElementById('inversa__adjunta-generate').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('inversa__adjunta-rows').value);
                const cols = parseInt(document.getElementById('inversa__adjunta-cols').value);
                document.getElementById('inversa__adjunta-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0 || rows !== cols) {
                    document.getElementById('inversa__adjunta-error').textContent = 'Dimensiones inválidas. La matriz debe ser cuadrada y > 0.';
                    return;
                }
                inversa__generateMatrixInputs('inversa__adjunta-matrix-container', rows, cols, 'adjunta');
            });


            // --- Event Listeners para resolver inversas ---
            document.getElementById('inversa__solve-gauss-jordan').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('inversa__gauss-jordan-rows').value);
                const cols = parseInt(document.getElementById('inversa__gauss-jordan-cols').value);
                const showSteps = inversa__gaussJordanShowStepsCheckbox.checked;
                const matrix = inversa__getMatrixValues('inversa__gauss-jordan-matrix-container', rows, cols, 'gauss-jordan', 'inversa__gauss-jordan-error');

                if (matrix) {
                    const { inverse, steps } = inversa__calculateInverseGaussJordan(matrix, showSteps);
                    inversa__displayResult(inverse, 'Matriz Inversa (Gauss-Jordan)', steps);
                }
            });

            document.getElementById('inversa__solve-adjunta').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('inversa__adjunta-rows').value);
                const cols = parseInt(document.getElementById('inversa__adjunta-cols').value);
                const showSteps = inversa__adjuntaShowStepsCheckbox.checked;
                const matrix = inversa__getMatrixValues('inversa__adjunta-matrix-container', rows, cols, 'adjunta', 'inversa__adjunta-error');

                if (matrix) {
                    const { inverse, steps } = inversa__calculateInverseAdjoint(matrix, showSteps);
                    inversa__displayResult(inverse, 'Matriz Inversa (Adjunta)', steps);
                }
            });


            // --- Lógica para el tema oscuro/claro (tomada de tu documento original) ---
            const inversa__applyTheme = (theme) => {
                const body = document.body;
                const inversa__iconSun = document.querySelector('.inversa__icon-sun');
                const inversa__iconMoon = document.querySelector('.inversa__icon-moon');
                if (theme === 'dark') {
                    body.classList.add('dark');
                    if (inversa__iconSun) inversa__iconSun.classList.add('inversa__hidden');
                    if (inversa__iconMoon) inversa__iconMoon.classList.remove('inversa__hidden');
                } else {
                    body.classList.remove('dark');
                    if (inversa__iconSun) inversa__iconSun.classList.remove('inversa__hidden');
                    if (inversa__iconMoon) inversa__iconMoon.classList.add('inversa__hidden');
                }
            };

            // Cargar tema guardado
            const savedTheme = localStorage.getItem('theme') || 'light';
            inversa__applyTheme(savedTheme);

            // Listener para el botón de cambio de tema (si existe en el HTML padre)
            const themeToggleButton = document.getElementById('app__theme-toggle'); // Mantener el ID original si está fuera
            if (themeToggleButton) {
                themeToggleButton.addEventListener('click', () => {
                    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    inversa__applyTheme(newTheme);
                });
            }

            // Mostrar la sección de Gauss-Jordan por defecto al cargar
            inversa__showMethodInputs('gaussJordan');
            document.getElementById('inversa__gauss-jordan-generate').click(); // Simular clic para generar inputs iniciales
        });