# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-05-30 10:06
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('visor', '0007_auto_20170530_0758'),
    ]

    operations = [
        migrations.AddField(
            model_name='datafile',
            name='uploaded_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='data_files', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='geoserverraster',
            name='uploaded_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='rasters', to=settings.AUTH_USER_MODEL),
        ),
    ]
