from __future__ import unicode_literals

from django.db import models
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry
from tagging.fields import TagField
from django.forms import ValidationError
from django.contrib.auth.models import User
from djcelery.models import TaskMeta
import museuzoo.settings as conf
import os

FILE_TYPES = (('shp', 'ShapeFile'), ('csv', 'Comma separated values(csv)'),)


class SpatialRefSys(models.Model):
    srid = models.IntegerField(db_column='srid',primary_key=True)
    auth_name = models.TextField(db_column='auth_name')
    auth_srid = models.DecimalField(db_column='auth_srid', max_digits=10, decimal_places=0)
    srtext = models.TextField(db_column='srtext')
    proj4text = models.TextField(db_column='proj4text')

    class Meta:
        managed = False
        db_table = "spatial_ref_sys"

    @property
    def ref_sys_code(self):
        return "{0}:{1}".format(self.auth_name, self.auth_srid)

    #def __unicode__(self):
        #return self.ref_sys_code


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

    def save(self, *args, **kwargs):
        if not self.boundary_geo:
            self.boundary_geo = self.generate_boundary_from_coords()
        super(WmsLayer, self).save(*args, **kwargs)


def validate_tif_extension(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.tif', '.tiff']
    if not ext in valid_extensions:
        raise ValidationError(u'S''admeten fitxers amb extensio tif, tiff, TIF o TIFF')


class GeoServerRaster(models.Model):
    name = models.CharField(max_length=50)
    file = models.FileField(upload_to=conf.LOCAL_RASTER_ROOT_DIRECTORY, validators=[validate_tif_extension])
    date_uploaded = models.DateTimeField(auto_now_add=True, blank=True)
    date_modified = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(User, related_name="rasters")
    srs_code = models.CharField(max_length=10, blank=True, null=True)
    geoserver_workspace = models.CharField(max_length=50, blank=True, null=True)
    geoserver_layername = models.CharField(max_length=50, blank=True, null=True)
    raster = models.RasterField(blank=True, null=True)
    tags = TagField()

    @property
    def full_geoserver_layer_name(self):
        return self.geoserver_workspace + ":" + self.geoserver_layername


def validate_datafile_extension(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.csv', '.zip']
    if not ext in valid_extensions:
        raise ValidationError(u'Nomes s''admeten fitxers amb extensio csv o zip')


class DataFile(models.Model):
    name = models.CharField(max_length=50)
    file = models.FileField(upload_to=conf.LOCAL_DATAFILE_ROOT_DIRECTORY, validators=[validate_datafile_extension])
    date_uploaded = models.DateTimeField(auto_now_add=True, blank=True)
    file_type = models.CharField(max_length=5, choices=FILE_TYPES, default='csv')
    date_modified = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(User, related_name="data_files")
    srs = models.ForeignKey(SpatialRefSys, related_name="data_files_by_srs", default=4326)
    points_geo = models.MultiPointField(blank=True, null=True, srid=4326)
    tags = TagField()

    @property
    def geometry_geojson(self):
        return self.points_geo.geojson


class Operation(models.Model):
    #raster_operator = models.ForeignKey(GeoServerRaster)
    raster_operator = models.ManyToManyField(GeoServerRaster)
    file_operator = models.ForeignKey(DataFile)
    performed_on = models.DateTimeField(auto_now_add=True, blank=True)
    performed_by = models.ForeignKey(User)
    result_path = models.CharField(max_length=255, blank=True, null=True)
    task_id = models.CharField(max_length=255, blank=True, null=True)
