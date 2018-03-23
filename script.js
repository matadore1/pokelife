$(document).ready(function() {
    $.wait = function(ms) {
        var defer = $.Deferred();
        setTimeout(function() { defer.resolve(); }, ms);
        return defer;
    };

    $('body').append('<div id="goDzicz" style="position: fixed; cursor: pointer; top: 0; right: 328px; z-index: 9999"></div>');
    $('body').append('<div id="goButton" style="border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 10px; font-size: 36px; text-align: center; width: 100px; height: 48px; line-height: 48px; background: '+$('.panel-heading').css('background-color')+'; z-index: 9999">GO</div>');
    $('body').append('<div id="goAutoButton" style="border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 122px; font-size: 36px; text-align: center; width: 140px; height: 48px; line-height: 48px; background: '+$('.panel-heading').css('background-color')+'; z-index: 9999">AutoGO</div>');

$('body').append('<div id="goSettings" style="border-radius: 4px;position: fixed;cursor: pointer;bottom: 10px;right: 10px;font-size: 19px;text-align: center;width: 30px;height: 30px;line-height: 35px;background: rgb(21, 149, 137);z-index: 9999;"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span></div>');

$('body').append('<div id="settings" style="display: none; width: 600px; height: auto; min-height: 200px; z-index: 9998; background: white; position: fixed; bottom: 0; right: 0; border: 3px solid #159589; padding: 10px; ">Uzywaj nightballi w nocy <input type="checkbox" id="use-nightball"><br> Lecz gdy pierwszy pokemon ma mniej zycia niz <input id="min-health" type="number" value="500"> </div>');


    var iconSelect;

    iconSelect = new IconSelect("goDzicz",
                {'selectedIconWidth':48,
                'selectedIconHeight':48,
                'selectedBoxPadding':1,
                'iconsWidth':48,
                'iconsHeight':48,
                'boxIconSpace':1,
                'vectoralIconNumber':1,
                'horizontalIconNumber':6
                });
    var icons = [];

    $.each($('#pasek_skrotow li'), function(index, item) {
        if($(item).find('a').attr('href').substring(0,9) == "gra/dzicz"){
            icons.push({'iconFilePath':$(item).find('img').attr('src'), 'iconValue':$(item).find('a').attr('href').substring(28)});
        }
    });
    iconSelect.refresh(icons);
    iconSelect.setSelectedIndex(1);

    function click(){
if(Number($('#sidebar .stan-pokemon:nth-child(2)').find('.progress-bar').attr('aria-valuenow')) < Number($('#min-health').val())){
                    console.log('lecze sie');
                    $('#skrot_leczenie').trigger('click');
setTimeout(function(){click();}, 100);
                } else {

            if($('.dzikipokemon-background-shiny').length == 1){
                console.log('spotkalem shiny');
                $('#goButton').css('background', 'green');
                window.auto = false;
                $('#goAutoButton').html('AutoGO');
            } else if($('.dzikipokemon-background-normalny').length == 1){
                console.log('wybieram pokemona 1');
		$('button[href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&wybierz_pokemona=0"]').trigger('click');
            } else if ($('button[href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&zlap_pokemona=greatballe"]').length == 1){
                
		if($('#use-nightball').val()){
		  var d = new Date();
    var h = d.getHours();
if(h > 22 || h < 6){
		$('button[href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&zlap_pokemona=nightballe"]').trigger('click');
console.log('rzucam nightballa');
} else {
$('button[href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&zlap_pokemona=greatballe"]').trigger('click');
console.log('rzucam greatballa');
}
} else {
                $('button[href="dzicz.php?miejsce='+iconSelect.getSelectedValue()+'&zlap_pokemona=greatballe"]').trigger('click');
console.log('rzucam greatballa');
}
            } else {
                if($('.progress-stan2 div').attr('aria-valuenow') < 5){
                    console.log('przerywam autoGo');
                    window.auto = false;
                    $('#goAutoButton').html('AutoGO');
                } else {
                    console.log('ide do dziczy '+iconSelect.getSelectedValue());
                    $('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce='+iconSelect.getSelectedValue()+'"] img').trigger('click');
                }
            }
}
    }

    $(document).off("click", "nav a");
    $(document).on("click", "nav a", function(event) {
        if($(this).attr('href').charAt(0)!='#' && !$(this).hasClass( "link" )) {
            event.preventDefault();

            //back_button
            //Ucinanie " gra/ "
            var new_buffer = $(this).attr('href');
            new_buffer = new_buffer.substr(4);
            remember_back(new_buffer);

            $("html, body").animate({ scrollTop: 0 }, "fast");

            //$("#glowne_okno").html(loadingbar);
            $("#glowne_okno").load($(this).attr('href'), function(){
               if(window.auto){
                   setTimeout(function(){click();}, 150);
               }
            });

            /* zamyka menu */
            $('.collapse-hidefix').collapse('hide');

            /* wyłącza aktywne menu */
            //$('.nav li').removeClass('active');
        }
    });

    $(document).off( "click", ".btn-akcja");
    $(document).on( "click", ".btn-akcja", function(event) {
        event.preventDefault();


        if(this.id != 'back_button') {

        } else {
            if($(this).prop('prev1') != '') {
                $('#back_button').attr('href', $('#back_button').attr('prev1') );
                $('#back_button').attr('prev1', $('#back_button').attr('prev2') );
                $('#back_button').attr('prev2', $('#back_button').attr('prev3') );
                $('#back_button').attr('prev3', $('#back_button').attr('prev4') );
                $('#back_button').attr('prev4', $('#back_button').attr('prev5') );
                $('#back_button').attr('prev5', '' );
            } else {
                $(this).prop('disabled',true);
            }
        }

        //Obejście modali
        if($('body').hasClass('modal-open')) {
            $('body').removeClass('modal-open');
            $('body').css({"padding-right":"0px"});
            $('.modal-backdrop').remove();
        }

        $("html, body").animate({ scrollTop: 0 }, "fast");

        //$("#glowne_okno").html(loadingbar);
        $("#glowne_okno").load('gra/'+$(this).attr('href'), {limit: 20},
        function (responseText, textStatus, req) {
            if(window.auto){
                setTimeout(function(){click();}, 150);
            }
            if (textStatus == "error") {
                $("#glowne_okno").html(responseText);
            }
        });
        //$("#glowne_okno").load($(this).attr('href'),{});
    });

    $(document).on("click", '#goButton', function(){
        click();
    });

    $(document).on("click", '#goSettings', function(){
        if($('#settings').css('display') == "none"){
	$('#settings').css('display', "block");
} else {
	$('#settings').css('display', "none");
}
    });

    window.auto = false;
    $(document).on("click", '#goAutoButton', function(){
        if(window.auto){
            window.auto = false;
            $('#goAutoButton').html('AutoGO');
        } else {
            window.auto = true;
            $('#goAutoButton').html('STOP');
            click();
        }
    });

});
