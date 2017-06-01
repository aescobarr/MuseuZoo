$( document ).ready(function() {
    map = new L.Map('map');

	// create the tile layer with correct attribution
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 12, attribution: osmAttrib});

	// start the map in South-East England
	map.setView(new L.LatLng(40.58, -3.25),4);
	map.addLayer(osm);
	var sidebar = $('#sidebar').sidebar();
});