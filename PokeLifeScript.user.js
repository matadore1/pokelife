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

var newCSS = GM_getResourceText ("customCSS");
GM_addStyle (newCSS);


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
    $('body').append('<div id="settings" style="display: none; width: 600px; height: auto; min-height: 200px; z-index: 9998; background: white; position: fixed; bottom: 0; right: 0; border: 3px solid #159589; padding: 10px; "><div>Lecz gdy pierwszy pokemon ma mniej niz <input id="min-health" type="number" min="1" max="100" style="margin-left: 10px" value="' + (window.localStorage.minHealth ?  window.localStorage.minHealth :  "90") + '">% zycia</div><div>Spacja uruchamia przycisk GO <input type="checkbox" id="space-go" '+ (window.localStorage.spaceGo ?  (window.localStorage.spaceGo == "true" ? "checked" : "") :  "checked") +' style="margin-left: 10px; width: 20px; height: 20px; "></div></div>');


    initPokemonIcons();
    initLocationIcons();
    initBallIcons();

    function click() {
        if (Number($('#sidebar .stan-pokemon:nth-child(2)').find('.progress-bar').attr('aria-valuenow')) * 100 / Number($('#sidebar .stan-pokemon:nth-child(2)').find('.progress-bar').attr('aria-valuemax')) < Number($('#min-health').val())) {
            console.log('lecze sie');
            $('#skrot_leczenie').trigger('click');
            setTimeout(function () { click(); }, 100);
        } else {

            if ($('.dzikipokemon-background-shiny').length == 1) {
                console.log('spotkalem shiny');
                $('#goButton').css('background', 'green');
                window.auto = false;
                $('#goAutoButton').html('AutoGO');
            } else if ($('.dzikipokemon-background-normalny').length == 1) {
                $('button[href="dzicz.php?miejsce=' + iconSelect.getSelectedValue() + iconPoke.getSelectedValue() + '"]').trigger('click');
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
    }


    $(window).keypress(function (e) {
      if (e.key === ' ' || e.key === 'Spacebar') {
          if ($('#space-go').is(":checked")){
            // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
            e.preventDefault();
            console.log('Space pressed');
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
        if($('#space-go').is(":checked")){
            window.localStorage.spaceGo = true;
        } else {
            window.localStorage.spaceGo = false;
        }
    });

    $('body').on('click', ':not(#settings *, #settings)', function(){
        $('#settings').css('display', "none");
        $('#goSettings').css('display', "block");
    });

    $(document).on("change", '#min-health', function (){
        if($(this).val() > 100 ||  $(this).val() < 1){
           $(this).val(90);
        }
        window.localStorage.minHealth = $(this).val();
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

    document.getElementById('setPok').addEventListener('changed', function(e){
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

    document.getElementById('goDzicz').addEventListener('changed', function(e){
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

    document.getElementById('setBall').addEventListener('changed', function(e){
        window.localStorage.ballIconsIndex = iconBall.getSelectedIndex();
    });

}



