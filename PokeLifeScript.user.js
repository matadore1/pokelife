// ==UserScript==
// @name         PokeLifeScript
// @version      1.8.7
// @downloadURL  https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @updateURL    https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @description  Dodatki do gry Pokelife
// @match        http://poke-life.net/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      http://bug7a.github.io/iconselect.js/sample/lib/control/iconselect.js
// @resource     customCSS  https://raw.githubusercontent.com/krozum/pokelife/master/style.css?v=1.8.6.3
// @resource     customCSS_dark  https://raw.githubusercontent.com/krozum/pokelife/master/style_dark.css?v=1.8.6.3
// @require      https://raw.githubusercontent.com/krozum/pokelife/master/careService.js?v=1.8.6.3
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
var globalMenu = [];
window.jsonData = [];
window.shinyData = [];
window.lastActiveData = [];

(function($) {
    var origAppend = $.fn.append;

    $.fn.append = function () {
        return origAppend.apply(this, arguments).trigger("append");
    };
})(jQuery);

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
    initCareService();
    loadLastActiveData();

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

        if (canRun) {
            lastClick = 'nieleczenie';
            if ($('.dzikipokemon-background-shiny').length == 1) {
                console.log('PokeLifeScript: spotkany Shiny, przerwanie AutoGo');
                window.auto = false;
                $('#goAutoButton').html('AutoGO');
            } else if (window.localStorage.catchMode == "true" && $('.dzikipokemon-background-normalny img[src="images/inne/pokeball_miniature2.png"]').length > 0 && $('.dzikipokemon-background-normalny img[src="images/trudnosc/trudnoscx.png"]').length < 1 && $('.dzikipokemon-background-normalny .col-xs-9 > b').html().split("Poziom: ")[1] <= 50) {
                console.log('PokeLifeScript: spotkany niezłapany pokemona, przerwanie AutoGo');
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
                    } else if (iconSelect.getSelectedValue() == "z_wakacyjna_wyspa" && $('.progress-stan2 div').attr('aria-valuenow') < 15) {
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
        if (iconBall.getSelectedValue() == "mixed"){
            let pokeLvlNumber = 0;
            if (!check) {
                let pokeLvlNode = getElementByXpath('//*[@id="glowne_okno"]/div/div[2]/table[2]/tbody/tr/td[2]/center/b/text()');
                let pokeLvlText = pokeLvlNode.data.replace("(", "");
                pokeLvlText = pokeLvlText.replace("poz.)", "");
                pokeLvlNumber = Number.parseInt(pokeLvlText.trim());
            }
            if (pokeLvlNumber < 15){
                return '&zlap_pokemona=nestballe';
            } else {
                return '&zlap_pokemona=greatballe';
            }
        } else if (iconBall.getSelectedValue() == "mixed2") {
            var d = new Date();
            var h = d.getHours();
            if(h >= 22 || h < 6 ){
                return '&zlap_pokemona=nightballe';
            } else {
                let pokeLvlNumber = 0;
                if (!check) {
                    let pokeLvlNode = getElementByXpath('//*[@id="glowne_okno"]/div/div[2]/table[2]/tbody/tr/td[2]/center/b/text()');
                    let pokeLvlText = pokeLvlNode.data.replace("(", "");
                    pokeLvlText = pokeLvlText.replace("poz.)", "");
                    pokeLvlNumber = Number.parseInt(pokeLvlText.trim());
                }
                if (pokeLvlNumber < 15){
                    return '&zlap_pokemona=nestballe';
                } else {
                    return '&zlap_pokemona=greatballe';
                }
            }
        } else {
            return iconBall.getSelectedValue()
        }
    }

    function updatePlecakView() {
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
        if ($('#plecak-trzymane').length > 0) {
            $('#plecak-trzymane > div.col-xs-6').each(function (index, val) {
                var id = $(this).find('.thumbnail-plecak').data("target").split("#plecak-przedmiot-")[1];
                var level = $(this).find('strong').html();
                var html = "";
                if(level != undefined){
                    if (level.split(" ").pop() == "II"){
                        html = '<button type="submit" class="btn btn-warning btn-akcja" href="plecak.php?rozbierz='+id+'&napewno=1&p=4" style=" margin: 0 auto; text-align: center; display: block; ">Rozbierz</button>';
                        $(this).find('.caption').append(html);
                    } else if (level.split(" ").pop() == "III"){
                        html = '<button type="submit" class="btn btn-danger btn-akcja" href="plecak.php?rozbierz='+id+'&napewno=1&p=4" style=" margin: 0 auto; text-align: center; display: block; ">Rozbierz</button>';
                        $(this).find('.caption').append(html);
                    }
                }
            });
        }

        $(document).off("click", "#plecak-trzymane");
        $(document).on("click", "#plecak-trzymane .thumbnail-plecak button[type='submit']", function(e){
            var id = $(this).attr("href").split("rozbierz=")[1].split("&napewno")[0];
            $("#plecak-przedmiot-"+id).remove();
            setTimeout(function(){
                $('.modal-backdrop').remove();
            }, 400);
        });
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
            if($('input:focus').length == 0 && $('textarea:focus').length == 0){
                if ($('#space-go').is(":checked")) {
                    // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
                    e.preventDefault();
                    click();
                }
            }
        }
    });

    $(document).on("click", "#goBack", function (event) {
        var url;
        globalMenu.pop();
        if(globalMenu.length < 1){
            url = "gra/statystyki.php";
        } else {
            url = globalMenu[globalMenu.length-1];
        }

        $("#glowne_okno").load(url, function () {
            updateActiveLog();
            updatePlecakView();
            updateKlikanieView();
            updateWymianaView();
            updateInfoLog();
            if (window.auto) {
                setTimeout(function () { click(); }, window.localStorage.clickSpeed);
            }
        });
    });

    $(document).off("click", "nav a");
    $(document).on("click", "nav a", function (event) {
        if ($(this).attr('href').charAt(0) != '#' && !$(this).hasClass("link")) {
            event.preventDefault();

            globalMenu.push($(this).attr('href'));
            console.log(globalMenu);

            //back_button
            //Ucinanie " gra/ "
            var new_buffer = $(this).attr('href');
            new_buffer = new_buffer.substr(4);
            remember_back(new_buffer);

            $("html, body").animate({ scrollTop: 0 }, "fast");

            //$("#glowne_okno").html(loadingbar);
            $("#glowne_okno").load($(this).attr('href'), function () {
                updateActiveLog();
                updatePlecakView();
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

    $(document).on( "click", "#zaloguj_chat", function(event) {
		$("#shout_refresher").load("gra/chat/shout.php?refresh="+window.shoutLastID);
	});

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
                setTimeout(function () { click(); }, 500);
            }
        });
    });

    $(document).on("change", "#clickSpeed", function (event) {
        window.localStorage.clickSpeed = $(this).val();
    });

    $("#shouts ul").bind("append", function() {
        var name = $('#shout_list li:last-of-type > .shout_post_name').html();

        $.each(window.lastActiveData, function (key, value) {
            var date1 = new Date(value.last_login_time);
            var date2 = new Date();
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffMinutes = Math.ceil(timeDiff / (1000 * 60));
            var opacity = 1/diffMinutes;
            $('#shout_list .shout_post_name:contains("'+value.login+'"):not(:has("span"))').prepend('<span class="fa fa-circle fa-fw" style="color: #62d262; opacity: '+opacity+'"></span>');
        });
    });

    $(document).off('submit', 'form');
    $(document).on('submit', 'form', function(e) {
        if (!$(this).attr("form-normal-submit")) {
            $(this).children('input[type=submit]').attr("disabled", "disabled");
            $("html, body").animate({ scrollTop: 0 }, "fast");

            //Obejście modali
            if($('body').hasClass('modal-open') && $(this).attr("dont-close-modal") != 1) {
                $('body').removeClass('modal-open');
                $('body').css({"padding-right":"0px"});
                $('.modal-backdrop').remove();
            } else {
                $(".modal").animate({ scrollTop: 0 }, "fast");
            }

            var postData = $(this).serializeArray();

            if ($(this).attr("form-target")) {
                //$($(this).attr('form-target')).html(loadingbar);
                $($(this).attr('form-target')).load('gra/'+$(this).attr('action'),  postData );
            } else {
                $("html, body").animate({ scrollTop: 0 }, "fast");
                //$("#glowne_okno").html(loadingbar);
                $("#glowne_okno").load('gra/'+$(this).attr('action'),  postData, function(){
                    updateWymianaView();
                });
            }

            e.preventDefault(); //STOP default action
            e.unbind(); //unbind. to stop multiple form submit.
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
                updateActiveLog();
                updatePlecakView();
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


    $("#goButton" ).contextmenu(function(event) {
        event.preventDefault();
        if ($('#space-go').is(":checked")) {
            window.localStorage.spaceGo = true;
            $("#space-go").prop( "checked", false );
            $("#goButton").css("opacity", "1");
        } else {
            window.localStorage.spaceGo = true;
            $("#goButton").css("opacity", "0.3");
            $("#space-go").prop( "checked", true );
        }
    });

    $(document).on("change", '#space-go', function () {
        if ($('#space-go').is(":checked")) {
            window.localStorage.spaceGo = true;
            $("#goButton").css("opacity", "0.3");
        } else {
            window.localStorage.spaceGo = false;
            $("#goButton").css("opacity", "1");
        }
    });

    $(document).on("change", '#exp-mode', function () {
        if ($('#exp-mode').is(":checked")) {
            window.localStorage.expMode = true;
            $('.exp-mode').addClass("exp-mode-visible")
        } else {
            window.localStorage.expMode = false;
            $('.exp-mode').removeClass("exp-mode-visible")
        }
    });

    $(document).on("change", '#catch-mode', function () {
        if ($('#catch-mode').is(":checked")) {
            window.localStorage.catchMode = true;
        } else {
            window.localStorage.catchMode = false;
        }
    });

    $('body').on('click', ':not(#settings *, #settings, #fastShop, #fastShop *)', function () {
        $('#settings').css('display', "none");
        $('#goSettings').css('display', "block");
        $('#fastShop').css('display', "none");
        $('#goFastShop').css('display', "block");
    });

    $('body').on('click', '#changeStyle', function () {
       if(window.localStorage.skinStyle == 1){
           window.localStorage.skinStyle = 2;
           location.reload();
       } else {
           window.localStorage.skinStyle = 1;
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


    document.onkeydown = function(e) {
        if (e.ctrlKey && e.which == 32) {
            if ($('#space-go').is(":checked")) {
                window.localStorage.spaceGo = true;
                $("#space-go").prop( "checked", false );
                $("#goButton").css("opacity", "1");
            } else {
                window.localStorage.spaceGo = true;
                $("#goButton").css("opacity", "0.3");
                $("#space-go").prop( "checked", true );
            }
        }
    };

    $(document).on("click", '#goSettings', function () {
        if ($('#settings').css('display') == "none") {
            $('#settings').css('display', "block");
            $('#goSettings').css('display', "none");
        } else {
            $('#settings').css('display', "none");
            $('#goSettings').css('display', "block");
        }
    });

    $(document).on("click", "#fastShop button:not('.confirm')", function(event) {
        event.preventDefault();
        $(this).addClass("confirm");
    });

    $(document).on("click", "#fastShop button.confirm", function(event) {
        $(this).removeClass("confirm");
        var MAIN = $(this).parent();
        var MAIN_FORM = $(this).parent().html();
        event.preventDefault();
        var formData = $(this).parent().serialize();
        MAIN.html("<button class='btn btn-primary' style='width: 100%; background-color: #c72929; border-color: #c72929'>Zakupiono</button>");

        $.ajax({
            type: 'POST',
            url: "gra/"+MAIN.attr('action'),
            data: formData
        }).done(function(){
            var ilosc_old, ilosc_new, html;
            if(formData == "kup_greatballe=30"){
                if($('form[action="dzicz.php?zlap"] button[data-original-title="Greatball"]').length > 0){
                    ilosc_old = $('form[action="dzicz.php?zlap"] button[data-original-title="Greatball"]').html().split("<br>")[1].split(" ")[0];
                    ilosc_new = Number(ilosc_old)+Number(30);
                    html = $('form[action="dzicz.php?zlap"] button[data-original-title="Greatball"]').html();
                    $('form[action="dzicz.php?zlap"] button[data-original-title="Greatball"]').html(html.replace(ilosc_old, ilosc_new));
                } else {
                    html = '<button type="button" class="btn btn-default btn-akcja btn-pokeball " href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&amp;zlap_pokemona=greatballe" title="" data-toggle="tooltip" data-placement="top" data-original-title="Greatball" aria-describedby="tooltip822784"><img src="images/pokesklep/greatballe.jpg" alt="Greatball" width="93px"><br>30 sztuk</button>';
                    $('form[action="dzicz.php?zlap"] center').prepend(html);
                }
            }
            if(formData == "kup_nestballe=30"){
                if($('form[action="dzicz.php?zlap"] button[data-original-title="Nestball"]').length > 0){
                    ilosc_old = $('form[action="dzicz.php?zlap"] button[data-original-title="Nestball"]').html().split("<br>")[1].split(" ")[0];
                    ilosc_new = Number(ilosc_old)+Number(30);
                    html = $('form[action="dzicz.php?zlap"] button[data-original-title="Nestball"]').html();
                    $('form[action="dzicz.php?zlap"] button[data-original-title="Nestball"]').html(html.replace(ilosc_old, ilosc_new));
                } else {
                    html = '<button type="button" class="btn btn-default btn-akcja btn-pokeball " href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&amp;zlap_pokemona=nestballe" title="" data-toggle="tooltip" data-placement="top" data-original-title="Nestball" aria-describedby="tooltip822784"><img src="images/pokesklep/nestballe.jpg" alt="Nestball" width="93px"><br>30 sztuk</button>';
                    $('form[action="dzicz.php?zlap"] center').prepend(html);
                }
            }
            if(formData == "kup_nightballe=30"){
                if($('form[action="dzicz.php?zlap"] button[data-original-title="Nightball"]').length > 0){
                    ilosc_old = $('form[action="dzicz.php?zlap"] button[data-original-title="Nightball"]').html().split("<br>")[1].split(" ")[0];
                    ilosc_new = Number(ilosc_old)+Number(30);
                    html = $('form[action="dzicz.php?zlap"] button[data-original-title="Nightball"]').html();
                    $('form[action="dzicz.php?zlap"] button[data-original-title="Nightball"]').html(html.replace(ilosc_old, ilosc_new));
                } else {
                    html = '<button type="button" class="btn btn-default btn-akcja btn-pokeball " href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&amp;zlap_pokemona=nightballe" title="" data-toggle="tooltip" data-placement="top" data-original-title="Nightball" aria-describedby="tooltip822784"><img src="images/pokesklep/nightballe.jpg" alt="Nightball" width="93px"><br>30 sztuk</button>';
                    $('form[action="dzicz.php?zlap"] center').prepend(html);
                }
            }
            if(formData == "kup_nightballe=30"){
                if($('form[action="dzicz.php?zlap"] button[data-original-title="Nightball"]').length > 0){
                    ilosc_old = $('form[action="dzicz.php?zlap"] button[data-original-title="Nightball"]').html().split("<br>")[1].split(" ")[0];
                    ilosc_new = Number(ilosc_old)+Number(30);
                    html = $('form[action="dzicz.php?zlap"] button[data-original-title="Nightball"]').html();
                    $('form[action="dzicz.php?zlap"] button[data-original-title="Nightball"]').html(html.replace(ilosc_old, ilosc_new));
                } else {
                    html = '<button type="button" class="btn btn-default btn-akcja btn-pokeball " href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&amp;zlap_pokemona=nightballe" title="" data-toggle="tooltip" data-placement="top" data-original-title="Nightball" aria-describedby="tooltip822784"><img src="images/pokesklep/nightballe.jpg" alt="Nightball" width="93px"><br>30 sztuk</button>';
                    $('form[action="dzicz.php?zlap"] center').prepend(html);
                }
            }

            if(formData == ("zamien_ile=1&zamien=stunball&s="+window.localStorage.s) || formData.startsWith("przedmiot=stunballe&id_oferty=")){
                if($('form[action="dzicz.php?zlap"] button[data-original-title="Stunball"]').length > 0){
                    ilosc_old = $('form[action="dzicz.php?zlap"] button[data-original-title="Stunball"]').html().split("<br>")[1].split(" ")[0];
                    ilosc_new = Number(ilosc_old)+Number(1);
                    html = $('form[action="dzicz.php?zlap"] button[data-original-title="Stunball"]').html();
                    $('form[action="dzicz.php?zlap"] button[data-original-title="Stunball"]').html(html.replace(ilosc_old, ilosc_new));
                } else {
                    html = '<button type="button" class="btn btn-default btn-akcja btn-pokeball " href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&amp;zlap_pokemona=stunballe" title="" data-toggle="tooltip" data-placement="top" data-original-title="Stunball" aria-describedby="tooltip822784"><img src="images/pokesklep/stunballe.jpg" alt="Stunball" width="93px"><br>1 sztuk</button>';
                    $('form[action="dzicz.php?zlap"] center').prepend(html);
                }
            }

            $(function() {
                $("#sidebar").load('inc/stan.php');
            });

            MAIN.html(MAIN_FORM);
            refreshShop();
        });
    });

    $(document).on("click", '#goFastShop', function () {
        refreshShop();
        if ($('#fastShop').css('display') == "none") {
            $('#fastShop').css('display', "block");
            $('#goFastShop').css('display', "none");
        } else {
            $('#fastShop').css('display', "none");
            $('#goFastShop').css('display', "block");
        }
    });

    function refreshShop(){
        $('#fastShop button.confirm').removeClass('confirm');
        $('#fastShop .greatball').attr("disabled", false);
        $('#fastShop .nightball').attr("disabled", false);
        $('#fastShop .nestball').attr("disabled", false);
        $('#fastShop .repel').attr("disabled", false);
        $('#fastShop .stunball').attr("disabled", false);
        $('#fastshop_niebieskie_jagody').html("");
        $('#fastshop_napoj_energetyczny').html("");
        $('#fastshop_stunballe_yeny').html("");

        var ilosc_yenow = Number($('a[href="http://pokelife.pl/pokedex/index.php?title=Pieniądze"]').parent().html().split("</a>")[1].split("<a")[0].replace(/\./g, ''));
        var ilosc_pz = Number($('a[href="http://pokelife.pl/pokedex/index.php?title=Punkty_Zasług"]').parent().html().split("</a>")[1].split("<a")[0].replace(/\./g, ''));

        $.ajax({
            type: 'POST',
            url: "gra/targ_prz.php?oferty_strona&&przedmiot=stunballe&zakladka=1&strona=1",
        }).done(function(response){
            var id = $($(response).find("form")[0]).find("input[name='id_oferty']").val();
            var max = 1;
            var price = Number($($(response).find("form span")[2]).html().split("&nbsp;")[0].replace(/\./g, '')) * max;
            var price_with_dot = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

            var html = '<input type="hidden" name="przedmiot" value="stunballe"><input type="hidden" name="id_oferty" value="'+id+'"><input type="hidden" name="ilosc_yeny" value="'+max+'"><input type="hidden" name="napewno"><input type="hidden" name="kup"><button class="stunballe_yeny btn btn-primary" style="width: 100%;" type="submit">Kup '+max+' stunballa <img src="https://t00.deviantart.net/JpLqXypqZZn45GZqRx_LRr_pxaU=/fit-in/500x250/filters:fixed_height(100,100):origin()/pre00/a325/th/pre/f/2014/317/c/e/net_ball_by_oykawoo-d86assn.png" style=" max-width: 23px; max-height: 23px; "><br>('+price_with_dot+' ￥) </button>';
            $("#fastshop_stunballe_yeny").append(html);

            if(ilosc_yenow < price){
                $('#fastShop .stunballe_yeny').attr("disabled", true);
            }
        });

        $.ajax({
            type: 'POST',
            url: "gra/targ_prz.php?oferty_strona&&przedmiot=niebieskie_jagody&strona=1",
        }).done(function(response){
            var id = $($(response).find("form")[0]).find("input[name='id_oferty']").val();
            var max = $($(response).find("form span")[1]).html();
            if(max>10){
                max = 10;
            }
            var price = Number($($(response).find("form span")[2]).html().split("&nbsp;")[0].replace(/\./g, '')) * max;
            var price_with_dot = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

            var html = '<input type="hidden" name="przedmiot" value="niebieskie_jagody"><input type="hidden" name="id_oferty" value="'+id+'"><input type="hidden" name="ilosc_yeny" value="'+max+'"><input type="hidden" name="napewno"><input type="hidden" name="kup"><button class="niebieskie_jagody btn btn-primary" style="width: 100%;" type="submit">Kup '+max+' niebieskich jagod <img src="https://raw.githubusercontent.com/krozum/pokelife/master/niebieskie_jagody.png" style=" max-width: 23px; max-height: 23px; "><br>('+price_with_dot+' ￥) </button>';
            $("#fastshop_niebieskie_jagody").append(html);

            if(ilosc_yenow < price){
                $('#fastShop .niebieskie_jagody').attr("disabled", true);
            }
        });

        $.ajax({
            type: 'POST',
            url: "gra/targ_prz.php?oferty_strona&&przedmiot=napoj_energetyczny&zakladka=3&strona=1",
        }).done(function(response){
            var id = $($(response).find("form")[0]).find("input[name='id_oferty']").val();
            var max = 1;
            var price = Number($($(response).find("form span")[2]).html().split("&nbsp;")[0].replace(/\./g, '')) * max;
            var price_with_dot = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

            var html = '<input type="hidden" name="przedmiot" value="napoj_energetyczny"><input type="hidden" name="id_oferty" value="'+id+'"><input type="hidden" name="ilosc_yeny" value="'+max+'"><input type="hidden" name="napewno"><input type="hidden" name="kup"><button class="napoj_energetyczny btn btn-primary" style="width: 100%;" type="submit">Kup '+max+' napoj energetyczny <img src="https://raw.githubusercontent.com/krozum/pokelife/master/napoj_energetyczny.png" style=" max-width: 23px; max-height: 23px; "><br>('+price_with_dot+' ￥) </button>';
            $("#fastshop_napoj_energetyczny").append(html);

            if(ilosc_yenow < price){
                $('#fastShop .napoj_energetyczny').attr("disabled", true);
            }
        });

        if(ilosc_yenow < 30000){
            $('#fastShop .greatball').attr("disabled", true);
        }
        if(ilosc_yenow < 37500){
            $('#fastShop .nightball').attr("disabled", true);
        }
        if(ilosc_yenow < 12000){
            $('#fastShop .nestball').attr("disabled", true);
        }
        if(ilosc_yenow < 75000){
            $('#fastShop .repel').attr("disabled", true);
        }
        if(ilosc_pz < 7){
            $('#fastShop .stunball').attr("disabled", true);
        }
    }

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
            $('#shinyBox').append('<div style="width: 290px;margin-bottom: 7px; margin-top: 7px;"><img style="width: 50px" src="http://poke-life.net/pokemony/srednie/s' + value['pokemon_id'] + '.png"><span style="margin-left: 5px">Spotkany o ' + value['creation_date'] + '</span></div>');
        });
    });
};

function loadLastActiveData() {
    updateActiveLog();

    var lastActiveAPI = "http://www.bra1ns.com/pokelife/get_last_active.php";
    $.getJSON(lastActiveAPI, {
        format: "json"
    }).done(function (data) {
        window.lastActiveData = data;
        $("#shout_list").find("span.fa").remove();
        $.each(window.lastActiveData, function (key, value) {
            var date1 = new Date(value.last_login_time);
            var date2 = new Date();
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffMinutes = Math.ceil(timeDiff / (1000 * 60));
            var opacity = 1/(diffMinutes/5);
            $('#shout_list .shout_post_name:contains("'+value.login+'"):not(:has("span"))').prepend('<span class="fa fa-circle fa-fw" style="color: #62d262;opacity: '+opacity+'"></span>');
        });
    });
};

function updateActiveLog() {
    var s = new Date();
    s.setMinutes(s.getMinutes()-1);
    if(window.lastActiveTime < s || window.lastActiveTime == undefined){
        window.lastActiveTime = new Date();
        setTimeout(function(){
            var insertLoginInfoURL = "http://www.bra1ns.com/pokelife/insert_user.php?bot_version=" + GM_info.script.version +"&login="+$('#wyloguj').parent().parent().html().split("<div")[0].trim();
            $.getJSON(insertLoginInfoURL, {
                format: "json"
            }).done(function (data) {
                loadLastActiveData();
            });
        }, 2000);
    }
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
    if (window.localStorage.skinStyle == undefined) {
        window.localStorage.skinStyle = 1;
    }
    if (window.localStorage.clickSpeed == undefined) {
        window.localStorage.clickSpeed = 200;
    }
    if (window.localStorage.care == undefined) {
        window.localStorage.care = false;
    }
};


function addNewElementsToWebsite() {

    $('body').append('<div id="setPok" style="position: fixed; cursor: pointer; top: 0; left: 10px; z-index: 9999"></div>');
    $('body').append('<div id="setBall" style="position: fixed; cursor: pointer; top: 0; left: 60px; z-index: 9999"></div>');

    $('body').append('<div id="goDzicz" style="position: fixed; cursor: pointer; top: 0; left: 117px; z-index: 9999"></div>');
    $('body').append('<div id="goButton" style="' + (window.localStorage.spaceGo ? (window.localStorage.spaceGo == "true" ? "opacity: 0.3;" : "opacity: 1;") : "opacity: 1;") + 'border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 10px; font-size: 36px; text-align: center; width: 100px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">GO</div>');
    $('body').append('<div id="goAutoButton" style="border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 122px; font-size: 36px; text-align: center; width: 140px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">AutoGO</div>');
    $('body').append('<div id="goBack" style="border-radius: 4px;position: fixed;cursor: pointer;top: 5px;right: 275px;font-size: 36px;text-align: center;width: 48px;height: 48px;line-height: 48px;background: rgb(125, 125, 125);z-index: 9999;">←</div>');

    $('body').append('<div id="newVersionInfo" style="border-radius: 4px; position: fixed; cursor: pointer; bottom: 10px; right: 60px; font-size: 19px; text-align: center; width: 250px; height: 30px; line-height: 35px; z-index: 9998; text-align: right;"><a style="color: yellow !important;text-decoration:none;" target="_blank" href="https://github.com/krozum/pokelife#user-content-changelog">' + (GM_info.script.version == window.localStorage.lastVersion ? "" : "New Version! ") + 'v' + GM_info.script.version + '</a></div>');
    $('body').append('<div id="goSettings" style="border-radius: 4px;position: fixed;cursor: pointer;bottom: 10px;right: 10px;font-size: 19px;text-align: center;width: 30px;height: 30px;line-height: 35px; z-index: 9999;"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span></div>');
    $('body').append('<div id="settings" style="box-shadow: -5px -5px 3px -3px rgba(0,0,0,0.53);display: none; width: 430px; height: auto; min-height: 200px; z-index: 9998; background: white; position: fixed; bottom: 0; right: 0; padding: 20px; ">' +
        '<div>Lecz gdy któryś pokemon ma mniej % życia niż: <input id="min-health" type="number" min="1" max="100" style="margin-left: 10px" value="' + (window.localStorage.minHealth ? window.localStorage.minHealth : "90") + '"></div>' +
        '<div style="margin-top: 5px;"><b>Włącz exp mode</b> <input type="checkbox" id="exp-mode" ' + (window.localStorage.expMode ? (window.localStorage.expMode == "true" ? "checked" : "") : "") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div>' +
        '<div class="exp-mode ' + (window.localStorage.expMode ? (window.localStorage.expMode == "true" ? "exp-mode-visible" : "") : "") + '"><div><b>EXP MODE:</b></div><div>Pokemon do 15 poziomu <input id="easy-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.easyLvl ? window.localStorage.easyLvl : "1") + '"></div>' +
        '<div>Pokemon od 16 do 30 poziomu: <input id="low-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.lowLvl ? window.localStorage.lowLvl : "1") + '"></div>' +
        '<div>Pokemon od 31 do 50 poziomu: <input id="mid-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.midLvl ? window.localStorage.midLvl : "1") + '"></div>' +
        '<div>Pokemon od 51 do 70 poziomu: <input id="hard-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.hardLvl ? window.localStorage.hardLvl : "1") + '"></div>' +
        '<div>Pokemon od 71 do 90 poziomu: <input id="power-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.powerLvl ? window.localStorage.powerLvl : "1") + '"></div>' +
        '<div>Pokemon od 91 do 100 poziomu: <input id="ultimate-lvl" type="number" min="1" max="6" style="margin-left: 10px" value="' + (window.localStorage.ultimateLvl ? window.localStorage.ultimateLvl : "1") + '"></div>' +
        '</div>' +
        '<div style="margin-top: 5px;"><b>Zatrzymuj gdy spotkasz niezłapanego</b> <input type="checkbox" id="catch-mode" ' + (window.localStorage.catchMode ? (window.localStorage.catchMode == "true" ? "checked" : "") : "") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div>' +
        '<div style="margin-top: 5px;"><b>Spacja uruchamia przycisk GO</b> <input type="checkbox" id="space-go" ' + (window.localStorage.spaceGo ? (window.localStorage.spaceGo == "true" ? "checked" : "") : "checked") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div>' +
        '<div style="margin-top: 5px;"><b>Sprawdzaj opieke</b> <input type="checkbox" id="care" ' + (window.localStorage.care ? (window.localStorage.care == "true" ? "checked" : "") : "checked") + ' style="margin-left: 10px; width: 20px; height: 20px; "></div>' +
        '<div style="margin-top: 5px;"><b>Szybkość klikania:</b><input type="range" min="130" max="1000" value="' + (window.localStorage.clickSpeed ? window.localStorage.clickSpeed : "200") + '" class="slider" id="clickSpeed" style="width: 100%;margin-top: 6px; margin-bottom: 6px;"></div>' +
        '<div id="shinyBox" style="margin-top: 5px;"><b>Ostatnio spotkane shiny:</b></div>' +
        '<br><br></div>');

    $('body').append('<div id="changeStyle" style="border-radius: 4px;position: fixed;cursor: pointer;bottom: 10px;left: 10px;font-size: 19px;text-align: center;width: 30px;height: 30px;line-height: 35px;background: ' + (window.localStorage.skinStyle == 2 ? '#f2cfc9' : "#d85046") + ';z-index: 9999;"></div>');
    $('body').append('<div id="goFastShop" style="border-radius: 4px; position: fixed; cursor: pointer; bottom: 10px; left: 60px; font-size: 19px; text-align: center; width: 150px; height: 30px; line-height: 35px; z-index: 9998; text-align: left;"><a style="color: inherit !important;text-decoration:none;">Szybki sklep</a></div>');
    $('body').append('<div id="fastShop" style="box-shadow: 5px -5px 3px -3px rgba(0,0,0,0.53);display: none; width: 270px; height: auto; min-height: 470px; z-index: 10001; background: white; position: fixed; bottom: 0; left: 0; padding: 20px; ">'+
                     '<form style="position: relative;margin-top: 5px;height: 35px;" action="pokesklep.php?zakupy&amp;z=1" class="form-inline"><button class="greatball btn btn-primary" style="width: 100%;" type="submit">Kup 30 greatballi (30.000 ￥) <img src="https://t00.deviantart.net/6LNr4Rou-uIXTDQBWysCj_95eic=/fit-in/500x250/filters:fixed_height(100,100):origin()/pre00/8b61/th/pre/f/2014/317/3/6/great_ball_by_oykawoo-d86ar2c.png" style=" max-width: 23px; max-height: 23px; "></button><input style="display: none" id="target3" value="30" name="kup_greatballe"></form>'+
                     '<form style="position: relative;margin-top: 5px;height: 35px;" action="pokesklep.php?zakupy&amp;z=1" class="form-inline"><button class="nestball btn btn-primary" style="width: 100%;" type="submit">Kup 30 nestballi (12.000 ￥) <img src="https://t00.deviantart.net/Arzhe_RxjSxt05wBb_XTD-Uwqq8=/fit-in/500x250/filters:fixed_height(100,100):origin()/pre00/ba83/th/pre/f/2014/317/5/c/nest_ball_by_oykawoo-d86asrz.png" style=" max-width: 23px; max-height: 23px; "></button><input style="display: none" id="target3" value="30" name="kup_nestballe"></form>'+
                     '<form style="position: relative;margin-top: 5px;height: 35px;" action="pokesklep.php?zakupy&amp;z=1" class="form-inline"><button class="nightball btn btn-primary" style="width: 100%;" type="submit">Kup 30 nightballi (37.500 ￥) <img src="https://t00.deviantart.net/K_wGrnuA8GwopJ6ShWtN5gFgU7A=/fit-in/500x250/filters:fixed_height(100,100):origin()/pre00/8bd1/th/pre/f/2014/317/b/e/moon_ball_by_oykawoo-d86asqk.png" style=" max-width: 23px; max-height: 23px; "></button><input style="display: none" id="target3" value="30" name="kup_nightballe"></form>'+
                     '<form style="position: relative;margin-top: 5px;height: 35px;" action="pokesklep.php?zakupy&amp;z=2" class="form-inline"><button class="repel btn btn-primary" style="width: 100%;" type="submit">Kup repel (75.000 ￥) <img src="https://raw.githubusercontent.com/krozum/pokelife/master/repel.png"  style=" max-width: 23px; max-height: 23px; "></button><input style="display: none" id="target3" value="1" name="kup_repel1"></form>'+
                     '</div>');

    $('#fastShop').append('<form style="position: relative;margin-top: 5px;min-height: 57px;" method="POST" id="fastshop_napoj_energetyczny" action="targ_prz.php?szukaj&amp;przedmiot=napoj_energetyczny" class="form-inline"></form>');
    $('#fastShop').append('<form style="position: relative;margin-top: 5px;min-height: 57px;" method="POST" id="fastshop_niebieskie_jagody" action="targ_prz.php?szukaj&amp;przedmiot=niebieskie_jagody" class="form-inline"></form>');
    $('#fastShop').append('<form style="position: relative;margin-top: 5px;min-height: 57px;" method="POST" id="fastshop_stunballe_yeny" action="targ_prz.php?szukaj&amp;przedmiot=stunballe" class="form-inline"></form>');


    $.ajax({
        type: 'POST',
        url: "gra/zaslugi_wydaj.php"
    }).done(function(response){
        var hash = response.split("input type='hidden' name='s' value='")[1].split("'/>")[0];
        window.localStorage.s = hash;
        var html = '<form id="fastshop_stunballe_pz" style="position: relative;margin-top: 5px;height: 35px;" action="zaslugi_wydaj.php?wymien" class="form-inline"><button class="stunball btn btn-primary" style="width: 100%;" type="submit">Kup 1 stunballa (7 PZ) <img src="https://t00.deviantart.net/JpLqXypqZZn45GZqRx_LRr_pxaU=/fit-in/500x250/filters:fixed_height(100,100):origin()/pre00/a325/th/pre/f/2014/317/c/e/net_ball_by_oykawoo-d86assn.png"  style=" width: 23px; height: 23px; "></button><input style="display: none" type="text" class="form-control" name="zamien_ile" value="1" placeholder="Ilość"><input type="hidden" name="zamien" value="stunball"><input type="hidden" name="s" value="'+hash+'"></form>';
        $("#fastShop").append(html);
    });

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
        { 'iconFilePath': "http://oi66.tinypic.com/2hro8zo.jpg", 'iconValue': 'mixed' },
        { 'iconFilePath': "http://oi63.tinypic.com/fm2juu.jpg", 'iconValue': 'mixed2' }

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
