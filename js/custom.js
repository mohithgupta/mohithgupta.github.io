(function($) {

    if(document.getElementById("age")){

        const d = new Date();
        document.getElementById("age").innerHTML = d.getFullYear() - 2001 - (d.getMonth() >= 4 ? 0 : 1);
        
        new TypeIt("#type2", {
            speed: 150,
            loop: true,
            waitUntilVisible: true,
        })

        .type("React", { delay: 400 })
            .pause(1000)
            .delete(10)
            .type("JavaScript", { delay: 400 })
            .pause(1000)
            .delete(13)
            .type("Blogs", { delay: 400 })
            .pause(1000)
            .delete(9)
            .pause(10)
            .type("Git", { delay: 400 })
            .pause(1000)
            .delete(9)
            .type("Humor :)", { delay: 400 })
            .pause(1000)
            .delete(9)
            .go();
    }
    
    $(document).ready(function() {

        if($(".copy-mail-link")){
            $(".copy-mail-link").click(function(e){
                e.preventDefault()
                navigator.clipboard.writeText('mohithguptak@gmail.com')
                .then(() => alert("Email copied to clipboard!"))
                .catch(() => alert('Could not copy the Email'))
            })
            let clipboard = new Clipboard('.copy-mail-link');

            clipboard.on('success', () => alert("Email copied to clipboard!"));

            clipboard.on('error', () => alert('Could not copy the Email'));
        }

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