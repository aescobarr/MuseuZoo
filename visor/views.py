from rest_framework import viewsets
from rest_framework.decorators import api_view
from django.shortcuts import render
from django.views.generic import UpdateView, ListView
from django.http import HttpResponse
from django.template.loader import render_to_string
from visor.models import WmsLayer
from visor.forms import WmsLayerForm
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
from serializers import WmsLayerSerializer
from owslib.wms import WebMapService

# Create your views here.
def index(request):
    layers = WmsLayer.objects.all()
    context = {'wmslayer_list': layers}
    return render(request, 'visor/index.html', context)

def layerloader(request):
    return render(request, 'visor/layerloader.html')

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
                bb = wms[layer].boundingBoxWGS84
                d = {'base_url': url, 'name': wms[layer].name, 'label': wms[layer].title, 'maxx': bb[2], 'maxy': bb[3], 'minx': bb[0], 'miny': bb[1]}
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
