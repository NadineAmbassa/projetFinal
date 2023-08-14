/**
 * Varkala - Bootstrap 5 E-commerce Theme v. 2.1.0
 * Homepage: https://themes.getbootstrap.com/product/varkala-e-commerce-theme/
 * Copyright 2022, Bootstrapious - https://bootstrapious.com
 */

'use strict';

(function ($) {
    // Init empty gallery array
    var container = [];
    // Loop over gallery items and push it to the array
    $('[data-toggle="photoswipe"]').each(function () {
        var $link = $(this),
            item = {
                src: $link.attr('href'),
                w: $link.data('width'),
                h: $link.data('height'),
                title: $link.data('caption')
            };
        container.push(item);
    });
    // Define click event on gallery item
    $('[data-toggle="photoswipe"]').click(function (event) {
        // Prevent location change
        event.preventDefault();

        var photoswipeItem = $(this);

        // Define object and gallery options
        var $pswp = $('.pswp')[0];
        var options = {
            bgOpacity: 0.85,
            showHideOpacity: true
        }
        // If the PhotoSwipeItem is in the slider, we don't count the 
        // duplicate slides
        if (photoswipeItem.parents('.swiper-slide').length > 0) {
            options.index =  photoswipeItem.parent('.swiper-slide:not(.swiper-slide-duplicate)').index() - 1;
        } 
        // normal content
        else {
            options.index =  photoswipeItem.index();
        }
        // Initialize PhotoSwipe
        var gallery = new PhotoSwipe($pswp, PhotoSwipeUI_Default, container, options);
        gallery.init();
    });
}(jQuery));