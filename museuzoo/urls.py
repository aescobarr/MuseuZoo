from django.conf import settings
from django.conf.urls import url,include
from django.contrib import admin
from visor import views
from rest_framework import routers
#from fine_uploader.views import UploadView
#from fine_uploader.views import home
from visor.views import geotiff_create, geotiff_list, geotiff_update, datafile_list, datafile_create, datafile_update, operation_detail, operation_json_detail, operation_list, rasterlist_list, rasterlist_update, datatable_operation_list, datatable_datafile_list, datatable_geotiff_list, datatable_rasterlist_list
from django.conf.urls.static import static
from django.contrib.auth.views import login,logout


router = routers.DefaultRouter()
router.register(r'geotiffs', views.GeotiffViewSet, base_name='geotiffs')
router.register(r'datafiles', views.DataFileViewSet, base_name='datafiles')
router.register(r'operations', views.OperationViewSet, base_name='operations')
router.register(r'tags', views.TagViewSet, 'tags')
router.register(r'rasterlists', views.RasterListViewSet, base_name='rasterlists')


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.index, name='index'),
    url(r'^accounts/login/$', login, name='login'),
    url(r'^logout/$', logout, {'next_page': '/'}, name='logout'),
    url(r'^datafile/list$', datafile_list, name='datafile_list'),
    url(r'^datafile/create$', datafile_create, name='datafile_create'),
    url(r'^datafile/update/$', datafile_update, name='datafile_update_no_id'),
    url(r'^datafile/update/(?P<id>\d+)/$', datafile_update, name='datafile_update'),
    url(r'^geotiff/list$', geotiff_list, name='geotiff_list'),
    url(r'^geotiff/create$', geotiff_create, name='geotiff_create'),
    url(r'^geotiff/update/$', geotiff_update, name='geotiff_update_no_id'),
    url(r'^geotiff/update/(?P<id>\d+)/$', geotiff_update, name='geotiff_update'),
    url(r'^rasterlist/list$', rasterlist_list, name='rasterlist_list'),
    url(r'^rasterlist/update/(?P<id>\d+)/$', rasterlist_update, name='rasterlist_update'),
    url(r'^operation/(?P<id>\d+)/$', operation_detail, name='operation_detail'),
    url(r'^operation/list$', operation_list, name='operation_list'),
    url(r'^datatableoperation/list$', datatable_operation_list, name='datatable_operation_list'),
    url(r'^datatabledatafile/list$', datatable_datafile_list, name='datatable_datafile_list'),
    url(r'^datatableraster/list$', datatable_geotiff_list, name='datatable_geotiff_list'),
    url(r'^datatablerasterlist/list$', datatable_rasterlist_list, name='datatable_rasterlist_list'),
    url(r'^layer_list$', views.WmsLayerListView.as_view(), name='layer_list'),
    #url(r'^upload(?:/(?P<qquuid>\S+))?', UploadView.as_view(), name='upload'),
    #url(r'^upload_list$', UploadView.as_view(), name='upload'),
    #url(r'^layer_edit/(?P<pk>\w+)$', views.WmsLayerUpdateView.as_view(), name='layer_edit'),
    #url(r'^wmslayerloader/$', views.layerloader, name='layerloader'),
    #url(r'^layerloader_json/$', views.layerloader_api, name='layerloader_json'),
    url(r'^api/',include(router.urls)),
    url(r'^api/operation/(?P<id>\d+)/$', operation_json_detail, name='operation_json_detail'),
    url(r'^api-auth/',include('rest_framework.urls', namespace='rest_framework')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
