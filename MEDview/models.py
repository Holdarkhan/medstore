from django.db import models

# Create your models here.
class Patients(models.Model):
    KeyName = models.CharField(max_length=90,primary_key=True)
    Name1 = models.CharField(max_length=30, null=True)
    Name2 = models.CharField(max_length=30, null=True)
    Name3 = models.CharField(max_length=30, null=True)
    Street = models.CharField(max_length=90, null=True)
    Apt = models.CharField(max_length=20, null=True)
    House = models.CharField(max_length=20, null=True)
    KC = models.CharField(max_length=10, null=True)
    Passwd = models.CharField(max_length=25, null=True)
    Porch = models.CharField(max_length=20, null=True)
    Floor = models.CharField(max_length=20, null=True)
    Tel1 = models.CharField(max_length=90, null=True)
    Tel2 = models.CharField(max_length=90, null=True)

class Vizov(models.Model):
    KeyName = models.ForeignKey(Patients)
    Age = models.CharField(max_length=20)
    Note = models.TextField()
    Decease = models.TextField()
    RedMoney = models.IntegerField(default=0)
    GreenMoney = models.IntegerField(default=0)
    Firm = models.CharField(max_length=30)
    Day = models.IntegerField(default=0)
    Month = models.IntegerField(default=0)
    Year = models.IntegerField(default=0)