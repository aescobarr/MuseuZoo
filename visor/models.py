from __future__ import unicode_literals

from django.db import models
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry

# Create your models here.
class WmsLayer(models.Model):
    name = models.CharField(max_length=50)
    base_url = models.URLField(max_length=255)
    label = models.CharField(max_length=255)
    minx = models.FloatField()
    maxx = models.FloatField()
    miny = models.FloatField()
    maxy = models.FloatField()
    boundary_geo = models.PolygonField()


    def generate_boundary_from_coords(self):
        if self.minx is None or self.maxx is None or self.miny is None or self.maxy is None:
            return None        
        wkt_polygon = 'POLYGON(( {0} {1},{2} {3},{4} {5},{6} {7},{8} {9} ))'
        p = GEOSGeometry(wkt_polygon.format(self.minx, self.miny, self.maxx, self.miny, self.maxx, self.maxy, self.minx, self.maxy, self.minx, self.miny), srid=4326)
        return p

'''
    def save(self, *args, **kwargs):
        if not self.boundary_geo:
            self.boundary_geo = self.generate_boundary_from_coords()
        super(WmsLayer, self).save(*args, **kwargs)
'''