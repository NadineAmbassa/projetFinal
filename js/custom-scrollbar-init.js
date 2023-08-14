/**
 * Varkala - Bootstrap 5 E-commerce Theme v. 2.1.0
 * Homepage: https://themes.getbootstrap.com/product/varkala-e-commerce-theme/
 * Copyright 2022, Bootstrapious - https://bootstrapious.com
 */

'use strict';

(function ($) {
    if ($(window).outerWidth() > 992) {
        $(".custom-scrollbar").mCustomScrollbar({
            scrollInertia: 200,
            theme:"dark-thin"
        });
    }
}(jQuery));