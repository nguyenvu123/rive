/*
 * @file
 *
 * Available variables
 * - boilerplate_display
 *
*/

(function ($) {
    'use strict';

    $(document).ready(function () {
        var msg = 'DOM is ready! JS\'s running 🚀';
        if (typeof boilerplate_timer != 'undefined') {
            msg += ' Load time : ' + (parseInt(Date.now()) - parseInt(boilerplate_timer)) + 'ms.';
        } else {
            msg += '.'
        }
        console.log(msg);
    });

    $(window).on(
        {
            'load': function () {
                var msg = 'The document has finished loading!';
                if (typeof boilerplate_timer != 'undefined') {
                    msg += ' Total load time : ' + (parseInt(Date.now()) - parseInt(boilerplate_timer)) + 'ms.';
                }
                console.log(msg);
            },
            'resizeend': function () {
                console.log('Window has been resized!');
            }
        }
    );

    if (typeof boilerplate_display != 'undefined') {
        $(window).on('load resizeend', function () {
            console.log('boilerplate_display', boilerplate_display);
        });
    }

})(jQuery);