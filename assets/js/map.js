// CODE DE LA MAP
var defaultCenter = ol.proj.transform([-6.835259, 34.016575], 'EPSG:4326', 'EPSG:3857');
var defaultExtent = [-840080.4335449198, 3988950.4443487297, -674212.0821660873, 4072419.6792361424];
var geojsonFormat_geom = new ol.format.GeoJSON();

var navcitiesXYZSource = new ol.source.XYZ({
    attributions: [new ol.Attribution({
        html: 'Tiles © <a href="https://www.navcities.com">Navcities</a>'
    })],
    url: "http://www.navcities.com/mapcache/tms/1.0.0/lintermediaire@NavG/{z}/{x}/{-y}.png"
});
var navcitiesMaps = new ol.layer.Tile({
    name: 'Navcities Maps',
    visible: true,
    preload: Infinity,
    source: navcitiesXYZSource
});
var view = new ol.View({
    center: defaultCenter,
    extent: defaultExtent,
    zoom: 13,
    minZoom: 13,
    maxZoom: 18
})
var map = new ol.Map({
    layers: [navcitiesMaps],
    target: 'map',
    view: view
});
// /CODE DE LA MAP
