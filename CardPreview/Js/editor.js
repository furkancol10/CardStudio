document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('editor-card');
    if (!card) {
        console.error('Kart bulunamadı!');
        return;
    }

    // Ön Yüz Elemanları
    const inpName = document.getElementById('inp-name');
    const inpTitle = document.getElementById('inp-title');
    const inpPhone = document.getElementById('inp-phone');
    const inpEmail = document.getElementById('inp-email');
    const inpCompany = document.getElementById('inp-company');

    const prevName = document.getElementById('prev-name');
    const prevTitle = document.getElementById('prev-title');
    const prevPhone = document.getElementById('prev-phone');
    const prevEmail = document.getElementById('prev-email');
    const prevCompany = document.getElementById('prev-company');

    // Arka Yüz Elemanları
    const inpSlogan = document.getElementById('inp-slogan');
    const inpWebsite = document.getElementById('inp-website');
    const inpAddress = document.getElementById('inp-address');

    const prevSlogan = document.getElementById('prev-slogan');
    const prevWebsite = document.getElementById('prev-website');
    const prevAddress = document.getElementById('prev-address');

    // Renkler
    const inpFrontColor = document.getElementById('inp-front-color');
    const inpBackColor = document.getElementById('inp-back-color');

    const frontFace = card.querySelector('.card-front');
    const backFace = card.querySelector('.card-back');

    // Yardımcı fonksiyon
    const bindText = (input, target, prefix = '') => {
        const defaultText = target.textContent;
        input.addEventListener('input', () => {
            const val = input.value.trim();
            if (val === '') {
                target.textContent = defaultText;
            } else {
                target.textContent = prefix ? `${prefix}${val}` : val;
            }
        });
    };

    // Bağlantılar
    bindText(inpName, prevName);
    bindText(inpTitle, prevTitle);
    bindText(inpPhone, prevPhone, 'Telefon: ');
    bindText(inpEmail, prevEmail, 'E-Posta: ');
    bindText(inpCompany, prevCompany);

    bindText(inpSlogan, prevSlogan);
    bindText(inpWebsite, prevWebsite);
    bindText(inpAddress, prevAddress);

    // Renk değişimi
    inpFrontColor.addEventListener('input', () => {
        const c = inpFrontColor.value;
        frontFace.style.background = `linear-gradient(135deg, ${c}, #00c6ff)`;
    });

    inpBackColor.addEventListener('input', () => {
        const c = inpBackColor.value;
        backFace.style.background = `linear-gradient(135deg, ${c}, #374151)`;
    });

    // Flip butonu
    const btnFlip = document.getElementById('btn-flip');
    btnFlip.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
});