from celery import task
import museuzoo.settings as conf
import os
from geoserver.catalog import Catalog
from models import GeoServerRaster
from django.contrib.gis.gdal import GDALRaster
from django.contrib.gis.geos import MultiPoint, Point


def get_coverage_srs(name):
    print "Recovering layer with name - " + name
    cat = Catalog(conf.GEOSERVER_REST_URL, conf.GEOSERVER_USER, conf.GEOSERVER_PASSWORD)
    l = cat.get_layer(name)
    return l.resource.projection


@task
def process_file_geoserver(file, geotiff_id):
    print "File name is:" + file.name
    #geoserver_filepath = conf.GEOSERVER_RASTER_DATA_DIR + "/" + os.path.basename(file.name)
    geoserver_filepath = conf.LOCAL_RASTER_ROOT + "/" + os.path.basename(file.name)
    print "File path is:" + geoserver_filepath
    cat = Catalog(conf.GEOSERVER_REST_URL, conf.GEOSERVER_USER, conf.GEOSERVER_PASSWORD)
    ws = cat.get_workspace(conf.GEOSERVER_WORKSPACE)
    tiffdata = geoserver_filepath
    coverage_store_name = os.path.splitext(os.path.basename(file.name))[0]
    print "Coverage store name is:" + coverage_store_name
    ft = cat.create_coveragestore(coverage_store_name, tiffdata, ws)
    #layer_name = os.path.splitext(file.name)[0]
    geotiff = GeoServerRaster.objects.get(pk=geotiff_id)
    srs = get_coverage_srs(coverage_store_name)
    geotiff.srs_code = srs
    raster = GDALRaster(geoserver_filepath, write=True)
    geotiff.raster = raster
    #geotiff.geoserver_layername = coverage_store_name
    #geotiff.geoserver_workspace = conf.GEOSERVER_WORKSPACE
    geotiff.save()

@task
def process_datafile(file, datafile_id):
    multi = MultiPoint(srid=4326)
    print "DataFile id is:" + datafile_id
    '''
    for point in file
        p = Point()
        multi.append(p)
    '''