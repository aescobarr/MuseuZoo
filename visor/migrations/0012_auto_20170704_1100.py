# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-07-04 11:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visor', '0011_auto_20170704_1008'),
    ]

    operations = [
        migrations.AlterField(
            model_name='geoserverraster',
            name='srs_code',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
