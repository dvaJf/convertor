
let themeToggle = document.getElementById('themeToggle');
let amountFromInput = document.getElementById('amountFrom');
let amountToInput = document.getElementById('amountTo');
let currencyFromSelect = document.getElementById('currencyFrom');
let currencyToSelect = document.getElementById('currencyTo');
let fromResult = document.getElementById('fromResult');
let toResult = document.getElementById('toResult');
let exchangeRateElement = document.getElementById('exchangeRate');
let tableUsdRate = document.getElementById('tableUsdRate');
let tableEurRate = document.getElementById('tableEurRate');
let tableGbpRate = document.getElementById('tableGbpRate');
let tableUsdRate_d = document.getElementById('tableUsdRate_d');
let tableEurRate_d = document.getElementById('tableEurRate_d');
let tableGbpRate_d = document.getElementById('tableGbpRate_d');
let datePicker = document.getElementById('selectedDate');
const tableData = document.getElementsByClassName('date-cell');
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
let registerBtn = document.getElementById('registerBtn');
let loginBtn = document.getElementById('loginBtn');
let profileBtn = document.getElementById('profileBtn');
let logoutBtn = document.getElementById('logoutBtn');
let registerModal = document.getElementById('registerModal');
let loginModal = document.getElementById('loginModal');
let profileModal = document.getElementById('profileModal');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const profileForm = document.getElementById('profileForm');
const registerError = document.getElementById('registerError');
const loginError = document.getElementById('loginError');
const profileMessage = document.getElementById('profileMessage');
let profileUsername = document.getElementById('profileUsername');
let profileCurrency = document.getElementById('profileCurrency');
const registerUsername = document.getElementById('registerUsername');
const registerPassword = document.getElementById('registerPassword');
const registerPassword2 = document.getElementById('registerPassword2');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
let exchangeRates = {};
const today = new Date();
today.setDate(today.getDate() - 1);
const formattedDate = today.toISOString().slice(0, 10);
datePicker.value = formattedDate;


//Загружает курсы валют с сервера за указанную дату.
async function loadRates(date) {
    try {
        const res = await fetch(`/api/rates/?date=${date}`);
        const data = await res.json();
        exchangeRates = {};
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
        convertCurrency();
        updateTable();

        if (chartContainer.style.display !== 'none') {
            updateChart();
        }
    } catch (err) {
        console.error(err);
        alert('Ошибка загрузки курсов');
    }
}


//Выполняет конвертацию валюты на основе текущих курсов.
function convertCurrency() {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
        return;
    }
    from = currencyFromSelect.value;
    to = currencyToSelect.value;

    amount = parseFloat(amountFromInput.value) || 0;
    let rate = 1;
    if (from === to) {
        rate = 1;
    } else if (from === 'RUB') {
        rate = 1 / exchangeRates[to];
    } else if (to === 'RUB') {
        rate = exchangeRates[from];
    } else {
        rate = exchangeRates[to] / exchangeRates[from];
    }
    if (isNaN(rate) || !isFinite(rate)) {
        rate = 1;
    }
    result = amount * rate;
    amountToInput.value = result.toFixed(2);
    fromResult.textContent = amount.toFixed(2);
    toResult.textContent = result.toFixed(2);
    exchangeRateElement.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
}


//Меняет местами исходную и целевую валюты.
function swapCurrencies() {
    const currentFrom = currencyFromSelect.value;
    const currentTo = currencyToSelect.value;
    const currentResult = parseFloat(amountToInput.value) || 0;

    currencyFromSelect.value = currentTo;
    currencyToSelect.value = currentFrom;
    amountFromInput.value = currentResult.toFixed(2);
    convertCurrency();
}

//Обновляет таблицу курсов валют на странице.
function updateTable() {
    tableUsdRate.textContent = exchangeRates['USD'].toFixed(2);
    tableEurRate.textContent = exchangeRates['EUR'].toFixed(2);
    tableGbpRate.textContent = exchangeRates['GBP'].toFixed(2);
    tableUsdRate_d.textContent = exchangeRates['USD_D'] > 0
        ? '+' + exchangeRates['USD_D'].toFixed(4)
        : exchangeRates['USD_D'].toFixed(4);
    tableEurRate_d.textContent = exchangeRates['EUR_D'] > 0
        ? '+' + exchangeRates['EUR_D'].toFixed(4)
        : exchangeRates['EUR_D'].toFixed(4);
    tableGbpRate_d.textContent = exchangeRates['GBP_D'] > 0
        ? '+' + exchangeRates['GBP_D'].toFixed(4)
        : exchangeRates['GBP_D'].toFixed(4);

    tableUsdRate_d.className = (exchangeRates['USD_D'] > 0 ? 'positive' : 'negative');
    tableEurRate_d.className = (exchangeRates['EUR_D'] > 0 ? 'positive' : 'negative');
    tableGbpRate_d.className = (exchangeRates['GBP_D'] > 0 ? 'positive' : 'negative');
    for (let cell of tableData) {
        cell.textContent = datePicker.value;
    }
}

//Показывает таблицу курсов и скрывает график.
function showTable() {
    ratesTableContainer.style.display = '';
    chartContainer.style.display = 'none';
    showTableBtn.classList.add('active');
    showChartBtn.classList.remove('active');
}

//Показывает график курсов и скрывает таблицу.
function showChart() {
    ratesTableContainer.style.display = 'none';
    chartContainer.style.display = '';
    showTableBtn.classList.remove('active');
    showChartBtn.classList.add('active');
    updateChart();
}

showTableBtn.addEventListener('click', showTable);
showChartBtn.addEventListener('click', showChart);

CODE_TO_RUS = {
    USD: ['ДОЛЛАР'],
    EUR: ['ЕВРО'],
    GBP: ['ФУНТ'],
};


//Находит курс валюты в ответе API по коду валюты.
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


//Получает серию данных о курсах за несколько дней.
async function fetchSeriesFromApi(targetCurrency, baseCurrency, endDateIso, n) {
    const labels = [];
    const values = [];

    const end = new Date(endDateIso);
    const dates = [];
    for (let i = n; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
    }
    const fetches = dates.map(date =>
        fetch(`/api/rates/?date=${date}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
    );

    const responses = await Promise.all(fetches);
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
        if (baseCurrency === targetCurrency) {
            rate = 1;
        } else if (baseCurrency === 'RUB') {
            rate = targetRate;
        } else if (targetCurrency === 'RUB') {
            rate = 1 / baseRate;
        } else {
            rate = targetRate / baseRate;
        }
        const d = new Date(dates[i]);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');

        labels.push(`${dd}.${mm}`);
        values.push(rate);
    }

    return { labels, values };
}


// Рисует  график
function drawLineChartWithLabels(values, labels) {
    const isDark = document.body.classList.contains('dark-theme');
    chartCtx.fillStyle = isDark ? '#363636' : '#f5f5f5';
    chartCtx.fillRect(0, 0, 760, 240);

    const padding = 40;
    const w = 760 - padding * 2;
    const h = 240 - padding * 2;
    const maxV = Math.max(...values);
    const minV = Math.min(...values);
    const range = (maxV - minV);

    chartCtx.strokeStyle = '#ccc';
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    chartCtx.moveTo(padding, padding + h);
    chartCtx.lineTo(padding + w, padding + h);
    chartCtx.stroke();

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
    chartCtx.fillStyle = isDark ? '#FFFF' : '#333';
    for (let i = 0; i < n; i++) {
        const v = values[i];
        const x = padding + (i / (n - 1)) * w;

        const y = padding + h - ((v - minV) / range) * h;
        chartCtx.fillText(labels[i], x, padding + h + 16);
        chartCtx.fillText(v.toFixed(2), x, y - 10);
    }
}


// Обновляет график курсов валют.

async function updateChart() {
    const target = chartCurrencySelect.value;
    const base = chartCurrencySelect2.value;
    const end = datePicker.value;
    let n = parseInt(days.value) || 7;

    if (n > 20) {
        alert('Введено слишком большое количество дней');
        days.value = 20;
        n = 20;
    }

    const { labels, values } = await fetchSeriesFromApi(target, base, end, n);
    drawLineChartWithLabels(values, labels);
}


function randd(input) {
    if ((input % 2) === 0) {
        alert('курс долара будет расти');
    } else {
        alert('курс долара будет падать');
    }
}

prognoz.addEventListener('click', () => randd(2));


chartCurrencySelect2.addEventListener('change', updateChart);
chartCurrencySelect.addEventListener('change', updateChart);
currencyFromSelect.addEventListener('change', convertCurrency);
currencyToSelect.addEventListener('change', convertCurrency);
amountFromInput.addEventListener('input', convertCurrency);
document.getElementById('swapCurrencies').addEventListener('click', swapCurrencies);
document.querySelectorAll('.quick-amount[data-amount]').forEach(btn => {
    btn.addEventListener('click', () => {
        amountFromInput.value = btn.dataset.amount;
        convertCurrency();
    });
});

days.addEventListener('input', () => {
    if (chartContainer.style.display !== 'none') {
        updateChart();
    }
});


datePicker.addEventListener('change', () => {
    loadRates(datePicker.value);
});

//Применяет указанную тему оформления.
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'dark' : 'light';
    if (logoutBtn.style.display === 'block') {
        saveTheme(newTheme);
    }
    if (chartContainer.style.display !== 'none') {
        updateChart();
    }
});

//Открывает окно.

function openModal(modal) {
    modal.style.display = 'block';
}


//Закрывает окно.
function closeModal(modal) {
    modal.style.display = 'none';
}

// Обработчики закрытия окон
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function () {
        const modal = this.closest('.modal');
        closeModal(modal);
    });
});

window.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
});

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


//Получение CSRF-токен из cookies или формы.
function getCsrfToken() {
    const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfInput) {
        return csrfInput.value;
    }
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


//Сохраняет данные профиля пользователя на сервере.
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


//Сохраняет валюту по умолчанию для текущего пользователя.
async function saveDefaultCurrency(currency) {
    await saveUserProfile({ default_currency: currency });
}


// Сохраняет тему оформления для текущего пользователя.
async function saveTheme(theme) {
    await saveUserProfile({ theme: theme });
}


//Загружает профиль пользователя и устанавливает валюту по умолчанию.
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


//Выполняет вход пользователя в систему.
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
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        profileBtn.style.display = 'block';
        logoutBtn.style.display = 'block';

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


//Загружает данные профиля пользователя.
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


//Обновляет профиль пользователя.
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

currencyFromSelect.addEventListener('change', function () {
    if (logoutBtn.style.display === 'block') {
        saveDefaultCurrency(currencyFromSelect.value);
    }
});


//Регистрирует нового пользователя.
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

// Выход
async function logoutUser() {
    try {
        const response = await fetch('/api/logout/', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
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

//Проверка статус аутентификации пользователя.
async function checkAuthStatus() {
    const response = await fetch('/api/profile/', {
        method: 'GET',
        credentials: 'include'
    });
    
    if (response.ok) {
        const userData = await response.json();
        if (userData.is_authenticated) {
            registerBtn.style.display = 'none';
            loginBtn.style.display = 'none';
            profileBtn.style.display = 'block';
            logoutBtn.style.display = 'block';
            if (userData.default_currency) {
                currencyFromSelect.value = userData.default_currency;
                chartCurrencySelect.value = userData.default_currency;
                convertCurrency();
            }
            if (userData.theme) {
                applyTheme(userData.theme);
            }
        } else {
            registerBtn.style.display = 'block';
            loginBtn.style.display = 'block';
            profileBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }
}

checkAuthStatus();
showTable();
loadRates(datePicker.value);


// ЭКСПОРТ ДЛЯ ТЕСТИРОВАНИЯ
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
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
    };
    
    module.exports.getExchangeRates = function() {
        return exchangeRates;
    };
    module.exports.setExchangeRates = function(rates) {
        exchangeRates = rates;
    };

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
