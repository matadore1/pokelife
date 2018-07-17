function initCareService(){
    var html = '<div id="careInformation" style="position:fixed;bottom:60px;left:45%;z-index:1100"><button id="goToCare" style="color:#333; background-color: #e9635f; border: 1px solid #e9635f; border-radius: 4px; padding: 5px 25px; text-transform: uppercase; line-height: 20px; height: 40px; "><b>Dziś nie opiekowałeś się</b></button></div>';

    if($('b:contains("Opiekowałeś się pokemonami dzisiaj:")').parent().parent().find("td:nth-child(2)").html() == "nie" && $('#sidebar .alert-info:contains("Jesteś w trakcie Opieki")').length == 0){
        if(window.localStorage.care == "true"){
            $('body').append(html);
        }
        window.localStorage.caredToday = "false";
    } else {
        window.localStorage.caredToday = "true";
    }

    $(document).on("click", 'button[href="aktywnosc.php?p=opieka&rozpocznij_opieke"]', function(){
        $('#careInformation').remove();
    });

    $(document).on("click", 'button[href="aktywnosc.php?p=opieka&przerwij=1"]', function(){
        if(window.localStorage.care == "true"){
            $('body').append(html);
        }
    });

    $(document).on("click", '#goToCare', function(){
         $("#glowne_okno").load('gra/aktywnosc.php', { limit: 20 }, function (responseText, textStatus, req) {
             $('a[href="#aktywnosc-opieka"]').trigger('click');
         });
    });

    $(document).on("change", '#care', function () {
        if ($('#care').is(":checked")) {
            window.localStorage.care = "true";
            if(window.localStorage.caredToday == "false"){
                $('body').append(html);
            }
        } else {
            window.localStorage.care = "false";
            $('#careInformation').remove();
        }
    });
};
