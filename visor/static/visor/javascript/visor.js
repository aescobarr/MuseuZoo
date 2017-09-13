$( document ).ready(function() {


	// create the tile layer with correct attribution
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	osm = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 12, attribution: osmAttrib});

    map = new L.Map('map',{
        layers: [osm]
    });
	// start the map in South-East England
	map.setView(new L.LatLng(40.58, -3.25),4);
	//map.addLayer(osm);

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

    L.control.layers(baseMaps).addTo(map);
	//var sidebar = $('#sidebar').sidebar();

	/*for (var i = 0; i < rasters.length; i++){
	    var wmsLayer = L.tileLayer.wms(
	        wms_url,
	        {
	            layers: rasters[i],
	            transparent: true
            }
        ).addTo(map);
	    wmsLayer.setOpacity(0.4);
	}*/
});