from rest_framework import status,viewsets
from rest_framework.decorators import api_view
from django.shortcuts import render, get_object_or_404
from django.views.generic import UpdateView, ListView
from django.http import HttpResponse, HttpResponseRedirect
from django.template.loader import render_to_string
from visor.models import WmsLayer,GeoServerRaster, DataFile, Operation
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
from serializers import WmsLayerSerializer, GeoTiffSerializer, TagSerializer, DataFileSerializer, OperationSerializer
from owslib.wms import WebMapService
from django.middleware.csrf import get_token
from django.core.urlresolvers import reverse
from tagging.models import Tag
from django.http import Http404
import os
from visor.forms import GeoServerRasterForm, GeoServerRasterUpdateForm, DataFileForm, DataFileUpdateForm
import museuzoo.settings
from visor.helpers import delete_geoserver_store
from django import forms
from django.contrib.auth.decorators import login_required
from visor.helpers import get_coverage_srs
from tasks import process_file_geoserver, process_datafile, cross_files_and_save_result
import museuzoo.settings as conf
from django.contrib.gis.gdal import GDALRaster
from rest_framework.settings import api_settings


@login_required
def datafile_list(request):
    return render(request, 'visor/datafile_list.html')


@login_required
def datafile_create(request):
    this_user = request.user
    if request.method == 'POST':
        form = DataFileForm(request.POST, request.FILES)
        if form.is_valid():
            datafile = form.save(commit=False)
            datafile.uploaded_by = this_user
            datafile.save()
            process_datafile.delay(datafile.file.name, datafile.id)
            return HttpResponseRedirect(reverse('datafile_list'))
    else:
        form = DataFileForm()
    return render(request, 'visor/datafile_create.html', {'form' : form})


@login_required
def datafile_update(request, id=None):
    if id:
        datafile = get_object_or_404(DataFile,pk=id)
    else:
        raise forms.ValidationError("No existeix aquest fitxer")
    form = DataFileUpdateForm(request.POST or None, instance=datafile)
    if request.POST and form.is_valid():
        form.save()
        return HttpResponseRedirect(reverse('datafile_list'))
    return render(request, 'visor/datafile_update.html', {'form': form, 'raster_id' : id})


@login_required
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


@login_required
def geotiff_create(request):
    this_user = request.user
    if request.method == 'POST':
        form = GeoServerRasterForm(request.POST,request.FILES)
        if form.is_valid():
            geotiff = form.save(commit=False)
            #process_file_geoserver(geotiff.file)
            geotiff.uploaded_by = this_user
            layer_name = os.path.splitext(geotiff.file.name)[0]
            #srs = get_coverage_srs(layer_name)
            #geotiff.srs_code = srs
            geotiff.geoserver_layername = layer_name
            geotiff.geoserver_workspace = conf.GEOSERVER_WORKSPACE
            #raster = GDALRaster(conf.LOCAL_RASTER_ROOT + "/" + geotiff.file.name,write=True)
            #geotiff.raster = raster
            geotiff.save()
            process_file_geoserver.delay(geotiff.file, geotiff.id)
            return HttpResponseRedirect(reverse('geotiff_list'))
    else:
        form = GeoServerRasterForm()
    return render(request, 'visor/geotiff_create.html', {'form' : form})


# Create your views here.
def index(request):
    layers = WmsLayer.objects.all()
    rasters = GeoServerRaster.objects.all()
    files = DataFile.objects.all()
    wms_url = conf.GEOSERVER_WMS_URL
    context = {'wmslayer_list': layers, 'raster_list': rasters, 'wms_url': wms_url, 'files_list': files}
    return render(request, 'visor/index.html', context)


@login_required
def geotiff_list(request):
    return render(request, 'visor/geotiff_list.html')


@login_required
def layerloader(request):
    return render(request, 'visor/layerloader.html')


@login_required
def add_geotiff(request):
    csrf_token = get_token(request)
    return render(request, 'visor/import.html', {'csrf_token': csrf_token})


@login_required
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


class OperationViewSet(viewsets.ModelViewSet):
    serializer_class = OperationSerializer

    def get_queryset(self):
        queryset = Operation.objects.all()
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        operation_id = serializer.data['id']
        cross_files_and_save_result.delay(operation_id)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def get_success_headers(self, data):
        try:
            return {'Location': data[api_settings.URL_FIELD_NAME]}
        except (TypeError, KeyError):
            return {}