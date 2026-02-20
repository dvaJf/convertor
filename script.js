const themeToggle = document.getElementById('themeToggle');
const amountFromInput = document.getElementById('amountFrom');
const amountToInput = document.getElementById('amountTo');
const currencyFromSelect = document.getElementById('currencyFrom');
const currencyToSelect = document.getElementById('currencyTo');
const fromResult = document.getElementById('fromResult');
const toResult = document.getElementById('toResult');
const exchangeRateElement = document.getElementById('exchangeRate');
const tableUsdRate = document.getElementById('tableUsdRate');
const tableEurRate = document.getElementById('tableEurRate');
const tableGbpRate = document.getElementById('tableGbpRate');
const tableUsdRate_d = document.getElementById('tableUsdRate_d');
const tableEurRate_d = document.getElementById('tableEurRate_d');
const tableGbpRate_d = document.getElementById('tableGbpRate_d');
const datePicker = document.getElementById('selectedDate');
const tableData = document.getElementsByClassName('date-cell');
const showTableBtn = document.getElementById('showTableBtn');
const showChartBtn = document.getElementById('showChartBtn');
const ratesTableContainer = document.getElementById('ratesTableContainer');
const chartContainer = document.getElementById('chartContainer');
const chartCanvas = document.getElementById('chartCanvas');
const chartCtx = chartCanvas.getContext('2d');
const chartCurrencySelect = document.getElementById('chartCurrency1');
const chartCurrencySelect2 = document.getElementById('chartCurrency2');
const days = document.getElementById('days');
const prognoz = document.getElementById('forecastBtn');

let exchangeRates = {};
const today = new Date();
today.setDate(today.getDate() - 1);
const formattedDate = today.toISOString().slice(0,10);
datePicker.value = formattedDate;

async function loadRates(date){
    try{
        res = await fetch(`http://localhost:8000//api/rates/?date=${date}`);// ВПИСАТЬ ХОСТ НОРМАЛЬНЫЙ 
        data = await res.json();
        exchangeRates = {};
        for(key in data){
            switch(key.toUpperCase()){
                case 'ДОЛЛАР': exchangeRates['USD']=parseFloat(data[key]); break;
                case 'ЕВРО': exchangeRates['EUR']=parseFloat(data[key]); break;
                case 'ФУНТ': exchangeRates['GBP']=parseFloat(data[key]); break;
                case 'ДОЛЛАР_DELTA': exchangeRates['USD_D']=parseFloat(data[key]); break;
                case 'ЕВРО_DELTA': exchangeRates['EUR_D']=parseFloat(data[key]); break;
                case 'ФУНТ_DELTA': exchangeRates['GBP_D']=parseFloat(data[key]); break;
            }
        }
        convertCurrency();
        updateTable();
        if(chartContainer.style.display !== 'none'){
            updateChart();
        }
    }catch(err){
        console.error(err); alert('Ошибка загрузки курсов');
    }
}

function convertCurrency(){
    from = currencyFromSelect.value;
    to = currencyToSelect.value;
    amount = parseFloat(amountFromInput.value)||0;
    let rate=1;
    if(from===to) rate=1;
    else if(from==='RUB') rate=1/exchangeRates[to];
    else if(to==='RUB') rate=exchangeRates[from];
    else rate=exchangeRates[to]/exchangeRates[from];
    result=amount*rate;
    amountToInput.value=result.toFixed(2);
    fromResult.textContent=amount.toFixed(2);
    toResult.textContent=result.toFixed(2);
    exchangeRateElement.textContent=`1 ${from} = ${rate.toFixed(4)} ${to}`;
}

function swapCurrencies(){
    const tempCur = currencyFromSelect.value;
    currencyFromSelect.value = currencyToSelect.value;
    currencyToSelect.value = tempCur;
    amountFromInput.value = amountToInput.value;
    convertCurrency();
}

function updateTable(){
    tableUsdRate.textContent = exchangeRates['USD'].toFixed(2);
    tableEurRate.textContent = exchangeRates['EUR'].toFixed(2);
    tableGbpRate.textContent = exchangeRates['GBP'].toFixed(2);
    tableUsdRate_d.textContent = exchangeRates['USD_D'] > 0 ? "+"+exchangeRates['USD_D'].toFixed(4) : exchangeRates['USD_D'].toFixed(4);
    tableEurRate_d.textContent = exchangeRates['EUR_D'] > 0 ? "+"+exchangeRates['EUR_D'].toFixed(4) : exchangeRates['EUR_D'].toFixed(4);
    tableGbpRate_d.textContent = exchangeRates['GBP_D'] > 0 ? "+"+exchangeRates['GBP_D'].toFixed(4) : exchangeRates['GBP_D'].toFixed(4);
    tableUsdRate_d.className = (exchangeRates['USD_D'] > 0 ? 'positive' : 'negative');
    tableEurRate_d.className =  (exchangeRates['EUR_D'] > 0 ? 'positive' : 'negative');
    tableGbpRate_d.className =  (exchangeRates['GBP_D'] > 0 ? 'positive' : 'negative');

    for (let cell of tableData) {
        cell.textContent = datePicker.value;
    }
}

function showTable(){
    ratesTableContainer.style.display = '';
    chartContainer.style.display = 'none';
    showTableBtn.classList.add('active');
    showChartBtn.classList.remove('active');
}

function showChart(){
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
    RUB: ['РУБЛЬ']
};

function findRateInResponse(dataObj, currencyCode){
    wanted = CODE_TO_RUS[currencyCode] || [];
    for(k of Object.keys(dataObj)){
        kk = k.toUpperCase();
        for(pattern of wanted){
            if(kk.indexOf(pattern.toUpperCase()) !== -1){
                return parseFloat(dataObj[k])
            }
        }
    }
    return null;
}

async function fetchSeriesFromApi(targetCurrency, baseCurrency, endDateIso, n){
    const labels = [];
    const values = [];

    const end = new Date(endDateIso);
    const dates = [];

    for(let i = n; i >= 0; i--){
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        dates.push(d.toISOString().slice(0,10));
    }

    const fetches = dates.map(date =>
        fetch(`http://localhost:8000/api/rates/?date=${date}`)
            .then(res => res.ok ? res.json() : null)
            .catch(()=>null)
    );

    const responses = await Promise.all(fetches);

    for(let i=0;i<dates.length;i++){
        const data = responses[i];

        if(!data){
            values.push(null);
            labels.push('');
            continue;
        }

        const targetRate = findRateInResponse(data, targetCurrency);
        const baseRate = findRateInResponse(data, baseCurrency);

        let rate;

        if(baseCurrency === targetCurrency){
            rate = 1; 
        } else if(baseCurrency === 'RUB'){
            rate = targetRate; 
        } else if(targetCurrency === 'RUB'){
            rate = 1 / baseRate; 
        } else {
            rate = targetRate / baseRate;
        }


        const d = new Date(dates[i]);
        const dd = String(d.getDate()).padStart(2,'0');
        const mm = String(d.getMonth()+1).padStart(2,'0');

        labels.push(`${dd}.${mm}`);
        values.push(rate);
    }

    return { labels, values };
}


function drawLineChartWithLabels(values, labels){
    const isDark = document.body.classList.contains('dark-theme');
    chartCtx.fillStyle = isDark ? '#363636' : '#f5f5f5';
    chartCtx.fillRect(0, 0, 760, 240);

    const padding = 40;
    const w = 760 - padding*2;
    const h = 240 - padding*2;

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
    for(let i=0;i<n;i++){
        const v = values[i];
        const x = padding + (i/(n-1))*w;
        const y = padding + h - ((v-minV)/range)*h;
        chartCtx.lineTo(x,y);
    }
    chartCtx.stroke();

    chartCtx.fillStyle = isDark ? '#FFFF' :'#333';
    for(let i=0;i<n;i++){
        const v = values[i];
        const x = padding + (i/(n-1))*w;
        
        const y = padding + h - ((v-minV)/range)*h;
        chartCtx.fillText(labels[i], x, padding+h+16);
        chartCtx.fillText(v.toFixed(2), x, y-10);
    }
}


async function updateChart(){
    const target = chartCurrencySelect.value;  
    const base = chartCurrencySelect2.value;
    const end = datePicker.value;
    const n = days.value;
    if(n>20){
        alert("Введено слишком большое количество дней")
        days.value=20
        n=20
    }

    const { labels, values } = await fetchSeriesFromApi(target, base, end, n);
    drawLineChartWithLabels(values, labels);
}

function randd(input) {
    if((input % 2) === 0){
        alert("курс долара будет расти");
    } else{
        alert("курс долара будет падать");
    }
    
}

prognoz.addEventListener('click', () => randd(2));

chartCurrencySelect2.addEventListener('change', updateChart);
chartCurrencySelect.addEventListener('change', updateChart);
currencyFromSelect.addEventListener('change', convertCurrency);
currencyToSelect.addEventListener('change', convertCurrency);
amountFromInput.addEventListener('input', convertCurrency);
document.getElementById('swapCurrencies').addEventListener('click', swapCurrencies);
document.querySelectorAll('.quick-amount[data-amount]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
        amountFromInput.value = btn.dataset.amount;
        convertCurrency();
    });
});
days.addEventListener('input',()=>{
    if(chartContainer.style.display !== 'none'){
    updateChart();
}});

datePicker.addEventListener('change', ()=>{ loadRates(datePicker.value); });
themeToggle.addEventListener('click', ()=>{
    document.body.classList.toggle('dark-theme');
    if(chartContainer.style.display !== 'none'){
        updateChart();
    }
});
showTable();
loadRates(datePicker.value);