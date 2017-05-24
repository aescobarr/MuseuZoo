from rest_framework import serializers

from models import WmsLayer, GeoServerRaster
from tagging.models import Tag


class WmsLayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = WmsLayer
        fields = ('id', 'name', 'base_url', 'label', 'minx', 'maxx', 'miny', 'maxy')


class GeoTiffSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoServerRaster
        fields = ('id', 'name', 'file', 'date_uploaded', 'tags')


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name')