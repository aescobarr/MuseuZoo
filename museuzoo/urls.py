from django.conf import settings
from django.conf.urls import url,include
from django.contrib import admin
from visor import views
from rest_framework import routers
from fine_uploader.views import UploadView
from fine_uploader.views import home
from visor.views import geotiff_create, geotiff_list, geotiff_update, datafile_list, datafile_create, datafile_update
from django.conf.urls.static import static


router = routers.DefaultRouter()
router.register(r'geotiffs', views.GeotiffViewSet, base_name='geotiffs')
router.register(r'datafiles', views.DataFileViewSet, base_name='datafiles')
router.register(r'tags', views.TagViewSet, 'tags')


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.index, name='index'),
    url(r'^datafile/list$', datafile_list, name='datafile_list'),
    url(r'^datafile/create$', datafile_create, name='datafile_create'),
    url(r'^datafile/update/$', datafile_update, name='datafile_update_no_id'),
    url(r'^datafile/update/(?P<id>\d+)/$', datafile_update, name='datafile_update'),
    url(r'^geotiff/list$', geotiff_list, name='geotiff_list'),
    url(r'^geotiff/create$', geotiff_create, name='geotiff_create'),
    url(r'^geotiff/update/$', geotiff_update, name='geotiff_update_no_id'),
    url(r'^geotiff/update/(?P<id>\d+)/$', geotiff_update, name='geotiff_update'),
    url(r'^layer_list$', views.WmsLayerListView.as_view(), name='layer_list'),
    url(r'^upload(?:/(?P<qquuid>\S+))?', UploadView.as_view(), name='upload'),
    url(r'^upload_list$', UploadView.as_view(), name='upload'),
    #url(r'^layer_edit/(?P<pk>\w+)$', views.WmsLayerUpdateView.as_view(), name='layer_edit'),
    #url(r'^wmslayerloader/$', views.layerloader, name='layerloader'),
    #url(r'^layerloader_json/$', views.layerloader_api, name='layerloader_json'),
    url(r'^api/',include(router.urls)),
    url(r'^api-auth/',include('rest_framework.urls', namespace='rest_framework')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)