var geojsonFormat_geom = new ol.format.GeoJSON();

// CHANGEMENT DE CLASSE CSS
function changerClasseCss(id, classe) {
    $('#' + id).attr('class', classe);
}
// /CHANGEMENT DE CLASSE CSS

// INTERACTION POUR COUCHES D'INTÉRÊT
$("#couchesInteret").click(function () {
    $("#tabBord").text("COUCHES D'INTÉRÊT");
    $("#tabBordCouleur").attr('class', '');
    $("#couchesAgentsCouleur").attr('class', '');
    $("#couchesInteretCouleur").attr('class', 'active open');
    $("#Boutontoggle").attr('class', 'style-toggle open');
    document.getElementById("style_selector_container").style.display = "block";
    document.getElementById("Boutontoggle").style.display = "block";
    $("#titreMenuDroit").text('Les couches disponibles');

});
// /INTERACTION POUR COUCHES D'INTÉRÊT

// GESTION DES CHECKBOX DES COUCHES DISPONIBLES
$("#mosquees").change(function () {
    if (this.checked) {
        changerClasseCss("listeCoucheMosquees", "dropdown open");
        critere = 301;
        getNearbyPois(critere);
        nearbyPoisGeometryVector.changed();
    } else {
        changerClasseCss("listeCoucheMosquees", "dropdown hidden");
        removePoisFeatures('Mosquée');
    }
});

$("#ecoles").change(function () {
    if (this.checked) {
        changerClasseCss("listeCoucheEcoles", "dropdown open");
        critere = 142;
        getNearbyPois(critere);
        nearbyPoisGeometryVector.changed();
    } else {
        changerClasseCss("listeCoucheEcoles", "dropdown hidden");
        removePoisFeatures('Ecole Supérieure Et Institut Public');
    }
});

$("#banques").change(function () {
    changerClasseCss("listeCoucheBanques", "dropdown open");
    if (this.checked) {
        critere = 150;
        getNearbyPois(critere);
        nearbyPoisGeometryVector.changed();
    } else {
        changerClasseCss("listeCoucheBanques", "dropdown hidden");
        removePoisFeatures('Banque');
    }
});

$("#hotels").change(function () {
    changerClasseCss("listeCoucheHotels", "dropdown open");
    if (this.checked) {
        critere = 266;
        getNearbyPois(critere);
        nearbyPoisGeometryVector.changed();
    } else {
        changerClasseCss("listeCoucheHotels", "dropdown hidden");
        removePoisFeatures('Hôtel');
    }
});


function removePoisFeatures(categorie) {
    nearbyPoisGeometryVector.getSource().forEachFeature(function (feature) {
        if (feature.get('souscategorie') == categorie) {
            nearbyPoisGeometryVector.getSource().removeFeature(feature);
        }
    });
    $("#nearby_pois_count").empty();
    $("#nearby_pois_count").append(nearbyPoisGeometryVector.getSource().getFeatures().length + ' POIS');
}

function getNearbyPois(critere) {

    if (mapAdvancedSearch_AddressGeometryVector.getSource().getFeatures().length > 0) {
        var features = mapAdvancedSearch_AddressGeometryVector.getSource().getFeatures();
        var coordinates = ol.proj.transform(features[0].getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');

        var res = '';
        $.ajax({
            url: 'http://www.navcities.com/api/proximite/?user=demo&maxNumberOfPois=20',
            data: {
                lon: coordinates[0],
                lat: coordinates[1],
                crit: critere
            },
            type: 'GET',
            dataType: 'JSON',
            async: true,
            cache: false,
            timeout: 1000,
            success: function (result) {
                //console.log(result.features.length +'|'+nearbyPoisGeometryVector.getSource().getFeatures().length);
                if (critere == 301) {
                    $("#nbrMosquees").empty();
                    // $("#nbrMosquees").append((result.features.length + nearbyPoisGeometryVector.getSource().getFeatures().length));
                    $("#nbrMosquees").append((result.features.length));
                    $("#nbrMosqueesTitre").text($('#nbrMosquees').text() + " Mosquées disponibles");
                }
                else if (critere == 142) {
                    $("#nbrEcoles").empty();
                    // $("#nbrEcoles").append((result.features.length + nearbyPoisGeometryVector.getSource().getFeatures().length));
                    $("#nbrEcoles").append((result.features.length));
                    $("#nbrEcolesTitre").text($('#nbrEcoles').text() + " Écoles disponibles");

                }
                else if (critere == 150) {
                    $("#nbrBanques").empty();
                    // $("#nbrBanques").append((result.features.length + nearbyPoisGeometryVector.getSource().getFeatures().length));
                    $("#nbrBanques").append((result.features.length));
                    $("#nbrBanquesTitre").text($('#nbrBanques').text() + " Banques disponibles");

                }
                else if (critere == 266) {
                    $("#nbrHotels").empty();
                    // $("#nbrHotels").append((result.features.length + nearbyPoisGeometryVector.getSource().getFeatures().length));
                    $("#nbrHotels").append((result.features.length));
                    $("#nbrHotelsTitre").text($('#nbrHotels').text() + " Hôtels disponibles");

                }


                var features = geojsonFormat_geom.readFeatures(result, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });

                nearbyPoisGeometryVector.getSource().addFeatures(features);
                var f = nearbyPoisGeometryVector.getSource().getFeatures();

                if (f.length > 0) {
                    res += '<div class="todo-actions" style="overflow-y: scroll; height:250px;" >';
                    res += '<span class="desc">';

                    function arrayColumn(arr, n) {
                        return arr.map(x => x[n]);
                    }

                    var ar = [];
                    for (var i = 0; i < f.length; i++) {
                        ar.push([i, f[i].get("distance")]);
                    }

                    ar.sort(function (a, b) {
                        return a[1] - b[1];
                    });

                    for (var j = 0,i = arrayColumn(ar, 0)[0]; j < f.length; i = arrayColumn(ar, 0)[++j]) {
                        
                        var dis = ((f[i].get("distance") < 1000) ? Math.round(f[i].get("distance")) + ' m' : (f[i].get("distance") / 1000).toFixed(3) + ' km');
                       
                        if (f[i].get('souscategorie') == 'Ecole Supérieure Et Institut Public') {

                            res += '<a href="javascript:void(0);" onclick="zoomToPoi(\'' + f[i].get("nom").replace(/[']/g, "|") + '\',\'' + f[i].get("x") + '\',\'' + f[i].get("y") + '\', this)" class="list-group-item list-group-item-action flex-column align-items-start">';
                            res += '<div class="d-flex w-100 justify-content-between"><h5 style="margin-top: 0px;margin-bottom: 0px;" ><i class="glyphicon glyphicon-bookmark" style="margin-top: 11px;color: #007aff;"></i> ' + f[i].get("nom") + '</h5><small><span class="badge badge-secondary" style="background-color: #ff1744;" >' + dis + '</span></small><br /></div>';
                            res += '<strong>' + f[i].get("adresse") + '</strong><br />' + f[i].get("categorie") + '<br /><small>' + f[i].get("souscategorie") + '</small><br />';

                            if (f[i].get("tl") != "") {
                                res += '<small><i class="icon-phone" style="color: green"></i> ' + f[i].get("tl") + '</small><br />';
                            }
                            if (f[i].get("fax") != "") {
                                res += '<small><i class="icon-tv2"  style="color: blue"></i> ' + f[i].get("fax") + '</small><br />';
                            }
                            if (f[i].get("email") != "") {
                                res += '<small><i class="icon-mail5"  style="color: red"></i> ' + f[i].get("email") + '</small><br />';
                            }
                            if (f[i].get("siteweb") != "") {
                                res += '<small><i class="icon-at"  style="color: black"></i> ' + f[i].get("siteweb") + '</small><br />';
                            }
                        } else if (f[i].get('souscategorie') == 'Hôtel') {

                            res += '<a href="javascript:void(0);" onclick="zoomToPoi(\'' + f[i].get("nom").replace(/[']/g, "|") + '\',\'' + f[i].get("x") + '\',\'' + f[i].get("y") + '\', this)" class="list-group-item list-group-item-action flex-column align-items-start">';
                            res += '<div class="d-flex w-100 justify-content-between"><h5 style="margin-top: 0px;margin-bottom: 0px;" ><i class="glyphicon glyphicon-bookmark" style="margin-top: 11px;color: #007aff;"></i> ' + f[i].get("nom") + '</h5><small><span class="badge badge-secondary" style="background-color: #ff1744;" >' + dis + '</span></small><br /></div>';
                            res += '<strong>' + f[i].get("adresse") + '</strong><br />' + f[i].get("categorie") + '<br /><small>' + f[i].get("souscategorie") + '</small><br />';

                            if (f[i].get("tl") != "") {
                                res += '<small><i class="icon-phone" style="color: green"></i> ' + f[i].get("tl") + '</small><br />';
                            }
                            if (f[i].get("fax") != "") {
                                res += '<small><i class="icon-tv2"  style="color: blue"></i> ' + f[i].get("fax") + '</small><br />';
                            }
                            if (f[i].get("email") != "") {
                                res += '<small><i class="icon-mail5"  style="color: red"></i> ' + f[i].get("email") + '</small><br />';
                            }
                            if (f[i].get("siteweb") != "") {
                                res += '<small><i class="icon-at"  style="color: black"></i> ' + f[i].get("siteweb") + '</small><br />';
                            }
                        } else if (f[i].get('souscategorie') == 'Banque') {
                            res += '<a href="javascript:void(0);" onclick="zoomToPoi(\'' + f[i].get("nom").replace(/[']/g, "|") + '\',\'' + f[i].get("x") + '\',\'' + f[i].get("y") + '\', this)" class="list-group-item list-group-item-action flex-column align-items-start">';
                            res += '<div class="d-flex w-100 justify-content-between"><h5 style="margin-top: 0px;margin-bottom: 0px;" ><i class="glyphicon glyphicon-bookmark" style="margin-top: 11px;color: #007aff;"></i> ' + f[i].get("nom") + '</h5><small><span class="badge badge-secondary" style="background-color: #ff1744;" >' + dis + '</span></small><br /></div>';
                            res += '<strong>' + f[i].get("adresse") + '</strong><br />' + f[i].get("categorie") + '<br /><small>' + f[i].get("souscategorie") + '</small><br />';

                            if (f[i].get("tl") != "") {
                                res += '<small><i class="icon-phone" style="color: green"></i> ' + f[i].get("tl") + '</small><br />';
                            }
                            if (f[i].get("fax") != "") {
                                res += '<small><i class="icon-tv2"  style="color: blue"></i> ' + f[i].get("fax") + '</small><br />';
                            }
                            if (f[i].get("email") != "") {
                                res += '<small><i class="icon-mail5"  style="color: red"></i> ' + f[i].get("email") + '</small><br />';
                            }
                            if (f[i].get("siteweb") != "") {
                                res += '<small><i class="icon-at"  style="color: black"></i> ' + f[i].get("siteweb") + '</small><br />';
                            }
                        } else if (f[i].get('souscategorie') == 'Mosquée') {
                            res += '<a href="javascript:void(0);" onclick="zoomToPoi(\'' + f[i].get("nom").replace(/[']/g, "|") + '\',\'' + f[i].get("x") + '\',\'' + f[i].get("y") + '\', this)" class="list-group-item list-group-item-action flex-column align-items-start">';
                            res += '<div class="d-flex w-100 justify-content-between"><h5 style="margin-top: 0px;margin-bottom: 0px;" ><i class="glyphicon glyphicon-bookmark" style="margin-top: 11px;color: #007aff;"></i> ' + f[i].get("nom") + '</h5><small><span class="badge badge-secondary" style="background-color: #ff1744;" >' + dis + '</span></small><br /></div>';
                            res += '<strong>' + f[i].get("adresse") + '</strong><br />' + f[i].get("categorie") + '<br /><small>' + f[i].get("souscategorie") + '</small><br />';

                            if (f[i].get("tl") != "") {
                                res += '<small><i class="icon-phone" style="color: green"></i> ' + f[i].get("tl") + '</small><br />';
                            }
                            if (f[i].get("fax") != "") {
                                res += '<small><i class="icon-tv2"  style="color: blue"></i> ' + f[i].get("fax") + '</small><br />';
                            }
                            if (f[i].get("email") != "") {
                                res += '<small><i class="icon-mail5"  style="color: red"></i> ' + f[i].get("email") + '</small><br />';
                            }
                            if (f[i].get("siteweb") != "") {
                                res += '<small><i class="icon-at"  style="color: black"></i> ' + f[i].get("siteweb") + '</small><br />';
                            }
                        }

                    }

                    res += '</span></div>';
                }

                // if (critere == 70) {
                //     $("#shopping_tab").empty();
                //     $("#shopping_tab").append(res);
                // } else 

                if (critere == 301) {
                    $("#ulMosquees").empty();
                    $("#ulMosquees").append(res);
                } else if (critere == 150) {
                    $("#ulBanques").empty();
                    $("#ulBanques").append(res);
                } else if (critere == 142) {
                    $("#ulEcoles").empty();
                    $("#ulEcoles").append(res);
                } else if (critere == 266) {
                    $("#ulHotels").empty();
                    $("#ulHotels").append(res);
                }


            },
            error: function () {
                console.log('error parse !');
            },
            complete: function () {
                // var extent = nearbyPoisGeometryVector.getSource().getExtent();
                // map.getView().fit(extent, map.getSize());
            }
        });
    }
}

function nearbyPoisStyle(feature, resolution) {
    var s = getFeatureStyle(feature);
    return s;
};

var nearbyPoisGeometryVector = new ol.layer.Vector(
    {
        name: 'Nearby Pois',
        source: new ol.source.Vector(),
        style: nearbyPoisStyle
    });
map.addLayer(nearbyPoisGeometryVector);


function getFeatureStyle(feature) {

    var st = [];

    function AppliquerStyleIcone(img){
        st.push(new ol.style.Style({
            image: new ol.style.Icon( ({
              anchor: [0.5, 46],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: "assets/img/"+img+".png"
            }))
          }));
    }

    switch (feature.get('souscategorie')) {
        case "Banque":
            AppliquerStyleIcone("banque");
            break;
        case "Mosquée":
            AppliquerStyleIcone("mosquee");    
            break;
        case "Ecole Supérieure Et Institut Public":
            AppliquerStyleIcone("ecole");
            break;
        case "Hôtel":
            AppliquerStyleIcone("hotel");
            break;
    }
    
    return st;
}

function zoomToPoi(nom, coord0, coord1, el) {
    nearbyPoisGeometryVector.getSource().forEachFeature(function (feature) {
        var name = feature.get('nom').replace(/[']/g, "|");
        var cx = feature.get('x');
        var cy = feature.get('y');
        if (name == nom && cx == coord0 && cy == coord1) {
            var ext = feature.getGeometry().getExtent();
            map.getView().fit(ext, map.getSize());
            var coordinates = ol.proj.transform([Number(feature.get('x')), Number(feature.get('y'))], 'EPSG:4326', 'EPSG:3857');
            poi_popup.show(feature.getGeometry().getCoordinates(), name);
            map.getView().setZoom(17);
        }
    });
    removeActiveClass();
    $(el).addClass("active");
}

var poi_popup = new ol.Overlay.Popup(
    {
        popupClass: "default anim", //"tooltips", "warning" "black" "default", "tips", "shadow",
        closeBox: true,
        onclose: function () { removeActiveClass(); },
        positioning: 'bottom-auto',
        autoPan: true,
        autoPanAnimation: { duration: 100 }
    });
map.addOverlay(poi_popup);


function removeActiveClass() {
    $("#pois_list_content").find('div.tab-content').find('a').removeClass('active');
}

// /GESTION DES CHECKBOX DES COUCHES DISPONIBLES