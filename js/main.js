document.addEventListener('DOMContentLoaded', function () {
    const card = document.getElementById('businessCard');
    if (!card) return;
    const toggle = () => card.classList.toggle('flipped');
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
});
