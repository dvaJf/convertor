"""
Модуль парсинга курсов валют с сайта ru.myfin.by

Данный скрипт выполняет автоматический сбор информации о курсах валют
(доллар, евро, фунт стерлингов) за указанный месяц и сохраняет данные
в базу данных PostgreSQL.

Автор: [Автор проекта]
Дата создания: [Дата]
"""

import requests  # Библиотека для выполнения HTTP-запросов
from bs4 import BeautifulSoup  # Библиотека для парсинга HTML-страниц
import psycopg2  # Драйвер для работы с PostgreSQL
from datetime import datetime  # Модуль для работы с датой и временем

# ============================================================================
# ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ
# ============================================================================

# Установка соединения с базой данных PostgreSQL
# Параметры подключения: имя БД, пользователь, пароль, хост, порт
conn = psycopg2.connect(
    dbname="currency_db",
    user="postgres",
    password="password",
    host="127.0.0.1",
    port="5432"
)

# Создание курсора для выполнения SQL-запросов
cursor = conn.cursor()

# ============================================================================
# ОСНОВНОЙ ЦИКЛ ПАРСИНГА
# ============================================================================

# Перебор дней месяца (от 1 до 31)
for x in range(1, 32):
    # Перебор месяцев (в данном случае только январь - месяц 1)
    for y in range(1, 2):
        # Формирование URL в зависимости от количества цифр в дне и месяце
        # Это необходимо для корректного формирования URL с ведущими нулями
        if x // 10 == 0 and y // 10 == 0:
            # День и месяц - однозначные числа (например: 01-01-2026)
            url = f'https://ru.myfin.by/currency/0{x}-0{y}-2026'
        elif x // 10 == 0 and y // 10 != 0:
            # День - однозначное, месяц - двузначное (например: 01-10-2026)
            url = f'https://ru.myfin.by/currency/0{x}-{y}-2026'
        elif x // 10 != 0 and y // 10 == 0:
            # День - двузначное, месяц - однозначное (например: 10-01-2026)
            url = f'https://ru.myfin.by/currency/{x}-0{y}-2026'
        else:
            # День и месяц - двузначные числа (например: 10-10-2026)
            url = f'https://ru.myfin.by/currency/{x}-{y}-2026'

        # Выполнение HTTP-GET запроса к странице с курсами валют
        response = requests.get(url)
        
        # Создание объекта BeautifulSoup для парсинга HTML
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Поиск таблицы с курсами валют по классу CSS
        table = soup.find('table', class_='table-best yellow_bg')

        # Извлечение даты из поля ввода на странице
        time = soup.find(class_='form-control')['value']

        # Обработка 4 строк таблицы (курсы для 4 валют)
        for row in range(4):
            # Получение текущей строки таблицы (пропускаем заголовок)
            row = table.find_all('tr')[1:][row]
            
            # Извлечение всех ячеек (td) из строки
            cols = row.find_all('td')
            
            # Проверка наличия данных в строке
            if not cols:
                continue
            
            # Извлечение названия валюты из первой ячейки
            currency = cols[0].get_text(strip=True)
            
            # Извлечение курса на сегодня из 4-й ячейки
            today = cols[3].get_text(strip=True)
            
            # Извлечение значения изменения курса (дельта) из тега <sup>
            sup_tag = cols[4].find('sup').get_text(strip=True)

            # Удаление тега <sup> для получения чистого курса на завтра
            for sup in cols[4].find('sup'):
                sup.decompose()

            # Получение курса на завтра из 5-й ячейки (без тега sup)
            tomorrow = cols[4].get_text(strip=True)

            # Преобразование строковых значений в числа с плавающей точкой
            # Замена запятой на точку для корректного преобразования
            today = float(today.replace(',', '.'))
            tomorrow = float(tomorrow.replace(',', '.'))
            sup_tag = float(sup_tag.replace(',', '.'))
            
            # Преобразование строки даты в объект datetime
            parsed_date = datetime.strptime(time, '%d.%m.%Y')
            
            # Вывод извлеченных данных в консоль для отладки
            print({
                "name": currency,
                "today": today,
                "tomorrow": tomorrow,
                "delta": sup_tag,
                "time": time
            })
            
            # Вставка данных в таблицу rates базы данных
            # Поля: код валюты, курс сегодня, курс завтра, изменение, дата парсинга
            cursor.execute("""
                INSERT INTO rates (currency, today, tomorrow, delta, parsed_time)
                VALUES (%s, %s, %s, %s, %s)
            """, (currency, today, tomorrow, sup_tag, parsed_date))
            
            # Фиксация изменений в базе данных
            conn.commit()