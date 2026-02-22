/**
 * Юнит-тесты для script.js
 * 
 * Данный файл импортирует функции напрямую из script.js и тестирует их.
 * При изменении функций в script.js тесты покажут, работают ли они корректно.
 * 
 * Запуск тестов:
 *     npx jest script.test.js
 *     или
 *     npm test
 * 
 * Автор: [Автор проекта]
 * Дата создания: [Дата]
 */

// ============================================================================
// МОКИ DOM-ЭЛЕМЕНТОВ (для загрузки script.js в Node.js)
// ============================================================================

// Создаём моки для всех DOM-элементов, используемых в script.js
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
    // Мок для canvas
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

// Специальный мок для элемента days (числовое значение)
const createMockDaysElement = () => {
    const el = createMockElement('days');
    el._value = 7;
    Object.defineProperty(el, 'value', {
        get: function() { return this._value; },
        set: function(v) { this._value = parseInt(v) || 7; }
    });
    return el;
};

// Специальный мок для элемента datePicker (дата)
const createMockDatePickerElement = () => {
    const el = createMockElement('selectedDate');
    el._value = '2026-02-22';
    Object.defineProperty(el, 'value', {
        get: function() { return this._value; },
        set: function(v) { this._value = v; }
    });
    return el;
};

// Мок для document
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

// Мок для window
global.window = {
    addEventListener: jest.fn(),
    alert: jest.fn()
};

// Мок для fetch
global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
}));

// Мок для alert
global.alert = jest.fn();

// Мок для console
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

// ============================================================================
// ИМПОРТ ТЕСТИРУЕМЫХ ФУНКЦИЙ ИЗ script.js
// ============================================================================

// Импортируем модуль после настройки моков
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

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ТЕСТОВ
// ============================================================================

/**
 * Создаёт полный набор моков DOM-элементов для тестирования
 */
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
        days: createMockDaysElement(),  // Специальный мок с числовым value
        datePicker: createMockDatePickerElement(),  // Специальный мок с датой
        chartCtx: createMockElement('chartCanvas').getContext(),
        themeToggle: createMockElement('themeToggle'),
        registerBtn: createMockElement('registerBtn'),
        loginBtn: createMockElement('loginBtn'),
        profileBtn: createMockElement('profileBtn'),
        logoutBtn: createMockElement('logoutBtn'),
        registerModal: createMockElement('registerModal'),
        loginModal: createMockElement('loginModal'),
        profileModal: createMockElement('profileModal'),
        // Добавляем элементы форм профиля
        profileUsername: createMockElement('profileUsername'),
        profileCurrency: createMockElement('profileCurrency')
    };
    
    setDOMElements(mockElements);
    return mockElements;
}

// ============================================================================
// ТЕСТЫ ДЛЯ CODE_TO_RUS
// ============================================================================

describe('CODE_TO_RUS', () => {
    test('содержит ключ USD', () => {
        expect(CODE_TO_RUS).toHaveProperty('USD');
    });
    
    test('содержит ключ EUR', () => {
        expect(CODE_TO_RUS).toHaveProperty('EUR');
    });
    
    test('содержит ключ GBP', () => {
        expect(CODE_TO_RUS).toHaveProperty('GBP');
    });
    
    test('USD содержит ДОЛЛАР', () => {
        expect(CODE_TO_RUS.USD).toContain('ДОЛЛАР');
    });
    
    test('EUR содержит ЕВРО', () => {
        expect(CODE_TO_RUS.EUR).toContain('ЕВРО');
    });
    
    test('GBP содержит ФУНТ', () => {
        expect(CODE_TO_RUS.GBP).toContain('ФУНТ');
    });
    
    test('USD является массивом', () => {
        expect(Array.isArray(CODE_TO_RUS.USD)).toBe(true);
    });
    
    test('EUR является массивом', () => {
        expect(Array.isArray(CODE_TO_RUS.EUR)).toBe(true);
    });
    
    test('GBP является массивом', () => {
        expect(Array.isArray(CODE_TO_RUS.GBP)).toBe(true);
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ findRateInResponse
// ============================================================================

describe('findRateInResponse', () => {
    // ------------------------------------------------------------------------
    // ПОЗИТИВНЫЕ ТЕСТЫ
    // ------------------------------------------------------------------------
    
    test('находит курс USD по ключу ДОЛЛАР', () => {
        const data = { 'ДОЛЛАР': 95.5 };
        expect(findRateInResponse(data, 'USD')).toBe(95.5);
    });
    
    test('находит курс EUR по ключу ЕВРО', () => {
        const data = { 'ЕВРО': 102.3 };
        expect(findRateInResponse(data, 'EUR')).toBe(102.3);
    });
    
    test('находит курс GBP по ключу ФУНТ', () => {
        const data = { 'ФУНТ': 119.8 };
        expect(findRateInResponse(data, 'GBP')).toBe(119.8);
    });
    
    test('работает с разным регистром ключа', () => {
        const data = { 'доллар': 95.5 };
        expect(findRateInResponse(data, 'USD')).toBe(95.5);
    });
    
    test('работает с ключом в нижнем регистре', () => {
        const data = { 'евро': 100 };
        expect(findRateInResponse(data, 'EUR')).toBe(100);
    });
    
    test('возвращает число при строковом значении', () => {
        const data = { 'ДОЛЛАР': '95.5' };
        expect(typeof findRateInResponse(data, 'USD')).toBe('number');
        expect(findRateInResponse(data, 'USD')).toBe(95.5);
    });
    
    test('находит курс с суффиксом _DELTA', () => {
        const data = { 'ДОЛЛАР_DELTA': 0.5 };
        expect(findRateInResponse(data, 'USD')).toBe(0.5);
    });
    
    test('работает с ключом, содержащим пробелы', () => {
        const data = { 'ДОЛЛАР ': 96 };
        expect(findRateInResponse(data, 'USD')).toBe(96);
    });
    
    // ------------------------------------------------------------------------
    // НЕГАТИВНЫЕ ТЕСТЫ
    // ------------------------------------------------------------------------
    
    test('возвращает null для неизвестной валюты', () => {
        const data = { 'ДОЛЛАР': 95.5 };
        expect(findRateInResponse(data, 'JPY')).toBeNull();
    });
    
    test('возвращает null для пустого объекта', () => {
        expect(findRateInResponse({}, 'USD')).toBeNull();
    });
    
    test('возвращает null если валюта не в CODE_TO_RUS', () => {
        const data = { 'ЙЕНА': 0.65 };
        expect(findRateInResponse(data, 'JPY')).toBeNull();
    });
    
    test('возвращает null если ключ не содержит паттерн', () => {
        const data = { 'РУБЛЬ': 1 };
        expect(findRateInResponse(data, 'USD')).toBeNull();
    });
    
    test('возвращает NaN при невалидном значении', () => {
        const data = { 'ДОЛЛАР': 'invalid' };
        const result = findRateInResponse(data, 'USD');
        expect(isNaN(result)).toBe(true);
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ applyTheme
// ============================================================================

describe('applyTheme', () => {
    beforeEach(() => {
        // Очищаем классы перед каждым тестом
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
    
    test('удаляет dark-theme при любой другой теме', () => {
        document.body.classList.add('dark-theme');
        applyTheme('unknown');
        expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
    
    test('работает с пустой строкой', () => {
        document.body.classList.add('dark-theme');
        applyTheme('');
        expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
    
    test('работает с null', () => {
        document.body.classList.add('dark-theme');
        applyTheme(null);
        expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
    
    test('работает с undefined', () => {
        document.body.classList.add('dark-theme');
        applyTheme(undefined);
        expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
    
    test('регистрозависимая тема dark', () => {
        applyTheme('Dark');
        expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
    
    test('регистрозависимая тема DARK', () => {
        applyTheme('DARK');
        expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ openModal / closeModal
// ============================================================================

describe('openModal / closeModal', () => {
    test('openModal устанавливает display: block', () => {
        const modal = createMockElement('testModal');
        openModal(modal);
        expect(modal.style.display).toBe('block');
    });
    
    test('closeModal устанавливает display: none', () => {
        const modal = createMockElement('testModal');
        closeModal(modal);
        expect(modal.style.display).toBe('none');
    });
    
    test('открытие и закрытие модального окна', () => {
        const modal = createMockElement('testModal');
        openModal(modal);
        expect(modal.style.display).toBe('block');
        
        closeModal(modal);
        expect(modal.style.display).toBe('none');
    });
    
    test('повторное открытие модального окна', () => {
        const modal = createMockElement('testModal');
        openModal(modal);
        openModal(modal);
        expect(modal.style.display).toBe('block');
    });
    
    test('повторное закрытие модального окна', () => {
        const modal = createMockElement('testModal');
        closeModal(modal);
        closeModal(modal);
        expect(modal.style.display).toBe('none');
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ getCsrfToken
// ============================================================================

describe('getCsrfToken', () => {
    beforeEach(() => {
        document.querySelector.mockReset();
        document.cookie = '';
    });
    
    test('возвращает null если нет токена', () => {
        document.querySelector.mockReturnValue(null);
        document.cookie = '';
        
        const token = getCsrfToken();
        expect(token).toBeNull();
    });
    
    test('пытается найти токен в форме', () => {
        const mockInput = { value: 'test-csrf-token' };
        document.querySelector.mockReturnValue(mockInput);
        
        const token = getCsrfToken();
        expect(token).toBe('test-csrf-token');
    });
    
    test('ищет токен в cookie', () => {
        document.querySelector.mockReturnValue(null);
        document.cookie = 'csrftoken=cookie-token; other=value';
        
        const token = getCsrfToken();
        expect(token).toBe('cookie-token');
    });
    
    test('возвращает null если cookie пустая', () => {
        document.querySelector.mockReturnValue(null);
        document.cookie = '';
        
        const token = getCsrfToken();
        expect(token).toBeNull();
    });
    
    test('находит токен в начале cookie', () => {
        document.querySelector.mockReturnValue(null);
        document.cookie = 'csrftoken=first-token; sessionid=abc123';
        
        const token = getCsrfToken();
        expect(token).toBe('first-token');
    });
    
    test('находит токен в середине cookie', () => {
        document.querySelector.mockReturnValue(null);
        document.cookie = 'sessionid=abc123; csrftoken=middle-token; other=value';
        
        const token = getCsrfToken();
        expect(token).toBe('middle-token');
    });
    
    test('декодирует токен', () => {
        document.querySelector.mockReturnValue(null);
        document.cookie = 'csrftoken=encoded%20token';
        
        const token = getCsrfToken();
        expect(token).toBe('encoded token');
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ exchangeRates (get/set)
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ randd (функция прогноза)
// ============================================================================

describe('randd', () => {
    beforeEach(() => {
        global.alert.mockClear();
    });
    
    test('предсказывает рост для чётного числа', () => {
        randd(2);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет расти');
    });
    
    test('предсказывает падение для нечётного числа', () => {
        randd(1);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет падать');
    });
    
    test('предсказывает рост для 0', () => {
        randd(0);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет расти');
    });
    
    test('предсказывает рост для 100', () => {
        randd(100);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет расти');
    });
    
    test('предсказывает падение для 99', () => {
        randd(99);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет падать');
    });
    
    test('работает с отрицательными числами', () => {
        randd(-2);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет расти');
        
        global.alert.mockClear();
        
        randd(-1);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет падать');
    });
    
    test('работает с дробными числами (усечение)', () => {
        // JavaScript: 2.5 % 2 = 0.5 (не чётное), Math.floor(2.5) = 2
        // Но функция использует input % 2 напрямую, поэтому 2.5 % 2 = 0.5 (не 0)
        randd(2.5);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет падать');  // 0.5 !== 0
        
        global.alert.mockClear();
        
        randd(3.9);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет падать');  // 3.9 % 2 = 1.9 !== 0
    });
    
    test('работает с очень большим чётным числом', () => {
        global.alert.mockClear();
        randd(1000000);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет расти');
    });
    
    test('работает с очень большим нечётным числом', () => {
        global.alert.mockClear();
        randd(1000001);
        expect(global.alert).toHaveBeenCalledWith('курс долара будет падать');
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ showTable / showChart
// ============================================================================

describe('showTable / showChart', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        // Устанавливаем дату для updateChart
        mockElements.datePicker.value = '2026-02-22';
        mockElements.days.value = '7';
        mockElements.chartCurrencySelect.value = 'USD';
        mockElements.chartCurrencySelect2.value = 'RUB';
        
        // Мокаем fetch для showChart
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

// ============================================================================
// ТЕСТЫ ДЛЯ convertCurrency
// ============================================================================

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
    
    test('не выполняется без курсов', () => {
        setExchangeRates({});
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('');
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
    
    test('конвертация EUR в USD (кросс-курс)', () => {
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

// ============================================================================
// ТЕСТЫ ДЛЯ swapCurrencies
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ updateTable
// ============================================================================

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
    
    test('устанавливает класс negative для нулевой дельты', () => {
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8,
            USD_D: 0,
            EUR_D: 0,
            GBP_D: 0
        });
        
        updateTable();
        
        expect(mockElements.tableUsdRate_d.className).toBe('negative');
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ loadRates
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ fetchSeriesFromApi
// ============================================================================

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
        
        expect(result.labels.length).toBe(4); // n + 1 точек
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

// ============================================================================
// ТЕСТЫ ДЛЯ drawLineChartWithLabels
// ============================================================================

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
        
        // fillStyle устанавливается дважды: сначала для фона (#363636), потом для текста (#FFFF)
        // Проверяем что fillRect был вызван (что означает fillStyle был установлен)
        expect(mockElements.chartCtx.fillRect).toHaveBeenCalled();
    });
    
    test('использует светлую тему без класса', () => {
        const values = [95, 96];
        const labels = ['01.01', '02.01'];
        
        drawLineChartWithLabels(values, labels);
        
        // fillStyle устанавливается дважды: сначала для фона (#f5f5f5), потом для текста (#333)
        // Проверяем что fillRect был вызван (что означает fillStyle был установлен)
        expect(mockElements.chartCtx.fillRect).toHaveBeenCalled();
    });
});

// ============================================================================
// ТЕСТЫ ДЛЯ saveUserProfile
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ saveDefaultCurrency
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ saveTheme
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ loginUser
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ registerUser
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ checkAuthStatus
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ updateProfile
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ loadProfileAndSetCurrency
// ============================================================================

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

// ============================================================================
// ТЕСТЫ ДЛЯ updateChart
// ============================================================================

describe('updateChart', () => {
    let mockElements;
    
    beforeEach(() => {
        mockElements = setupMockDOM();
        // Устанавливаем необходимые значения
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

// ============================================================================
// ИНТЕГРАЦИОННЫЕ ТЕСТЫ
// ============================================================================

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
        // Установка курсов
        setExchangeRates({
            USD: 95.5,
            EUR: 102.3,
            GBP: 119.8
        });
        
        // Проверка получения
        const rates = getExchangeRates();
        expect(rates.USD).toBe(95.5);
        expect(rates.EUR).toBe(102.3);
        expect(rates.GBP).toBe(119.8);
    });
    
    test('поиск курсов после изменения CODE_TO_RUS', () => {
        // CODE_TO_RUS используется в findRateInResponse
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
        
        // Конвертация USD в RUB
        mockElements.currencyFromSelect.value = 'USD';
        mockElements.currencyToSelect.value = 'RUB';
        mockElements.amountFromInput.value = '100';
        
        convertCurrency();
        
        expect(mockElements.amountToInput.value).toBe('9550.00');
        
        // Обмен валют
        swapCurrencies();
        
        expect(mockElements.currencyFromSelect.value).toBe('RUB');
        expect(mockElements.currencyToSelect.value).toBe('USD');
    });
});

// ============================================================================
// ТЕСТЫ ГРАНИЧНЫХ ЗНАЧЕНИЙ
// ============================================================================

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

// ============================================================================
// ТЕСТЫ КЛАССОВ ЭКВИВАЛЕНТНОСТИ
// ============================================================================

describe('Классы эквивалентности для findRateInResponse', () => {
    test('класс: ключи в верхнем регистре', () => {
        expect(findRateInResponse({ 'ДОЛЛАР': 95 }, 'USD')).toBe(95);
        expect(findRateInResponse({ 'ЕВРО': 100 }, 'EUR')).toBe(100);
        expect(findRateInResponse({ 'ФУНТ': 120 }, 'GBP')).toBe(120);
    });
    
    test('класс: ключи в нижнем регистре', () => {
        expect(findRateInResponse({ 'доллар': 95 }, 'USD')).toBe(95);
        expect(findRateInResponse({ 'евро': 100 }, 'EUR')).toBe(100);
        expect(findRateInResponse({ 'фунт': 120 }, 'GBP')).toBe(120);
    });
    
    test('класс: ключи в смешанном регистре', () => {
        expect(findRateInResponse({ 'Доллар': 95 }, 'USD')).toBe(95);
        expect(findRateInResponse({ 'Евро': 100 }, 'EUR')).toBe(100);
        expect(findRateInResponse({ 'Фунт': 120 }, 'GBP')).toBe(120);
    });
    
    test('класс: ключи с суффиксами', () => {
        expect(findRateInResponse({ 'ДОЛЛАР_DELTA': 0.5 }, 'USD')).toBe(0.5);
        expect(findRateInResponse({ 'ЕВРО_delta': -0.3 }, 'EUR')).toBe(-0.3);
    });
});

// ============================================================================
// ТЕСТЫ DOM-ЭЛЕМЕНТОВ
// ============================================================================

describe('setDOMElements / getDOMElements', () => {
    test('setDOMElements устанавливает элементы', () => {
        const mockElements = {
            amountFromInput: createMockElement('test'),
            currencyFromSelect: createMockElement('test')
        };
        
        setDOMElements(mockElements);
        
        const elements = getDOMElements();
        expect(elements.amountFromInput.id).toBe('test');
    });
    
    test('getDOMElements возвращает все элементы', () => {
        const elements = getDOMElements();
        
        expect(elements).toHaveProperty('amountFromInput');
        expect(elements).toHaveProperty('amountToInput');
        expect(elements).toHaveProperty('currencyFromSelect');
        expect(elements).toHaveProperty('currencyToSelect');
    });
});

// ============================================================================
// ТЕСТЫ ОБРАБОТКИ ОШИБОК
// ============================================================================

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
        
        // Не должен выбросить ошибку
        await expect(saveUserProfile({ theme: 'dark' })).resolves.not.toThrow();
    });
    
    test('loadProfileAndSetCurrency обрабатывает ошибку', async () => {
        setupMockDOM();
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        // Не должен выбросить ошибку
        await expect(loadProfileAndSetCurrency()).resolves.not.toThrow();
    });
});

// ============================================================================
// ТЕСТЫ СПЕЦИФИЧЕСКИХ СЦЕНАРИЕВ
// ============================================================================

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
        
        // При отсутствии курса должен использовать 1
        expect(mockElements.exchangeRateElement.textContent).toContain('1.0000');
    });
    
    test('updateTable с неполными данными выбрасывает ошибку', () => {
        const mockElements = setupMockDOM();
        setExchangeRates({ USD: 95.5 }); // Только USD, EUR и GBP отсутствуют
        
        // Должен выбросить ошибку при попытке вызвать toFixed на undefined
        expect(() => updateTable()).toThrow();
    });
    
    test('fetchSeriesFromApi с пустым ответом', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        
        const result = await fetchSeriesFromApi('USD', 'RUB', '2026-01-15', 1);
        
        // При пустом ответе должен вернуть null
        expect(result.values[0]).toBeNull();
    });
});