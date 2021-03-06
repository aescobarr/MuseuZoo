# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-09-20 12:52
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('visor', '0028_auto_20170920_1229'),
    ]

    operations = [
        migrations.AddField(
            model_name='rasterlist',
            name='owner',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='raster_lists', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='geoserverraster',
            name='list',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='rasters_in_list', to='visor.RasterList'),
        ),
    ]
