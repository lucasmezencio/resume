$(document).ready(function() {
    $(document.body).fadeIn(500);

    $('a[href=#top]').click(function (e) {
        e.preventDefault();
        e.stopPropagation();

        $('html, body').animate({scrollTop : 0}, 'slow');
    });

    var phrases = {
        'Rancore - Canto Gritando' : 'Surpreenda a todos aqueles que não esperam nada de você.',
        'Incubus - The Warmth' : 'Don\'t let the world bring you down.'
    }

    $('#year').html((new Date()).getFullYear());
});
