$(document).ready(function() {
    $("#hamburger").click(function() {
        $('header .dropdown-btn').hasClass('up') && $('header .dropdown-btn').click();
        $(this).toggleClass("open");
        $("#headerMenus").toggleClass("open");
        $("#overlay").toggleClass("menuOverlay");
    })
    $("#featuresLink, #devicesLink").click(function(event) {
        event.stopPropagation();
        if ($("#hamburger").hasClass("open")) {
            $("#hamburger").removeClass("open");
            $("#headerMenus").removeClass("open");
            $("#overlay").removeClass("menuOverlay");
        }
    })
    $('header .dropdown-btn').click(function() {
        var hasUp = $(this).hasClass('up'),
            $container = $('header .dropdown-container'),
            $item = $('header .dropdown-container .item'),
            $shadow = $('header .drop-shadow');

        $(this).toggleClass('up', !hasUp);
        if (!hasUp) {
            $shadow.css({
                top: $('#headerMenus').height(),
            }).addClass('open');
            $container.show();
            $container.animate({
                height: '100%',
                top: $('#headerMenus').height(),
            }, 200, function() {
                $item.animate({
                    opacity: 1,
                }, 200)
            })

            $(window).on('resize.header', function() {
                if (parseInt($('#headerMenus').css('left')) < 0) {
                    $shadow.removeClass('open');
                    $container.hide();
                } else {
                    $shadow.css({
                        top: $('#headerMenus').height(),
                    });
                    $container.css({
                        top: $('#headerMenus').height()
                    })
                }

            })
        } else {
            $item.animate({
                opacity: 0,
            }, 200, function() {
                $container.animate({
                    height: 0,
                }, 200, function() {
                    $shadow.removeClass('open');
                    $container.hide();
                })
            })

            $(window).off('resize.header');
        }
    })
    initScores();
});

function initScores() {
    var score = $.cookie("score");
    if (score == undefined) {
        $.cookie("score", "false", {
            path: "/",
            expires: 1000
        });
    } else if (score == "true") {
        $("body").addClass("score-on");
    }
    $("header .scores, .game-score-info a").click(function() {
        if (score == "true") {
            score = "false";
            $(document).trigger('setPlayerScore', false);
            $("body").removeClass("score-on").trigger("scoreOff");
        } else if (score == "false" || score == undefined) {
            score = "true";
            $(document).trigger('setPlayerScore', true);
            $("body").addClass("score-on").trigger("scoreOn");
        }

        $.cookie("score", score, {
            path: "/",
            expires: 1000
        });
    });

}

function closeSignin() {
    if ($("#overlaySignIn").hasClass("visible")) {
        $("#overlaySignIn").removeClass("visible");
    }
    if ($("#overlayWrap").hasClass("visible")) {
        $("#overlayWrap").removeClass("visible");
    }
    if ($("#overlay").hasClass("visible")) {
        $("#overlay").removeClass("visible");
    }
}

function removeClose() {
    if ($("#overlaySignIn").hasClass("close")) {
        $("#overlaySignIn").removeClass("close");
    }
    setTimeout("closeSignin()", 100);
}

function showSignIn() {
    var url = location.href;
    if (url.indexOf("?") != -1)
        url = url.substr(0, url.indexOf("?"));
    url = LOC_SERVER + "secure/signin?parent=" + encodeURIComponent(url);
    document.getElementById("signInFrame").src = url;
    $("#overlay").addClass("visible").addClass("animation");
    $("#overlayWrap").addClass("visible").addClass("animation");
    $("#overlaySignIn").addClass("visible").addClass("animation");
}

function hideSignIn() {
    $("#overlaySignIn").removeClass("animation").addClass("close");
    $("#overlayWrap").removeClass("animation");
    $("#overlay").removeClass("animation");
    setTimeout("removeClose()", 300);
}

function showSubnav() {
    $("#subNavs").toggleClass("open");
    $("#subNav").toggleClass("open");
    $("#shadow").toggleClass("open");
}