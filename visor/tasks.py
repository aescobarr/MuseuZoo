from celery import task
from celery import app
import museuzoo.settings as conf
import os
import errno
from geoserver.catalog import Catalog
from models import GeoServerRaster, DataFile, Operation
from django.contrib.gis.gdal import GDALRaster
from django.contrib.gis.geos import MultiPoint, Point, GEOSGeometry
from django.db import connection
from djcelery.models import TaskMeta
import csv


def get_coverage_srs(name):
    print "Recovering layer with name - " + name
    cat = Catalog(conf.GEOSERVER_REST_URL, conf.GEOSERVER_USER, conf.GEOSERVER_PASSWORD)
    l = cat.get_layer(name)
    return l.resource.projection


@app.task
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


@app.task
def process_datafile(file, datafile_id):
    print "File is: " + file
    multi = MultiPoint(srid=4326)
    print "DataFile id is:" + str(datafile_id)
    datafile_filepath = conf.LOCAL_DATAFILE_ROOT + "/" + os.path.basename(file)
    with open(datafile_filepath,'rb') as csvfile:
        reader = csv.reader(csvfile, delimiter=';')
        headers = reader.next()
        print "Headers: "
        print headers
        coord_x_index = headers.index("coord_x")
        coord_y_index = headers.index("coord_y")
        for row in reader:
            coord_x = row[coord_x_index]
            coord_y = row[coord_y_index]
            wkt_point = 'POINT( {0} {1} )'
            p = GEOSGeometry(wkt_point.format(coord_x, coord_y), srid=4326)
            multi.append(p)
    datafile = DataFile.objects.get(pk=datafile_id)
    datafile.points_geo = multi
    datafile.save()

@app.task(bind=True)
def cross_files_and_save_result(self, operation_id):
    operation = Operation.objects.get(pk=operation_id)
    _task_id = self.request.id
    operation.task_id = _task_id
    operation.save()
    file_operator_id = operation.file_operator.id
    rasters = operation.raster_operator.all()
    rs_ids = []
    for raster in rasters:
        rs_ids.append(str(raster.id))
    rs_id_list = ",".join(rs_ids)
    query = """ select r.name as raster_name, st_value(r.raster,subquery.location), subquery.coord_x, subquery.coord_y
                from
                visor_geoserverraster r,
                (
                    select
                    (ST_DUMP(d.points_geo)).geom as location,
                    ST_X((ST_DUMP(d.points_geo)).geom) as coord_x,
                    ST_Y((ST_DUMP(d.points_geo)).geom) as coord_y
                    from
                    visor_datafile d
                    where d.id={0}
                ) as subquery
                where
                r.id IN ({1}) AND
                ST_INTERSECTS(subquery.location,r.raster) order by 1
    """
    loaded_query = query.format(file_operator_id, rs_id_list)
    print loaded_query
    if not os.path.exists(os.path.dirname(conf.LOCAL_RESULTS_ROOT + "/")):
        print conf.LOCAL_RESULTS_ROOT + " does not exist, creating"
        try:
            os.makedirs(os.path.dirname(conf.LOCAL_RESULTS_ROOT + "/"))
            print "Directory created"
        except OSError as exc:  # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise
    else:
        print conf.LOCAL_RESULTS_ROOT + " exists, doing nothing!"
    with connection.cursor() as cursor:
        cursor.execute(loaded_query)
        result = cursor.fetchall()
        with open( conf.LOCAL_RESULTS_ROOT + "/" + str(operation_id) + ".csv", "wb") as f:
            writer = csv.writer(f, delimiter=';')
            writer.writerow(["raster_name", "value", "coord_x", "coord_y"])
            writer.writerows(result)
    operation.result_path = conf.LOCAL_RESULTS_ROOT_DIRECTORY + "/" + str(operation_id) + ".csv"
    operation.save()