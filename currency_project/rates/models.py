from django.db import models


class Rate(models.Model):
    """
    Поля:
        currency (str): Код валюты (например, 'ДОЛЛАР', 'ЕВРО', 'ФУНТ').
        today (Decimal): Курс валюты на текущий день.
        tomorrow (Decimal): Курс валюты на завтрашний день.
        delta (Decimal): Изменение курса по сравнению с предыдущим днём.
        parsed_time (DateTime): Дата и время парсинга/публикации курса.
    Примечание:
        Курсы хранятся в российских рублях за 1 единицу иностранной валюты.
    """
    
    currency = models.CharField(
        max_length=3,
        verbose_name='Валюта',
        help_text='Код или название валюты (например, ДОЛЛАР, ЕВРО, ФУНТ)'
    )
    
    today = models.DecimalField(
        max_digits=10, 
        decimal_places=4,
        verbose_name='Курс сегодня',
    )
    
    tomorrow = models.DecimalField(
        max_digits=10, 
        decimal_places=4,
        verbose_name='Курс завтра',
    )
    
    delta = models.DecimalField(
        max_digits=10, 
        decimal_places=4,
        verbose_name='Изменение курса',
    )
    
    parsed_time = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата парсинга',
    )

    class Meta:
        db_table = 'rates'
        verbose_name = 'Курс валюты'
        verbose_name_plural = 'Курсы валют'

    def __str__(self):
        return self.currency