# Generated by Django 3.1.7 on 2021-04-14 08:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('messenger', '0003_remove_profile_custom_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='read_on',
            field=models.DateTimeField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='message',
            name='reply_to',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='messenger.message'),
        ),
    ]