/**
 * тесты для script.js
 * Запуск тестов:
 *     npx jest script.test.js
 *     или
 *     npm test
 */

const createMockElement = (id) => ({
    id: id,
    value: '',
    textContent: '',
    style: { display: '' },
    classList: {
        _classes: new Set(),
        add: function(cls) { this._classes.add(cls); },
        remove: function(cls) { this._classes.delete(cls); },
        toggle: function(cls) {
            if (this._classes.has(cls)) {
                this._classes.delete(cls);
            } else {
                this._classes.add(cls);
            }
        },
        contains: function(cls) { return this._classes.has(cls); }
    },
    addEventListener: jest.fn(),
    dataset: {},
    getContext: jest.fn(() => ({
        fillStyle: '',
        fillRect: jest.fn(),
        strokeStyle: '',
        lineWidth: 1,
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fillText: jest.fn()
    }))
});

const createMockDaysElement = () => {
    const el = createMockElement('days');
    el._value = 7;
    Object.defineProperty(el, 'value', {
        get: function() { return this._value; },
        set: function(v) { this._value = parseInt(v) || 7; }
    });
    return el;
};

const createMockDatePickerElement = () => {
    const el = createMockElement('selectedDate');
    el._value = '2026-02-22';
    Object.defineProperty(el, 'value', {
        get: function() { return this._value; },
        set: function(v) { this._value = v; }
    });
    return el;
};

global.document = {
    getElementById: jest.fn((id) => createMockElement(id)),
    getElementsByClassName: jest.fn(() => [createMockElement('cell')]),
    querySelector: jest.fn(() => createMockElement('csrf')),
    querySelectorAll: jest.fn(() => [createMockElement('btn')]),
    body: {
        classList: {
            _classes: new Set(),
            add: function(cls) { this._classes.add(cls); },
            remove: function(cls) { this._classes.delete(cls); },
            toggle: function(cls) {
                if (this._classes.has(cls)) {
                    this._classes.delete(cls);
                } else {
                    this._classes.add(cls);
                }
            },
            contains: function(cls) { return this._classes.has(cls); }
        }
    },
    cookie: ''
};

global.window = {
    addEventListener: jest.fn(),
    alert: jest.fn()
};

global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
}));

global.alert = jest.fn();

global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

const {
    CODE_TO_RUS,
    loadRates,
    convertCurrency,
    swapCurrencies,
    findRateInResponse,
    updateTable,
    showTable,
    showChart,
    fetchSeriesFromApi,
    drawLineChartWithLabels,
    updateChart,
    randd,
    applyTheme,
    openModal,
    closeModal,
    getCsrfToken,
    saveUserProfile,
    saveDefaultCurrency,
    saveTheme,
    loadProfileAndSetCurrency,
    loginUser,
    logoutUser,
    registerUser,
    checkAuthStatus,
    loadProfileData,
    updateProfile,
    getExchangeRates,
    setExchangeRates,
    setDOMElements,
    getDOMElements
} = require('./script.js');

function setupMockDOM() {
    const mockElements = {
        amountFromInput: createMockElement('amountFrom'),
        amountToInput: createMockElement('amountTo'),
        currencyFromSelect: createMockElement('currencyFrom'),
        currencyToSelect: createMockElement('currencyTo'),
        fromResult: createMockElement('fromResult'),
        toResult: createMockElement('toResult'),
        exchangeRateElement: createMockElement('exchangeRate'),
        tableUsdRate: createMockElement('tableUsdRate'),
        tableEurRate: createMockElement('tableEurRate'),
        tableGbpRate: createMockElement('tableGbpRate'),
        tableUsdRate_d: createMockElement('tableUsdRate_d'),
        tableEurRate_d: createMockElement('tableEurRate_d'),
        tableGbpRate_d: createMockElement('tableGbpRate_d'),
        ratesTableContainer: createMockElement('ratesTableContainer'),
        chartContainer: createMockElement('chartContainer'),
        showTableBtn: createMockElement('showTableBtn'),
        showChartBtn: createMockElement('showChartBtn'),
        chartCurrencySelect: createMockElement('chartCurrency1'),
        chartCurrencySelect2: createMockElement('chartCurrency2'),
        days: createMockDaysElement(), 
        datePicker: createMockDatePickerElement(),
        chartCtx: createMockElement('chartCanvas').getContext(),
        themeToggle: createMockElement('themeToggle'),
        registerBtn: createMockElement('registerBtn'),
        loginBtn: createMockElement('loginBtn'),
        profileBtn: createMockElement('profileBtn'),
        logoutBtn: createMockElement('logoutBtn'),
        registerModal: createMockElement('registerModal'),
        loginModal: createMockElement('loginModal'),
        profileModal: createMockElement('profileModal'),
        profileUsername: createMockElement('profileUsername'),
        profileCurrency: createMockElement('profileCurrency')
    };
    
    setDOMElements(mockElements);
    return mockElements;
}

describe('applyTheme', () => {
    beforeEach(() => {
        document.body.classList._classes.clear();
    });
    
    test('добавляет dark-theme для тёмной темы', () => {
        applyTheme('dark');
        expect(document.body.classList.contains('dark-theme')).toBe(true);
    });
    
    test('удаляет dark-theme для светлой темы', () => {
        document.body.classList.add('dark-theme');
        applyTheme('light');
        expect(document.body.classList.contains('dark-theme')).toBe(false);
    });

});

describe('exchangeRates', () => {
    test('getExchangeRates возвращает текущие курсы', () => {
        setExchangeRates({ USD: 95.5, EUR: 100 });
        const rates = getExchangeRates();
        
        expect(rates.USD).toBe(95.5);
        expect(rates.EUR).toBe(100);
    });
    
    test('setExchangeRates обновляет курсы', () => {
        setExchangeRates({ USD: 96 });
        expect(getExchangeRates().USD).toBe(96);
        
        setExchangeRates({ USD: 97 });
        expect(getExchangeRates().USD).toBe(97);
    });
    
    test('setExchangeRates заменяет курсы', () => {
        setExchangeRates({ USD: 95, EUR: 100 });
        setExchangeRates({ GBP: 120 });
        
        const rates = getExchangeRates();
        expect(rates.USD).toBeUndefined();
        expect(rates.GBP).toBe(120);
    });
    
    test('пустые курсы', () => {
        setExchangeRates({});
        expect(Object.keys(getExchangeRates()).length).toBe(0);
    });
    
    test('курсы с дельтами', () => {
        setExchangeRates({ 
            USD: 95.5, 
            USD_D: 0.5, 
            EUR: 100, 
            EUR_D: -0.3 
        });
        
        const rates = getExchangeRates();
        expect(rates.USD).toBe(95.5);
        expect(rates.USD_D).toBe(0.5);
        expect(rates.EUR_D).toBe(-0.3);
    });
});


describe('showTable / showChart', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        mockElements.datePicker.value = '2026-02-22';
        mockElements.days.value = '7';
        mockElements.chartCurrencySelect.value = 'USD';
        mockElements.chartCurrencySelect2.value = 'RUB';
        global.fetch.mockReset();
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ 'ДОЛЛАР': 95.5 })
        });
    });
    
    test('showTable показывает таблицу', () => {
        mockElements.chartContainer.style.display = 'block';
        
        showTable();
        
        expect(mockElements.ratesTableContainer.style.display).toBe('');
        expect(mockElements.chartContainer.style.display).toBe('none');
    });
    
    test('showTable добавляет класс active кнопке таблицы', () => {
        showTable();
        
        expect(mockElements.showTableBtn.classList.contains('active')).toBe(true);
        expect(mockElements.showChartBtn.classList.contains('active')).toBe(false);
    });
    
    test('showChart показывает график', async () => {
        mockElements.ratesTableContainer.style.display = '';
        
        await showChart();
        
        expect(mockElements.ratesTableContainer.style.display).toBe('none');
        expect(mockElements.chartContainer.style.display).toBe('');
    });
    
    test('showChart добавляет класс active кнопке графика', async () => {
        await showChart();
        
        expect(mockElements.showTableBtn.classList.contains('active')).toBe(false);
        expect(mockElements.showChartBtn.classList.contains('active')).toBe(true);
    });
    
    test('переключение между таблицей и графиком', async () => {
        await showChart();
        expect(mockElements.chartContainer.style.display).toBe('');
        
        showTable();
        expect(mockElements.chartContainer.style.display).toBe('none');
        expect(mockElements.ratesTableContainer.style.display).toBe('');
    });
});

describe('convertCurrency', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8
        });
    });
    
    test('конвертация USD в RUB', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('9550.00');
    });
    
    test('конвертация RUB в USD', () => {
        mockElements.currencyFromSelect.value = 'RUB';
        mockElements.currencyToSelect.value = 'USD';
        mockElements.amountFromInput.value = '9550';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('100.00');
    });
    
    test('конвертация EUR в USD', () => {
        mockElements.currencyFromSelect.value = 'EUR';
        mockElements.currencyToSelect.value = 'USD';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();
        
        const expectedRate = 95.5 / 102.3;
        const expectedResult = 100 * expectedRate;
        expect(parseFloat(mockElements.amountToInput.value)).toBeCloseTo(expectedResult, 1);
    });
    
    test('конвертация одной валюты в себя', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'USD';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('100.00');
    });
    
    test('конвертация с нулевой суммой', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '0';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('0.00');
    });
    
    test('конвертация с пустой суммой', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('0.00');
    });
    
    test('конвертация с невалидной суммой', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = 'abc';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('0.00');
    });
    
    test('обновляет текст курса обмена', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();
        
        expect(mockElements.exchangeRateElement.textContent).toContain('USD');
        expect(mockElements.exchangeRateElement.textContent).toContain('RUB');
        expect(mockElements.exchangeRateElement.textContent).toContain('95.5');
    });
    
    test('обновляет fromResult и toResult', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();
        
        expect(mockElements.fromResult.textContent).toBe('100.00');
        expect(mockElements.toResult.textContent).toBe('9550.00');
    });
});

describe('swapCurrencies', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8
        });
    });
    
    test('меняет валюты местами', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'EUR';
        mockElements.amountFromInput.value = '100';
        
        swapCurrencies();
        
        expect(mockElements.currencyFromSelect.value).toBe('EUR');
        expect(mockElements.currencyToSelect.value).toBe('USD');
    });
    
    test('устанавливает результат как новую сумму', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '100';
        mockElements.amountToInput.value = '9550';
        
        swapCurrencies();
        
        expect(mockElements.amountFromInput.value).toBe('9550.00');
    });
    
    test('работает с нулевым результатом', () => {
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '0';
        mockElements.amountToInput.value = '0';
        
        swapCurrencies();
        
        expect(mockElements.amountFromInput.value).toBe('0.00');
    });
});

describe('updateTable', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
    });
    
    test('обновляет курсы в таблице', () => {
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8,
            USD_D: 0.5,
            EUR_D: -0.3,
            GBP_D: 1.2
        });
        
        updateTable();
        
        expect(mockElements.tableUsdRate.textContent).toBe('95.50');
        expect(mockElements.tableEurRate.textContent).toBe('102.30');
        expect(mockElements.tableGbpRate.textContent).toBe('119.80');
    });
    
    test('добавляет знак + для положительной дельты', () => {
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8,
            USD_D: 0.5,
            EUR_D: -0.3,
            GBP_D: 1.2
        });
        
        updateTable();
        
        expect(mockElements.tableUsdRate_d.textContent).toBe('+0.5000');
        expect(mockElements.tableGbpRate_d.textContent).toBe('+1.2000');
    });
    
    test('не добавляет знак + для отрицательной дельты', () => {
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8,
            USD_D: 0.5,
            EUR_D: -0.3,
            GBP_D: 1.2
        });
        
        updateTable();
        
        expect(mockElements.tableEurRate_d.textContent).toBe('-0.3000');
    });
    
    test('устанавливает класс positive для положительной дельты', () => {
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8,
            USD_D: 0.5,
            EUR_D: -0.3,
            GBP_D: 1.2
        });
        
        updateTable();
        
        expect(mockElements.tableUsdRate_d.className).toBe('positive');
        expect(mockElements.tableGbpRate_d.className).toBe('positive');
    });
    
    test('устанавливает класс negative для отрицательной дельты', () => {
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8,
            USD_D: 0.5,
            EUR_D: -0.3,
            GBP_D: 1.2
        });
        
        updateTable();
        
        expect(mockElements.tableEurRate_d.className).toBe('negative');
    });
    
});


describe('loadRates', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        global.fetch.mockReset();
        global.alert.mockReset();
    });
    
    test('загружает курсы с сервера', async () => {
        const mockData = {
            'ДОЛЛАР': 95.5,
            'ЕВРО': 102.3,
            'ФУНТ': 119.8,
            'ДОЛЛАР_DELTA': 0.5,
            'ЕВРО_DELTA': -0.3,
            'ФУНТ_DELTA': 1.2
        };
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockData)
        });
        
        await loadRates('2026-01-15');
        
        const rates = getExchangeRates();
        expect(rates.USD).toBe(95.5);
        expect(rates.EUR).toBe(102.3);
        expect(rates.GBP).toBe(119.8);
    });
    
    test('парсит дельты курсов', async () => {
        const mockData = {
            'ДОЛЛАР': 95.5,
            'ДОЛЛАР_DELTA': 0.5
        };
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockData)
        });
        
        await loadRates('2026-01-15');
        
        const rates = getExchangeRates();
        expect(rates.USD_D).toBe(0.5);
    });
    
    test('показывает ошибку при неудаче', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        await loadRates('2026-01-15');
        
        expect(global.alert).toHaveBeenCalledWith('Ошибка загрузки курсов');
    });
    
    test('правильно формирует URL запроса', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        
        await loadRates('2026-02-22');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/rates/?date=2026-02-22');
    });
});

describe('fetchSeriesFromApi', () => {
    beforeEach(() => {
        global.fetch.mockReset();
    });
    
    test('возвращает массив дат и значений', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ 'ДОЛЛАР': 95.5 })
        });
        
        const result = await fetchSeriesFromApi('USD', 'RUB', '2026-01-15', 2);
        
        expect(result.labels).toBeDefined();
        expect(result.values).toBeDefined();
        expect(Array.isArray(result.labels)).toBe(true);
        expect(Array.isArray(result.values)).toBe(true);
    });
    
    test('формирует правильное количество точек', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ 'ДОЛЛАР': 95.5 })
        });
        
        const result = await fetchSeriesFromApi('USD', 'RUB', '2026-01-15', 3);
        
        expect(result.labels.length).toBe(4);
        expect(result.values.length).toBe(4);
    });
    
    test('возвращает null при ошибке запроса', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        const result = await fetchSeriesFromApi('USD', 'RUB', '2026-01-15', 1);
        
        expect(result.values[0]).toBeNull();
    });
    
    test('возвращает 1 при одинаковых валютах', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ 'ДОЛЛАР': 95.5 })
        });
        
        const result = await fetchSeriesFromApi('USD', 'USD', '2026-01-15', 1);
        
        expect(result.values[0]).toBe(1);
    });
});

describe('drawLineChartWithLabels', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        document.body.classList._classes.clear();
    });
    
    test('вызывает fillRect для очистки canvas', () => {
        const values = [95, 96, 97];
        const labels = ['01.01', '02.01', '03.01'];
        
        drawLineChartWithLabels(values, labels);
        
        expect(mockElements.chartCtx.fillRect).toHaveBeenCalled();
    });
    
    test('вызывает stroke для рисования линий', () => {
        const values = [95, 96, 97];
        const labels = ['01.01', '02.01', '03.01'];
        
        drawLineChartWithLabels(values, labels);
        
        expect(mockElements.chartCtx.stroke).toHaveBeenCalled();
    });
    
    test('работает с одним значением', () => {
        const values = [95];
        const labels = ['01.01'];
        
        expect(() => drawLineChartWithLabels(values, labels)).not.toThrow();
    });
    
    test('работает с двумя значениями', () => {
        const values = [95, 96];
        const labels = ['01.01', '02.01'];
        
        expect(() => drawLineChartWithLabels(values, labels)).not.toThrow();
    });
    
    test('использует тёмную тему при наличии класса', () => {
        document.body.classList.add('dark-theme');
        
        const values = [95, 96];
        const labels = ['01.01', '02.01'];
        
        drawLineChartWithLabels(values, labels);

        expect(mockElements.chartCtx.fillRect).toHaveBeenCalled();
    });
    
    test('использует светлую тему без класса', () => {
        const values = [95, 96];
        const labels = ['01.01', '02.01'];
        
        drawLineChartWithLabels(values, labels);

        expect(mockElements.chartCtx.fillRect).toHaveBeenCalled();
    });
});

describe('saveUserProfile', () => {
    beforeEach(() => {
        global.fetch.mockReset();
        document.querySelector.mockReset();
        document.querySelector.mockReturnValue({ value: 'test-csrf' });
    });
    
    test('отправляет PATCH запрос', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await saveUserProfile({ default_currency: 'EUR' });
        
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/profile/',
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ default_currency: 'EUR' })
            })
        );
    });
    
    test('добавляет CSRF-токен в заголовки', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await saveUserProfile({ theme: 'dark' });
        
        const callArgs = global.fetch.mock.calls[0][1];
        expect(callArgs.headers['X-CSRFToken']).toBe('test-csrf');
    });
    
    test('не выбрасывает ошибку при неудаче', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        await expect(saveUserProfile({ theme: 'dark' })).resolves.not.toThrow();
    });
});

describe('saveDefaultCurrency', () => {
    beforeEach(() => {
        global.fetch.mockReset();
        document.querySelector.mockReturnValue({ value: 'test-csrf' });
    });
    
    test('вызывает saveUserProfile с correct параметрами', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await saveDefaultCurrency('EUR');
        
        const callArgs = global.fetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.default_currency).toBe('EUR');
    });
    
    test('работает с USD', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await expect(saveDefaultCurrency('USD')).resolves.not.toThrow();
    });
    
    test('работает с GBP', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await expect(saveDefaultCurrency('GBP')).resolves.not.toThrow();
    });
});

describe('saveTheme', () => {
    beforeEach(() => {
        global.fetch.mockReset();
        document.querySelector.mockReturnValue({ value: 'test-csrf' });
    });
    
    test('сохраняет тёмную тему', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await saveTheme('dark');
        
        const callArgs = global.fetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.theme).toBe('dark');
    });
    
    test('сохраняет светлую тему', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await saveTheme('light');
        
        const callArgs = global.fetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.theme).toBe('light');
    });
});


describe('loginUser', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        global.fetch.mockReset();
    });
    
    test('отправляет POST запрос на /api/login/', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        
        await loginUser('testuser', 'password123');
        
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/login/',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    username: 'testuser',
                    password: 'password123'
                })
            })
        );
    });
    
    test('возвращает true при успешном входе', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        
        const result = await loginUser('testuser', 'password123');
        
        expect(result).toBe(true);
    });
    
    test('возвращает false при неудаче', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ detail: 'Неверные учетные данные' })
        });
        
        const result = await loginUser('testuser', 'wrongpassword');
        
        expect(result).toBe(false);
    });
    
    test('скрывает кнопки login/register при успехе', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        
        await loginUser('testuser', 'password123');
        
        expect(mockElements.loginBtn.style.display).toBe('none');
        expect(mockElements.registerBtn.style.display).toBe('none');
    });
    
    test('показывает кнопки profile/logout при успехе', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        
        await loginUser('testuser', 'password123');
        
        expect(mockElements.profileBtn.style.display).toBe('block');
        expect(mockElements.logoutBtn.style.display).toBe('block');
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ logoutUser
// ============================================================================

describe('logoutUser', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        global.fetch.mockReset();
    });
    
    test('отправляет POST запрос на /api/logout/', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await logoutUser();
        
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/logout/',
            expect.objectContaining({
                method: 'POST'
            })
        );
    });
    
    test('возвращает true при успешном выходе', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        const result = await logoutUser();
        
        expect(result).toBe(true);
    });
    
    test('возвращает false при неудаче', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ detail: 'Ошибка' })
        });
        
        const result = await logoutUser();
        
        expect(result).toBe(false);
    });
    
    test('показывает кнопки login/register при успехе', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await logoutUser();
        
        expect(mockElements.loginBtn.style.display).toBe('block');
        expect(mockElements.registerBtn.style.display).toBe('block');
    });
    
    test('скрывает кнопки profile/logout при успехе', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await logoutUser();
        
        expect(mockElements.profileBtn.style.display).toBe('none');
        expect(mockElements.logoutBtn.style.display).toBe('none');
    });
});

describe('registerUser', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        global.fetch.mockReset();
    });
    
    test('отправляет POST запрос на /api/register/', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        
        await registerUser('newuser', 'password123', 'password123');
        
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/register/',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    username: 'newuser',
                    password: 'password123',
                    password2: 'password123'
                })
            })
        );
    });
    
    test('возвращает true при успешной регистрации', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        
        const result = await registerUser('newuser', 'password123', 'password123');
        
        expect(result).toBe(true);
    });
    
    test('возвращает false при неудаче', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ username: 'Пользователь уже существует' })
        });
        
        const result = await registerUser('existinguser', 'password123', 'password123');
        
        expect(result).toBe(false);
    });
    
    test('возвращает false при сетевой ошибке', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        const result = await registerUser('newuser', 'password123', 'password123');
        
        expect(result).toBe(false);
    });
});


describe('checkAuthStatus', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        global.fetch.mockReset();
    });
    
    test('отправляет GET запрос на /api/profile/', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ is_authenticated: false })
        });
        
        await checkAuthStatus();
        
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/profile/',
            expect.objectContaining({
                method: 'GET'
            })
        );
    });
    
    test('показывает кнопки авторизованного пользователя', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                is_authenticated: true,
                default_currency: 'EUR',
                theme: 'dark'
            })
        });
        
        await checkAuthStatus();
        
        expect(mockElements.loginBtn.style.display).toBe('none');
        expect(mockElements.registerBtn.style.display).toBe('none');
        expect(mockElements.profileBtn.style.display).toBe('block');
        expect(mockElements.logoutBtn.style.display).toBe('block');
    });
    
    test('показывает кнопки неавторизованного пользователя', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ is_authenticated: false })
        });
        
        await checkAuthStatus();
        
        expect(mockElements.loginBtn.style.display).toBe('block');
        expect(mockElements.registerBtn.style.display).toBe('block');
        expect(mockElements.profileBtn.style.display).toBe('none');
        expect(mockElements.logoutBtn.style.display).toBe('none');
    });
    
    test('применяет тему пользователя', async () => {
        document.body.classList._classes.clear();
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                is_authenticated: true,
                theme: 'dark'
            })
        });
        
        await checkAuthStatus();
        
        expect(document.body.classList.contains('dark-theme')).toBe(true);
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ loadProfileData
// ============================================================================

describe('loadProfileData', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        global.fetch.mockReset();
    });
    
    test('отправляет GET запрос на /api/profile/', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ username: 'testuser', default_currency: 'EUR' })
        });
        
        await loadProfileData();
        
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/profile/',
            expect.objectContaining({
                method: 'GET'
            })
        );
    });
    
    test('заполняет данные профиля при успехе', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ username: 'testuser', default_currency: 'EUR' })
        });
        
        await loadProfileData();
        
        expect(mockElements.profileUsername.value).toBe('testuser');
    });
    
    test('открывает форму входа при ошибке', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({})
        });
        
        await loadProfileData();
        
        expect(mockElements.profileModal.style.display).toBe('none');
        expect(mockElements.loginModal.style.display).toBe('block');
    });
});

describe('updateProfile', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        global.fetch.mockReset();
        document.querySelector.mockReturnValue({ value: 'test-csrf' });
    });
    
    test('отправляет PATCH запрос на /api/profile/', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await updateProfile('testuser', 'EUR');
        
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/profile/',
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({
                    username: 'testuser',
                    default_currency: 'EUR'
                })
            })
        );
    });
    
    test('возвращает true при успехе', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        const result = await updateProfile('testuser', 'EUR');
        
        expect(result).toBe(true);
    });
    
    test('обновляет выбранную валюту', async () => {
        global.fetch.mockResolvedValue({ ok: true });
        
        await updateProfile('testuser', 'GBP');
        
        expect(mockElements.currencyFromSelect.value).toBe('GBP');
    });
});


describe('loadProfileAndSetCurrency', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        global.fetch.mockReset();
        setExchangeRates({ USD: 95.5, EUR: 102.3 });
    });
    
    test('загружает профиль и устанавливает валюту', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ default_currency: 'EUR' })
        });
        
        await loadProfileAndSetCurrency();
        
        expect(mockElements.currencyFromSelect.value).toBe('EUR');
    });
    
    test('не выбрасывает ошибку при неудаче', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        await expect(loadProfileAndSetCurrency()).resolves.not.toThrow();
    });
});


describe('updateChart', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        mockElements.datePicker.value = '2026-02-22';
        mockElements.chartCurrencySelect.value = 'USD';
        mockElements.chartCurrencySelect2.value = 'RUB';
        
        global.fetch.mockReset();
        global.alert.mockReset();
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ 'ДОЛЛАР': 95.5 })
        });
    });
    
    test('показывает предупреждение при большом количестве дней', async () => {
        mockElements.days.value = 30;
        
        await updateChart();
        
        expect(global.alert).toHaveBeenCalledWith('Введено слишком большое количество дней');
    });
    
    test('ограничивает количество дней до 20', async () => {
        mockElements.days.value = 30;
        
        await updateChart();
        
        expect(mockElements.days.value).toBe(20);
    });
    
    test('вызывает fetch с правильными параметрами', async () => {
        await updateChart();
        
        expect(global.fetch).toHaveBeenCalled();
    });
});

describe('Интеграционные тесты', () => {
    test('последовательное применение тем', () => {
        document.body.classList._classes.clear();
        
        applyTheme('dark');
        expect(document.body.classList.contains('dark-theme')).toBe(true);
        
        applyTheme('light');
        expect(document.body.classList.contains('dark-theme')).toBe(false);
        
        applyTheme('dark');
        expect(document.body.classList.contains('dark-theme')).toBe(true);
    });
    
    test('работа с курсами через get/set', () => {
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8
        });
        
        const rates = getExchangeRates();
        expect(rates.USD).toBe(95.5);
        expect(rates.EUR).toBe(102.3);
        expect(rates.GBP).toBe(119.8);
    });
    
    test('поиск курсов после изменения CODE_TO_RUS', () => {
        const data = { 'ДОЛЛАР': 96 };
        const rate = findRateInResponse(data, 'USD');
        expect(rate).toBe(96);
    });
    
    test('полный цикл конвертации', () => {
        const mockElements = setupMockDOM();
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8
        });

        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('9550.00');

        swapCurrencies();
        
        expect(mockElements.currencyFromSelect.value).toBe('RUB');
        expect(mockElements.currencyToSelect.value).toBe('USD');
    });
});


describe('Граничные значения', () => {
    test('findRateInResponse с очень большим числом', () => {
        const data = { 'ДОЛЛАР': 999999999.99 };
        expect(findRateInResponse(data, 'USD')).toBe(999999999.99);
    });
    
    test('findRateInResponse с очень маленьким числом', () => {
        const data = { 'ДОЛЛАР': 0.0001 };
        expect(findRateInResponse(data, 'USD')).toBe(0.0001);
    });
    
    test('findRateInResponse с отрицательным числом', () => {
        const data = { 'ДОЛЛАР': -5 };
        expect(findRateInResponse(data, 'USD')).toBe(-5);
    });
    
    test('randd с очень большим чётным числом', () => {
        global.alert.mockClear();
        randd(1000000);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет расти');
    });
    
    test('randd с очень большим нечётным числом', () => {
        global.alert.mockClear();
        randd(1000001);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет падать');
    });
    
    test('конвертация очень большой суммы', () => {
        const mockElements = setupMockDOM();
        setExchangeRates({ USD: 95.5 });
        
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '999999999';
        
        convertCurrency();
        
        expect(parseFloat(mockElements.amountToInput.value)).toBeCloseTo(999999999 * 95.5, 0);
    });
    
    test('конвертация очень маленькой суммы', () => {
        const mockElements = setupMockDOM();
        setExchangeRates({ USD: 95.5 });
        
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '0.01';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('0.96');
    });
});



describe('Обработка ошибок', () => {
    test('loadRates обрабатывает сетевую ошибку', async () => {
        setupMockDOM();
        global.fetch.mockRejectedValue(new Error('Network error'));
        global.alert.mockClear();
        
        await loadRates('2026-01-15');
        
        expect(global.alert).toHaveBeenCalledWith('Ошибка загрузки курсов');
    });
    
    test('saveUserProfile обрабатывает ошибку', async () => {
        document.querySelector.mockReturnValue({ value: 'csrf' });
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        await expect(saveUserProfile({ theme: 'dark' })).resolves.not.toThrow();
    });
    
    test('loadProfileAndSetCurrency обрабатывает ошибку', async () => {
        setupMockDOM();
        global.fetch.mockRejectedValue(new Error('Network error'));

        await expect(loadProfileAndSetCurrency()).resolves.not.toThrow();
    });
});


describe('Специфические сценарии', () => {
    test('конвертация между одинаковыми валютами даёт 1', () => {
        const mockElements = setupMockDOM();
        setExchangeRates({ USD: 95.5, EUR: 102.3 });
        
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'USD';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('100.00');
    });
    
    test('конвертация с отсутствующим курсом', () => {
        const mockElements = setupMockDOM();
        setExchangeRates({ USD: 95.5 }); // EUR отсутствует
        
        mockElements.currencyFromSelect.value = 'EUR';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();

        expect(mockElements.exchangeRateElement.textContent).toContain('1.0000');
    });
    
    test('updateTable с неполными данными выбрасывает ошибку', () => {
        const mockElements = setupMockDOM();
        setExchangeRates({ USD: 95.5 });
        expect(() => updateTable()).toThrow();
    });
    
    test('fetchSeriesFromApi с пустым ответом', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        
        const result = await fetchSeriesFromApi('USD', 'RUB', '2026-01-15', 1);

        expect(result.values[0]).toBeNull();
    });
});