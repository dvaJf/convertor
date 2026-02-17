from django.db import models

class Rate(models.Model):
    currency = models.CharField(max_length=10)
    today = models.DecimalField(max_digits=10, decimal_places=4)
    tomorrow = models.DecimalField(max_digits=10, decimal_places=4, null=True)
    delta = models.DecimalField(max_digits=10, decimal_places=4, null=True)
    parsed_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rates'

    def __str__(self):
        return self.currency
