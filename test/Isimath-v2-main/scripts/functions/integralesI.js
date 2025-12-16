const { createElement } = require("react");

document.addEventListener('DOMContentLoaded', () => {
            // Referencias a elementos del DOM
            const integralesI__functionInput = document.getElementById('integralesI__function-input');
            const integralesI__solveBtn = document.getElementById('integralesI__solve-btn');
            const integralesI__resultDiv = document.getElementById('integralesI__result');
            const integralesI__resultMathField = document.getElementById('integralesI__result-math-field');
            const integralesI__functionError = document.getElementById('integralesI__function-error');
            const integralesI__stepsContainer = document.getElementById('integralesI__steps-container');
            const integralesI__toggleStepsBtn = document.getElementById('integralesI__toggle-steps-btn');
            const integralesI__stepsContent = document.getElementById('integralesI__steps-content');
            const integralesI__stepsList = document.getElementById('integralesI__steps-list');
            const integralesI__graphContainer = document.getElementById('integralesI__graph-container');
            const integralesI__graphLegend = document.getElementById('integralesI__graph-legend');
            // const integralesI__themeToggle = document.getElementById('integralesI__theme-toggle');

            // Variables para almacenar las funciones y pasos
            let integralesI__originalFunction = null;
            let integralesI__integralFunction = null;
            let integralesI__integrationSteps = [];

            // Manejar el toggle de pasos
            integralesI__toggleStepsBtn.addEventListener('click', () => {
                if (integralesI__stepsContent.classList.contains('hidden')) {
                    integralesI__stepsContent.classList.remove('hidden');
                    integralesI__toggleStepsBtn.textContent = 'Ocultar pasos detallados';
                } else {
                    integralesI__stepsContent.classList.add('hidden');
                    integralesI__toggleStepsBtn.textContent = 'Mostrar pasos detallados';
                }
            });

            // Función para normalizar la entrada
            const integralesI__normalizeInput = (input) => {
                return input
                    .replace(/\\cdot/g, '*')
                    .replace(/\\left\(/g, '(')
                    .replace(/\\right\)/g, ')')
                    .replace(/\\sin/g, 'sin')
                    .replace(/\\cos/g, 'cos')
                    .replace(/\\tan/g, 'tan')
                    .replace(/\\sec/g, 'sec')
                    .replace(/\\csc/g, 'csc')
                    .replace(/\\cot/g, 'cot')
                    .replace(/\\ln/g, 'log')
                    .replace(/\\exp/g, 'exp')
                    .replace(/\\sqrt{([^}]+)}/g, 'sqrt($1)')
                    .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
                    .replace(/\\ /g, '')
                    .replace(/\s+/g, '');
            };

            // Función para extraer valores numéricos
            const integralesI__extractNumericValue = (node) => {
                try {
                    return parseFloat(math.evaluate(node.toString()));
                } catch {
                    return NaN;
                }
            };

            // Función para verificar si un nodo es x
            const integralesI__isSymbolX = (node) => {
                if (node.type === 'SymbolNode' && node.name === 'x') return true;
                if (node.type === 'ParenthesisNode') return integralesI__isSymbolX(node.content);
                return false;
            };

            // Función para verificar si es 1/x
            const integralesI__isOneOverX = (n) => {
                if (n.type === 'OperatorNode' && n.op === '/') {
                    let numerator = n.args[0];
                    const denominator = n.args[1];

                    if (numerator.type === 'ParenthesisNode') {
                        numerator = numerator.content;
                    }

                    const isNumeratorConst = numerator.type === 'ConstantNode' ||
                        (numerator.type === 'UnaryMinusNode' && numerator.args[0].type === 'ConstantNode');

                    return isNumeratorConst && integralesI__isSymbolX(denominator);
                }
                return false;
            };

            // Función para agregar pasos
            const integralesI__addStep = (description, formula, rule) => {
                integralesI__integrationSteps.push({
                    description: description,
                    formula: formula,
                    rule: rule
                });
            };

            // Función para mostrar pasos
            const integralesI__displaySteps = () => {
                integralesI__stepsList.innerHTML = '';
                integralesI__integrationSteps.forEach((step, index) => {
                    const stepDiv = document.createElement('div');
                    stepDiv.className = 'integralesI__step-item';
                    stepDiv.innerHTML = `
                        <div class="integralesI__step-title">
                            Paso ${index + 1}: ${step.description}
                        </div>
                        <div style="margin: 10px 0;">
                            <math-field read-only>${step.formula}</math-field>
                        </div>
                        <div class="integralesI__step-rule">
                            Regla aplicada: ${step.rule}
                        </div>
                    `;
                    integralesI__stepsList.appendChild(stepDiv);
                });
            };

            // Función para integrar un nodo
            const integralesI__integrateNode = (n, depth = 0) => {
                if (n.type === 'ConstantNode') {
                    const result = new math.OperatorNode('*', 'multiply', [
                        new math.ConstantNode(parseFloat(n.value)),
                        new math.SymbolNode('x')
                    ]);
                    integralesI__addStep(
                        "Integración de constante",
                        `\\int ${n.toTex()} \\, dx = ${result.toTex()} + C`,
                        "∫k dx = kx + C"
                    );
                    return result;
                } else if (integralesI__isSymbolX(n)) {
                    const result = math.parse('x^2 / 2');
                    integralesI__addStep(
                        "Integración de x",
                        `\\int x \\, dx = \\frac{x^2}{2} + C`,
                        "∫x dx = x²/2 + C"
                    );
                    return result;
                } else if (integralesI__isOneOverX(n)) {
                    let numerator = n.args[0];

                    if (numerator.type === 'ParenthesisNode') {
                        numerator = numerator.content;
                    }

                    let coefficient = 1;

                    if (numerator.type === 'ConstantNode') {
                        coefficient = parseFloat(numerator.value);
                    } else if (numerator.type === 'UnaryMinusNode') {
                        const inner = numerator.args[0];
                        if (inner.type === 'ConstantNode') {
                            coefficient = -parseFloat(inner.value);
                        } else if (inner.type === 'ParenthesisNode' && inner.content.type === 'ConstantNode') {
                            coefficient = -parseFloat(inner.content.value);
                        }
                    }

                    const lnNode = math.parse('log(abs(x))');
                    const result = coefficient === 1
                        ? lnNode
                        : new math.OperatorNode('*', 'multiply', [
                            new math.ConstantNode(coefficient),
                            lnNode
                        ]);
                    
                    integralesI__addStep(
                        "Integración de 1/x",
                        `\\int ${n.toTex()} \\, dx = ${result.toTex().replace('log', '\\ln')} + C`,
                        "∫(1/x) dx = ln|x| + C"
                    );
                    return result;
                } else if (n.type === 'OperatorNode' && n.op === '^') {
                    const base = n.args[0];
                    const exponent = integralesI__extractNumericValue(n.args[1]);
                    if (integralesI__isSymbolX(base)) {
                        if (exponent === -1) {
                            const result = math.parse('log(abs(x))');
                            integralesI__addStep(
                                "Integración de x^(-1)",
                                `\\int x^{-1} \\, dx = \\ln|x| + C`,
                                "∫x^(-1) dx = ln|x| + C"
                            );
                            return result;
                        }
                        const newExp = exponent + 1;
                        const numerator = new math.OperatorNode('^', 'pow', [
                            new math.SymbolNode('x'),
                            new math.ConstantNode(newExp)
                        ]);
                        const denominator = new math.ConstantNode(newExp);
                        const result = new math.OperatorNode('/', 'divide', [numerator, denominator]);
                        
                        integralesI__addStep(
                            `Integración de potencia x^${exponent}`,
                            `\\int x^{${exponent}} \\, dx = \\frac{x^{${newExp}}}{${newExp}} + C`,
                            `∫x^n dx = x^(n+1)/(n+1) + C (n ≠ -1)`
                        );
                        return result;
                    }
                } else if (n.type === 'OperatorNode' && n.op === '*') {
                    const left = n.args[0];
                    const right = n.args[1];
                    if (left.type === 'ConstantNode') {
                        const integratedRight = integralesI__integrateNode(right, depth + 1);
                        if (integratedRight) {
                            const result = new math.OperatorNode('*', 'multiply', [
                                new math.ConstantNode(parseFloat(left.value)),
                                integratedRight
                            ]);
                            integralesI__addStep(
                                "Aplicación de la regla del múltiplo constante",
                                `\\int ${left.toTex()} \\cdot (${right.toTex()}) \\, dx = ${left.toTex()} \\int ${right.toTex()} \\, dx`,
                                "∫k·f(x) dx = k·∫f(x) dx"
                            );
                            return result;
                        }
                    } else if (right.type === 'ConstantNode') {
                        const integratedLeft = integralesI__integrateNode(left, depth + 1);
                        if (integratedLeft) {
                            const result = new math.OperatorNode('*', 'multiply', [
                                integratedLeft,
                                new math.ConstantNode(parseFloat(right.value))
                            ]);
                            integralesI__addStep(
                                "Aplicación de la regla del múltiplo constante",
                                `\\int (${left.toTex()}) \\cdot ${right.toTex()} \\, dx = ${right.toTex()} \\int ${left.toTex()} \\, dx`,
                                "∫f(x)·k dx = k·∫f(x) dx"
                            );
                            return result;
                        }
                    }
                } else if (n.type === 'OperatorNode' && (n.op === '+' || n.op === '-')) {
                    integralesI__addStep(
                        `Aplicación de la regla de la ${n.op === '+' ? 'suma' : 'resta'}`,
                        `\\int (${n.args[0].toTex()} ${n.op} ${n.args[1].toTex()}) \\, dx = \\int ${n.args[0].toTex()} \\, dx ${n.op} \\int ${n.args[1].toTex()} \\, dx`,
                        `∫(f(x) ${n.op} g(x)) dx = ∫f(x) dx ${n.op} ∫g(x) dx`
                    );
                    
                    const leftIntegrated = integralesI__integrateNode(n.args[0], depth + 1);
                    const rightIntegrated = integralesI__integrateNode(n.args[1], depth + 1);
                    if (leftIntegrated && rightIntegrated) {
                        return new math.OperatorNode(n.op === '+' ? '+' : '-', n.op === '+' ? 'add' : 'subtract', [
                            leftIntegrated,
                            rightIntegrated
                        ]);
                    }
                } else if (n.type === 'FunctionNode') {
                    const arg = n.args[0];
                    if (integralesI__isSymbolX(arg)) {
                        switch (n.fn.name) {
                            case 'sin':
                                const sinResult = math.parse('-cos(x)');
                                integralesI__addStep(
                                    "Integración de función seno",
                                    `\\int \\sin(x) \\, dx = -\\cos(x) + C`,
                                    "∫sin(x) dx = -cos(x) + C"
                                );
                                return sinResult;
                            case 'cos':
                                const cosResult = math.parse('sin(x)');
                                integralesI__addStep(
                                    "Integración de función coseno",
                                    `\\int \\cos(x) \\, dx = \\sin(x) + C`,
                                    "∫cos(x) dx = sin(x) + C"
                                );
                                return cosResult;
                            case 'tan':
                                const tanResult = math.parse('-log(abs(cos(x)))');
                                integralesI__addStep(
                                    "Integración de función tangente",
                                    `\\int \\tan(x) \\, dx = -\\ln|\\cos(x)| + C`,
                                    "∫tan(x) dx = -ln|cos(x)| + C"
                                );
                                return tanResult;
                            case 'sec':
                                const secResult = math.parse('log(abs(sec(x) + tan(x)))');
                                integralesI__addStep(
                                    "Integración de función secante",
                                    `\\int \\sec(x) \\, dx = \\ln|\\sec(x) + \\tan(x)| + C`,
                                    "∫sec(x) dx = ln|sec(x) + tan(x)| + C"
                                );
                                return secResult;
                            case 'csc':
                                const cscResult = math.parse('-log(abs(csc(x) + cot(x)))');
                                integralesI__addStep(
                                    "Integración de función cosecante",
                                    `\\int \\csc(x) \\, dx = -\\ln|\\csc(x) + \\cot(x)| + C`,
                                    "∫csc(x) dx = -ln|csc(x) + cot(x)| + C"
                                );
                                return cscResult;
                            case 'cot':
                                const cotResult = math.parse('log(abs(sin(x)))');
                                integralesI__addStep(
                                    "Integración de función cotangente",
                                    `\\int \\cot(x) \\, dx = \\ln|\\sin(x)| + C`,
                                    "∫cot(x) dx = ln|sin(x)| + C"
                                );
                                return cotResult;
                            case 'exp':
                                const expResult = math.parse('exp(x)');
                                integralesI__addStep(
                                    "Integración de función exponencial",
                                    `\\int e^x \\, dx = e^x + C`,
                                    "∫e^x dx = e^x + C"
                                );
                                return expResult;
                            case 'log':
                                const logResult = math.parse('x * log(x) - x');
                                integralesI__addStep(
                                    "Integración de función logaritmo natural",
                                    `\\int \\ln(x) \\, dx = x\\ln(x) - x + C`,
                                    "∫ln(x) dx = x·ln(x) - x + C (integración por partes)"
                                );
                                return logResult;
                        }
                    }
                }
                return null;
            };

            // Función para dibujar la gráfica
            const integralesI__drawGraph = (originalFunc, integralFunc) => {
                const xMin = -5;
                const xMax = 5;
                const numPoints = 500;
                const step = (xMax - xMin) / numPoints;
                
                const xValues = [];
                const yOriginal = [];
                const yIntegral = [];
                
                for (let i = 0; i <= numPoints; i++) {
                    const x = xMin + i * step;
                    xValues.push(x);
                    
                    try {
                        const y = originalFunc.evaluate({x: x});
                        yOriginal.push(isFinite(y) && Math.abs(y) < 100 ? y : null);
                    } catch (e) {
                        yOriginal.push(null);
                    }
                    
                    try {
                        const integral = integralFunc.evaluate({x: x});
                        yIntegral.push(isFinite(integral) && Math.abs(integral) < 100 ? integral : null);
                    } catch (e) {
                        yIntegral.push(null);
                    }
                }
                
                const isDarkMode = document.body.classList.contains('dark');
                const bgColor = isDarkMode ? '#16213E' : '#FFFFFF';
                const gridColor = isDarkMode ? '#495057' : '#e0e0e0';
                const textColor = isDarkMode ? '#E0E0E0' : '#333333';
                
                const data = [
                    {
                        x: xValues,
                        y: yOriginal,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'f(x) (función original)',
                        line: {
                            color: isDarkMode ? '#48D1CC' : '#20B2AA',
                            width: 2
                        },
                        connectgaps: false
                    },
                    {
                        x: xValues,
                        y: yIntegral,
                        type: 'scatter',
                        mode: 'lines',
                        name: '∫f(x)dx (integral)',
                        line: {
                            color: isDarkMode ? '#7B68EE' : '#6A5ACD',
                            width: 2
                        },
                        connectgaps: false
                    }
                ];
                
                const layout = {
                    title: {
                        text: 'Función Original e Integral',
                        font: {
                            size: 16,
                            color: textColor
                        }
                    },
                    xaxis: {
                        title: 'x',
                        zeroline: true,
                        zerolinecolor: textColor,
                        zerolinewidth: 1,
                        gridcolor: gridColor,
                        gridwidth: 0.5,
                        color: textColor
                    },
                    yaxis: {
                        title: 'y',
                        zeroline: true,
                        zerolinecolor: textColor,
                        zerolinewidth: 1,
                        gridcolor: gridColor,
                        gridwidth: 0.5,
                        color: textColor
                    },
                    plot_bgcolor: bgColor,
                    paper_bgcolor: bgColor,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 12,
                        color: textColor
                    },
                    legend: {
                        x: 0.02,
                        y: 0.98,
                        bgcolor: isDarkMode ? 'rgba(22,33,62,0.8)' : 'rgba(255,255,255,0.8)',
                        bordercolor: isDarkMode ? '#495057' : '#ddd',
                        borderwidth: 1,
                        font: {
                            color: textColor
                        }
                    },
                    margin: {
                        l: 50,
                        r: 50,
                        t: 50,
                        b: 50
                    }
                };
                
                // Configurar opciones
                const config = {
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian']
                };
                
                // Crear la gráfica
                Plotly.newPlot('integralesI__plot', data, layout, config);
            };

            // Función principal para calcular integral indefinida
            const integralesI__calculateIndefiniteIntegral = (funcText) => {
                integralesI__resultDiv.classList.add('hidden');
                integralesI__functionError.classList.add('hidden');
                integralesI__functionError.textContent = '';
                integralesI__graphContainer.classList.add('hidden');
                integralesI__graphLegend.classList.add('hidden');
                integralesI__stepsContainer.classList.add('hidden');
                integralesI__integrationSteps = []; // Limpiar pasos anteriores

                try {
                    const cleanInput = integralesI__normalizeInput(funcText);
                    const node = math.parse(cleanInput);
                    
                    // Compilar la función original
                    integralesI__originalFunction = math.compile(cleanInput);
                    
                    // Agregar paso inicial
                    integralesI__addStep(
                        "Función original a integrar",
                        `\\int ${node.toTex()} \\, dx`,
                        "Identificación de la función"
                    );

                    const integratedNode = integralesI__integrateNode(node);

                    if (integratedNode) {
                        const simplifiedNode = math.simplify(integratedNode);
                        
                        // Agregar paso de simplificación si es necesario
                        if (integratedNode.toString() !== simplifiedNode.toString()) {
                            integralesI__addStep(
                                "Simplificación del resultado",
                                `${integratedNode.toTex()} = ${simplifiedNode.toTex()}`,
                                "Simplificación algebraica"
                            );
                        }
                        
                        // Agregar paso final
                        integralesI__addStep(
                            "Resultado final",
                            `\\int ${node.toTex()} \\, dx = ${simplifiedNode.toTex()} + C`,
                            "Resultado de la integral indefinida"
                        );
                        
                        // Compilar la función integral
                        integralesI__integralFunction = math.compile(simplifiedNode.toString());
                        
                        const integralLatex = simplifiedNode.toTex({
                            handler: (node, options) => {
                                if (node.type === 'FunctionNode' && (node.fn.name === 'log' || node.fn.name === 'ln')) {
                                    return `\\ln\\left(${node.args[0].toTex(options)}\\right)`;
                                }
                                return undefined;
                            }
                        });

                        integralesI__resultMathField.innerHTML = `<math-field read-only>${integralLatex}</math-field>`;
                        integralesI__resultDiv.classList.remove('hidden');
                        
                        // Mostrar pasos
                        integralesI__stepsContainer.classList.remove('hidden');
                        integralesI__displaySteps();
                        
                        // Mostrar y dibujar la gráfica con Plotly
                        integralesI__graphContainer.classList.remove('hidden');
                        integralesI__graphLegend.classList.remove('hidden');
                        integralesI__drawGraph(integralesI__originalFunction, integralesI__integralFunction);
                    } else {
                        integralesI__functionError.textContent = `No se pudo integrar la función. Tipo de nodo no soportado o sintaxis compleja.`;
                        integralesI__functionError.classList.remove('hidden');
                    }
                } catch (error) {
                    if (!error.message.includes('render is not a function')) {
                        integralesI__functionError.textContent = 'Error al procesar la función. Asegúrate de que la sintaxis es correcta. Mensaje: ' + error.message;
                        integralesI__functionError.classList.remove('hidden');
                    }
                    console.error("Error al calcular la integral indefinida:", error);
                }
            };

            // Event listener para el botón de resolver
            integralesI__solveBtn.addEventListener('click', () => {
                const functionText = integralesI__functionInput.getValue();
                integralesI__resultDiv.classList.add('hidden');
                integralesI__functionError.classList.add('hidden');
                integralesI__functionError.textContent = '';
                integralesI__graphContainer.classList.add('hidden');
                integralesI__graphLegend.classList.add('hidden');

                if (!functionText) {
                    integralesI__functionError.textContent = 'Por favor, introduce una función para integrar.';
                    integralesI__functionError.classList.remove('hidden');
                    return;
                }

                integralesI__calculateIndefiniteIntegral(functionText);
            });

            // TODO: Moviendo el MathField
            const integralesI__containerTest = document.querySelector('.integralesI__input-section');
            const integralesI__mathfieldInput = document.getElementById('integralesI__function-input');

            let test = integralesI__mathfieldInput.shadowRoot;
            
            
            
            
            
            
            const integralesI__test = createElement('h2');
            integralesI__test.textContent = `${test}`;

            // integralesI__containerTest.appendChild(test);


        });