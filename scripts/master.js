$(document).ready(function() {
    $.popupDismissEverywhere();
    $("#footerLanguage .item").click(function() {
        $(this).addClass("selected");
        var itemText = $(this).find(".text").text();
        $("#footerLanguage .current .text").text(itemText);
    })
});