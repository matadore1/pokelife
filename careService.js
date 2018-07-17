function initCareService(){
    console.log("dziala");
    initCareVeriable();
    initCare();

    $(document).on("change", '#care', function () {
        if ($('#care').is(":checked")) {
            window.localStorage.care = true;
            if (careIsNotDo())
                addCareInformationToHtml()
        } else {
            window.localStorage.care = false;
            disableCare();
        }
    });

    $(document).off("click", "#goToCare");
    $(document).on("click", "#goToCare", function (event) {
        $('a[href="gra/aktywnosc.php"]').trigger('click');
        setTimeout(function () {
            $('a[href="#aktywnosc-opieka"]').trigger('click');
            setTimeout(function () {
                if ($('button[href="aktywnosc.php?p=opieka&przerwij=1"]').length == 1 && careIsNotDo()) {
                    setCare();
                }
                $('button[href="aktywnosc.php?p=opieka&rozpocznij_opieke"]').trigger('click');
            }, 600);
        }, 600);
    });
};

function initCareVeriable(){
    if (window.localStorage.care == undefined) {
        window.localStorage.care = false;
    }
}

function initCare() {
    if ($('#care').is(":checked")) {

        $(document).on("click", 'button[href="aktywnosc.php?p=opieka&rozpocznij_opieke"]', function () {
            if (careIsNotDo())
                setCare();
        });
        $(document).on("click", 'button[href="aktywnosc.php?p=opieka&przerwij=1"]', function () {
            resetCare();
            addCareInformationToHtml()
        });
        if (careIsNotDo())
            addCareInformationToHtml()
    }
};

function careIsNotDo() {
    var lastCareDate;
    if (window.localStorage.lastCareDate == undefined) {
        lastCareDate = new Date();
        lastCareDate.setFullYear(2010)
    }
    else
        lastCareDate = new Date(window.localStorage.lastCareDate);

    var now = new Date();
    var resetStatDate = new Date();
    resetStatDate.setHours(3);
    resetStatDate.setMinutes(30);

    if (now > resetStatDate && resetStatDate > lastCareDate) {
        return true;
    }
    else return false;
}

function disableCare() {
    $("button[href='aktywnosc.php?p=opieka&rozpocznij_opieke']").off();
    $("button[href='aktywnosc.php?p=opieka&przerwij=1']").off();
    removeCareInformationFromHtml();
    resetCare();
}

function addCareInformationToHtml() {
    var html = '<div id="careInformation" style="position:fixed;bottom:50px;left:45%;z-index:1100"><button id="goToCare" style="color:white; background-color: #ed663f; border: 1px solid #ce9532; border-radius: 5px; padding: 5px 25px; text-transform: uppercase; line-height: 20px; height: 40px; ">Dziś nie opiekowałeś się</button></div>';
    $('body').append(html);
}

function removeCareInformationFromHtml() {
    $("#careInformation").remove();
}

function resetCare() {
    window.localStorage.removeItem("lastCareDate");
}

function setCare() {
    window.localStorage.lastCareDate = new Date();
    removeCareInformationFromHtml();
}