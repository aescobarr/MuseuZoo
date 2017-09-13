# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-09-06 14:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visor', '0020_auto_20170905_1426'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='operation',
            name='raster_operator',
        ),
        migrations.AddField(
            model_name='operation',
            name='raster_operator',
            field=models.ManyToManyField(to='visor.GeoServerRaster'),
        ),
    ]