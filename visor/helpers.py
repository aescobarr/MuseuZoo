from geoserver.catalog import Catalog
import os
import museuzoo.settings as conf
from geoserver.catalog import Catalog, ConflictingDataError
from django import forms
import csv
import sys
import magic


def check_file_already_uploaded(file, upload_dir):
    if os.path.isfile(upload_dir + "/" + file.name ):
        raise forms.ValidationError("Aquest fitxer ja es al disc")

def check_file_is_tiff(file, upload_dir):
    file_type = magic.from_file(upload_dir + "/" + file.name)
    if 'TIFF' not in file_type:
        raise forms.ValidationError("Aquest fitxer no sembla ser un raster TIFF valid")

def check_file_has_coords(csv_file):
    reader = csv.reader(csv_file, delimiter=';')
    headers = reader.next()
    if 'coord_x' not in headers or 'coord_y' not in headers:
        raise forms.ValidationError("Cal que el fitxer contingui les columnes coord_x i coord_y")


def check_file_has_semicolon_separator(csv_file):
    content = csv_file.read()
    if ';' not in content:
        raise forms.ValidationError("El fitxer csv ha de tenir el caracter ';' com a separador de camps")

'''
def process_file_geoserver(file):
    try:
        geoserver_filepath = conf.GEOSERVER_RASTER_DATA_DIR + "/" + file.name
        #with open( geoserver_filepath, 'wb+') as destination:
            #for chunk in file.chunks():
                #destination.write(chunk)
        cat = Catalog(conf.GEOSERVER_REST_URL, conf.GEOSERVER_USER, conf.GEOSERVER_PASSWORD)
        ws = cat.get_workspace(conf.GEOSERVER_WORKSPACE)
        tiffdata = geoserver_filepath
        ft = cat.create_coveragestore(os.path.splitext(file.name)[0], tiffdata, ws)
    except Exception as e:
        raise forms.ValidationError("Error inesperat: " + e.strerror)
'''


def get_coverage_srs(name):
    cat = Catalog(conf.GEOSERVER_REST_URL, conf.GEOSERVER_USER, conf.GEOSERVER_PASSWORD)
    l = cat.get_layer(name)
    return l.resource.projection


def delete_geoserver_store(filename):
    name_and_extension = os.path.basename(filename)
    name = os.path.splitext(name_and_extension)[0]
    # Load catalog
    cat = Catalog(conf.GEOSERVER_REST_URL, conf.GEOSERVER_USER, conf.GEOSERVER_PASSWORD)
    # Load store
    st = cat.get_store(name)
    # Load layer
    layer = cat.get_layer(name)
    # Delete layer
    cat.delete(layer)
    # Reload catalog to make it aware it no longer contains the layer
    cat.reload()
    # Remove store
    cat.delete(st)