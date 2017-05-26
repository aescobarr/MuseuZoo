from rest_framework import status,viewsets
from rest_framework.decorators import api_view
from django.shortcuts import render, get_object_or_404
from django.views.generic import UpdateView, ListView
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.template.loader import render_to_string
from visor.models import WmsLayer,GeoServerRaster, DataFile
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
from serializers import WmsLayerSerializer, GeoTiffSerializer, TagSerializer, DataFileSerializer
from owslib.wms import WebMapService
from django.middleware.csrf import get_token
from django.core.urlresolvers import reverse
from tagging.models import Tag
from django.core.exceptions import ValidationError
from django.http import Http404
import os
from visor.forms import GeoServerRasterForm, GeoServerRasterUpdateForm, DataFileForm
import museuzoo.settings
from visor.helpers import delete_geoserver_store
from django import forms


def datafile_list(request):
    return render(request, 'visor/datafile_list.html')

def datafile_create(request):
    if request.method == 'POST':
        form = DataFileForm(request.POST,request.FILES)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('datafile_list'))
    else:
        form = DataFileForm()
    return render(request, 'visor/datafile_create.html', {'form' : form})

def geotiff_update(request, id=None):
    if id:
        raster = get_object_or_404(GeoServerRaster,pk=id)
    else:
        raise forms.ValidationError("No existeix aquest raster")
    form = GeoServerRasterUpdateForm(request.POST or None, instance=raster)
    if request.POST and form.is_valid():
        form.save()
        return HttpResponseRedirect(reverse('geotiff_list'))
    return render(request, 'visor/geotiff_update.html', {'form': form, 'raster_id' : id})


def geotiff_create(request):
    if request.method == 'POST':
        form = GeoServerRasterForm(request.POST,request.FILES)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('geotiff_list'))
    else:
        form = GeoServerRasterForm()
    return render(request, 'visor/geotiff_create.html', {'form' : form})


# Create your views here.
def index(request):
    layers = WmsLayer.objects.all()
    context = {'wmslayer_list': layers}
    return render(request, 'visor/index.html', context)


def geotiff_list(request):
    return render(request, 'visor/geotiff_list.html')


def layerloader(request):
    return render(request, 'visor/layerloader.html')


def add_geotiff(request):
    csrf_token = get_token(request)
    # return render_to_response(request, 'visor/import.html', {'csrf_token': csrf_token})
    return render(request, 'visor/import.html', {'csrf_token': csrf_token})


@api_view(['GET'])
def layerloader_api(request):
    if request.method == 'GET':
        url = request.query_params.get('url', -1)
        if url == -1:
            raise ParseError(detail='Url is mandatory')
        try:
            wms = WebMapService(url)
            contents = list(wms.contents)
            layers = []
            for layer in contents:
                have_it = WmsLayer.objects.filter(name=wms[layer].name).exists()
                bb = wms[layer].boundingBoxWGS84
                d = {'base_url': url, 'name': wms[layer].name, 'label': wms[layer].title, 'maxx': bb[2], 'maxy': bb[3], 'minx': bb[0], 'miny': bb[1], 'have_it': have_it}
                layers.append(d)
            return Response(layers)
        except Exception as e:
            raise ParseError(detail=e.message)


class WmsLayerListView(ListView):
    model = WmsLayer
    template_name = 'visor/wmslayer_list.html'

    def get_queryset(self):
        return WmsLayer.objects.all()


class WmsLayerUpdateView(UpdateView):
    model = WmsLayer
    form_class = WmsLayer
    template_name = '/visor/wmslayer_edit_form.html'

    def dispatch(self, *args, **kwargs):
        self.id = kwargs['pk']
        return super(WmsLayerUpdateView, self).dispatch(*args, **kwargs)

    def form_valid(self, form):
        form.save()
        wmslayer = WmsLayer.objects.get(id=self.id)
        return HttpResponse(render_to_string('/visor/wmslayer_edit_form_success.html', {'wmslayer': wmslayer}))


class WmsLayerViewSet(viewsets.ModelViewSet):
    queryset = WmsLayer.objects.all()
    serializer_class = WmsLayerSerializer


class DataFileViewSet(viewsets.ModelViewSet):
    serializer_class = DataFileSerializer

    def get_queryset(self):
        queryset = DataFile.objects.all()
        return queryset

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            filename = instance.file.name
            self.perform_destroy(instance)
            # delete local file
            file = os.path.join(museuzoo.settings.MEDIA_ROOT, filename)
            os.remove(file)
        except Http404:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)

class GeotiffViewSet(viewsets.ModelViewSet):
    serializer_class = GeoTiffSerializer

    def get_queryset(self):
        queryset = GeoServerRaster.objects.all()
        return queryset

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            filename = instance.file.name
            self.perform_destroy(instance)
            # delete local file
            file = os.path.join(museuzoo.settings.MEDIA_ROOT, filename)
            os.remove(file)
            # delete geoserver store
            delete_geoserver_store(filename)
        except Http404:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class TagViewSet(viewsets.ReadOnlyModelViewSet):

    def get_queryset(self):
        queryset = Tag.objects.all()
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(name__icontains=name)
        return queryset

    serializer_class = TagSerializer
