"""
Представления главного приложения currency_project

Данный модуль содержит представления для отображения главной страницы
веб-приложения конвертера валют.

Автор: [Автор проекта]
Дата создания: [Дата]
"""

from django.shortcuts import render
from django.views.generic import TemplateView


class IndexView(TemplateView):
    """
    Класс представления главной страницы приложения.
    
    Наследуется от TemplateView для отображения статического HTML-шаблона.
    
    Атрибуты:
        template_name (str): Путь к HTML-шаблону главной страницы.
    
    Возвращает:
        Rendered template: Отрендеренный HTML-шаблон index.html.
    """
    template_name = 'index.html'