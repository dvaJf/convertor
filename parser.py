import requests
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime

conn = psycopg2.connect(
    dbname="currency_db",
    user="postgres",
    password="password",
    host="127.0.0.1",
    port="5432"
)
cursor = conn.cursor()

for x in range(17,20): 
    for y in range(2,3):
        if x//10==0 and y//10==0:
            url = f'https://ru.myfin.by/currency/0{x}-0{y}-2026'
        elif x//10==0 and y//10!=0:
            url = f'https://ru.myfin.by/currency/0{x}-{y}-2026'
        elif x//10!=0 and y//10==0:
            url = f'https://ru.myfin.by/currency/{x}-0{y}-2026'
        else:
            url = f'https://ru.myfin.by/currency/{x}-{y}-2026'

        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'lxml')
        table = soup.find('table', class_='table-best yellow_bg')

        time = soup.find(class_='form-control')['value']

        for row in range(4):
            row = table.find_all('tr')[1:][row]
            cols = row.find_all('td')
            if not cols:
                continue
            currency = cols[0].get_text(strip=True)
            today = cols[3].get_text(strip=True)
            
            sup_tag = cols[4].find('sup').get_text(strip=True)

            for sup in cols[4].find('sup'):
                sup.decompose()

            tomorrow = cols[4].get_text(strip=True)

            today = float(today.replace(',', '.'))
            tomorrow = float(tomorrow.replace(',', '.'))
            sup_tag = float(sup_tag.replace(',', '.'))
            parsed_date = datetime.strptime(time, '%d.%m.%Y')
            print({
                "name": currency,
                "today": today,
                "tomorrow": tomorrow,
                "delta":sup_tag,
                "time":time
            })
            cursor.execute("""
                INSERT INTO rates (currency, today, tomorrow, delta, parsed_time)
                VALUES (%s, %s, %s, %s, %s)
            """, (currency, today, tomorrow, sup_tag, parsed_date))
            conn.commit()
