/**
 * Клиентский JavaScript для приложения конвертера валют
 * 
 * Данный модуль обеспечивает интерактивность веб-интерфейса конвертера валют,
 * включая:
 * - Загрузку и отображение курсов валют
 * - Конвертацию валют в реальном времени
 * - Построение графиков динамики курсов
 * - Управление темой оформления
 * - Аутентификацию и управление профилем пользователя
 * 
 * Автор: [Автор проекта]
 * Дата создания: [Дата]
 */

// ============================================================================
// ПОЛУЧЕНИЕ DOM-ЭЛЕМЕНТОВ
// ============================================================================

// Элементы управления темой (let для возможности переназначения в тестах)
let themeToggle = document.getElementById('themeToggle');

// Элементы конвертера валют
let amountFromInput = document.getElementById('amountFrom');
let amountToInput = document.getElementById('amountTo');
let currencyFromSelect = document.getElementById('currencyFrom');
let currencyToSelect = document.getElementById('currencyTo');
let fromResult = document.getElementById('fromResult');
let toResult = document.getElementById('toResult');
let exchangeRateElement = document.getElementById('exchangeRate');

// Элементы таблицы курсов
let tableUsdRate = document.getElementById('tableUsdRate');
let tableEurRate = document.getElementById('tableEurRate');
let tableGbpRate = document.getElementById('tableGbpRate');
let tableUsdRate_d = document.getElementById('tableUsdRate_d');
let tableEurRate_d = document.getElementById('tableEurRate_d');
let tableGbpRate_d = document.getElementById('tableGbpRate_d');
let datePicker = document.getElementById('selectedDate');
const tableData = document.getElementsByClassName('date-cell');

// Элементы переключения видов (таблица/график)
let showTableBtn = document.getElementById('showTableBtn');
let showChartBtn = document.getElementById('showChartBtn');
let ratesTableContainer = document.getElementById('ratesTableContainer');
let chartContainer = document.getElementById('chartContainer');
const chartCanvas = document.getElementById('chartCanvas');
let chartCtx = chartCanvas.getContext('2d');
let chartCurrencySelect = document.getElementById('chartCurrency1');
let chartCurrencySelect2 = document.getElementById('chartCurrency2');
let days = document.getElementById('days');
const prognoz = document.getElementById('forecastBtn');

// Элементы аутентификации
let registerBtn = document.getElementById('registerBtn');
let loginBtn = document.getElementById('loginBtn');
let profileBtn = document.getElementById('profileBtn');
let logoutBtn = document.getElementById('logoutBtn');

// Модальные окна
let registerModal = document.getElementById('registerModal');
let loginModal = document.getElementById('loginModal');
let profileModal = document.getElementById('profileModal');

// Формы
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const profileForm = document.getElementById('profileForm');

// Элементы сообщений об ошибках
const registerError = document.getElementById('registerError');
const loginError = document.getElementById('loginError');
const profileMessage = document.getElementById('profileMessage');

// Поля форм (let для возможности переназначения в тестах)
let profileUsername = document.getElementById('profileUsername');
let profileCurrency = document.getElementById('profileCurrency');
const registerUsername = document.getElementById('registerUsername');
const registerPassword = document.getElementById('registerPassword');
const registerPassword2 = document.getElementById('registerPassword2');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');

// ============================================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================================

/** @type {Object} Объект для хранения текущих курсов валют */
let exchangeRates = {};

// Инициализация даты (вчерашний день по умолчанию)
const today = new Date();
today.setDate(today.getDate() - 1);
const formattedDate = today.toISOString().slice(0, 10);
datePicker.value = formattedDate;

// ============================================================================
// ФУНКЦИИ ЗАГРУЗКИ И КОНВЕРТАЦИИ ВАЛЮТ
// ============================================================================

/**
 * Загружает курсы валют с сервера за указанную дату.
 * 
 * Выполняет асинхронный запрос к API и обновляет глобальный объект
 * exchangeRates, затем обновляет таблицу курсов и выполняет конвертацию.
 * 
 * @param {string} date - Дата в формате ISO (YYYY-MM-DD)
 * @returns {Promise<void>}
 * 
 * @example
 * loadRates('2026-01-15');
 */
async function loadRates(date) {
    try {
        // Выполнение GET-запроса к API курсов
        const res = await fetch(`/api/rates/?date=${date}`);
        const data = await res.json();
        
        // Сброс текущих курсов
        exchangeRates = {};
        
        // Преобразование ответа API в удобный формат
        for (const key in data) {
            switch (key.toUpperCase()) {
                case 'ДОЛЛАР':
                    exchangeRates['USD'] = parseFloat(data[key]);
                    break;
                case 'ЕВРО':
                    exchangeRates['EUR'] = parseFloat(data[key]);
                    break;
                case 'ФУНТ':
                    exchangeRates['GBP'] = parseFloat(data[key]);
                    break;
                case 'ДОЛЛАР_DELTA':
                    exchangeRates['USD_D'] = parseFloat(data[key]);
                    break;
                case 'ЕВРО_DELTA':
                    exchangeRates['EUR_D'] = parseFloat(data[key]);
                    break;
                case 'ФУНТ_DELTA':
                    exchangeRates['GBP_D'] = parseFloat(data[key]);
                    break;
            }
        }
        
        // Обновление интерфейса
        convertCurrency();
        updateTable();
        
        // Обновление графика, если он отображается
        if (chartContainer.style.display !== 'none') {
            updateChart();
        }
    } catch (err) {
        console.error(err);
        alert('Ошибка загрузки курсов');
    }
}

/**
 * Выполняет конвертацию валюты на основе текущих курсов.
 * 
 * Рассчитывает сумму в целевой валюте на основе введённой суммы
 * и выбранных валют, затем обновляет отображение результата.
 * 
 * @returns {void}
 * 
 * @example
 * // После изменения курса или суммы
 * convertCurrency();
 */
function convertCurrency() {
    // Проверка наличия загруженных курсов
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
        return;
    }
    
    // Получение выбранных валют
    from = currencyFromSelect.value;
    to = currencyToSelect.value;
    
    // Получение введённой суммы
    amount = parseFloat(amountFromInput.value) || 0;
    
    // Расчёт курса конвертации
    let rate = 1;
    if (from === to) {
        rate = 1;
    } else if (from === 'RUB') {
        // Конвертация из рублей в иностранную валюту
        rate = 1 / exchangeRates[to];
    } else if (to === 'RUB') {
        // Конвертация из иностранной валюты в рубли
        rate = exchangeRates[from];
    } else {
        // Кросс-курс между иностранными валютами
        rate = exchangeRates[to] / exchangeRates[from];
    }

    // Проверка корректности курса
    if (isNaN(rate) || !isFinite(rate)) {
        rate = 1;
    }

    // Расчёт результата
    result = amount * rate;
    
    // Обновление полей результата
    amountToInput.value = result.toFixed(2);
    fromResult.textContent = amount.toFixed(2);
    toResult.textContent = result.toFixed(2);
    exchangeRateElement.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
}

/**
 * Меняет местами исходную и целевую валюты.
 * 
 * После обмена валют выполняет повторную конвертацию.
 * 
 * @returns {void}
 */
function swapCurrencies() {
    const currentFrom = currencyFromSelect.value;
    const currentTo = currencyToSelect.value;
    const currentResult = parseFloat(amountToInput.value) || 0;
    
    // Обмен валют
    currencyFromSelect.value = currentTo;
    currencyToSelect.value = currentFrom;
    
    // Установка результата как новой суммы
    amountFromInput.value = currentResult.toFixed(2);
    
    // Пересчёт
    convertCurrency();
}

// ============================================================================
// ФУНКЦИИ ОБНОВЛЕНИЯ ТАБЛИЦЫ
// ============================================================================

/**
 * Обновляет таблицу курсов валют на странице.
 * 
 * Заполняет ячейки таблицы текущими курсами и их изменениями.
 * Добавляет CSS-классы для цветовой индикации роста/падения курса.
 * 
 * @returns {void}
 */
function updateTable() {
    // Обновление курсов
    tableUsdRate.textContent = exchangeRates['USD'].toFixed(2);
    tableEurRate.textContent = exchangeRates['EUR'].toFixed(2);
    tableGbpRate.textContent = exchangeRates['GBP'].toFixed(2);
    
    // Обновление изменений с форматированием (знак + для роста)
    tableUsdRate_d.textContent = exchangeRates['USD_D'] > 0
        ? '+' + exchangeRates['USD_D'].toFixed(4)
        : exchangeRates['USD_D'].toFixed(4);
    tableEurRate_d.textContent = exchangeRates['EUR_D'] > 0
        ? '+' + exchangeRates['EUR_D'].toFixed(4)
        : exchangeRates['EUR_D'].toFixed(4);
    tableGbpRate_d.textContent = exchangeRates['GBP_D'] > 0
        ? '+' + exchangeRates['GBP_D'].toFixed(4)
        : exchangeRates['GBP_D'].toFixed(4);
    
    // Установка CSS-классов для цветовой индикации
    tableUsdRate_d.className = (exchangeRates['USD_D'] > 0 ? 'positive' : 'negative');
    tableEurRate_d.className = (exchangeRates['EUR_D'] > 0 ? 'positive' : 'negative');
    tableGbpRate_d.className = (exchangeRates['GBP_D'] > 0 ? 'positive' : 'negative');

    // Обновление даты в ячейках таблицы
    for (let cell of tableData) {
        cell.textContent = datePicker.value;
    }
}

// ============================================================================
// ФУНКЦИИ УПРАВЛЕНИЯ ВИДАМИ (ТАБЛИЦА/ГРАФИК)
// ============================================================================

/**
 * Показывает таблицу курсов и скрывает график.
 * 
 * @returns {void}
 */
function showTable() {
    ratesTableContainer.style.display = '';
    chartContainer.style.display = 'none';
    showTableBtn.classList.add('active');
    showChartBtn.classList.remove('active');
}

/**
 * Показывает график курсов и скрывает таблицу.
 * 
 * При переключении на график выполняет его обновление.
 * 
 * @returns {void}
 */
function showChart() {
    ratesTableContainer.style.display = 'none';
    chartContainer.style.display = '';
    showTableBtn.classList.remove('active');
    showChartBtn.classList.add('active');
    updateChart();
}

// Обработчики переключения видов
showTableBtn.addEventListener('click', showTable);
showChartBtn.addEventListener('click', showChart);

// ============================================================================
// ФУНКЦИИ ПОСТРОЕНИЯ ГРАФИКОВ
// ============================================================================

/**
 * Словарь соответствия кодов валют русским названиям.
 * Используется для поиска курса в ответе API.
 */
CODE_TO_RUS = {
    USD: ['ДОЛЛАР'],
    EUR: ['ЕВРО'],
    GBP: ['ФУНТ'],
};

/**
 * Находит курс валюты в ответе API по коду валюты.
 * 
 * @param {Object} dataObj - Объект с данными от API
 * @param {string} currencyCode - Код валюты (USD, EUR, GBP)
 * @returns {number|null} Курс валюты или null, если не найден
 * 
 * @example
 * const rate = findRateInResponse(data, 'USD');
 */
function findRateInResponse(dataObj, currencyCode) {
    wanted = CODE_TO_RUS[currencyCode] || [];
    for (k of Object.keys(dataObj)) {
        kk = k.toUpperCase();
        for (pattern of wanted) {
            if (kk.indexOf(pattern.toUpperCase()) !== -1) {
                return parseFloat(dataObj[k]);
            }
        }
    }
    return null;
}

/**
 * Получает серию данных о курсах за несколько дней.
 * 
 * Выполняет множественные запросы к API для получения
 * исторических данных о курсах.
 * 
 * @param {string} targetCurrency - Целевая валюта (USD, EUR, GBP, RUB)
 * @param {string} baseCurrency - Базовая валюта
 * @param {string} endDateIso - Конечная дата в формате ISO
 * @param {number} n - Количество дней для выборки
 * @returns {Promise<{labels: string[], values: number[]}>} Объект с метками и значениями
 * 
 * @example
 * const { labels, values } = await fetchSeriesFromApi('USD', 'RUB', '2026-01-15', 7);
 */
async function fetchSeriesFromApi(targetCurrency, baseCurrency, endDateIso, n) {
    const labels = [];
    const values = [];

    const end = new Date(endDateIso);
    const dates = [];

    // Формирование списка дат для запроса
    for (let i = n; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
    }

    // Параллельные запросы к API
    const fetches = dates.map(date =>
        fetch(`/api/rates/?date=${date}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
    );

    const responses = await Promise.all(fetches);

    // Обработка ответов
    for (let i = 0; i < dates.length; i++) {
        const data = responses[i];

        if (!data) {
            values.push(null);
            labels.push('');
            continue;
        }

        const targetRate = findRateInResponse(data, targetCurrency);
        const baseRate = findRateInResponse(data, baseCurrency);

        let rate;

        // Расчёт курса
        if (baseCurrency === targetCurrency) {
            rate = 1;
        } else if (baseCurrency === 'RUB') {
            rate = targetRate;
        } else if (targetCurrency === 'RUB') {
            rate = 1 / baseRate;
        } else {
            rate = targetRate / baseRate;
        }

        // Форматирование даты для метки
        const d = new Date(dates[i]);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');

        labels.push(`${dd}.${mm}`);
        values.push(rate);
    }

    return { labels, values };
}

/**
 * Рисует линейный график с метками на canvas.
 * 
 * @param {number[]} values - Массив значений для построения
 * @param {string[]} labels - Массив меток для оси X
 * @returns {void}
 * 
 * @example
 * drawLineChartWithLabels([95.5, 95.7, 96.0], ['01.01', '02.01', '03.01']);
 */
function drawLineChartWithLabels(values, labels) {
    // Определение цветовой схемы в зависимости от темы
    const isDark = document.body.classList.contains('dark-theme');
    
    // Очистка и заливка фона
    chartCtx.fillStyle = isDark ? '#363636' : '#f5f5f5';
    chartCtx.fillRect(0, 0, 760, 240);

    const padding = 40;
    const w = 760 - padding * 2;
    const h = 240 - padding * 2;

    // Вычисление диапазона значений
    const maxV = Math.max(...values);
    const minV = Math.min(...values);
    const range = (maxV - minV);

    // Рисование оси X
    chartCtx.strokeStyle = '#ccc';
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    chartCtx.moveTo(padding, padding + h);
    chartCtx.lineTo(padding + w, padding + h);
    chartCtx.stroke();

    // Рисование линии графика
    chartCtx.strokeStyle = '#007bff';
    chartCtx.lineWidth = 2;
    chartCtx.beginPath();
    const n = values.length;
    for (let i = 0; i < n; i++) {
        const v = values[i];
        const x = padding + (i / (n - 1)) * w;
        const y = padding + h - ((v - minV) / range) * h;
        chartCtx.lineTo(x, y);
    }
    chartCtx.stroke();

    // Рисование меток и значений
    chartCtx.fillStyle = isDark ? '#FFFF' : '#333';
    for (let i = 0; i < n; i++) {
        const v = values[i];
        const x = padding + (i / (n - 1)) * w;

        const y = padding + h - ((v - minV) / range) * h;
        chartCtx.fillText(labels[i], x, padding + h + 16);
        chartCtx.fillText(v.toFixed(2), x, y - 10);
    }
}

/**
 * Обновляет график курсов валют.
 * 
 * Получает данные с сервера и рисует график.
 * 
 * @returns {Promise<void>}
 */
async function updateChart() {
    const target = chartCurrencySelect.value;
    const base = chartCurrencySelect2.value;
    const end = datePicker.value;
    let n = parseInt(days.value) || 7;
    
    // Ограничение количества дней
    if (n > 20) {
        alert('Введено слишком большое количество дней');
        days.value = 20;
        n = 20;
    }

    const { labels, values } = await fetchSeriesFromApi(target, base, end, n);
    drawLineChartWithLabels(values, labels);
}

/**
 * Функция-заглушка для прогнозирования курса.
 * 
 * Выводит простое сообщение о прогнозе.
 * 
 * @param {number} input - Входное значение для "прогноза"
 * @returns {void}
 */
function randd(input) {
    if ((input % 2) === 0) {
        alert('курс долара будет расти');
    } else {
        alert('курс долара будет падать');
    }
}

// Обработчик кнопки прогноза
prognoz.addEventListener('click', () => randd(2));

// ============================================================================
// ОБРАБОТЧИКИ СОБЫТИЙ КОНВЕРТЕРА
// ============================================================================

// Обработчики изменения параметров графика
chartCurrencySelect2.addEventListener('change', updateChart);
chartCurrencySelect.addEventListener('change', updateChart);

// Обработчики конвертера
currencyFromSelect.addEventListener('change', convertCurrency);
currencyToSelect.addEventListener('change', convertCurrency);
amountFromInput.addEventListener('input', convertCurrency);
document.getElementById('swapCurrencies').addEventListener('click', swapCurrencies);

// Обработчики быстрых сумм
document.querySelectorAll('.quick-amount[data-amount]').forEach(btn => {
    btn.addEventListener('click', () => {
        amountFromInput.value = btn.dataset.amount;
        convertCurrency();
    });
});

// Обработчик изменения количества дней для графика
days.addEventListener('input', () => {
    if (chartContainer.style.display !== 'none') {
        updateChart();
    }
});

// Обработчик изменения даты
datePicker.addEventListener('change', () => {
    loadRates(datePicker.value);
});

// ============================================================================
// ФУНКЦИИ УПРАВЛЕНИЯ ТЕМОЙ ОФОРМЛЕНИЯ
// ============================================================================

/**
 * Применяет указанную тему оформления.
 * 
 * @param {string} theme - Название темы ('light' или 'dark')
 * @returns {void}
 * 
 * @example
 * applyTheme('dark');
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Обработчик переключения темы
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'dark' : 'light';
    
    // Сохранение темы для авторизованных пользователей
    if (logoutBtn.style.display === 'block') {
        saveTheme(newTheme);
    }
    
    // Перерисовка графика при смене темы
    if (chartContainer.style.display !== 'none') {
        updateChart();
    }
});

// ============================================================================
// ФУНКЦИИ УПРАВЛЕНИЯ МОДАЛЬНЫМИ ОКНАМИ
// ============================================================================

/**
 * Открывает модальное окно.
 * 
 * @param {HTMLElement} modal - Элемент модального окна
 * @returns {void}
 * 
 * @example
 * openModal(registerModal);
 */
function openModal(modal) {
    modal.style.display = 'block';
}

/**
 * Закрывает модальное окно.
 * 
 * @param {HTMLElement} modal - Элемент модального окна
 * @returns {void}
 * 
 * @example
 * closeModal(loginModal);
 */
function closeModal(modal) {
    modal.style.display = 'none';
}

// Обработчики закрытия модальных окон
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function () {
        const modal = this.closest('.modal');
        closeModal(modal);
    });
});

// Закрытие по клику вне модального окна
window.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
});

// Обработчики кнопок аутентификации
registerBtn.addEventListener('click', () => {
    openModal(registerModal);
});

loginBtn.addEventListener('click', () => {
    openModal(loginModal);
});

profileBtn.addEventListener('click', () => {
    openModal(profileModal);
    loadProfileData();
});

logoutBtn.addEventListener('click', async () => {
    await logoutUser();
});

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

/**
 * Получает CSRF-токен из cookies или формы.
 * 
 * @returns {string|null} CSRF-токен или null, если не найден
 */
function getCsrfToken() {
    // Попытка получить токен из формы
    const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfInput) {
        return csrfInput.value;
    }
    
    // Попытка получить токен из cookies
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken'.length + 1) === ('csrftoken' + '=')) {
                cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Сохраняет данные профиля пользователя на сервере.
 * 
 * @param {Object} data - Данные для обновления профиля
 * @returns {Promise<void>}
 * 
 * @example
 * await saveUserProfile({ default_currency: 'EUR' });
 */
async function saveUserProfile(data) {
    try {
        await fetch('/api/profile/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
    } catch (error) {
        console.error('Ошибка сохранения профиля:', error);
    }
}

/**
 * Сохраняет валюту по умолчанию для текущего пользователя.
 * 
 * @param {string} currency - Код валюты (USD, EUR, GBP)
 * @returns {Promise<void>}
 */
async function saveDefaultCurrency(currency) {
    await saveUserProfile({ default_currency: currency });
}

/**
 * Сохраняет тему оформления для текущего пользователя.
 * 
 * @param {string} theme - Название темы ('light' или 'dark')
 * @returns {Promise<void>}
 */
async function saveTheme(theme) {
    await saveUserProfile({ theme: theme });
}

/**
 * Загружает профиль пользователя и устанавливает валюту по умолчанию.
 * 
 * @returns {Promise<void>}
 */
async function loadProfileAndSetCurrency() {
    try {
        const response = await fetch('/api/profile/', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            if (userData.default_currency) {
                currencyFromSelect.value = userData.default_currency;
                chartCurrencySelect.value = userData.default_currency;
                convertCurrency();
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}

// ============================================================================
// ФУНКЦИИ АУТЕНТИФИКАЦИИ
// ============================================================================

/**
 * Выполняет вход пользователя в систему.
 * 
 * Отправляет учётные данные на сервер и обновляет интерфейс
 * при успешной аутентификации.
 * 
 * @param {string} username - Имя пользователя
 * @param {string} password - Пароль пользователя
 * @returns {Promise<boolean>} true при успешном входе, false при ошибке
 * 
 * @example
 * const success = await loginUser('ivan', 'password123');
 */
async function loginUser(username, password) {
    const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        }),
        credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
        loginError.textContent = '';
        closeModal(loginModal);
        
        // Обновление видимости кнопок
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        profileBtn.style.display = 'block';
        logoutBtn.style.display = 'block';
        
        // Загрузка настроек пользователя
        loadProfileAndSetCurrency();
        return true;
    } else {
        loginError.textContent = data.detail || 'Ошибка входа';
        return false;
    }
}

// Обработчик формы входа
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (username && password) {
        await loginUser(username, password);
    } else {
        loginError.textContent = 'Пожалуйста, заполните все поля';
    }
});

/**
 * Загружает данные профиля пользователя.
 * 
 * При успешной загрузке заполняет форму профиля.
 * При ошибке открывает форму входа.
 * 
 * @returns {Promise<void>}
 */
async function loadProfileData() {
    const response = await fetch('/api/profile/', {
        method: 'GET',
        credentials: 'include'
    });

    if (response.ok) {
        const userData = await response.json();
        profileUsername.value = userData.username;
        profileCurrency.value = userData.default_currency;
    } else {
        closeModal(profileModal);
        openModal(loginModal);
    }
}

/**
 * Обновляет профиль пользователя.
 * 
 * @param {string} username - Имя пользователя
 * @param {string} currency - Валюта по умолчанию
 * @returns {Promise<boolean|undefined>} true при успехе
 */
async function updateProfile(username, currency) {
    const response = await fetch('/api/profile/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
            username: username,
            default_currency: currency
        }),
        credentials: 'include'
    });

    if (response.ok) {
        profileMessage.textContent = 'Профиль успешно обновлен!';
        setTimeout(() => {
            profileMessage.textContent = '';
        }, 3000);
        
        if (currency) {
            currencyFromSelect.value = currency;
            chartCurrencySelect.value = currency;
            convertCurrency();
        }
        return true;
    }
}

// Обработчик формы профиля
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = profileUsername.value.trim();
    const currency = profileCurrency.value;

    if (username && currency) {
        await updateProfile(username, currency);
    } else {
        profileMessage.textContent = 'Пожалуйста, заполните все поля';
    }
});

// Сохранение валюты при изменении выбора
currencyFromSelect.addEventListener('change', function () {
    if (logoutBtn.style.display === 'block') {
        saveDefaultCurrency(currencyFromSelect.value);
    }
});

/**
 * Регистрирует нового пользователя.
 * 
 * @param {string} username - Имя пользователя
 * @param {string} password - Пароль
 * @param {string} password2 - Подтверждение пароля
 * @returns {Promise<boolean>} true при успешной регистрации
 */
async function registerUser(username, password, password2) {
    try {
        const response = await fetch('/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                password2: password2
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            registerError.textContent = '';
            closeModal(registerModal);
            openModal(loginModal);
            return true;
        } else {
            registerError.textContent = data.username || data.password || data.password2 || 'Ошибка регистрации';
            return false;
        }
    } catch (error) {
        console.error('Ошибка:', error);
        registerError.textContent = 'Ошибка соединения с сервером';
        return false;
    }
}

// Обработчик формы регистрации
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = registerUsername.value.trim();
    const password = registerPassword.value.trim();
    const password2 = registerPassword2.value.trim();

    if (username && password && password2) {
        if (password !== password2) {
            registerError.textContent = 'Пароли не совпадают';
            return;
        }
        await registerUser(username, password, password2);
    } else {
        registerError.textContent = 'Пожалуйста, заполните все поля';
    }
});

/**
 * Выполняет выход пользователя из системы.
 * 
 * @returns {Promise<boolean>} true при успешном выходе
 */
async function logoutUser() {
    try {
        const response = await fetch('/api/logout/', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            // Восстановление видимости кнопок
            registerBtn.style.display = 'block';
            loginBtn.style.display = 'block';
            profileBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
            return true;
        } else {
            const data = await response.json();
            console.error('Ошибка выхода:', data.detail || 'Неизвестная ошибка');
            return false;
        }
    } catch (error) {
        console.error('Ошибка:', error);
        return false;
    }
}

/**
 * Проверяет статус аутентификации пользователя.
 * 
 * Обновляет интерфейс в зависимости от статуса авторизации.
 * 
 * @returns {Promise<void>}
 */
async function checkAuthStatus() {
    const response = await fetch('/api/profile/', {
        method: 'GET',
        credentials: 'include'
    });
    
    if (response.ok) {
        const userData = await response.json();
        if (userData.is_authenticated) {
            // Пользователь авторизован
            registerBtn.style.display = 'none';
            loginBtn.style.display = 'none';
            profileBtn.style.display = 'block';
            logoutBtn.style.display = 'block';
            
            // Применение настроек пользователя
            if (userData.default_currency) {
                currencyFromSelect.value = userData.default_currency;
                chartCurrencySelect.value = userData.default_currency;
                convertCurrency();
            }
            if (userData.theme) {
                applyTheme(userData.theme);
            }
        } else {
            // Пользователь не авторизован
            registerBtn.style.display = 'block';
            loginBtn.style.display = 'block';
            profileBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================================================

// Проверка статуса авторизации при загрузке
checkAuthStatus();

// Отображение таблицы по умолчанию
showTable();

// Загрузка курсов за текущую дату
loadRates(datePicker.value);

// ============================================================================
// ЭКСПОРТ ДЛЯ ТЕСТИРОВАНИЯ (Node.js / Jest)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Константы
        CODE_TO_RUS,
        
        // Функции загрузки и конвертации
        loadRates,
        convertCurrency,
        swapCurrencies,
        findRateInResponse,
        
        // Функции таблицы
        updateTable,
        
        // Функции управления видами
        showTable,
        showChart,
        
        // Функции графиков
        fetchSeriesFromApi,
        drawLineChartWithLabels,
        updateChart,
        
        // Функция прогноза
        randd,
        
        // Функции темы
        applyTheme,
        
        // Функции модальных окон
        openModal,
        closeModal,
        
        // Вспомогательные функции
        getCsrfToken,
        
        // Функции сохранения
        saveUserProfile,
        saveDefaultCurrency,
        saveTheme,
        loadProfileAndSetCurrency,
        
        // Функции аутентификации
        loginUser,
        logoutUser,
        registerUser,
        checkAuthStatus,
        loadProfileData,
        updateProfile,
    };
    
    // Экспортируем геттер для exchangeRates
    module.exports.getExchangeRates = function() {
        return exchangeRates;
    };
    
    // Экспортируем сеттер для exchangeRates (для тестов)
    module.exports.setExchangeRates = function(rates) {
        exchangeRates = rates;
    };
    
    // Экспортируем сеттеры для DOM-элементов (для тестов)
    module.exports.setDOMElements = function(elements) {
        if (elements.amountFromInput) amountFromInput = elements.amountFromInput;
        if (elements.amountToInput) amountToInput = elements.amountToInput;
        if (elements.currencyFromSelect) currencyFromSelect = elements.currencyFromSelect;
        if (elements.currencyToSelect) currencyToSelect = elements.currencyToSelect;
        if (elements.fromResult) fromResult = elements.fromResult;
        if (elements.toResult) toResult = elements.toResult;
        if (elements.exchangeRateElement) exchangeRateElement = elements.exchangeRateElement;
        if (elements.tableUsdRate) tableUsdRate = elements.tableUsdRate;
        if (elements.tableEurRate) tableEurRate = elements.tableEurRate;
        if (elements.tableGbpRate) tableGbpRate = elements.tableGbpRate;
        if (elements.tableUsdRate_d) tableUsdRate_d = elements.tableUsdRate_d;
        if (elements.tableEurRate_d) tableEurRate_d = elements.tableEurRate_d;
        if (elements.tableGbpRate_d) tableGbpRate_d = elements.tableGbpRate_d;
        if (elements.ratesTableContainer) ratesTableContainer = elements.ratesTableContainer;
        if (elements.chartContainer) chartContainer = elements.chartContainer;
        if (elements.showTableBtn) showTableBtn = elements.showTableBtn;
        if (elements.showChartBtn) showChartBtn = elements.showChartBtn;
        if (elements.chartCurrencySelect) chartCurrencySelect = elements.chartCurrencySelect;
        if (elements.chartCurrencySelect2) chartCurrencySelect2 = elements.chartCurrencySelect2;
        if (elements.days) days = elements.days;
        if (elements.datePicker) datePicker = elements.datePicker;
        if (elements.chartCtx) chartCtx = elements.chartCtx;
        if (elements.themeToggle) themeToggle = elements.themeToggle;
        if (elements.registerBtn) registerBtn = elements.registerBtn;
        if (elements.loginBtn) loginBtn = elements.loginBtn;
        if (elements.profileBtn) profileBtn = elements.profileBtn;
        if (elements.logoutBtn) logoutBtn = elements.logoutBtn;
        if (elements.registerModal) registerModal = elements.registerModal;
        if (elements.loginModal) loginModal = elements.loginModal;
        if (elements.profileModal) profileModal = elements.profileModal;
        if (elements.profileUsername) profileUsername = elements.profileUsername;
        if (elements.profileCurrency) profileCurrency = elements.profileCurrency;
    };
    
    // Экспортируем геттер для DOM-элементов
    module.exports.getDOMElements = function() {
        return {
            amountFromInput, amountToInput, currencyFromSelect, currencyToSelect,
            fromResult, toResult, exchangeRateElement,
            tableUsdRate, tableEurRate, tableGbpRate,
            tableUsdRate_d, tableEurRate_d, tableGbpRate_d,
            ratesTableContainer, chartContainer,
            showTableBtn, showChartBtn,
            chartCurrencySelect, chartCurrencySelect2,
            days, datePicker, chartCtx,
            themeToggle, registerBtn, loginBtn, profileBtn, logoutBtn,
            registerModal, loginModal, profileModal
        };
    };
}
