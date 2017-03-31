from django.contrib import admin
from django.contrib.gis import admin
from visor.models import WmsLayer

# Register your models here.
admin.site.register(WmsLayer, admin.GeoModelAdmin)