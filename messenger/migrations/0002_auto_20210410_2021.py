# Generated by Django 3.1.7 on 2021-04-10 14:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messenger', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='status',
            field=models.CharField(default='Hi, I am using Potato Messenger', max_length=64),
        ),
    ]
