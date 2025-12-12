document.addEventListener('DOMContentLoaded', function () {
    const card = document.getElementById('businessCard');

    if (!card) {
        console.warn("Kart elemanları bulunamadı.");
        return;
    }

    card.classList.remove('flipped');

    window.addEventListener('scroll', function () {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;

        const threshold = 0.5;

        if (progress < threshold) {
            card.classList.remove('flipped');
        } else {
            card.classList.add('flipped');
        }
    });

    card.addEventListener('click', function () {
        card.classList.toggle('flipped');
    });

});



