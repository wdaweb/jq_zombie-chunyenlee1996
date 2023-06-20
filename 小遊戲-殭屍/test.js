const readapi_base_url = 'https://api01-platform.stream.co.jp/apiservice/getMediaByParam/?token=MTNDMkU2RTAwNTNBMzBFOTgyQjMwQzE0RDIwN0EyMEY=&';
const skipSecond = 10;

let playList, mid;

player.accessor.addEventListener("landing", function () {
    setTimeout(function () {
        initPlayer();
        initPlayList();
        player.accessor.playOnSelect = true;
    }, 300);
    player.accessor.addEventListener("playlistitem", function () {
        initPlayer();
    });
    player.accessor.addEventListener("progress", function () {
        setTime();
    });
    player.accessor.addEventListener("playing", function () {
        // initSwipeEvent();
        const cpanel = $('.cpanel');
        const wrapper = $('.player-wrapper');
        if (cpanel.hasClass('show') == false) {
            cpanel.addClass('show');
            wrapper.addClass('play');
        }
        togglePlayButton();
    });
    player.accessor.addEventListener("paused", function () {
        setTime();
        togglePlayButton();
    });
});

function togglePlayButton() {
    const playButton = $('.btn-play');
    if (player.accessor.state == "playing") {
        playButton.addClass('pause');
    } else {
        playButton.removeClass('pause');
    }
}

$('.btn-playlist').on('click', function () {
    toggleCpanel();
});

$('#music-title').on('click', function () {
    playToggle();
});

$('.btn-play').on('click', function () {
    playToggle();
});

$('.btn-back').on('click', function () {
    const currentTime = player.accessor.getCurrentTime();
    let backTime = currentTime - skipSecond;
    if (backTime < 0) {
        backTime = 0;
    }
    player.accessor.setCurrentTime(backTime);
});

$('.btn-forward').on('click', function () {
    const currentTime = player.accessor.getCurrentTime();
    player.accessor.setCurrentTime(currentTime + skipSecond);
});

$('.btn-previous').on('click', function () {
    player.accessor.setCurrentTime(0);
});

$('.btn-next').on('click', function () {
    player.accessor.playlist.next();
});

$('#seekbar').on('input', function () {
    const jumpTime = $(this).val();
    player.accessor.setCurrentTime(jumpTime);
});

$(document).on('click', '.pl-music', function (e) {
    const elm = e.currentTarget;
    const index = $(elm).attr('data-index');
    player.accessor.pause();
    player.accessor.playlist.currentItem(index);
    toggleCpanel();
});

function toggleCpanel() {
    const cpanel = $('.cpanel');
    const btn = $('.btn-playlist');
    const openLabel = 'OPEN PLAYLIST';
    const closeLabel = 'CLOSE PLAYLIST';
    let properties;
    if (cpanel.hasClass('open')) {
        properties = { top: cpanelTop };
        btn.text(openLabel);
    } else {
        properties = { top: "0" };
        cpanelTop = cpanel.css('top');
        playListElm.toggle();
        btn.text(closeLabel);
    }
    cpanel.animate(properties, 100, function () {
        if (cpanel.hasClass('open')) {
            playListElm.toggle();
        }
        cpanel.toggleClass('open');
    });

}

function initSwipeEvent() {
    if (isSwipeEventInit == false) {
        $('.swipe-area').css('pointer-events', 'auto');
        $('.swipe-area').on('touchstart', touchStart);
        $('.swipe-area').on('touchmove', touchMove);
        $('.swipe-area').on('touchend', touchEnd);
        if (window.ontouchstart === undefined) {
            $('.swipe-area').on('click', function () {
                playToggle();
            });
        }
        isSwipeEventInit = true;
    }
}

function touchStart(event) {
    startX = event.touches[0].pageX;
}
function touchMove(event) {
    endX = event.touches[0].pageX;
}
function touchEnd() {
    if (endX == 0) {
        playToggle();
    } else if ((endX - startX) > 30) {
        const previousIndex = player.accessor.playlist.previousIndex();
        player.accessor.pause();
        player.accessor.playlist.currentItem(previousIndex);
    } else if ((endX - startX) < -30) {
        const nextIndex = player.accessor.playlist.nextIndex();
        player.accessor.pause();
        player.accessor.playlist.currentItem(nextIndex);
    } else {
        playToggle();
    }
    endX = 0;
}

function playToggle() {
    if (player.accessor.state == 'playing') {
        player.accessor.pause();
    } else if (player.accessor.state == 'paused' || player.accessor.state == 'landing') {
        player.accessor.play();
    }

}

function initPlayer() {
    mid = player.accessor.meta_id;
    // const iFrameData = player.accessor.playlist.iFrameAPI.IFrameModel.getIFrameData(); // ver >= 4
    // playList = iFrameData.data.playlist; // ver >= 4
    playList = player.accessor.playlist.playlist; // ver 3.9

    if (playList.length == 0) {
        const script_tag = '<script src="' + readapi_base_url + 'mid=' + mid + '"></script>';
        $('head').append(script_tag);
        $('.btn-playlist').hide();
    } else {
        const item = player.accessor.playlist.currentItem();
        const subtitle = getMetaData(item.meta_id);
        $('#music-title').html(item.title + '<br><small>' + subtitle + '</small>');
    }
    setTime();
}

function setTime(ctime = player.accessor.getCurrentTime(), ttime = player.accessor.getTotalTime()) {
    const totalTime = Math.floor(ttime);
    const currentTime = Math.floor(ctime);
    const leftTime = totalTime - currentTime;
    $('#current-time').text(formatSecondToMinute(currentTime));
    $('#left-time').text('-' + formatSecondToMinute(leftTime));
    $('#seekbar').attr('max', totalTime);
    $('#seekbar').val(currentTime);
    setSeekbar();
}

function initPlayList() {
    playListElm.empty();
    for (const key in playList) {
        const info = playList[key];
        const subtitle = getMetaData(playList[key].meta_id);

        playListElm.append('<div class="pl-music" data-index="' + key + '"><div class="pl-number">' + (parseInt(key) + 1) + '</div><h2>' + info.title + '<br><small>' + subtitle + '</small></h2><div class="pl-time">' + formatSecondToMinute(info.duration) + '</div></div>')
    }
}

function formatSecondToMinute(baseMinute) {
    const minute = Math.floor(baseMinute / 60);
    const second = baseMinute % 60
    return ('00' + minute).slice(-2) + ':' + ('00' + second).slice(-2);
}

function getMetaData(mid) {
    for (const key in playListMetaData) {
        if (playListMetaData[key].mid == mid) {
            return playListMetaData[key].custom_metadata.playlist_name;
        }
    }
}

function getMetaData(mid) {
    for (const key in playListMetaData) {
        if (playListMetaData[key].mid == mid) {
            return playListMetaData[key].custom_metadata.playlist_name;
        }
    }
}

function setTitle() {
    const item = playListMetaData[0];
    $('#music-title').html(item.title + '<br><small>' + item.custom_metadata.playlist_name + '</small>');
}

function setSeekbar() {
    var $range = $('input[type="range"]');
    var trackColor = "#9E9E9E";
    var trackOffColor = "#B6B6B6";
    var trackOffFocusedColor = "#B6B6B6";
    var thumbColor = "#333333";
    var zeroClassName = "off";
    var isWebkit = ('WebkitAppearance' in document.documentElement.style);
    $.each($range, function (k, v) {
        setRangeColor($(v));
    });
    $range.on('change blur click', function (e) {
        var $this = $(this);
        setRangeColor($this);
    });
    function setRangeColor($element) {
        var value = getValue($element);
        if (value == 0) {
            $element.addClass(zeroClassName);
        } else {
            $element.removeClass(zeroClassName);
        }
        var isDisabled = $element.attr("disabled");
        if (isDisabled) {
            return;
        }
        var isFocused = $element.is(':focus');
        if (isWebkit) {
            $element.css("background", getTrackBackground(value, isFocused));
        }
    }
    function getValue($element) {
        var min = $element.attr("min") || 0;
        var max = $element.attr("max") || 100;
        return ($element.val() - min) / (max - min);
    }
    function getTrackBackground(value, isFocused) {
        let trackBg = getTrackColor(value, isFocused);
        return `-webkit-linear-gradient(left, ${thumbColor} 0%, ${thumbColor} ${value * 100}%, ${trackBg} ${value * 100}%, ${trackBg} 100%)`;
    }
    function getTrackColor(value, isFocused) {
        if (value == 0 && isFocused) {
            return trackOffFocusedColor;
        }
        return value > 0 ? trackColor : trackOffColor;
    }
}