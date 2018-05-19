// ==UserScript==
// @name         PokeLifeScript
// @namespace    http://tampermonkey.net/
// @version      1.1.4
// @downloadURL  https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @updateURL    https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @description  Auto Attack Script
// @author       brains, metinowy15
// @match        http://poke-life.net/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      http://bug7a.github.io/iconselect.js/sample/lib/control/iconselect.js
// @resource     customCSS  https://raw.githubusercontent.com/krozum/pokelife/master/style.css?v=6.2
// ==/UserScript==

var newCSS = GM_getResourceText("customCSS");
GM_addStyle(newCSS);

var isExpMode = false;
var iconSelect;
var iconPoke;
var iconBall;
$(document).ready(function () {
    $.wait = function (ms) {
        var defer = $.Deferred();
        setTimeout(function () { defer.resolve(); }, ms);
        return defer;
    };

    $('body').append('<div id="setPok" style="position: fixed; cursor: pointer; top: 0; left: 10px; z-index: 9999"></div>');
    $('body').append('<div id="setBall" style="position: fixed; cursor: pointer; top: 0; left: 60px; z-index: 9999"></div>');

    $('body').append('<div id="goDzicz" style="position: fixed; cursor: pointer; top: 0; right: 328px; z-index: 9999"></div>');
    $('body').append('<div id="goButton" style="border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 10px; font-size: 36px; text-align: center; width: 100px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">GO</div>');
    $('body').append('<div id="goAutoButton" style="border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 122px; font-size: 36px; text-align: center; width: 140px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">AutoGO</div>');

    $('body').append('<div id="goSettings" style="border-radius: 4px;position: fixed;cursor: pointer;bottom: 10px;right: 10px;font-size: 19px;text-align: center;width: 30px;height: 30px;line-height: 35px;background: rgb(21, 149, 137);z-index: 9999;"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span></div>');
    $('body').append('<div id="settings" style="display: none; width: 600px; height: auto; min-height: 200px; z-index: 9998; background: white; position: fixed; bottom: 0; right: 0; border: 3px solid #159589; padding: 10px; ">'+
    '<div>Lecz gdy pierwszy pokemon ma mniej niz <input id="min-health" type="number" min="1" max="100" style="margin-left: 10px" value="' + (window.localStorage.minHealth ? window.localStorage.minHealth : "90") + '">% zycia</div>' +
    '<div>Pokemon do 15 poziomu <input id="easy-lvl" type="number" min="0" max="5" style="margin-left: 10px" value="' + (window.localStorage.easyLvl ? window.localStorage.easyLvl : "1") + '"></div>' +
    '<div>Pokemon od 15 do 30 poziomu <input id="low-lvl" type="number" min="0" max="5" style="margin-left: 10px" value="' + (window.localStorage.lowLvl ? window.localStorage.lowLvl : "1") + '"></div>' +
    '<div>Pokemon od 30 do 50 poziomu <input id="mid-lvl" type="number" min="0" max="5" style="margin-left: 10px" value="' + (window.localStorage.midLvl ? window.localStorage.midLvl : "1") + '"></div>' +
    '<div>Pokemon od 50 do 70 poziomu <input id="hard-lvl" type="number" min="0" max="5" style="margin-left: 10px" value="' + (window.localStorage.hardLvl ? window.localStorage.hardLvl : "1") + '"></div>' +
    '<div>Pokemon od 70 do 90 poziomu <input id="power-lvl" type="number" min="0" max="5" style="margin-left: 10px" value="' + (window.localStorage.powerLvl ? window.localStorage.powerLvl : "1") + '"></div>' +
    '<div>Pokemon od 90 do 100 poziomu <input id="ultimate-lvl" type="number" min="0" max="5" style="margin-left: 10px" value="' + (window.localStorage.ultimateLvl ? window.localStorage.ultimateLvl : "1") + '"></div>' +
    '<div>Włącz exp mode <input type="checkbox" id="exp-mode" ' + (window.localStorage.expoMode ? (window.localStorage.expMode == "true" ? "checked" : "") : "checked") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div>' +
    '<div>Spacja uruchamia przycisk GO <input type="checkbox" id="space-go" ' + (window.localStorage.spaceGo ? (window.localStorage.spaceGo == "true" ? "checked" : "") : "checked") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div></div>');


    initPokemonIcons();
    initLocationIcons();
    initBallIcons();
    window.localStorage.expMode = false;

    function click() {
        for (let i = 0; i < 12; i++) {
            if (Number($('#sidebar .stan-pokemon:nth-child(' + i + ')').find('.progress-bar').attr('aria-valuenow')) * 100 / Number($('#sidebar .stan-pokemon:nth-child(2)').find('.progress-bar').attr('aria-valuemax')) < Number($('#min-health').val())) {
                console.log('lecze sie');
                $('#skrot_leczenie').trigger('click');
                break;
            }
        }
        if ($('.dzikipokemon-background-shiny').length == 1) {
            console.log('spotkalem shiny');
            $('#goButton').css('background', 'green');
            window.auto = false;
            $('#goAutoButton').html('AutoGO');
        } else if ($('.dzikipokemon-background-normalny').length == 1) {
            $('button[href="dzicz.php?miejsce=' + iconSelect.getSelectedValue() + getPockeIndex() + '"]').trigger('click');
        } else if ($('button[href="dzicz.php?miejsce=' + iconSelect.getSelectedValue() + iconBall.getSelectedValue() + '"]').length == 1) {
            $('button[href="dzicz.php?miejsce=' + iconSelect.getSelectedValue() + iconBall.getSelectedValue() + '"]').trigger('click');
            console.log('rzucam balla');
        } else {
            if ($('.progress-stan2 div').attr('aria-valuenow') < 5) {
                console.log('przerywam autoGo');
                window.auto = false;
                $('#goAutoButton').html('AutoGO');
            } else {
                console.log('ide do dziczy ' + iconSelect.getSelectedValue());
                $('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=' + iconSelect.getSelectedValue() + '"] img').trigger('click');
            }
        }

    }

    function getPockeIndex() {
        if (!isExpMode)
            return iconPoke.getSelectedValue();
        var pokeLvlNode = getElementByXpath('//*[@id="glowne_okno"]/div/div[2]/div[1]/div/div[2]/b');
        console.log(pokeLvlNode);
        var pokeLvlText = pokeLvlNode.innerHTML;
        var pokeLvlNumber = Number.parseInt(pokeLvlText.replace("Poziom: ",""));
console.log(pokeLvlNumber);
        return "&wybierz_pokemona=" + getPokForLvl(pokeLvlNumber);

    }
    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    function getPokForLvl(enemyLvl){
        if(enemyLvl <= 15)
            return Number($('#easy-lvl').val());
        else if(enemyLvl > 15 && enemyLvl <= 30)
            return Number($('#low-lvl').val());
        else if(enemyLvl > 30 && enemyLvl <= 50)
            return Number($('#mid-lvl').val());
        else if(enemyLvl > 50 && enemyLvl <= 70)
            return Number($('#hard-lvl').val());
        else if(enemyLvl > 70 && enemyLvl <= 90)
            return Number($('#power-lvl').val());
        else
            return Number($('#ultimate-lvl').val());
    }

    $(window).keypress(function (e) {
        if (e.key === ' ' || e.key === 'Spacebar') {
            if ($('#space-go').is(":checked")) {
                // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
                e.preventDefault();
                console.log('Space pressed');
                click();
            }
        }
    });

    var poksForLvl = {
        easyLvl:0,
        lowLvl:1,
        midLvl:2,
        hardLvl:3,
        powerLvl:4,
        ultimateLvl:5
    };

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
                if (window.auto) {
                    setTimeout(function () { click(); }, 150);
                }
            });

            /* zamyka menu */
            $('.collapse-hidefix').collapse('hide');

            /* wyłącza aktywne menu */
            //$('.nav li').removeClass('active');
        }
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
                if (window.auto) {
                    setTimeout(function () { click(); }, 150);
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
            isExpMode = true;
        } else {
            isExpMode = false;
            window.localStorage.expMode = false;
        }
    });

    $('body').on('click', ':not(#settings *, #settings)', function () {
        $('#settings').css('display', "none");
        $('#goSettings').css('display', "block");
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

function initPokemonIcons() {
    iconPoke = new IconSelect("setPok",
        {
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
    iconSelect = new IconSelect("goDzicz",
        {
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
    iconBall = new IconSelect("setBall",
        {
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
        { 'iconFilePath': "images/pokesklep/lureballe.jpg", 'iconValue': '&zlap_pokemona=lureballe' }];

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

