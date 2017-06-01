from rest_framework import serializers

from models import WmsLayer, GeoServerRaster, DataFile
from tagging.models import Tag


class WmsLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = WmsLayer
        fields = ('id', 'name', 'base_url', 'label', 'minx', 'maxx', 'miny', 'maxy')


class DataFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataFile
        fields = ('id', 'name', 'file', 'date_uploaded', 'date_modified', 'uploaded_by', 'file_type', 'tags')

class GeoTiffSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoServerRaster
        fields = ('id', 'name', 'file', 'date_uploaded', 'date_modified', 'uploaded_by', 'tags')


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name')