from rest_framework import status,viewsets
from rest_framework.decorators import api_view
from django.shortcuts import render, get_object_or_404
from django.views.generic import UpdateView, ListView
from django.http import HttpResponse, HttpResponseRedirect
from django.template.loader import render_to_string
from visor.models import WmsLayer,GeoServerRaster, DataFile, Operation, RasterList
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
#import serializers
import serializers
from owslib.wms import WebMapService
from django.middleware.csrf import get_token
from django.core.urlresolvers import reverse
from tagging.models import Tag
from django.http import Http404
import os
from visor.forms import GeoServerRasterForm, GeoServerRasterUpdateForm, DataFileForm, DataFileUpdateForm, RasterListUpdateForm
import museuzoo.settings
from visor.helpers import delete_geoserver_store
from django import forms
from django.contrib.auth.decorators import login_required
from tasks import process_file_geoserver, process_datafile, cross_files_and_save_result
import museuzoo.settings as conf
from rest_framework.settings import api_settings
from djcelery.models import TaskMeta
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json
from querystring_parser import parser
from django.db.models import Q
import operator


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
def rasterlist_update(request, id=None):
    if id:
        rasterlist = get_object_or_404(RasterList,pk=id)
        rasterlist_rasters = rasterlist.rasters.all()
    else:
        raise forms.ValidationError("No existeix aquesta llista")
    form = RasterListUpdateForm(request.POST or None, instance=rasterlist)
    if request.POST and form.is_valid():
        form.save()
        return HttpResponseRedirect(reverse('rasterlist_list'))
    return render(request, 'visor/rasterlist_update.html', {'form': form, 'id' : id, 'rasters' : rasterlist_rasters})


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
            process_file_geoserver.delay(geotiff.file.name, geotiff.id)
            return HttpResponseRedirect(reverse('geotiff_list'))
    else:
        form = GeoServerRasterForm()
    return render(request, 'visor/geotiff_create.html', {'form' : form})


@login_required
def operation_detail(request, id=None):
    op = get_object_or_404(Operation,pk=id)
    return render(request, 'visor/operation_detail.html',context={'operation':op})


@login_required
def operation_list(request):
    return render(request, 'visor/operation_list.html')


def get_order_clause(params_dict, translation_dict=None):
    order_clause = []
    try:
        order = params_dict['order']
        if len(order) > 0:
            for key in order:
                sort_dict = order[key]
                column_index_str = sort_dict['column']
                column_name = params_dict['columns'][int(column_index_str)]['data']
                direction = sort_dict['dir']
                if direction != 'asc':
                    order_clause.append('-' + column_name)
                else:
                    order_clause.append(column_name)
    except KeyError:
        pass
    return order_clause


def get_filter_clause(params_dict, fields):
    filter_clause = []
    try:
        q = params_dict['search']['value']
        if q != '':
            for field in fields:
                filter_clause.append( Q(**{field+'__icontains':q}) )
    except KeyError:
        pass
    return filter_clause


def generic_datatable_list_endpoint(request,search_field_list,queryClass, classSerializer):
    draw = request.query_params.get('draw', -1)
    start = request.query_params.get('start', 0)
    length = request.query_params.get('length', 10)

    get_dict = parser.parse(request.GET.urlencode())

    order_clause = get_order_clause(get_dict)

    filter_clause = get_filter_clause(get_dict, search_field_list)

    if len(filter_clause) == 0:
        queryset = queryClass.objects.order_by(*order_clause)
    else:
        queryset = queryClass.objects.order_by(*order_clause).filter(reduce(operator.or_, filter_clause))

    paginator = Paginator(queryset, length)

    recordsTotal = queryset.count()
    recordsFiltered = recordsTotal
    page = int(start) / int(length) + 1

    serializer = classSerializer(paginator.page(page), many=True)
    return Response(
        {'draw': draw, 'recordsTotal': recordsTotal, 'recordsFiltered': recordsFiltered, 'data': serializer.data})


@login_required
@api_view(['GET'])
def datatable_operation_list(request):
    if request.method == 'GET':
        search_field_list = ('file_operator__name', 'result_path', 'performed_by__username', 'raster_operator__name')
        response = generic_datatable_list_endpoint(request, search_field_list, Operation, serializers.DataTableOperationSerializer)
        return response


@login_required
@api_view(['GET'])
def datatable_datafile_list(request):
    if request.method == 'GET':
        search_field_list = ('name', 'tags', 'file', 'uploaded_by__username', 'date_uploaded', 'date_modified')
        response = generic_datatable_list_endpoint(request, search_field_list, DataFile,serializers.DataFileSerializer)
        return response


@login_required
@api_view(['GET'])
def datatable_geotiff_list(request):
    if request.method == 'GET':
        search_field_list = ('name', 'tags', 'file', 'uploaded_by__username', 'date_uploaded', 'date_modified')
        response = generic_datatable_list_endpoint(request, search_field_list, GeoServerRaster,serializers.GeoTiffSerializer)
        return response


@login_required
@api_view(['GET'])
def datatable_rasterlist_list(request):
    if request.method == 'GET':
        search_field_list = ('name', 'rasters__name')
        response = generic_datatable_list_endpoint(request, search_field_list, RasterList,serializers.RasterListDetailSerializer)
        return response


@login_required
def index(request):
    layers = WmsLayer.objects.all()
    rasters = GeoServerRaster.objects.all()
    files = DataFile.objects.all()
    wms_url = conf.GEOSERVER_WMS_URL
    context = {'wmslayer_list': layers, 'raster_list': rasters, 'wms_url': wms_url, 'files_list': files}
    return render(request, 'visor/index.html', context)


@login_required
def rasterlist_list(request):
    return render(request, 'visor/rasterlist_list.html')


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
def operation_json_detail(request, id=None):
    if request.method == 'GET':
        op = get_object_or_404(Operation,pk=id)
        if op.task_id is not None:
            tm = TaskMeta.objects.get(task_id=op.task_id)
            resp = {'op_code':'op_available', 'status': tm.status, 'date_done': tm.date_done, 'traceback': tm.traceback }
            return Response(resp)
        return Response([{'op_code': 'op_not_available'}])


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
    serializer_class = serializers.WmsLayerSerializer



class DataFileViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.DataFileSerializer

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
    serializer_class = serializers.GeoTiffSerializer

    def get_queryset(self):
        queryset = GeoServerRaster.objects.all()
        term = self.request.query_params.get('term', None)
        if term is not None:
            queryset = queryset.filter(name__icontains=term)
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


class RasterListViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.RasterListSerializer

    def get_serializer_class(self):
        if self.action == 'list':
            return serializers.RasterListDetailSerializer
        return serializers.RasterListSerializer

    def get_queryset(self):
        user_id = None
        if self.request.user.is_authenticated():
            user_id = self.request.user.id
        if user_id:
            queryset = RasterList.objects.filter(owner_id=user_id)
        term = self.request.query_params.get('term', None)
        if term is not None:
            queryset = queryset.filter(name__icontains=term)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        list_name = serializer.validated_data['name']
        if RasterList.objects.filter(name=list_name).exists():
            return Response("Ja existeix una lista amb aquest nom", status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.TagSerializer

    def get_queryset(self):
        queryset = Tag.objects.all()
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(name__icontains=name)
        return queryset


class OperationViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.OperationSerializer

    def get_serializer_class(self):
        if self.action == 'list':
            return serializers.OperationDetailSerializer
        return serializers.OperationSerializer

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

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            file_name = instance.result_path
            self.perform_destroy(instance)
            if file_name is not None:
                # delete local file
                file = os.path.join(museuzoo.settings.MEDIA_ROOT, file_name)
                os.remove(file)
        except Http404:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)