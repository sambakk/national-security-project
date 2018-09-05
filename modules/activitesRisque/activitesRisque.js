// DECLARATION DES VARIABLES
var coords_activite_risque;
var cercle, pts_intersection;
// /DECLARATION DES VARIABLES

// INTERACTION GRAPHIQUE POUR LE MENU DROIT
interactionGraphiqueMenuDeNavigation(5, "activitesRisque", "Boîte à outils des activités à risque", 43, 0);
// /INTERACTION GRAPHIQUE POUR LE MENU DROIT

// LE STYLE CSS DU CONTENU HTML DU MENU DROIT
if(!$('head').find('link[href="modules/activitesRisque/activitesRisque.css"][rel="stylesheet"]').length){
    $("<link>").attr("rel", "stylesheet").attr("type", "text/css").attr("href", "modules/activitesRisque/activitesRisque.css").appendTo("head");
}
// /LE STYLE CSS DU CONTENU HTML DU MENU DROIT

// LE CONTENU HTML DU MENU DROIT
$.get("modules/activitesRisque/activitesRisque.html", function (data) {
    $("#style_selector div:eq(1)").after().append(data);
});
// /LE CONTENU HTML DU MENU DROIT

// CACHER TOUS LES POP-UPS
popup.hide();
// CACHER TOUS LES POP-UPS

// SUPPRESSION DE TOUTES LES AUTRES COUCHES
supprimerCouches();
// /SUPPRESSION DE TOUTES LES AUTRES COUCHES


$(document).off("click", "#choisirEmplacementActivitesRisque").on("click", "#choisirEmplacementActivitesRisque", function (e) {
    changerPointeurAjout(undefined, true);
    map.on('click', function (evt) {
        coords_activite_risque = ol.proj.toLonLat(evt.coordinate);
        $("#choisirEmplacementActivitesRisque").html('<i class="clip-plus-circle"></i> ' + coords_activite_risque[0].toFixed(6) + ", " + coords_activite_risque[1].toFixed(6));
    });
});

$(document).off("click", "#reinitActivitesRisque").on("click", "#reinitActivitesRisque", function (e) {
    changerPointeurAjout(undefined);

    coucheRues.getSource().getFeatures().forEach(function(f){
        f.setStyle(new ol.style.Style ({
            stroke: new ol.style.Stroke({
               color: [23, 39, 38, 1],
                width: 2
              })                               
        }));
    });

    coords_activite_risque = null;
    map.removeLayer(cercle);
    map.removeLayer(pts_intersection);
    $("#rayon").val("");
    $("#choisirEmplacementActivitesRisque").html('<i class="clip-plus-circle"></i> Choisir un emplacement');
});

$(document).off("click", "#appliquer").on("click", "#appliquer", function (e) {
    changerPointeurAjout(undefined);

    coucheRues.getSource().getFeatures().forEach(function(f){
        f.setStyle(new ol.style.Style ({
            stroke: new ol.style.Stroke({
               color: [23, 39, 38, 1],
                width: 2
              })                               
        }));
    });

    if (!coords_activite_risque || !$("#rayon").val()) {
        if (!coords_activite_risque) {
            afficherNotif("warning", "Veuillez choisir un emplacement");
        } if (!$("#rayon").val()) {
            afficherNotif("warning", "Veuillez saisir le rayon");
        }
    } else {
        map.removeLayer(cercle);
        map.removeLayer(pts_intersection);

        // DEF DE LA COUCHE CERCLE
        f = new ol.Feature(
            ol.geom.Polygon.fromCircle(new ol.geom.Circle(
                ol.proj.fromLonLat(coords_activite_risque), parseInt($("#rayon").val())
            ), 60)
        );

        cercle = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [f]
            }),
            style: [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'red',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 0, 0, 0.1)'
                    })
                })
            ]
        });
        map.addLayer(cercle);
        // /DEF DE LA COUCHE CERCLE

        // POINTS D'INTERSECTION
        pts_intersection = turf.lineIntersect(coucheVersGeoJSON(coucheRues), coucheVersGeoJSON(cercle));

        pts_intersection = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: geojson.readFeatures(pts_intersection, { featureProjection: 'EPSG:3857' })
            })
        });
        map.addLayer(pts_intersection);
        // /POINTS D'INTERSECTION

        pts_coords = [];
        id_points = 1;


        function style_pts() {
            return [new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({
                        color: [255, 0, 0], width: 2
                    })
                })
            }),
            new ol.style.Style({
                fill: new ol.style.Fill({
                    color: '#ffa500'
                }),
                stroke: new ol.style.Stroke({
                    color: '#000000',
                    width: 3
                }),
                text: new ol.style.Text({
                    font: '13px sans-serif',
                    fill: new ol.style.Fill({ color: '#ffa500' }),
                    stroke: new ol.style.Stroke({
                        color: '#000000', width: 3
                    }),
                    text: this.get('description')
                    ,
                    offsetX: 45,
                    offsetY: 0,
                    rotation: 0
                })
            })
            ];
        }

        function sty_rues() {
            return [new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#ffa500'
            }),
            stroke: new ol.style.Stroke({
                color: '#1de9b6',
                width: 3
            }),
            text: new ol.style.Text({
                font: '13px sans-serif',
                fill: new ol.style.Fill({ color: '#1de9b6' }),
                stroke: new ol.style.Stroke({
                    color: '#000000', width: 3
                }),
                text: this.get('description')
                ,
                offsetX: 45,
                offsetY: 0,
                rotation: 0
            })
        })]
        }
        var id_points = 0;
        pts_intersection.getSource().getFeatures().forEach(function(pts){

            data = {
                rue_bouchon: true,
                coords: ol.proj.toLonLat( pts.getGeometry().getCoordinates())
            }
            error_fatale = function (jqXhr) {
                rapportErreurs(jqXhr);
            }
            success = function (resultat) {
                pts.set('description', "   Bouchon N° "+id_points++);
                pts.setStyle(style_pts);

                coucheRues.getSource().getFeatures().forEach(function(f){
                    if(f.get("id")==resultat[0]){
                        if(!resultat[1]){
                            f.set('description', resultat[2]);
                        }else{
                            f.set('description', resultat[1]+" ,"+resultat[2]);
                        }
                        f.setStyle(sty_rues);
                    }
                });
                
            }
            ajax("modules/activitesRisque/activitesRisque.php", data, error_fatale, success);


        });  

    }
});