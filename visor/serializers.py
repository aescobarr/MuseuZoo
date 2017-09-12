from rest_framework import serializers

from models import WmsLayer, GeoServerRaster, DataFile, SpatialRefSys, Operation
from django.contrib.auth.models import User
from tagging.models import Tag


class SpatialRefSysSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpatialRefSys
        fields = ('srid', 'ref_sys_code')


class WmsLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = WmsLayer
        fields = ('id', 'name', 'base_url', 'label', 'minx', 'maxx', 'miny', 'maxy')


class DataFileSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField(many=False)
    srs = SpatialRefSysSerializer()

    class Meta:
        model = DataFile
        fields = ('id', 'name', 'file', 'date_uploaded', 'date_modified', 'uploaded_by', 'file_type', 'tags', 'srs', 'geometry_geojson')


class GeoTiffSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField(many=False)

    class Meta:
        model = GeoServerRaster
        fields = ('id', 'name', 'file', 'srs_code', 'date_uploaded', 'date_modified', 'uploaded_by', 'tags', 'full_geoserver_layer_name')


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name')


class OperationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operation
        fields = ('id', 'raster_operator', 'file_operator', 'performed_on', 'performed_by', 'result_path')


class OperationDetailSerializer(serializers.ModelSerializer):
    file_operator = DataFileSerializer(many=False)
    raster_operator = GeoTiffSerializer(many=True)
    class Meta:
        model = Operation
        fields = ('id', 'raster_operator', 'file_operator', 'performed_on', 'performed_by', 'result_path', 'status')