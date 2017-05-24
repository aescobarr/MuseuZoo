# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-05-19 08:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visor', '0002_auto_20170331_1444'),
    ]

    operations = [
        migrations.CreateModel(
            name='GeoServerRaster',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('file', models.FileField(upload_to='filefield_uploads')),
                ('date_uploaded', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
