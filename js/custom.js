const d = new Date();
document.getElementById("age").innerHTML = d.getFullYear() - 2001 - (d.getMonth() >= 4 ? 0 : 1);


new TypeIt("#type2", {
    speed: 120,
    loop: true,
    waitUntilVisible: true,
})

.type("React", { delay: 400 })
    .pause(1000)
    .delete(10)
    .type("JavaScript", { delay: 400 })
    .pause(1000)
    .delete(13)
    .type("Blog", { delay: 400 })
    .pause(1000)
    .delete(9)
    .pause(10)
    .type("Git", { delay: 400 })
    .pause(1000)
    .delete(9)
    .go();


(function($) {

    $(document).ready(function() {

        $(".revealator-delay1").addClass('no-transform');

        function checkSize() {
            if ($(document).width() > 992) {
                var btn_hover = "";
                $(".btn").each(function() {
                    var btn_text = $(this).text();
                    $(this).addClass(btn_hover).empty().append("<span data-hover='" + btn_text + "'>" + btn_text + "</span>");
                });
            }
        }

        checkSize();

        window.addEventListener('resize', function() {
            checkSize();
        })
    });

})(jQuery);