document.addEventListener('DOMContentLoaded', () => {
            // --- Referencias a elementos del DOM ---
            const calculadoraMatriz__operationButtons = {
                suma: document.getElementById('calculadoraMatriz__btn-suma'),
                resta: document.getElementById('calculadoraMatriz__btn-resta'),
                multiplicacion: document.getElementById('calculadoraMatriz__btn-multiplicacion'),
                traspuesta: document.getElementById('calculadoraMatriz__btn-traspuesta')
            };

            const calculadoraMatriz__operationInputSections = {
                suma: document.getElementById('calculadoraMatriz__suma-inputs'),
                resta: document.getElementById('calculadoraMatriz__resta-inputs'),
                multiplicacion: document.getElementById('calculadoraMatriz__multiplicacion-inputs'),
                traspuesta: document.getElementById('calculadoraMatriz__traspuesta-inputs')
            };

            const calculadoraMatriz__resultDisplay = document.getElementById('calculadoraMatriz__result-display');

            // --- Funciones de Utilidad ---

            /**
             * Muestra la sección de inputs para la operación seleccionada y oculta las demás.
             * @param {string} operationType - El tipo de operación ('suma', 'resta', 'multiplicacion', 'traspuesta').
             */
            const calculadoraMatriz__showOperationInputs = (operationType) => {
                for (const key in calculadoraMatriz__operationInputSections) {
                    if (calculadoraMatriz__operationInputSections.hasOwnProperty(key)) {
                        if (key === operationType) {
                            calculadoraMatriz__operationInputSections[key].classList.remove('calculadoraMatriz__hidden');
                        } else {
                            calculadoraMatriz__operationInputSections[key].classList.add('calculadoraMatriz__hidden');
                        }
                    }
                }
                calculadoraMatriz__resultDisplay.innerHTML = 'El resultado de la operación aparecerá aquí.'; // Limpiar resultado
            };

            /**
             * Genera dinámicamente los campos de entrada para una matriz.
             * @param {string} containerId - El ID del contenedor donde se insertarán los inputs.
             * @param {number} rows - Número de filas de la matriz.
             * @param {number} cols - Número de columnas de la matriz.
             * @param {string} matrixPrefix - Prefijo para los IDs de los inputs (ej. 'suma-a', 'resta-b').
             */
            const calculadoraMatriz__generateMatrixInputs = (containerId, rows, cols, matrixPrefix) => {
                const container = document.getElementById(containerId);
                container.innerHTML = ''; // Limpiar inputs anteriores

                if (rows <= 0 || cols <= 0) {
                    container.innerHTML = '<p class="calculadoraMatriz__error-message">Las dimensiones deben ser mayores que 0.</p>';
                    return;
                }

                for (let i = 0; i < rows; i++) {
                    const rowDiv = document.createElement('div');
                    rowDiv.classList.add('calculadoraMatriz__matrix-row');
                    for (let j = 0; j < cols; j++) {
                        const input = document.createElement('input');
                        input.type = 'number'; // Usar number para validación automática
                        input.classList.add('calculadoraMatriz__input-text', 'calculadoraMatriz__matrix-input');
                        input.id = `${matrixPrefix}-${i}-${j}`;
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
            const calculadoraMatriz__getMatrixValues = (containerId, rows, cols, matrixPrefix, errorElementId) => {
                const errorElement = document.getElementById(errorElementId);
                errorElement.textContent = ''; // Limpiar errores previos
                const matrix = [];
                for (let i = 0; i < rows; i++) {
                    const row = [];
                    for (let j = 0; j < cols; j++) {
                        const input = document.getElementById(`${matrixPrefix}-${i}-${j}`);
                        if (!input) {
                            errorElement.textContent = `Error: No se encontró el input ${matrixPrefix}-${i}-${j}. Genera la matriz primero.`;
                            return null;
                        }
                        const value = parseFloat(input.value);
                        if (isNaN(value)) {
                            errorElement.textContent = `Error: El valor en [${i+1},${j+1}] de la matriz ${matrixPrefix.toUpperCase()} no es un número.`;
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
            const calculadoraMatriz__displayMatrix = (matrix, title = "Matriz Resultado") => {
                let html = `<h4>${title}</h4>`;
                if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
                    html += '<p>Matriz vacía o inválida.</p>';
                } else {
                    html += '<table class="calculadoraMatriz__matrix-table">';
                    for (let i = 0; i < matrix.length; i++) {
                        html += '<tr>';
                        for (let j = 0; j < matrix[i].length; j++) {
                            html += `<td>${matrix[i][j].toFixed(4)}</td>`; // Redondear para visualización
                        }
                        html += '</tr>';
                    }
                    html += '</table>';
                }
                calculadoraMatriz__resultDisplay.innerHTML = html;
            };

            /**
             * Realiza la suma de dos matrices.
             * @param {number[][]} matrixA
             * @param {number[][]} matrixB
             * @returns {number[][]|null} Matriz resultado o null si las dimensiones no coinciden.
             */
            const calculadoraMatriz__addMatrices = (matrixA, matrixB) => {
                if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
                    calculadoraMatriz__resultDisplay.innerHTML = '<p class="calculadoraMatriz__error-message">Error: Las matrices deben tener las mismas dimensiones para la suma.</p>';
                    return null;
                }
                const result = [];
                for (let i = 0; i < matrixA.length; i++) {
                    const row = [];
                    for (let j = 0; j < matrixA[0].length; j++) {
                        row.push(matrixA[i][j] + matrixB[i][j]);
                    }
                    result.push(row);
                }
                return result;
            };

            /**
             * Realiza la resta de dos matrices.
             * @param {number[][]} matrixA
             * @param {number[][]} matrixB
             * @returns {number[][]|null} Matriz resultado o null si las dimensiones no coinciden.
             */
            const calculadoraMatriz__subtractMatrices = (matrixA, matrixB) => {
                if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
                    calculadoraMatriz__resultDisplay.innerHTML = '<p class="calculadoraMatriz__error-message">Error: Las matrices deben tener las mismas dimensiones para la resta.</p>';
                    return null;
                }
                const result = [];
                for (let i = 0; i < matrixA.length; i++) {
                    const row = [];
                    for (let j = 0; j < matrixA[0].length; j++) {
                        row.push(matrixA[i][j] - matrixB[i][j]);
                    }
                    result.push(row);
                }
                return result;
            };

            /**
             * Realiza la multiplicación de dos matrices.
             * @param {number[][]} matrixA
             * @param {number[][]} matrixB
             * @returns {number[][]|null} Matriz resultado o null si las dimensiones no son compatibles.
             */
            const calculadoraMatriz__multiplyMatrices = (matrixA, matrixB) => {
                const rowsA = matrixA.length;
                const colsA = matrixA[0].length;
                const rowsB = matrixB.length;
                const colsB = matrixB[0].length;

                if (colsA !== rowsB) {
                    calculadoraMatriz__resultDisplay.innerHTML = '<p class="calculadoraMatriz__error-message">Error: El número de columnas de la Matriz A debe ser igual al número de filas de la Matriz B para la multiplicación.</p>';
                    return null;
                }

                const result = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

                for (let i = 0; i < rowsA; i++) {
                    for (let j = 0; j < colsB; j++) {
                        for (let k = 0; k < colsA; k++) {
                            result[i][j] += matrixA[i][k] * matrixB[k][j];
                        }
                    }
                }
                return result;
            };

            /**
             * Realiza la traspuesta de una matriz.
             * @param {number[][]} matrix
             * @returns {number[][]} Matriz traspuesta.
             */
            const calculadoraMatriz__transposeMatrix = (matrix) => {
                const rows = matrix.length;
                const cols = matrix[0].length;
                const result = Array(cols).fill(0).map(() => Array(rows).fill(0));

                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        result[j][i] = matrix[i][j];
                    }
                }
                return result;
            };

            // --- Event Listeners para botones de operación ---
            calculadoraMatriz__operationButtons.suma.addEventListener('click', () => {
                calculadoraMatriz__showOperationInputs('suma');
                // Generar matrices 2x2 por defecto al seleccionar
                document.getElementById('calculadoraMatriz__suma-a-rows').value = 2;
                document.getElementById('calculadoraMatriz__suma-a-cols').value = 2;
                document.getElementById('calculadoraMatriz__suma-b-rows').value = 2;
                document.getElementById('calculadoraMatriz__suma-b-cols').value = 2;
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__suma-matrix-a-container', 2, 2, 'suma-a');
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__suma-matrix-b-container', 2, 2, 'suma-b');
            });

            calculadoraMatriz__operationButtons.resta.addEventListener('click', () => {
                calculadoraMatriz__showOperationInputs('resta');
                document.getElementById('calculadoraMatriz__resta-a-rows').value = 2;
                document.getElementById('calculadoraMatriz__resta-a-cols').value = 2;
                document.getElementById('calculadoraMatriz__resta-b-rows').value = 2;
                document.getElementById('calculadoraMatriz__resta-b-cols').value = 2;
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__resta-matrix-a-container', 2, 2, 'resta-a');
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__resta-matrix-b-container', 2, 2, 'resta-b');
            });

            calculadoraMatriz__operationButtons.multiplicacion.addEventListener('click', () => {
                calculadoraMatriz__showOperationInputs('multiplicacion');
                document.getElementById('calculadoraMatriz__multiplicacion-a-rows').value = 2;
                document.getElementById('calculadoraMatriz__multiplicacion-a-cols').value = 2;
                document.getElementById('calculadoraMatriz__multiplicacion-b-rows').value = 2;
                document.getElementById('calculadoraMatriz__multiplicacion-b-cols').value = 2;
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__multiplicacion-matrix-a-container', 2, 2, 'multiplicacion-a');
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__multiplicacion-matrix-b-container', 2, 2, 'multiplicacion-b');
            });

            calculadoraMatriz__operationButtons.traspuesta.addEventListener('click', () => {
                calculadoraMatriz__showOperationInputs('traspuesta');
                document.getElementById('calculadoraMatriz__traspuesta-a-rows').value = 2;
                document.getElementById('calculadoraMatriz__traspuesta-a-cols').value = 2;
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__traspuesta-matrix-a-container', 2, 2, 'traspuesta-a');
            });

            // --- Event Listeners para generar matrices ---
            document.getElementById('calculadoraMatriz__suma-generate-a').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('calculadoraMatriz__suma-a-rows').value);
                const cols = parseInt(document.getElementById('calculadoraMatriz__suma-a-cols').value);
                document.getElementById('calculadoraMatriz__suma-a-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
                    document.getElementById('calculadoraMatriz__suma-a-error').textContent = 'Dimensiones inválidas para Matriz A.';
                    return;
                }
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__suma-matrix-a-container', rows, cols, 'suma-a');
            });
            document.getElementById('calculadoraMatriz__suma-generate-b').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('calculadoraMatriz__suma-b-rows').value);
                const cols = parseInt(document.getElementById('calculadoraMatriz__suma-b-cols').value);
                document.getElementById('calculadoraMatriz__suma-b-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
                    document.getElementById('calculadoraMatriz__suma-b-error').textContent = 'Dimensiones inválidas para Matriz B.';
                    return;
                }
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__suma-matrix-b-container', rows, cols, 'suma-b');
            });

            document.getElementById('calculadoraMatriz__resta-generate-a').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('calculadoraMatriz__resta-a-rows').value);
                const cols = parseInt(document.getElementById('calculadoraMatriz__resta-a-cols').value);
                document.getElementById('calculadoraMatriz__resta-a-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
                    document.getElementById('calculadoraMatriz__resta-a-error').textContent = 'Dimensiones inválidas para Matriz A.';
                    return;
                }
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__resta-matrix-a-container', rows, cols, 'resta-a');
            });
            document.getElementById('calculadoraMatriz__resta-generate-b').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('calculadoraMatriz__resta-b-rows').value);
                const cols = parseInt(document.getElementById('calculadoraMatriz__resta-b-cols').value);
                document.getElementById('calculadoraMatriz__resta-b-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
                    document.getElementById('calculadoraMatriz__resta-b-error').textContent = 'Dimensiones inválidas para Matriz B.';
                    return;
                }
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__resta-matrix-b-container', rows, cols, 'resta-b');
            });

            document.getElementById('calculadoraMatriz__multiplicacion-generate-a').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('calculadoraMatriz__multiplicacion-a-rows').value);
                const cols = parseInt(document.getElementById('calculadoraMatriz__multiplicacion-a-cols').value);
                document.getElementById('calculadoraMatriz__multiplicacion-a-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
                    document.getElementById('calculadoraMatriz__multiplicacion-a-error').textContent = 'Dimensiones inválidas para Matriz A.';
                    return;
                }
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__multiplicacion-matrix-a-container', rows, cols, 'multiplicacion-a');
            });
            document.getElementById('calculadoraMatriz__multiplicacion-generate-b').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('calculadoraMatriz__multiplicacion-b-rows').value);
                const cols = parseInt(document.getElementById('calculadoraMatriz__multiplicacion-b-cols').value);
                document.getElementById('calculadoraMatriz__multiplicacion-b-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
                    document.getElementById('calculadoraMatriz__multiplicacion-b-error').textContent = 'Dimensiones inválidas para Matriz B.';
                    return;
                }
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__multiplicacion-matrix-b-container', rows, cols, 'multiplicacion-b');
            });

            document.getElementById('calculadoraMatriz__traspuesta-generate-a').addEventListener('click', () => {
                const rows = parseInt(document.getElementById('calculadoraMatriz__traspuesta-a-rows').value);
                const cols = parseInt(document.getElementById('calculadoraMatriz__traspuesta-a-cols').value);
                document.getElementById('calculadoraMatriz__traspuesta-a-error').textContent = '';
                if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
                    document.getElementById('calculadoraMatriz__traspuesta-a-error').textContent = 'Dimensiones inválidas para Matriz A.';
                    return;
                }
                calculadoraMatriz__generateMatrixInputs('calculadoraMatriz__traspuesta-matrix-a-container', rows, cols, 'traspuesta-a');
            });


            // --- Event Listeners para resolver operaciones ---
            document.getElementById('calculadoraMatriz__solve-suma').addEventListener('click', () => {
                const rowsA = parseInt(document.getElementById('calculadoraMatriz__suma-a-rows').value);
                const colsA = parseInt(document.getElementById('calculadoraMatriz__suma-a-cols').value);
                const rowsB = parseInt(document.getElementById('calculadoraMatriz__suma-b-rows').value);
                const colsB = parseInt(document.getElementById('calculadoraMatriz__suma-b-cols').value);

                if (rowsA !== rowsB || colsA !== colsB) {
                    calculadoraMatriz__resultDisplay.innerHTML = '<p class="calculadoraMatriz__error-message">Error: Las matrices deben tener las mismas dimensiones para la suma.</p>';
                    return;
                }

                const matrixA = calculadoraMatriz__getMatrixValues('calculadoraMatriz__suma-matrix-a-container', rowsA, colsA, 'suma-a', 'calculadoraMatriz__suma-a-error');
                const matrixB = calculadoraMatriz__getMatrixValues('calculadoraMatriz__suma-matrix-b-container', rowsB, colsB, 'suma-b', 'calculadoraMatriz__suma-b-error');

                if (matrixA && matrixB) {
                    const result = calculadoraMatriz__addMatrices(matrixA, matrixB);
                    if (result) {
                        calculadoraMatriz__displayMatrix(result, 'Resultado de la Suma');
                    }
                }
            });

            document.getElementById('calculadoraMatriz__solve-resta').addEventListener('click', () => {
                const rowsA = parseInt(document.getElementById('calculadoraMatriz__resta-a-rows').value);
                const colsA = parseInt(document.getElementById('calculadoraMatriz__resta-a-cols').value);
                const rowsB = parseInt(document.getElementById('calculadoraMatriz__resta-b-rows').value);
                const colsB = parseInt(document.getElementById('calculadoraMatriz__resta-b-cols').value);

                if (rowsA !== rowsB || colsA !== colsB) {
                    calculadoraMatriz__resultDisplay.innerHTML = '<p class="calculadoraMatriz__error-message">Error: Las matrices deben tener las mismas dimensiones para la resta.</p>';
                    return;
                }

                const matrixA = calculadoraMatriz__getMatrixValues('calculadoraMatriz__resta-matrix-a-container', rowsA, colsA, 'resta-a', 'calculadoraMatriz__resta-a-error');
                const matrixB = calculadoraMatriz__getMatrixValues('calculadoraMatriz__resta-matrix-b-container', rowsB, colsB, 'resta-b', 'calculadoraMatriz__resta-b-error');

                if (matrixA && matrixB) {
                    const result = calculadoraMatriz__subtractMatrices(matrixA, matrixB);
                    if (result) {
                        calculadoraMatriz__displayMatrix(result, 'Resultado de la Resta');
                    }
                }
            });

            document.getElementById('calculadoraMatriz__solve-multiplicacion').addEventListener('click', () => {
                const rowsA = parseInt(document.getElementById('calculadoraMatriz__multiplicacion-a-rows').value);
                const colsA = parseInt(document.getElementById('calculadoraMatriz__multiplicacion-a-cols').value);
                const rowsB = parseInt(document.getElementById('calculadoraMatriz__multiplicacion-b-rows').value);
                const colsB = parseInt(document.getElementById('calculadoraMatriz__multiplicacion-b-cols').value);

                const matrixA = calculadoraMatriz__getMatrixValues('calculadoraMatriz__multiplicacion-matrix-a-container', rowsA, colsA, 'multiplicacion-a', 'calculadoraMatriz__multiplicacion-a-error');
                const matrixB = calculadoraMatriz__getMatrixValues('calculadoraMatriz__multiplicacion-matrix-b-container', rowsB, colsB, 'multiplicacion-b', 'calculadoraMatriz__multiplicacion-b-error');

                if (matrixA && matrixB) {
                    const result = calculadoraMatriz__multiplyMatrices(matrixA, matrixB);
                    if (result) {
                        calculadoraMatriz__displayMatrix(result, 'Resultado de la Multiplicación');
                    }
                }
            });

            document.getElementById('calculadoraMatriz__solve-traspuesta').addEventListener('click', () => {
                const rowsA = parseInt(document.getElementById('calculadoraMatriz__traspuesta-a-rows').value);
                const colsA = parseInt(document.getElementById('calculadoraMatriz__traspuesta-a-cols').value);
                
                const matrixA = calculadoraMatriz__getMatrixValues('calculadoraMatriz__traspuesta-matrix-a-container', rowsA, colsA, 'traspuesta-a', 'calculadoraMatriz__traspuesta-a-error');

                if (matrixA) {
                    const result = calculadoraMatriz__transposeMatrix(matrixA);
                    calculadoraMatriz__displayMatrix(result, 'Resultado de la Traspuesta');
                }
            });


            // --- Lógica para el tema oscuro/claro (tomada de tu documento original) ---
            const calculadoraMatriz__applyTheme = (theme) => {
                const body = document.body;
                // Los iconos de sol/luna no están en este documento, pero se mantienen las referencias por si se integra
                const calculadoraMatriz__iconSun = document.querySelector('.calculadoraMatriz__icon-sun');
                const calculadoraMatriz__iconMoon = document.querySelector('.calculadoraMatriz__icon-moon');
                if (theme === 'dark') {
                    body.classList.add('dark');
                    if (calculadoraMatriz__iconSun) calculadoraMatriz__iconSun.classList.add('calculadoraMatriz__hidden');
                    if (calculadoraMatriz__iconMoon) calculadoraMatriz__iconMoon.classList.remove('calculadoraMatriz__hidden');
                } else {
                    body.classList.remove('dark');
                    if (calculadoraMatriz__iconSun) calculadoraMatriz__iconSun.classList.remove('calculadoraMatriz__hidden');
                    if (calculadoraMatriz__iconMoon) calculadoraMatriz__iconMoon.classList.add('calculadoraMatriz__hidden');
                }
            };

            // Cargar tema guardado
            const savedTheme = localStorage.getItem('theme') || 'light';
            calculadoraMatriz__applyTheme(savedTheme);

            // Listener para el botón de cambio de tema (si existe en el HTML padre)
            const themeToggleButton = document.getElementById('app__theme-toggle'); // Mantener el ID original si está fuera
            if (themeToggleButton) {
                themeToggleButton.addEventListener('click', () => {
                    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
                    localStorage.setItem('theme', newTheme);
                    calculadoraMatriz__applyTheme(newTheme);
                });
            }

            // Mostrar la sección de suma por defecto al cargar
            calculadoraMatriz__showOperationInputs('suma');
            document.getElementById('calculadoraMatriz__suma-generate-a').click(); // Simular clic para generar inputs iniciales
            document.getElementById('calculadoraMatriz__suma-generate-b').click();
        });