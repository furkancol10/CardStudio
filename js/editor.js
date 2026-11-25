document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'kartvizit-studio-v1';
    const $ = (id) => document.getElementById(id);
    const card = $('editor-card');
    if (!card) return;

    const THEMES = {
        mavi:   { label: 'Okyanus',  f1: '#0b5ed7', f2: '#00a3d9', b1: '#111827', b2: '#374151', ftext: '#ffffff', btext: '#f9fafb', accent: '#ffffff', baccent: '#cfe3ff' },
        orman:  { label: 'Orman',    f1: '#14532d', f2: '#2f855a', b1: '#0f2a1d', b2: '#1f4d36', ftext: '#ffffff', btext: '#f0fdf4', accent: '#d9f99d', baccent: '#bbf7d0' },
        gun:    { label: 'Gün Batımı', f1: '#9a1b3c', f2: '#d9480f', b1: '#3b0f1c', b2: '#7a2e1a', ftext: '#ffffff', btext: '#fff7ed', accent: '#ffe8a3', baccent: '#fed7aa' },
        acik:   { label: 'Minimal',  f1: '#ffffff', f2: '#e5e7eb', b1: '#f3f4f6', b2: '#ffffff', ftext: '#111827', btext: '#111827', accent: '#0b5ed7', baccent: '#374151' },
        gece:   { label: 'Gece',     f1: '#1e1b4b', f2: '#4338ca', b1: '#09090b', b2: '#27272a', ftext: '#ffffff', btext: '#fafafa', accent: '#fcd34d', baccent: '#c7d2fe' },
    };
    const FIELDS = ['name', 'title', 'phone', 'email', 'company', 'slogan', 'website', 'address'];
    const inp = {}; FIELDS.forEach(f => inp[f] = $('inp-' + f));
    const frontColor = $('inp-front-color'), backColor = $('inp-back-color');
    const exportCard = $('export-card');
    const status = $('status');

    const defaults = { theme: 'mavi' };
    FIELDS.forEach(f => defaults[f] = inp[f].defaultValue || inp[f].value);
    defaults.frontColor = THEMES.mavi.f1; defaults.backColor = THEMES.mavi.b1;
    let state = Object.assign({}, defaults);

    // localStorage (erişim engelli olabilir)
    const load = () => { try { const s = JSON.parse(localStorage.getItem(STORAGE_KEY)); return s && typeof s === 'object' ? s : null; } catch (e) { return null; } };
    const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* yoksay */ } };
    const clearSaved = () => { try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* yoksay */ } };

    const saved = load();
    if (saved) {
        FIELDS.forEach(f => { if (typeof saved[f] === 'string') state[f] = saved[f]; });
        if (THEMES[saved.theme]) state.theme = saved.theme;
        if (/^#[0-9a-f]{6}$/i.test(saved.frontColor)) state.frontColor = saved.frontColor;
        if (/^#[0-9a-f]{6}$/i.test(saved.backColor)) state.backColor = saved.backColor;
    }

    // Renk yardımcıları: seçilen rengin ikinci tonunu üret
    const shade = (hex, amt) => {
        const n = parseInt(hex.slice(1), 16);
        const ch = (v) => Math.max(0, Math.min(255, Math.round(v + (amt >= 0 ? (255 - v) : v) * amt)));
        return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(ch).map(v => v.toString(16).padStart(2, '0')).join('');
    };
    const luminance = (hex) => {
        const n = parseInt(hex.slice(1), 16);
        const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };

    const applyColors = (el) => {
        const t = THEMES[state.theme];
        const frontCustom = state.frontColor.toLowerCase() !== t.f1.toLowerCase();
        const backCustom = state.backColor.toLowerCase() !== t.b1.toLowerCase();
        const vars = Object.assign({}, t, { f1: state.frontColor, b1: state.backColor });
        if (frontCustom) {
            vars.f2 = shade(state.frontColor, 0.25);
            const light = luminance(state.frontColor) > 0.45;
            vars.ftext = light ? '#111827' : '#ffffff';
            vars.accent = light ? '#111827' : '#ffffff';
        }
        if (backCustom) {
            vars.b2 = shade(state.backColor, 0.2);
            const light = luminance(state.backColor) > 0.45;
            vars.btext = light ? '#111827' : '#f9fafb';
            vars.baccent = light ? '#374151' : '#e5e7eb';
        }
        ['f1', 'f2', 'b1', 'b2', 'ftext', 'btext', 'accent', 'baccent'].forEach(k => el.style.setProperty('--' + k, vars[k]));
    };

    const text = {
        name: (v) => v, title: (v) => v, company: (v) => v, slogan: (v) => v, website: (v) => v, address: (v) => v,
        phone: (v) => 'Telefon: ' + v, email: (v) => 'E-Posta: ' + v,
    };
    const placeholders = { name: 'Adınız Soyadınız', title: 'Unvanınız', phone: '0 5XX XXX XX XX', email: 'adiniz@sirketiniz.com', company: 'Şirket Adı', slogan: 'Sloganınız buraya gelecek', website: 'www.sirketiniz.com', address: 'Adresiniz, Şehir, Ülke' };

    // vCard 3.0
    const esc = (v) => String(v).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
    const buildVCard = () => {
        const v = (f) => (state[f] || '').trim();
        const name = v('name') || placeholders.name;
        const parts = name.split(/\s+/);
        const last = parts.length > 1 ? parts.pop() : '';
        const first = parts.join(' ');
        const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${esc(last)};${esc(first)};;;`, `FN:${esc(name)}`];
        if (v('company')) lines.push('ORG:' + esc(v('company')));
        if (v('title')) lines.push('TITLE:' + esc(v('title')));
        if (v('phone')) lines.push('TEL;TYPE=CELL:' + esc(v('phone')));
        if (v('email')) lines.push('EMAIL:' + esc(v('email')));
        if (v('website')) lines.push('URL:' + esc(v('website')));
        if (v('address')) lines.push('ADR;TYPE=WORK:;;' + esc(v('address')) + ';;;;');
        lines.push('END:VCARD');
        return lines.join('\n');
    };

    // qrcode-generator: UTF-8 (Türkçe karakter) desteği için bayt dönüştürücüyü değiştir
    if (typeof qrcode !== 'undefined' && qrcode.stringToBytesFuncs) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    const drawQR = (host) => {
        host.textContent = '';
        if (typeof qrcode === 'undefined') return false;
        const data = buildVCard();
        for (const level of ['M', 'L']) {
            try {
                const qr = qrcode(0, level);
                qr.addData(data, 'Byte');
                qr.make();
                const img = new Image();
                img.alt = '';
                img.src = qr.createDataURL(8, 0);
                host.appendChild(img);
                return true;
            } catch (e) { /* daha düşük hata düzeltme seviyesiyle dene */ }
        }
        status.textContent = 'QR kod için metin çok uzun; bazı alanları kısaltın.';
        return false;
    };

    let qrTimer;
    const render = () => {
        FIELDS.forEach(f => {
            const val = (state[f] || '').trim();
            const out = text[f](val || placeholders[f]);
            $('prev-' + f).textContent = out;
            $('exp-' + f).textContent = out;
        });
        applyColors(card);
        applyColors(exportCard);
        document.querySelectorAll('.theme-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === state.theme)));
        clearTimeout(qrTimer);
        qrTimer = setTimeout(() => { drawQR($('prev-qr')); drawQR($('exp-qr')); }, 120);
    };

    // Tema düğmeleri
    const themesEl = $('themes');
    Object.keys(THEMES).forEach(key => {
        const t = THEMES[key];
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'theme-btn'; b.dataset.theme = key;
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="sw"></span>';
        b.querySelector('.sw').style.background = `linear-gradient(135deg, ${t.f1}, ${t.f2})`;
        b.appendChild(document.createTextNode(t.label));
        b.addEventListener('click', () => {
            state.theme = key; state.frontColor = t.f1; state.backColor = t.b1;
            frontColor.value = t.f1; backColor.value = t.b1;
            save(); render();
        });
        themesEl.appendChild(b);
    });

    const syncInputs = () => {
        FIELDS.forEach(f => { inp[f].value = state[f]; });
        frontColor.value = state.frontColor; backColor.value = state.backColor;
    };

    FIELDS.forEach(f => inp[f].addEventListener('input', () => { state[f] = inp[f].value; save(); render(); }));
    frontColor.addEventListener('input', () => { state.frontColor = frontColor.value; save(); render(); });
    backColor.addEventListener('input', () => { state.backColor = backColor.value; save(); render(); });

    $('btn-flip').addEventListener('click', () => {
        const on = card.classList.toggle('flipped');
        $('btn-flip').setAttribute('aria-pressed', String(on));
    });
    card.addEventListener('click', () => $('btn-flip').click());

    $('btn-reset').addEventListener('click', () => {
        state = Object.assign({}, defaults); clearSaved(); syncInputs(); render();
        status.textContent = 'Varsayılan değerlere dönüldü.';
    });

    // PNG indirme: ekran dışındaki düz kopyayı html2canvas ile çiz
    const download = (side) => {
        if (typeof html2canvas === 'undefined') { status.textContent = 'PNG için html2canvas yüklenemedi (internet bağlantısını kontrol edin).'; return; }
        const face = exportCard.querySelector(side === 'front' ? '.card-front' : '.card-back');
        const prev = exportCard.querySelector(side === 'front' ? '.card-back' : '.card-front');
        prev.style.display = 'none'; face.style.display = 'block';
        html2canvas(face, { scale: 3, backgroundColor: null, useCORS: true }).then(canvas => {
            const a = document.createElement('a');
            const slug = (state.name || 'kartvizit').trim().toLowerCase().replace(/[^a-z0-9ğüşıöç]+/gi, '-').replace(/^-|-$/g, '') || 'kartvizit';
            a.download = `${slug}-${side === 'front' ? 'on' : 'arka'}.png`;
            a.href = canvas.toDataURL('image/png');
            document.body.appendChild(a); a.click(); a.remove();
            status.textContent = 'PNG indirildi.';
        }).catch(() => { status.textContent = 'PNG oluşturulamadı.'; })
          .finally(() => { prev.style.display = ''; face.style.display = ''; });
    };
    $('btn-png-front').addEventListener('click', () => download('front'));
    $('btn-png-back').addEventListener('click', () => download('back'));

    syncInputs();
    render();
});
