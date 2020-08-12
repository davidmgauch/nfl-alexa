var eventType = {
    playlistAdded: 'playlistAdded',
    playlistRemoved: 'playlistRemoved'
};

function showPromptMessage(msgId, msg) {
    $("#overlay").addClass("promptOverlayVisible");
    var containerId;
    if (msgId) {
        containerId = "#overlay" + msgId;
    } else {
        containerId = "#overlayPrompt";
        $("#overlayPromptDesc").html(msg);
    }
    var windowHeight = $(window).height();
    var containerHeight = $(containerId).outerHeight();
    var top = windowHeight - containerHeight > 0 ? (windowHeight - containerHeight) * 0.45 : 0;
    top += $(window).scrollTop();
    // TODO: handle bottom edge
    $(containerId).css("top", top + "px");
    $(containerId).addClass("promptVisible");
}

function cancelPrompt(msgId) {
    $("#overlay").removeClass("promptOverlayVisible");
    if (msgId) {
        $("#overlay" + msgId).removeClass("promptVisible");
    } else {
        $("#overlayPrompt").removeClass("promptVisible");
    }
}

function videoSessionTimeout() {
    showPromptMessage("PCM");
}

function PCMConfirm() {
    // FIXME try to continue play video without reload page
    location.href = location.href;
}

function showUpSellMessage() {
    showPromptMessage("UpSell");
}

function upSellConfirm() {
    goToUpSell();
}

function goToUpSell() {
    location.href = "/account/profile#subscriptions";
}

function listenUnsupported() {
    // NFL use H5 Only player, no Flash fallback.
    var message = checkH5PlayerCompatibility(navigator.userAgent, true)[1];
    message += '<div class="app-links">';
    if (!isIOS && !isAndroid) {
        message += '<a href="http://nfl.com/m/gp?icampaign=gamepass-free-mobileweb-confirm-appstorebutton" target="_blank"><img src="' + LOC_RESOURCE + SITE_ID + '/site_4/images/packages/appstorews.png" border="0" /></a>';
    }
    if (isIOS || !isAndroid) {
        message += '<a href="http://nfl.com/m/gp?icampaign=gamepass-free-mobileweb-confirm-appstorebutton" target="_blank"><img src="' + LOC_RESOURCE + SITE_ID + '/site_4/images/packages/appstoreios.png" border="0" /></a>';
    }
    if (isAndroid || !isIOS) {
        message += '<a href="http://nfl.com/m/gp?icampaign=gamepass-free-mobileweb-confirm-appstorebutton" target="_blank"><img src="' + LOC_RESOURCE + SITE_ID + '/site_4/images/packages/appstoregp.png" border="0" /></a>';
    }
    message += '</div>';
    showPromptMessage(null, message);
}

// Personalization
function getPersonalData(ids, type, callback) {
    var timeout = 3000,
        failed = false;
    var iid = window.setTimeout(timeoutHandler, timeout);
    ps.personalContent.list(null, type, ids, successCallback);

    function successCallback(data) {
        if (!failed) {
            window.clearTimeout(iid);
            if ($.isFunction(callback)) {
                // If no match result, server will return empty array.
                callback(data.contents);
            }
        }
    }

    function timeoutHandler() {
        failed = true;
        callback([]);
    }
}

function getGameViewProgress(game, position) {
    var percent = 0;
    if (game.endDateTimeGMT != null) {
        var duration = (new Date(game.endDateTimeGMT + 'Z') - new Date(game.dateTimeGMT + "Z")) / 1000;
        percent = position / duration;
    }
    return Math.min(Math.round(parseInt(percent * 100, 10)) / 100, 1);
}

function _getRecentViewedPrograms() {
    var _viewHistoryCallbacks = [];
    var _viewHistoryParams = [];
    var _isViewHistoryRequesting = false;
    var _viewHistoryItems = null;
    var _viewHistoryPaging = null;
    return function(callback, viewHistoryCallback, viewHistoryParam) {
        if (!_viewHistoryItems && !_isViewHistoryRequesting) {
            _isViewHistoryRequesting = true;
            if (viewHistoryCallback) {
                _viewHistoryCallbacks.push(viewHistoryCallback);
                _viewHistoryParams.push(viewHistoryParam);
            }
            ps.viewHistory.list(null, {
                type: "program",
                ps: 10000,
                pn: 1
            }, function(data) {
                _viewHistoryItems = data.contents;
                _viewHistoryPaging = data.paging;
                if (_viewHistoryItems.length > 0) {
                    getViewHistoryProgramsDetail();
                } else {
                    callback && callback([]);
                }
                _isViewHistoryRequesting = false;
                _viewHistoryCallbacks.forEach(function(callbackItem, index) {
                    callbackItem(_viewHistoryItems, _viewHistoryParams[index]);
                });
                _viewHistoryCallbacks = [];
                _viewHistoryParams = [];
            });
        } else if (_isViewHistoryRequesting) {
            if (viewHistoryCallback) {
                _viewHistoryCallbacks.push(viewHistoryCallback);
                _viewHistoryParams.push(viewHistoryParam);
            }
        } else {
            viewHistoryCallback && viewHistoryCallback(_viewHistoryItems, viewHistoryParam);
        }

        function getViewHistoryProgramsDetail() {
            var programsServer = "/service/programs?ids={ids}&format=json";
            var ids = [];
            for (var i = 0; i < _viewHistoryItems.length; i++) {
                ids[ids.length] = _viewHistoryItems[i].id;
            }
            var q = ids.join(",");
            $.get(programsServer.replace("{ids}", q), callbackViewHistoryProgramsDetail);
        }

        function callbackViewHistoryProgramsDetail(data) {
            var programs = data.programs;
            var viewHistoryPrograms = [];
            for (var i = 0; i < _viewHistoryItems.length; i++) {
                for (var j = 0; j < programs.length; j++) {
                    if (programs[j].id == _viewHistoryItems[i].id) {
                        programs[j].position = _viewHistoryItems[i].position;
                        programs[j].completed = _viewHistoryItems[i].completed;
                        var progress = 0;
                        var duration = getProgramDuration(programs[j].runtime);
                        if (programs[j].position > 0 && duration > 0) {
                            progress = Math.min(Math.round(parseInt(programs[j].position / duration * 100, 10)) / 100, 1);
                        }
                        programs[j].progress = progress;
                        viewHistoryPrograms[viewHistoryPrograms.length] = programs[j];
                        break;
                    }
                }
            }
            if ($.isFunction(callback)) {
                callback(viewHistoryPrograms, _viewHistoryPaging);
            }
        }
    };
}
window.getRecentViewedPrograms = _getRecentViewedPrograms();

function getFavoriteTeams(callback) {
    ps.favorite.list(null, {
        type: "team"
    }, function(data) {
        if ($.isFunction(callback)) {
            callback(data);
        }
    });
}

function getTeamName(code) {
    return teams[code].name;
}

function getTeamColor(code) {
    return teams[code].color;
}

// Utils
/**
 * Convert App Server runtime string to seconds value
 * Possible format: "34:58", "86",
 * @param runtime string
 */
function getProgramDuration(runtime) {
    var dur = 0;
    if (runtime.indexOf(":") > -1) {
        dur = parseInt(runtime.split(":")[0], 10) * 60 + parseInt(runtime.split(":")[1], 10);
    } else {
        dur = parseInt(runtime * 60, 10);
    }
    return dur;
}

function getTime() {
    var d = new Date();
    d.setMilliseconds(0);
    if (d.getSeconds() < 30) d.setSeconds(0);
    else d.setSeconds(30);
    return d.getTime().toString();
}

function addTimestamp(url, round) {
    return url + (url.indexOf('?') > -1 ? '&' : '?') + 't=' + parseInt(new Date().getTime() / (round ? round * 1000 : 1));
}
/**
 *
 * @param dateStr  standard date string from app server: yyyy-MM-dd'T'HH:mm:ss.000, for example: 2016-03-05T09:15:31.000
 * @param pattern  for example: EEEE, MMM d, yyyy h:mm a z
 * @returns string  for example: Saturday, Mar 5, 2016 9:15 AM ET
 */
function formatDate(dateStr, pattern) {
    var regex = /M{1,4}|y{4}|([smhHd])\1?|E{3,4}|[az]|"[^"]*"|'[^']*'/g;
    var date = new Date();
    date.setFullYear(parseInt(dateStr.substring(0, 4), 10), parseInt(dateStr.substring(5, 7), 10) - 1, parseInt(dateStr.substring(8, 10), 10));
    date.setHours(parseInt(dateStr.substring(11, 13), 10), parseInt(dateStr.substring(14, 16), 10), parseInt(dateStr.substring(17, 19), 10));
    var month = date.getMonth();
    var day = date.getDate();
    var year = date.getFullYear();
    var dayInWeek = date.getDay();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var flags = {
        "s": second,
        "ss": second < 10 ? "0" + second : second,
        "m": minute,
        "mm": minute < 10 ? "0" + minute : minute,
        "h": hour % 12 || 12,
        "hh": ((hour % 12 || 12) + '').length > 1 ? (hour % 12 || 12) : '0' + (hour % 12 || 12),
        "H": hour,
        "HH": hour < 10 ? "0" + hour : hour,
        "d": day,
        "dd": (day < 10 ? "0" + day : day),
        "M": (month + 1),
        "MM": (month + 1 + '').length > 1 ? (month + 1) : '0' + (month + 1),
        "MMM": getLocalizedString("month_abbr").split(",")[month],
        "MMMM": getLocalizedString("month_abbr_full").split(",")[month],
        "yyyy": year + "",
        "EEE": getLocalizedString("day_abbr").split(",")[dayInWeek],
        "EEEE": getLocalizedString("day").split(",")[dayInWeek],
        "a": hour < 12 ? getLocalizedString("am") : getLocalizedString("pm"),
        "z": getLocalizedString("timezone")
    };
    return pattern.replace(regex, function($0) {
        return $0 in flags ? flags[$0] : $0;
    });
}

function getLocalizedString(key) {
    var obj = document.getElementById("msg_" + key);
    if (obj != null)
        return obj.innerHTML.replace(/\\n/g, "\n");
    alert("Error - Localization key '" + key + "' not found.");
}
/**
 * convert "2012-02-04T11:42:33.718" to Date obj
 */
function formatTimeToDate(str) {
    var d = str.split("T")[0].split("-");
    var t = str.split("T")[1].split(".")[0].split(":");
    var month = d[1] / 1 - 1;
    return new Date(d[0], month, d[2], t[0], t[1], t[2]);
}

function getTimeAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? getLocalizedString("pm") : getLocalizedString("am");
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm + ' ' + getLocalizedString("timezone");
}

function getScript(url, callback, requireCache, cacheRound) {
    if (!$.isFunction(callback)) {
        requireCache = callback;
        cacheRound = requireCache;
    }
    requireCache = !!requireCache;
    if (requireCache && cacheRound > 0) {
        url = url + (url.indexOf('?') > -1 ? '&' : '?') + 't=' + parseInt(new Date().getTime() / (cacheRound * 1000));
    }
    $.ajax({
        url: url,
        dataType: "script",
        cache: requireCache,
        success: callback
    });
}

function nlXMLToJson(xml) {
    return $.xml2json(xml);
}
/**
 * return {[supported, message]}
 * @param userAgent
 * @param drm enable DRM or not
 */
function checkH5PlayerCompatibility(userAgent, drm) {
    /**
     * 1) Windows 7, all IE doesn't support (Windows NT == 6.1 and isIE())
     * 2) lower than Windows 7 (Windows XP), all browser doesn't support (Windows NT < 6.1)
     * 3) Mac Safari. if not supported, prompt a message
     * 4) Mac Firefox (not sure why it has been disabled in SkyBoxOffice)
     * 5) iOS 9+. disabled if drm=true
     * 6) android 4.4+. disabled in Firefox if drm=true
     */
    var ua = userAgent.toLowerCase();
    var isWindows = userAgent.match(/Windows NT/) != null;
    var isMac = userAgent.indexOf("Macintosh") != -1;
    var winVersion = null;
    if (isWindows && userAgent.match(/Windows NT (\d+[\.]{0,1}\d+)/)[1].length == 2) {
        winVersion = userAgent.match(/Windows NT (\d+[\.]{0,1}\d+)/)[1] / 1;
    }
    var isIE = "ActiveXObject" in window;
    var isEdge = userAgent.indexOf("Edge") != -1;
    var isSafari = !isEdge && userAgent.indexOf("Safari") != -1;
    var isFirefox = userAgent.indexOf("Firefox") != -1;
    var isAndroid = ua.indexOf("android") != -1;
    var isIOS = ua.indexOf("iphone") != -1 || ua.indexOf("ipad") != -1;
    var supported = true;
    var message = getLocalizedString("unsupported");
    if (isWindows && winVersion == 6.1 && isIE) {
        supported = false;
        message = getLocalizedString("unsupported"); //video_unsupported_windows7
    } else if (isWindows && winVersion < 6.1) {
        supported = false;
        message = getLocalizedString("unsupported"); //video_unsupported_windows
    } else if (isMac && isSafari) {
        message = getLocalizedString("video_unsupported_safari");
    } else if (isIOS && drm || isAndroid && drm && isFirefox) {
        supported = false;
    } else if (isMac && isFirefox) {
        message = getLocalizedString("unsupported"); //video_unsupported_mac_firefox
    }
    return [supported, message];
}
/**
 *
 * @param success: true (for success), false (for fail)
 * @param tipInfo: object, example: {title: 'success', link: {address: 'www.xxxx.com/pagename', name: 'pagename'}}
 * @param $relatedItem: target element jquery object which trigger tip
 * @param callback: function to be called after showTip completed, same params with showTip without 'callback' param
 *
 */
function showTip(success, tipInfo, $relatedItem, callback) {
    var tipId = 'tipId',
        $tip = $('#' + tipId);
    if ($tip.length == 0) {
        $('body').append('<div id="' + tipId + '" class="tip-container">');
        $tip = $('#' + tipId);
    } else {
        $tip.finish().fadeOut(0);
    }
    tipInfo = $.extend({
        title: '',
        link: {
            address: '',
            name: ''
        }
    }, tipInfo);
    var iconName = success ? 'icon_success' : 'icon_fail',
        tipHTMLContent =
        '<div class="center-container">' +
        '<div class="center-wrapper left-icon">' +
        '<img class="tip-checked" src="../nflgp/site_4/images/' + iconName + '.svg">' +
        '</div>' +
        '<div class="center-wrapper">' +
        '<span class="tip-title">' + tipInfo.title + '</span>' +
        '</div>' +
        '<div class="center-wrapper right-link">' +
        '<a class="tip-link" href="' + tipInfo.link.address + '">' + tipInfo.link.name + '</a>' +
        '</div>' +
        '</div>' +
        '</div>';
    $tip.html(tipHTMLContent).fadeIn(500).delay(1000).fadeOut(500);

    callback && callback(success, tipInfo, $relatedItem);
}

// Common for channel, category, video pages
function _initPagePlayListItems() {
    var playListData = undefined;
    var callbacks = [];
    var handleAllCallbacks = function() {
        callbacks.forEach(function(callbackItem) {
            callbackItem && callbackItem(playListData.contents);
        });
        callbacks.length = 0;

        getPlayListCallback(playListData);
    };

    return function(playlistCallback) {
        if (playListData) {
            handleAllCallbacks();
        } else {
            playlistCallback && callbacks.push(playlistCallback);
            if (playListData !== null) {
                playListData = null;

                window.ps && ps.playlist.getItems(null, null, function(data) {
                    playListData = data;
                    handleAllCallbacks();
                }, getPlayListErrorCallback);
            }
        }
    };

    function getPlayListCallback(data) {
        $('.episode-item .watchlist-action').each(function() {
            var isOnWatchList = false,
                listItems = data.contents,
                episodeId = $(this).attr('id') && $(this).attr('id').split('-')[0];
            for (var i = 0, l = listItems.length; i < l; i++) {
                if (listItems[i].id && episodeId == listItems[i].id) {
                    $(this).addClass('on');
                    isOnWatchList = true;
                    break;
                }
            }
            if ($(this).hasClass('on') && !isOnWatchList) {
                $(this).removeClass('on');
            }
        });
    }

    function getPlayListErrorCallback(data) {

    }
}
window.initPagePlayListItems = _initPagePlayListItems();

// Add Play List
function addPlayListItem(id, callback) {
    var programId = id.toString().indexOf('-') > 0 ? id.split('-')[0] : id,
        $targetEpisode = $('#' + id);
    window.ps && ps.playlist.addItem(null, "program", programId, null, handleAddPlayListItemCallback, handleAddPlayListItemErrorCallback);

    function handleAddPlayListItemCallback(data) {
        if (data.result == 'success') {
            callback && callback(true, $targetEpisode);
            callback && $('body').trigger(eventType.playlistAdded, [programId]);
        }
    }

    function handleAddPlayListItemErrorCallback(data) {
        $targetEpisode.removeClass('on');
    }
}

// Remove Play List
function removePlayListItem(id, callback) {
    var programId = id.toString().indexOf('-') > 0 ? id.split('-')[0] : id,
        $targetEpisode = $('#' + id);
    window.ps && ps.playlist.removeItem(null, {
        id: programId,
        type: "program"
    }, handleRemovePlayListItemCallback, handleRemovePlayListItemErrorCallback);

    function handleRemovePlayListItemCallback(data) {
        if (data.result == 'success') {
            callback && callback(false, $targetEpisode);
            callback && $('body').trigger(eventType.playlistRemoved, [programId])
        }
    }

    function handleRemovePlayListItemErrorCallback(data) {
        $targetEpisode.addClass('on');
    }
}

// Common for channel, category, video pages
function initPageProgramHistoryItems(categoryEpisodes) {
    getRecentViewedPrograms(null, getProgramHistoryCallback, categoryEpisodes);

    function getProgramHistoryCallback(programList, updatedEpisodes) {
        updatedEpisodes = updatedEpisodes || $('[data-history]').toArray().map(function(item) {
            return {
                id: item.getAttribute('data-history')
            }
        });
        updatedEpisodes.forEach(function(episode) {
            var program = programList.find(function(listItem) {
                return listItem.id === episode.id.toString();
            });
            if (program) {
                $('[data-history="' + program.id + '"]').toArray().forEach(function(item) {
                    var progress = 0,
                        runtime = $(item).data('runtime');
                    var duration = ((runtime.toString().indexOf(':') === -1) && (runtime / 1 > 60)) ? runtime / 1 : getProgramDuration(runtime.toString());
                    if (program.position > 0 && duration > 0) {
                        progress = Math.min(Math.round(parseInt(program.position / duration * 100, 10)) / 100, 1);
                    }
                    $(item).find('.watch-progress').width(progress * 100 + '%');
                    if (program.completed === 1) {
                        $(item).addClass('watched');
                    }
                    item.removeAttribute('data-history');
                });
            }
        });
    }
}

function imageLoaded(event) {
    $(event.target).parents(".episode-item").addClass("image-loaded");
}

function addRemoveInPlaylist(event) {
    var targetEpisodeId = $(event.target).parents('.watchlist-action').attr('id'),
        $targetEpisode = $('#' + targetEpisodeId);
    if (targetEpisodeId) {
        if ($targetEpisode.hasClass('on')) {
            $targetEpisode.removeClass('on');
            removePlayListItem(targetEpisodeId, watchlistTip);
        } else {
            $targetEpisode.addClass('on');
            addPlayListItem(targetEpisodeId, watchlistTip);
        }
    }
}

function watchlistTip(isInWatchlist, $targetItem) {
    var tipInfo = {
        type: isInWatchlist,
        title: getLocalizedString(isInWatchlist ? 'add_to_watchlist_successful' : 'remove_from_watchlist_successful'),
        link: {
            address: LOC_SERVER + 'account/playlist',
            name: getLocalizedString('view_watchlist')
        }
    };
    showTip(true, tipInfo, $targetItem, addRemoveToWatchlistCallback);
}

function addRemoveToWatchlistCallback(success, tipInfo, $relatedItem) {
    tipInfo.type ? $relatedItem.addClass('on') : $relatedItem.removeClass('on');
}

function lazyLoadCategory() {
    initLazyLoadArray();
    $(window).scroll(lazyLoadScrollMonitor);
    $(window).trigger("scroll");
}

function lazyLoadScrollMonitor() {
    lazyLoadIdArray.length && throttle(checkAndLoadCategory);
}

function initLazyLoadArray() {
    var $leafCategory = $('.category-leaf');
    for (var i = 0, l = $leafCategory.length; i < l; i++) {
        lazyLoadIdArray[i] = $($leafCategory[i]).attr('id');
        if (typeof lazyLoadPSArray != 'undefined') {
            lazyLoadPSArray[i] = parseInt($($leafCategory[i]).data('limit'), 10);
        }
    }
}

function checkAndLoadCategory() {
    var scrollTop = $(window).scrollTop(),
        windowHeight = $(window).height(),
        windowBottomToTop = scrollTop + windowHeight;
    for (var i = 0; i < lazyLoadIdArray.length; i++) {
        var top = $('#' + lazyLoadIdArray[i]).position().top,
            earlyLoadDistance = -284;
        if (windowBottomToTop - top > earlyLoadDistance) {
            var loadId = lazyLoadIdArray.splice(i, 1)[0];
            if (typeof lazyLoadPSArray != 'undefined') {
                var loadPS = lazyLoadPSArray.splice(i, 1)[0];
                getCategoryWithSeoName(loadId, addEpisodes, null, null, loadPS);
            } else {
                getCategoryWithSeoName(loadId, addEpisodes);
            }
            i--;
        } else {
            break;
        }
    }
}

function throttle(method, context) {
    clearTimeout(method.tId);
    method.tId = setTimeout(function() {
        method.call(context);
    }, 100);
}

function getCategoryWithSeoName(catSeoName, callback, dataFilterCallback, dataFilterCallbackParam, pageSize) {
    var ps = pageSize || 24,
        categoryUrl = LOC_SERVER + 'category/' + catSeoName + '?format=json&ps=' + ps + '&pn=1';
    $.ajax({
        url: categoryUrl,
        dataType: "json"
    }).done(function(data) {
        if (data.programs) {
            var programs = data.programs;
            if (dataFilterCallback && dataFilterCallbackParam) {
                programs = dataFilterCallback(programs, dataFilterCallbackParam);
            }
            callback && callback(catSeoName, programs, data.name, data.paging);
        } else {
            addNoContent($('#' + catSeoName));
        }
    }).fail(function() {
        addNoContent($('#' + catSeoName));
    });
}

function addNoContent($folder) {
    $folder.html('<div class="no-content">' + getLocalizedString('no_content') + '</div>');
}

function removeNoContent($folder) {
    $folder.html('');
}

function addEpisodes(id, categoryEpisodes, categoryName, categoryPaging) {
    var watchlistBtnTemplate = '';
    if (isSubscriber && window.ps != null) {
        var addToWatchlist = getLocalizedString('add_to_watchlist'),
            removeFromWatchlist = getLocalizedString('remove_from_watchlist'),
            watchlistBtnTemplate = '<div id="{{episode-id}}" class="watchlist-action">' +
            '<a class="add" href="javascript:void(0);" onclick="addRemoveInPlaylist(event)">' + addToWatchlist + '</a>' +
            '<a class="remove" href="javascript:void(0);" onclick="addRemoveInPlaylist(event)">' + removeFromWatchlist + '</a>' +
            '</div>';
    }
    var categoryRowTemplate =
        '<div class="episode-item episode-item-{{episode-id}} col-lg-3 col-md-4 col-sm-6 col-xs-12 {{episode-hidden}} {{watched-class}}" data-runtime="{{episode-runtime}}" {{data-history}} data-id="{{episode-id}}">' +
        '<a href="{{episode-url}}" class="episode-img">' +
        '<img class="img-responsive image-hover-scale" src="{{episode-image}}" onload="imageLoaded(event)">' +
        '<div class="watch-progress-bar">' +
        '<div class="watch-progress" style="width: {{percentage}};"></div>' +
        '</div>' +
        '<div class="watch-status">{{episode-watched}}</div>' +
        '<img class="watch-icon" src="' + LOC_RESOURCE + 'nflgp/site_4/images/icon_play.png" srcset="' + LOC_RESOURCE + 'nflgp/site_4/images/icon_play@2x.png 2x">' +
        '</a>' +
        '<div class="episode-info">' +
        '<div class="category-title">{{episode-category}}</div>' +
        '<a href="{{episode-url}}" class="episode-title" title="{{episode-name}}">{{episode-name}}</a>' + watchlistBtnTemplate +
        '</div>' +
        '</div>';
    var categoryRow = [],
        watched = getLocalizedString('episode_watched'),
        $categoryRow = $('#' + id),
        $category = $categoryRow.parents('.category'),
        episodeHiddenClass = '';
    for (var i = 0; i < categoryEpisodes.length; i++) {
        var categoryEpisode = categoryEpisodes[i],
            percentage = categoryEpisode.progress ? (categoryEpisode.progress * 100 + '%') : '0',
            showName = categoryName,
            watchedClass = "",
            dataHistory = (categoryEpisode.progress !== undefined ? '' : ('data-history="' + categoryEpisode.id + '"'));
        if (categoryEpisode.showName) {
            showName = categoryEpisode.showName;
        }
        var appendCategoryId = '';
        if ($categoryRow.data('category') != null) {
            appendCategoryId = '?cat=' + id;
        } else if ($categoryRow.data('param') != null) {
            appendCategoryId = '?' + $categoryRow.data('param') + '=true';
        }
        if ($categoryRow.data('limit') != null) {
            var limitCount = parseInt($categoryRow.data('limit'), 10);
            if (i + 1 == limitCount) {
                $category.addClass('limit-more');
                if (!$category.hasClass('hidden-over')) {
                    episodeHiddenClass = 'hidden-md';
                }
            }
        }
        if (categoryEpisode.completed === 1) {
            watchedClass = 'watched';
        }
        categoryRow[i] = categoryRowTemplate.replace(new RegExp("{{episode-id}}", "g"), categoryEpisode.id + '-' + id)
            .replace(new RegExp("{{data-history}}", "g"), dataHistory)
            .replace(new RegExp("{{episode-hidden}}", "g"), episodeHiddenClass)
            .replace(new RegExp("{{episode-url}}", "g"), LOC_SERVER + 'video/' + categoryEpisode.seoName + appendCategoryId)
            .replace(new RegExp("{{episode-image}}", "g"), LOC_CONTENT + categoryEpisode.image)
            .replace(new RegExp("{{percentage}}", "g"), percentage.toString())
            .replace(new RegExp("{{watched-class}}", "g"), watchedClass)
            .replace(new RegExp("{{episode-watched}}", "g"), watched)
            .replace(new RegExp("{{episode-runtime}}", "g"), categoryEpisode.runtime)
            .replace(new RegExp("{{episode-category}}", "g"), showName ? showName : '')
            .replace(new RegExp("{{episode-name}}", "g"), categoryEpisode.name);
    }

    if ($categoryRow.find('.no-content').length > 0) {
        removeNoContent($categoryRow);
    }

    $categoryRow.append(categoryRow.join(''));
    $category.show();

    // New init page playlist item status
    initPagePlayListItems();
    initPageProgramHistoryItems(categoryEpisodes);

    categoryPaging && updateCategoryData($category, categoryPaging);
}

function updateCategoryData($category, categoryPaging) {
    if (categoryPaging.pageNumber == categoryPaging.totalPages) {
        $category.removeClass('has-more');
    } else {
        $category.addClass('has-more')
            .data('pagenumber', categoryPaging.pageNumber)
            .data('totalpages', categoryPaging.totalPages)
            .data('count', categoryPaging.count)
    }
}

function viewMore(event) {
    var $category = $(this).parents('.category'),
        pageNumber = parseInt($category.data('pagenumber'), 10),
        totalPages = parseInt($category.data('totalpages'), 10),
        catSeoName = $category.data('category');
    if (event.data) {
        pageNumber < totalPages && getMoreEpisodes(catSeoName, ++pageNumber, addEpisodes, event.data.callback, event.data.callbackParam);
    } else {
        pageNumber < totalPages && getMoreEpisodes(catSeoName, ++pageNumber, addEpisodes);
    }
}

function getMoreEpisodes(categorySeoName, pageNo, callback, dataFilterCallback, dataFilterCallbackParam) {
    var categoryUrl = LOC_SERVER + 'category/' + categorySeoName + '?format=json&ps=24&pn=' + pageNo;
    $.ajax({
        url: categoryUrl,
        dataType: "json"
    }).done(function(data) {
        var programs = data.programs;
        if (dataFilterCallback && dataFilterCallbackParam) {
            programs = dataFilterCallback(programs, dataFilterCallbackParam);
        }
        callback && callback(categorySeoName, programs, data.name, data.paging);
    });
}

function initMiniPlayer() {
    //mini player
    var screenHeight = $("#nlPlayerContainer").height();
    $("#playerContainer .player-info").on("click", function(e) {
        if ($("#playerContainer").hasClass("active-fix")) {
            var top = $("header").height();
            $('html, body').animate({
                scrollTop: top
            }, 250);
        }
    });
    $(window).scroll(function() {
        var top = $(window).scrollTop();
        var height = 0;
        if ($("#nlPlayerContainer").length > 0) {
            height = screenHeight + $("header").height();
        }
        if (top >= height) {
            $("#screenTop").css("height", screenHeight + "px");
            $("#playerContainer").addClass('active-fix');
        } else {
            $("#screenTop").css("height", "auto");
            $("#playerContainer").removeClass('active-fix');
        }
    });
}

function getProgramsDetail(programItems, callback) {
    var programsServer = "/service/programs?ids={ids}&format=json";
    var ids = [];
    for (var i = 0; i < programItems.length; i++) {
        ids[ids.length] = programItems[i].id;
    }
    var q = ids.join(",");
    $.get(programsServer.replace("{ids}", q), callback);
}