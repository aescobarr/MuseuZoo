from geoserver.catalog import Catalog
import os
import museuzoo.settings as conf
from geoserver.catalog import Catalog, ConflictingDataError
from django import forms
import sys


def check_file_already_uploaded(file):
    if os.path.isfile(conf.LOCAL_RASTER_ROOT + "/" + file.name ):
        raise forms.ValidationError("Aquest fitxer ja es al disc")


def process_file_geoserver(file):
    try:
        geoserver_filepath = conf.GEOSERVER_RASTER_DATA_DIR + "/" + file.name
        with open( geoserver_filepath, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        cat = Catalog(conf.GEOSERVER_URL, conf.GEOSERVER_USER, conf.GEOSERVER_PASSWORD)
        ws = cat.get_workspace(conf.GEOSERVER_WORKSPACE)
        tiffdata = geoserver_filepath
        ft = cat.create_coveragestore(os.path.splitext(file.name)[0], tiffdata, ws)
    except Exception as e:
        raise forms.ValidationError("Error inesperat: " + e.strerror)


def delete_geoserver_store(filename):
    name_and_extension = os.path.basename(filename)
    name = os.path.splitext(name_and_extension)[0]
    # Load catalog
    cat = Catalog(conf.GEOSERVER_URL, conf.GEOSERVER_USER, conf.GEOSERVER_PASSWORD)
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