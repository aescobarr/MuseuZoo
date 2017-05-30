from django.contrib import admin
from django.contrib.gis import admin
from visor.models import WmsLayer, GeoServerRaster, DataFile

# Register your models here.
admin.site.register(WmsLayer, admin.GeoModelAdmin)
admin.site.register(GeoServerRaster)
admin.site.register(DataFile)