$( document ).ready(function() {


	// create the tile layer with correct attribution
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	osm = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 12, attribution: osmAttrib});

    map = new L.Map('map',{
        layers: [osm]
    });

	map.setView(new L.LatLng(40.58, -3.25),2);

	roads = L.gridLayer.googleMutant({
        type: 'roadmap' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });

    satellite = L.gridLayer.googleMutant({
        type: 'satellite' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });

    terrain = L.gridLayer.googleMutant({
        type: 'terrain' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });

    hybrid = L.gridLayer.googleMutant({
        type: 'hybrid' // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });

    var baseMaps = {
        "Open Street Map": osm,
        "Google roads": roads,
        "Google satellite": satellite,
        "Google terrain": terrain,
        "Google hybrid": hybrid
    };

    var overlays = {};

    control_layers = L.control.layers(baseMaps,overlays);
    control_layers.addTo(map);

});