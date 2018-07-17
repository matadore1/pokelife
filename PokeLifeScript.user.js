// ==UserScript==
// @name         PokeLifeScript
// @namespace    http://tampermonkey.net/
// @version      1.6.14
// @downloadURL  https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @updateURL    https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @description  Auto Attack Script
// @author       brains, metinowy15
// @match        http://poke-life.net/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      http://bug7a.github.io/iconselect.js/sample/lib/control/iconselect.js
// @resource     customCSS  https://raw.githubusercontent.com/krozum/pokelife/master/style.css?v=6.5
// @resource     customCSS_dark  https://raw.githubusercontent.com/krozum/pokelife/master/style_dark.css?v=6.5
// @require      https://raw.githubusercontent.com/krozum/pokelife/master/careService.js?v=6.1
// ==/UserScript==

var newCSS;
if(window.localStorage.skinStyle == 2){
    newCSS = GM_getResourceText("customCSS_dark");
    GM_addStyle(newCSS);
} else {
    newCSS = GM_getResourceText("customCSS");
    GM_addStyle(newCSS);
}

var iconSelect;
var iconPoke;
var iconBall;
var lastClick;
window.jsonData = [];
window.shinyData = [];

$(document).ready(function () {
    $.wait = function (ms) {
        var defer = $.Deferred();
        setTimeout(function () { defer.resolve(); }, ms);
        return defer;
    };
    initJsonData();
    initVariables();
    addNewElementsToWebsite();
    initPokemonIcons();
    initLocationIcons();
    initBallIcons();
    insertLoginInfo();
    initCareService();

    function click() {
        var canRun = true;
        $('.stan-pokemon div.progress:first-of-type .progress-bar').each(function (index) {
            var now = $(this).attr("aria-valuenow");
            var max = $(this).attr("aria-valuemax");
            if (Number(now) * 100 / Number(max) < Number($('#min-health').val())) {
                if (lastClick === 'leczenie') {
                    canRun = false;
                } else {
                    canRun = false;
                    console.log('PokeLifeScript: leczę się');
                    lastClick = 'leczenie';
                    $('#skrot_leczenie').trigger('click');
                }
            }
        });

        console.log(canRun);
        if (canRun) {
            lastClick = 'nieleczenie';
            if ($('.dzikipokemon-background-shiny').length == 1) {
                console.log('PokeLifeScript: spotkany Shiny, przerwanie AutoGo');
                $('#goButton').css('background', 'green');
                window.auto = false;
                $('#goAutoButton').html('AutoGO');
            } else if (window.localStorage.catchMode == "true" && $('.dzikipokemon-background-normalny img[src="images/inne/pokeball_miniature2.png"]').length > 0) {
                console.log('PokeLifeScript: spotkany niezłapany pokemona, przerwanie AutoGo');
                $('#goButton').css('background', 'green');
                window.auto = false;
                $('#goAutoButton').html('AutoGO');
            } else if ($('.dzikipokemon-background-normalny').length == 1) {
                console.log('PokeLifeScript: atakuje pokemona');
                var url = "dzicz.php?miejsce=" + iconSelect.getSelectedValue() + getPockeIndex();
                $('button[href="' + url + '"]').trigger('click');
            } else if ($('button[href="dzicz.php?miejsce=' + iconSelect.getSelectedValue() + getBallIndex(true) + '"]').length == 1) {
                $('button[href="dzicz.php?miejsce=' + iconSelect.getSelectedValue() + getBallIndex() + '"]').trigger('click');
                console.log('PokeLifeScript: rzucam pokeballa');
            } else {
                if ($('.progress-stan2 div').attr('aria-valuenow') < 5) {
                    console.log('PokeLifeScript: brak PA, przerywam AutoGo');
                    window.auto = false;
                    $('#goAutoButton').html('AutoGO');
                } else {
                    if (iconSelect.getSelectedValue() == "ruiny_miasta" && $('.progress-stan2 div').attr('aria-valuenow') < 11) {
                        console.log('PokeLifeScript: brak PA, przerywam AutoGo');
                        window.auto = false;
                        $('#goAutoButton').html('AutoGO');
                    } else if (iconSelect.getSelectedValue() == "park_narodowy" && $('.progress-stan2 div').attr('aria-valuenow') < 12) {
                        console.log('PokeLifeScript: brak PA, przerywam AutoGo');
                        window.auto = false;
                        $('#goAutoButton').html('AutoGO');
                    } else {
                        console.log('PokeLifeScript: idę do dziczy ' + iconSelect.getSelectedValue() + ".");
                        $('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=' + iconSelect.getSelectedValue() + '"] img').trigger('click');
                    }
                }
            }
        }
    }

    function updateInfoLog() {
        if ($('#glowne_okno .panel-heading').html() === "Dzicz - wyprawa") {
            if ($('#glowne_okno p.alert:first').html() === "Na twojej drodze staje inny trener pokemon, który wyzywa Cię na pojedynek. Musisz przyjąć wyzwanie.") {
                console.log('PokeLifeScript: walka z trenerem');
            }
            if ($('#glowne_okno p.alert:first').html() === "Natrafiasz na dzikiego pokemona:") {
                console.log('PokeLifeScript: spotkałem pokemona');
                if ($('.dzikipokemon-background-shiny').length == 1) {
                    var shinyAPIInsert = "http://www.bra1ns.com/pokelife/insert.php?pokemon_id=" + $('.dzikipokemon-background-shiny .center-block img').attr('src').split('/')[1].split('.')[0].split('s')[1]+"&login="+$('#wyloguj').parent().parent().html().split("<div")[0].trim();
                    $.getJSON(shinyAPIInsert, {
                        format: "json"
                    }).done(function (data) {
                        loadShinyData();
                    });
                }
            }
        }

        if ($('#glowne_okno .panel-heading').html() === "Walka z dzikim pokemonem") {
            if ($('#glowne_okno h2').html() === "Złap Pokemona") {
                console.log('PokeLifeScript: walka wygrana');
            }
            if ($('#glowne_okno h2').html() === "Pokemon Ucieka") {
                console.log('PokeLifeScript: walka wygrana, pokemon ucieka');
            }
        }
        if ($('#glowne_okno .panel-heading').html() === "Łapanie Pokemona") {
            if ($('#glowne_okno p.alert-success').length > 0) {
                console.log('PokeLifeScript: pokemon złapany');
            } else {
                console.log('PokeLifeScript: pokemon się uwolnił');
            }
        }
    }

    function getBallIndex(check) {
        if (iconBall.getSelectedValue() != "mixed")
            return iconBall.getSelectedValue()
        else {
            let pokeLvlNumber = 0;
            if (!check) {
                let pokeLvlNode = getElementByXpath('//*[@id="glowne_okno"]/div/div[2]/table[2]/tbody/tr/td[2]/center/b/text()');
                let pokeLvlText = pokeLvlNode.data.replace("(", "");
                pokeLvlText = pokeLvlText.replace("poz.)", "");
                pokeLvlNumber = Number.parseInt(pokeLvlText.trim());
            }

            if (pokeLvlNumber < 15)
                return '&zlap_pokemona=nestballe';
            else
                return '&zlap_pokemona=greatballe'
        }
    }

    function updateTMView() {
        if ($('#plecak-tm').length > 0) {
            $('#plecak-tm > div.col-xs-6').each(function (index, val) {
                var id = $(this).find('h3').html().split(" ")[1];
                $(this).find("br").remove();
                if (window.jsonData["tm"][id - 1]["category_id"] == 1) {
                    $(this).children().css("background-color", "#f9856e");
                }
                if (window.jsonData["tm"][id - 1]["category_id"] == 2) {
                    $(this).children().css("background-color", "#4d98b0");
                }
                if (window.jsonData["tm"][id - 1]["category_id"] == 3) {
                    $(this).children().css("background-color", "#bdbcbb");
                }
                $(this).children().prepend('<br><img src="https://pokelife.pl/images/typy/' + window.jsonData["tm"][id - 1]["type_id"] + '.png" style="width: 40px;">');
            });
        }
    }

    function updateKlikanieView() {
        if ($('#glowne_okno .panel-heading').html() === "Promuj stronę") {
            var html = '<div class="col-xs-12" style=" text-align: center; "><button id="clickAllLinks" style=" background-color: #f1b03b; border: 1px solid #ce9532; border-radius: 5px; padding: 5px 25px; text-transform: uppercase; line-height: 20px; height: 40px; ">Wyklikaj wszystkie</button></div>';
            $('#glowne_okno .panel-body>div:first-of-type').append(html);
        }
    }

    function updateWymianaView() {
        if ($('#glowne_okno .panel-heading').html() === "Centrum wymiany Punktów Zasług") {
            var dostepne = Number($('#glowne_okno .panel-body big').html().split(" ")[0]);
            var cena_zakupu = Number($('#target0').parent().find("b").html().split("¥")[0].replace(/\./g, ''));
            var ilosc_yenow = Number($('a[href="http://pokelife.pl/pokedex/index.php?title=Pieniądze"]').parent().html().split("</a>")[1].split("<a")[0].replace(/\./g, ''));

            var ile_moge_kupic = Number((ilosc_yenow / cena_zakupu).toFixed());

            if (ile_moge_kupic > dostepne) {
                ile_moge_kupic = dostepne;
            }

            console.log('PokeLifeScript: dostępnych PZ do kupienia: ' + ile_moge_kupic);
            $('#target0').val(ile_moge_kupic);
            $('#target0').keyup();
        }
    }

    $(document).off("click", "#clickAllLinks");
    $(document).on("click", "#clickAllLinks", function (event) {
        var id = $('#klikniecie-1').parent().find("a").attr("onclick").split(",")[1].split(")")[0];
        setTimeout(function () { clickInLink(1, id); }, 200);
    });

    function clickInLink(number, id) {
        if (number < 11) {
            var w = window.open("", "myWindow", "width=200,height=100");
            w.location.href = 'http://pokelife.pl/index.php?k=' + number + '&g=' + id;
            $(w).load(setTimeout(function () {
                w.close();
                $('#klikniecie-' + number).html('TAK');
                console.log('PokeLifeScript: klikam link ' + number);
                setTimeout(function () { clickInLink(number + 1, id); }, 300);
            }, 300));
        } else {
            setTimeout(function () {
                $("#sidebar").load('inc/stan.php');
            }, 100);
        }
    }

    function getPockeIndex() {
        var pokeLvlNode = getElementByXpath('//*[@id="glowne_okno"]/div/div[2]/div[1]/div/div[2]/b');
        var pokeLvlText = pokeLvlNode.innerHTML;
        var pokeLvlNumber = Number.parseInt(pokeLvlText.replace("Poziom: ", ""));
        if (window.localStorage.expMode == "false")
            return iconPoke.getSelectedValue();
        return "&wybierz_pokemona=" + getPokForLvl(pokeLvlNumber);
    }

    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    function getPokForLvl(enemyLvl) {
        if (enemyLvl <= 15)
            return Number($('#easy-lvl').val() - 1);
        else if (enemyLvl > 15 && enemyLvl <= 30)
            return Number($('#low-lvl').val() - 1);
        else if (enemyLvl > 30 && enemyLvl <= 50)
            return Number($('#mid-lvl').val() - 1);
        else if (enemyLvl > 50 && enemyLvl <= 70)
            return Number($('#hard-lvl').val() - 1);
        else if (enemyLvl > 70 && enemyLvl <= 90)
            return Number($('#power-lvl').val() - 1);
        else
            return Number($('#ultimate-lvl').val());
    }

    $(window).keypress(function (e) {
        if (e.key === ' ' || e.key === 'Spacebar') {
            if ($('#space-go').is(":checked")) {
                // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
                e.preventDefault();
                click();
            }
        }
    });
    $(document).off("click", "nav a");
    $(document).on("click", "nav a", function (event) {
        if ($(this).attr('href').charAt(0) != '#' && !$(this).hasClass("link")) {
            event.preventDefault();

            //back_button
            //Ucinanie " gra/ "
            var new_buffer = $(this).attr('href');
            new_buffer = new_buffer.substr(4);
            remember_back(new_buffer);

            $("html, body").animate({ scrollTop: 0 }, "fast");

            //$("#glowne_okno").html(loadingbar);
            $("#glowne_okno").load($(this).attr('href'), function () {
                updateTMView();
                updateKlikanieView();
                updateWymianaView();
                updateInfoLog();
                if (window.auto) {
                    setTimeout(function () { click(); }, window.localStorage.clickSpeed);
                }
            });

            /* zamyka menu */
            $('.collapse-hidefix').collapse('hide');

            /* wyłącza aktywne menu */
            //$('.nav li').removeClass('active');
        }
    });

    var poksForLvl = {
        easyLvl: 0,
        lowLvl: 1,
        midLvl: 2,
        hardLvl: 3,
        powerLvl: 4,
        ultimateLvl: 5
    };

    $(document).off("click", "#skrot_leczenie");
    $(document).on("click", "#skrot_leczenie", function (event) {
        $("#skrot_leczenie_img").attr("src", "images/leczenie_load.gif");
        //$("#miniOkno_content").html(loadingbar);
        $("#miniOkno_Label").html('Centrum Pokemon');
        $("#miniOkno_content").load('gra/lecznica.php?wylecz_wszystkie&tylko_komunikat', function () {
            $('.btn-wybor_pokemona').attr("disabled", false);
            $('.btn-wybor_pokemona .progress-bar').css("width", "100%");
            $('.btn-wybor_pokemona .progress-bar span').html("100% PŻ");
            if (window.auto) {
                console.log("clic3");
                setTimeout(function () { click(); }, 500);
            }
        });
    });

    $(document).on("change", "#clickSpeed", function (event) {
        window.localStorage.clickSpeed = $(this).val();
    });

    $(document).off("click", ".btn-akcja");
    $(document).on("click", ".btn-akcja", function (event) {
        event.preventDefault();


        if (this.id != 'back_button') {

        } else {
            if ($(this).prop('prev1') != '') {
                $('#back_button').attr('href', $('#back_button').attr('prev1'));
                $('#back_button').attr('prev1', $('#back_button').attr('prev2'));
                $('#back_button').attr('prev2', $('#back_button').attr('prev3'));
                $('#back_button').attr('prev3', $('#back_button').attr('prev4'));
                $('#back_button').attr('prev4', $('#back_button').attr('prev5'));
                $('#back_button').attr('prev5', '');
            } else {
                $(this).prop('disabled', true);
            }
        }

        //Obejście modali
        if ($('body').hasClass('modal-open')) {
            $('body').removeClass('modal-open');
            $('body').css({ "padding-right": "0px" });
            $('.modal-backdrop').remove();
        }

        $("html, body").animate({ scrollTop: 0 }, "fast");

        //$("#glowne_okno").html(loadingbar);
        $("#glowne_okno").load('gra/' + $(this).attr('href'), { limit: 20 },
            function (responseText, textStatus, req) {
                updateTMView();
                updateKlikanieView();
                updateWymianaView();
                updateInfoLog();
                if (window.auto) {
                    setTimeout(function () { click(); }, window.localStorage.clickSpeed);
                }
                if (textStatus == "error") {
                    $("#glowne_okno").html(responseText);
                }
            });
        //$("#glowne_okno").load($(this).attr('href'),{});
    });

    $(document).on("click", '#goButton', function () {
        click();
    });

    $(document).on("change", '#space-go', function () {
        if ($('#space-go').is(":checked")) {
            window.localStorage.spaceGo = true;
        } else {
            window.localStorage.spaceGo = false;
        }
    });

    $(document).on("change", '#exp-mode', function () {
        if ($('#exp-mode').is(":checked")) {
            window.localStorage.expMode = true;
        } else {
            window.localStorage.expMode = false;
        }
    });

    $(document).on("change", '#catch-mode', function () {
        if ($('#catch-mode').is(":checked")) {
            window.localStorage.catchMode = true;
        } else {
            window.localStorage.catchMode = false;
        }
    });

    $('body').on('click', ':not(#settings *, #settings)', function () {
        $('#settings').css('display', "none");
        $('#goSettings').css('display', "block");
    });

    $('body').on('click', '#changeStyle', function () {
       if(window.localStorage.skinStyle == 2){
           window.localStorage.skinStyle = 1;
           location.reload();
       } else {
           window.localStorage.skinStyle = 2;
           location.reload();
       }
    });

    $(document).on("change", '#min-health', function () {
        if ($(this).val() > 100 || $(this).val() < 1) {
            $(this).val(90);
        }
        window.localStorage.minHealth = $(this).val();
    });

    $(document).on("change", '#easy-lvl', function () {
        window.localStorage.easyLvl = $(this).val();
    });
    $(document).on("change", '#low-lvl', function () {
        window.localStorage.lowLvl = $(this).val();
    });
    $(document).on("change", '#mid-lvl', function () {
        window.localStorage.midLvl = $(this).val();
    });
    $(document).on("change", '#hard-lvl', function () {
        window.localStorage.hardLvl = $(this).val();
    });
    $(document).on("change", '#power-lvl', function () {
        window.localStorage.powerLvl = $(this).val();
    });
    $(document).on("change", '#ultimate-lvl', function () {
        window.localStorage.ultimateLvl = $(this).val();
    });

    $(document).on("click", '#goSettings', function () {
        if ($('#settings').css('display') == "none") {
            $('#settings').css('display', "block");
            $('#goSettings').css('display', "none");
        } else {
            $('#settings').css('display', "none");
            $('#goSettings').css('display', "block");
        }
    });

    window.auto = false;
    $(document).on("click", '#goAutoButton', function () {
        if (window.auto) {
            window.auto = false;
            $('#goAutoButton').html('AutoGO');
        } else {
            window.auto = true;
            $('#goAutoButton').html('STOP');
            click();
        }
    });

});


function initJsonData() {
    var flickerAPI = "https://raw.githubusercontent.com/krozum/pokelife/master/data.json";
    $.getJSON(flickerAPI, {
        format: "json"
    }).done(function (data) {
        window.jsonData = data;
    });

    loadShinyData();
};

function loadShinyData() {
    var shinyAPI = "http://www.bra1ns.com/pokelife/get.php";
    $.getJSON(shinyAPI, {
        format: "json"
    }).done(function (data) {
        window.shinyData = data;
        $('#shinyBox').html("<b>Ostatnio spotkanie shiny:</b>");
        $.each(window.shinyData, function (key, value) {
            $('#shinyBox').append('<div style="width: 290px;margin-bottom: 10px;"><img style="width: 50px" src="http://poke-life.net/pokemony/srednie/s' + value['pokemon_id'] + '.png"><span style="margin-left: 5px">Spotkany o ' + value['creation_date'] + '</span></div>');
        });
    });
};

function insertLoginInfo() {
    setTimeout(function(){
        var insertLoginInfoURL = "http://www.bra1ns.com/pokelife/insert_user.php?bot_version=" + GM_info.script.version +"&login="+$('#wyloguj').parent().parent().html().split("<div")[0].trim();
        $.getJSON(insertLoginInfoURL, {
            format: "json"
        }).done(function (data) {
        });
    }, 2000);
};



function initVariables() {
    if (window.localStorage.expMode == undefined) {
        window.localStorage.expMode = false;
    }
    if (window.localStorage.catchMode == undefined) {
        window.localStorage.catchMode = true;
    }
    if (window.localStorage.spaceGo == undefined) {
        window.localStorage.spaceGo = true;
    }
    if (window.localStorage.clickSpeed == undefined) {
        window.localStorage.clickSpeed = 200;
    }
};


function addNewElementsToWebsite() {

    $('body').append('<div id="setPok" style="position: fixed; cursor: pointer; top: 0; left: 10px; z-index: 9999"></div>');
    $('body').append('<div id="setBall" style="position: fixed; cursor: pointer; top: 0; left: 60px; z-index: 9999"></div>');

    $('body').append('<div id="goDzicz" style="position: fixed; cursor: pointer; top: 0; right: 328px; z-index: 9999"></div>');
    $('body').append('<div id="goButton" style="border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 10px; font-size: 36px; text-align: center; width: 100px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">GO</div>');
    $('body').append('<div id="goAutoButton" style="border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 122px; font-size: 36px; text-align: center; width: 140px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">AutoGO</div>');

    $('body').append('<div id="newVersionInfo" style="border-radius: 4px; position: fixed; cursor: pointer; bottom: 10px; right: 60px; color: yellow; font-size: 19px; text-align: center; width: 250px; height: 30px; line-height: 35px; z-index: 9998; text-align: right;">' + (GM_info.script.version == window.localStorage.lastVersion ? "" : "New Version! ") + 'v' + GM_info.script.version + '</div>');
    $('body').append('<div id="goSettings" style="border-radius: 4px;position: fixed;cursor: pointer;bottom: 10px;right: 10px;font-size: 19px;text-align: center;width: 30px;height: 30px;line-height: 35px;background: rgb(21, 149, 137);z-index: 9999;"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span></div>');
    $('body').append('<div id="settings" style="display: none; width: 600px; height: auto; min-height: 200px; z-index: 9998; background: white; position: fixed; bottom: 0; right: 0; border: 3px solid #159589; padding: 10px; ">' +
        '<div>Lecz gdy któryś pokemon ma mniej niż <input id="min-health" type="number" min="1" max="100" style="margin-left: 10px" value="' + (window.localStorage.minHealth ? window.localStorage.minHealth : "90") + '">% zycia</div>' +
        '<div><b>EXP MODE:</b><br>Pokemon do 15 poziomu <input id="easy-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.easyLvl ? window.localStorage.easyLvl : "1") + '"></div>' +
        '<div>Pokemon od 15 do 30 poziomu <input id="low-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.lowLvl ? window.localStorage.lowLvl : "1") + '"></div>' +
        '<div>Pokemon od 30 do 50 poziomu <input id="mid-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.midLvl ? window.localStorage.midLvl : "1") + '"></div>' +
        '<div>Pokemon od 50 do 70 poziomu <input id="hard-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.hardLvl ? window.localStorage.hardLvl : "1") + '"></div>' +
        '<div>Pokemon od 70 do 90 poziomu <input id="power-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.powerLvl ? window.localStorage.powerLvl : "1") + '"></div>' +
        '<div>Pokemon od 90 do 100 poziomu <input id="ultimate-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.ultimateLvl ? window.localStorage.ultimateLvl : "1") + '"></div>' +
        '<div>Włącz exp mode <input type="checkbox" id="exp-mode" ' + (window.localStorage.expMode ? (window.localStorage.expMode == "true" ? "checked" : "") : "") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div>' +
        '<div><b>Zatrzymuj gdy spotkasz niezłapanego</b> <input type="checkbox" id="catch-mode" ' + (window.localStorage.catchMode ? (window.localStorage.catchMode == "true" ? "checked" : "") : "") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div>' +
        '<div><b>Spacja uruchamia przycisk GO</b> <input type="checkbox" id="space-go" ' + (window.localStorage.spaceGo ? (window.localStorage.spaceGo == "true" ? "checked" : "") : "checked") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div>' +
        '<div><b>Sprawdzaj opieke</b> <input type="checkbox" id="care" ' + (window.localStorage.care ? (window.localStorage.care == "true" ? "checked" : "") : "checked") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div>' +
        '<div style="margin-top: 10px;"><b>Szybkość klikania:</b><input type="range" min="130" max="1000" value="' + (window.localStorage.clickSpeed ? window.localStorage.clickSpeed : "200") + '" class="slider" id="clickSpeed" style="width: 300px;"></div>' +
        '<div style="margin-top: 10px;" id="shinyBox"><b>Ostatnio spotkane shiny:</b></div>' +
        '<br><br></div>');

    $('body').append('<div id="changeStyle" style="border-radius: 4px;position: fixed;cursor: pointer;bottom: 10px;left: 10px;font-size: 19px;text-align: center;width: 30px;height: 30px;line-height: 35px;background: ' + (window.localStorage.skinStyle == 2 ? '#d85046' : '#74b5b1' ) + ';z-index: 9999;"></div>');

    window.localStorage.lastVersion = GM_info.script.version;

}

function initPokemonIcons() {
    iconPoke = new IconSelect("setPok", {
        'selectedIconWidth': 48,
        'selectedIconHeight': 48,
        'selectedBoxPadding': 1,
        'iconsWidth': 48,
        'iconsHeight': 48,
        'boxIconSpace': 1,
        'vectoralIconNumber': 1,
        'horizontalIconNumber': 6
    });
    var selectPoke = [];
    let i = 0;
    $.each($('.stan-pokemon'), function (index, item) {

        let src = $(item).find('img').attr('src');
        if (src != "undefined" && src != undefined) {
            selectPoke.push({ 'iconFilePath': $(item).find('img').attr('src'), 'iconValue': "&wybierz_pokemona=" + i });
            i = i + 1;
        }

    });

    iconPoke.refresh(selectPoke);

    if (window.localStorage.pokemonIconsIndex) {
        iconPoke.setSelectedIndex(window.localStorage.pokemonIconsIndex);
    } else {
        iconPoke.setSelectedIndex(0);
        window.localStorage.pokemonIconsIndex = 0;
    }

    document.getElementById('setPok').addEventListener('changed', function (e) {
        window.localStorage.pokemonIconsIndex = iconPoke.getSelectedIndex();
    });
}

function initLocationIcons() {
    iconSelect = new IconSelect("goDzicz", {
        'selectedIconWidth': 48,
        'selectedIconHeight': 48,
        'selectedBoxPadding': 1,
        'iconsWidth': 48,
        'iconsHeight': 48,
        'boxIconSpace': 1,
        'vectoralIconNumber': 1,
        'horizontalIconNumber': 6
    });
    var icons = [];
    $.each($('#pasek_skrotow li'), function (index, item) {
        if ($(item).find('a').attr('href').substring(0, 9) == "gra/dzicz") {
            icons.push({ 'iconFilePath': $(item).find('img').attr('src'), 'iconValue': $(item).find('a').attr('href').substring(28) });
        }
    });

    iconSelect.refresh(icons);

    if (window.localStorage.locationIconsIndex) {
        iconSelect.setSelectedIndex(window.localStorage.locationIconsIndex);
    } else {
        iconSelect.setSelectedIndex(0);
        window.localStorage.locationIconsIndex = 0;
    }

    document.getElementById('goDzicz').addEventListener('changed', function (e) {
        window.localStorage.locationIconsIndex = iconSelect.getSelectedIndex();
    });
}

function initBallIcons() {
    iconBall = new IconSelect("setBall", {
        'selectedIconWidth': 48,
        'selectedIconHeight': 48,
        'selectedBoxPadding': 1,
        'iconsWidth': 48,
        'iconsHeight': 48,
        'boxIconSpace': 1,
        'vectoralIconNumber': 1,
        'horizontalIconNumber': 6
    });
    var selectBall = [
        { 'iconFilePath': "images/pokesklep/pokeballe.jpg", 'iconValue': '&zlap_pokemona=pokeballe' },
        { 'iconFilePath': "images/pokesklep/greatballe.jpg", 'iconValue': '&zlap_pokemona=greatballe' },
        { 'iconFilePath': "images/pokesklep/nestballe.jpg", 'iconValue': '&zlap_pokemona=nestballe' },
        { 'iconFilePath': "images/pokesklep/friendballe.jpg", 'iconValue': '&zlap_pokemona=friendballe' },
        { 'iconFilePath': "images/pokesklep/nightballe.jpg", 'iconValue': '&zlap_pokemona=nightballe' },
        { 'iconFilePath': "images/pokesklep/cherishballe.jpg", 'iconValue': '&zlap_pokemona=cherishballe' },
        { 'iconFilePath': "images/pokesklep/lureballe.jpg", 'iconValue': '&zlap_pokemona=lureballe' },
        { 'iconFilePath': "http://oi66.tinypic.com/2hro8zo.jpg", 'iconValue': 'mixed' }

    ];

    iconBall.refresh(selectBall);

    if (window.localStorage.ballIconsIndex) {
        iconBall.setSelectedIndex(window.localStorage.ballIconsIndex);
    } else {
        iconBall.setSelectedIndex(1);
        window.localStorage.ballIconsIndex = 1;
    }

    document.getElementById('setBall').addEventListener('changed', function (e) {
        window.localStorage.ballIconsIndex = iconBall.getSelectedIndex();
    });
}
