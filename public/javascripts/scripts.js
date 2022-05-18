// Add drop shadow to header on scroll
$(window).scroll(function () {
    if ($(window).scrollTop() >= 30) {
        $('header').addClass('shadow-header');
    } else {
        $('header').removeClass('shadow-header');
    }
});

// Google Maps
function initMap() {
    const uluru = {lat: 21.0326476, lng: 105.7723577};
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 18,
        center: uluru,
    });
    const marker = new google.maps.Marker({
        position: uluru,
        map: map,
    });
}

// Scroll to top button
$(window).scroll(function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        $('#scroll-to-top').show();
    } else {
        $('#scroll-to-top').hide();
    }
})
$('#scroll-to-top').click(() => {
    $('html, body').animate({scrollTop: '0px'}, 300);
})

// Three column fade in up
$(window).on("load", function () {
    function fadeInUp() {
        var windowTop = $(window).scrollTop(),
            windowBottom = windowTop + $(window).innerHeight();
        $(".slide-card-section > *").each(function () {
            /* Check the location of each desired element */
            var objectHeight = $(this).outerHeight(),
                objectMiddle = $(this).parent().offset().top + objectHeight / 2;
            // Check the index of each desired element
            var index = $(this).index();
            /* Fade element in/out based on its visible percentage */
            if (objectMiddle < windowBottom) {
                if (!$(this).hasClass('fadeInUp')) {
                    setTimeout(() => $(this).removeClass('fadeOut').addClass('fadeInUp'), index * 200);
                }
            } else {
                if (!$(this).hasClass('fadeOut')) {
                    $(this).removeClass('fadeInUp').addClass('fadeOut');
                }
            }
        });
    }
    fadeInUp(); //fade elements on page-load
    document.addEventListener("scroll", fadeInUp);
});

// Banner fade in - fade out
$(window).on("load", function () {
    function fadeInOut() {
        var windowTop = $(window).scrollTop(),
            windowBottom = windowTop + $(window).innerHeight();
        $(".banner").each(function () {
            /* Check the location of each desired element */
            var objectHeight = $(this).outerHeight(),
                objectMiddle = $(this).offset().top + objectHeight / 2;
            /* Fade element in/out based on its visible percentage */
            if (objectMiddle < windowBottom) {
                if (!$(this).hasClass('fadeIn')) {
                    $(this).removeClass('fadeOut').addClass('fadeIn');
                }
            } else {
                if (!$(this).hasClass('fadeOut')) {
                    $(this).removeClass('fadeIn').addClass('fadeOut');
                }
            }
        });
    }
    fadeInOut(); //fade elements on page-load
    document.addEventListener("scroll", fadeInOut);
});

// Accordion collapse
$('#accordion .card-header').click(function() {
    $(this).toggleClass('active').next().collapse('toggle');
});

// Dropdown menu
$(document).ready(function () {
    $(".dropdown").hover(
        function () {
            if (!$(".navbar-toggler").is(":visible")) {
                $(this).find(".dropdown-menu").slideDown("fast");
            }
        },
        function () {
            if (!$(".navbar-toggler").is(":visible")) {
                $(this).find(".dropdown-menu").slideUp("fast");
            }
        },
    );
});

function togglePopup(){
    document.getElementById("popup-1").classList.toggle("active");
}

