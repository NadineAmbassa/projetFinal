/**
 * Varkala - Bootstrap 5 E-commerce Theme v. 2.1.0
 * Homepage: https://themes.getbootstrap.com/product/varkala-e-commerce-theme/
 * Copyright 2022, Bootstrapious - https://bootstrapious.com
 */

"use strict";

$(function () {
    AOS.init({
        disable: detectIE(), // dont' run in IEs as it's really slow
        startEvent: "DOMContentLoaded", // name of the event dispatched on the document, that AOS should initialize on
        offset: 120, // offset (in px) from the original trigger point
        delay: 150, // values from 0 to 3000, with step 50ms
        duration: 400, // values from 0 to 3000, with step 50ms
        easing: "ease", // default easing for AOS animations
        once: true, // whether animation should happen only once - while scrolling down
    });

    // ------------------------------------------------------- //
    //   Increase/Decrease product amount
    // ------------------------------------------------------ //

    $(".btn-items-decrease").on("click", function () {
        var input = $(this).siblings(".input-items");
        if (parseInt(input.val(), 10) >= 1) {
            input.val(parseInt(input.val(), 10) - 1);
        }
    });

    $(".btn-items-increase").on("click", function () {
        var input = $(this).siblings(".input-items");
        input.val(parseInt(input.val(), 10) + 1);
    });

    // ------------------------------------------------------- //
    //   Vh hack for sidebars on mobiles
    // ------------------------------------------------------ //

    function setVhVar() {
        var vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty("--vh", vh + "px");
    }

    setVhVar();

    // We listen to the resize event
    window.addEventListener("resize", setVhVar);

    // ------------------------------------------------------- //
    //   Transparent navbar dropdowns
    //
    //   = do not make navbar
    //   transparent if dropdown's still open
    //   / make transparent again when dropdown's closed
    // ------------------------------------------------------ //

    var navbar = $(".navbar"),
        navbarCollapse = $(".navbar-collapse");

    $(".navbar.bg-transparent .navbar-collapse").on(
        "show.bs.collapse",
        function () {
            makeNavbarWhite();
        }
    );

    $(".navbar.bg-transparent .navbar-collapse").on(
        "hidden.bs.collapse",
        function () {
            makeNavbarTransparent();
        }
    );

    function makeNavbarWhite() {
        navbar.addClass("was-transparent");
        if (navbar.hasClass("navbar-dark")) {
            navbar.addClass("was-navbar-dark");
            navbar.removeClass("navbar-dark");
        } else {
            navbar.addClass("was-navbar-light");
        }

        navbar.removeClass("bg-transparent");

        navbar.addClass("bg-white");
        navbar.addClass("navbar-light");
    }

    function makeNavbarTransparent() {
        navbar.removeClass("bg-white");
        navbar.removeClass("navbar-light");
        navbar.removeClass("was-transparent");

        navbar.addClass("bg-transparent");
        if (navbar.hasClass("was-navbar-dark")) {
            navbar.addClass("navbar-dark");
        } else {
            navbar.addClass("navbar-light");
        }
    }

    // ------------------------------------------------------- //
    //   Bootstrap tooltips
    // ------------------------------------------------------- //

    $('[data-bs-toggle="tooltip"]').tooltip();

    // ------------------------------------------------------- //
    //    Colour form control
    // ------------------------------------------------------ //

    $(".btn-colour").on("click", function (e) {
        var button = $(this);

        if (button.attr("data-allow-multiple") === undefined) {
            button
                .parents(".colours-wrapper")
                .find(".btn-colour")
                .removeClass("active");
        }

        button.toggleClass("active");
    });

    // ------------------------------------------------------- //
    //  Button-style form labels used in product details
    // ------------------------------------------------------ //

    $(".detail-option-btn-label").on("click", function () {
        var button = $(this);

        button
            .parents(".detail-option")
            .find(".detail-option-btn-label")
            .removeClass("active");

        button.toggleClass("active");
    });

    // ------------------------------------------------------- //
    //   Image zoom
    // ------------------------------------------------------ //

    $('[data-toggle="zoom"]').each(function () {
        $(this).zoom({
            url: $(this).attr("data-image"),
            duration: 0,
        });
    });

    /* =================================================
        Change product image according to product color
    ================================================= */

    let productColors = document.querySelectorAll(".product-color-input");
    let altProductImageLabels = document.querySelectorAll(".alt-img");
    let imgHolder = document.querySelectorAll(".product-img-holder");

    if (altProductImageLabels.length && imgHolder.length) {
        altProductImageLabels.forEach((el) => {
            el.closest(".product")
                .querySelector(".product-img-holder")
                .insertAdjacentHTML(
                    "beforeend",
                    `<img class="img-fluid alt-product-img" src=${el.dataset.img} data-id=${el.dataset.id}>`
                );
        });
    }

    if (productColors.length && imgHolder.length) {
        productColors.forEach((color) => {
            color.addEventListener("input", function () {
                if (color.nextElementSibling.classList.contains("alt-img")) {
                    color
                        .closest(".product")
                        .querySelector(
                            `.alt-product-img[data-id=${color.nextElementSibling.dataset.id}]`
                        ).style.opacity = "1";
                    color
                        .closest(".product")
                        .querySelectorAll(
                            `.alt-product-img:not([data-id=${color.nextElementSibling.dataset.id}])`
                        )
                        .forEach((el) => {
                            el.style.opacity = "0";
                        });
                } else {
                    color
                        .closest(".product")
                        .querySelectorAll(".alt-product-img")
                        .forEach((el) => {
                            el.style.opacity = "0";
                        });
                }
            });
        });
    }

    /* =====================================================
        Product Slider
    ===================================================== */
    var productsSlider = new Swiper(".product-slider", {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,

        // Navigation arrows
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

    // ------------------------------------------------------- //
    //   Object Fit Images
    // ------------------------------------------------------- //

    objectFitImages();
});

function detectIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var version = false;

    if (msie > 0) {
        // IE 10 or older => return version number
        version = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
    }

    var trident = ua.indexOf("Trident/");
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf("rv:");
        version = parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
    }

    var edge = ua.indexOf("Edge/");
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        version = parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
    }

    if (version !== false && version <= 11) {
        return true;
    } else {
        return false;
    }
}
