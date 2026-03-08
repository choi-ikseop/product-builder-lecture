const URL = "https://teachablemachine.withgoogle.com/models/Yza9DNKd3/";
let model, labelContainer;

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const tabContents = document.querySelectorAll('.tab-content');
const toolsLayout = document.getElementById('tools-layout');

// 1. Theme Orchestration
const updateThemeUI = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
        root.classList.add('dark-mode');
        themeToggle.textContent = '🌙';
    } else {
        root.classList.remove('dark-mode');
        themeToggle.textContent = '☀️';
    }
};
updateThemeUI(localStorage.getItem('theme') === 'dark');
themeToggle.addEventListener('click', () => {
    const isDark = !document.documentElement.classList.contains('dark-mode');
    updateThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 2. Navigation & Context Management
function resetDisqus(tabId) {
    const baseUrl = window.location.origin + window.location.pathname;
    const pageUrl = tabId === 'home' ? baseUrl : baseUrl + "#!" + tabId;
    const identifier = "omnikit-v2-final-" + tabId;
    
    const discussionTitle = document.getElementById('discussion-title');
    if (discussionTitle) discussionTitle.innerText = `💬 ${tabId.toUpperCase()} Community Feed`;

    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({ reload: true, config: function () { this.page.identifier = identifier; this.page.url = pageUrl; } });
    }
}

function switchTab(tabId) {
    const globalSections = ['home', 'inquiry'];
    const isTool = !globalSections.includes(tabId);
    
    // Sync Nav States
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) btn.classList.add('active');
    });

    // Layout Transition
    if (isTool) {
        toolsLayout.classList.remove('hidden');
        globalSections.forEach(s => document.getElementById(`${s}-section`).classList.add('hidden'));
    } else {
        toolsLayout.classList.add('hidden');
        globalSections.forEach(s => {
            const el = document.getElementById(`${s}-section`);
            tabId === s ? el.classList.remove('hidden') : el.classList.add('hidden');
        });
    }

    // Tab Content Visibility
    tabContents.forEach(content => {
        if (content.id === `${tabId}-section`) content.classList.remove('hidden');
        else if (isTool && content.id.endsWith('-section')) content.classList.add('hidden');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    resetDisqus(tabId);
}

document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-tab]');
    if (target) { e.preventDefault(); switchTab(target.getAttribute('data-tab')); }
});

// 3. Engine Implementation
// --- Lotto Engine ---
document.getElementById('generate-btn')?.addEventListener('click', () => {
    const container = document.getElementById('numbers');
    container.innerHTML = '';
    const nums = new Set();
    while (nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
    [...nums].sort((a,b)=>a-b).forEach((n, i) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'number';
            div.textContent = n;
            container.appendChild(div);
        }, i * 100);
    });
});

// --- AI Vision Engine ---
async function initModel() {
    if (!model) model = await tmImage.load(URL + "model.json", URL + "metadata.json");
}
document.getElementById('image-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        const img = document.getElementById('preview-image');
        const scanLine = document.getElementById('scan-line');
        img.src = event.target.result;
        img.style.display = 'block';
        scanLine.classList.remove('hidden');
        
        document.getElementById('loading-spinner').classList.remove('hidden');
        await initModel();
        const pred = await model.predict(img);
        
        const container = document.getElementById('label-container');
        container.innerHTML = '';
        pred.sort((a,b)=>b.probability-a.probability).forEach(p => {
            const prob = (p.probability*100).toFixed(0);
            container.innerHTML += `
                <div class="data-row">
                    <div class="data-label"><span>${p.className}</span><span>${prob}%</span></div>
                    <div class="progress-track"><div class="progress-bar" style="width:${prob}%"></div></div>
                </div>`;
        });
        document.getElementById('loading-spinner').classList.add('hidden');
        setTimeout(() => scanLine.classList.add('hidden'), 1000);
    };
    reader.readAsDataURL(file);
});

// --- Food Lab Engine ---
document.getElementById('recommend-menu-btn')?.addEventListener('click', () => {
    const menus = window.allMenus || [];
    const container = document.getElementById('menu-image-container');
    container.innerHTML = '<div class="scan-line"></div>';
    
    setTimeout(() => {
        const recipe = menus[Math.floor(Math.random() * menus.length)];
        container.innerHTML = `<img src="https://images.unsplash.com/photo-${recipe.id}?auto=format&fit=crop&w=800&q=80" style="width:100%; height:100%; object-fit:cover;">`;
        document.getElementById('menu-name').innerText = recipe.name;
        document.getElementById('menu-category').innerText = `Category: ${recipe.category}`;
        document.getElementById('recipe-ingredients').innerText = recipe.ingredients;
        const stepList = document.getElementById('recipe-steps');
        stepList.innerHTML = '';
        recipe.steps.forEach(s => stepList.innerHTML += `<li>${s}</li>`);
        document.getElementById('recipe-container').classList.remove('hidden');
    }, 800);
});

// --- Fortune Engine ---
const fortunes = ["역동적인 에너지가 흐르는 하루입니다.", "심사숙고 끝에 내린 결정이 빛을 발합니다.", "작은 배려가 큰 보답으로 돌아옵니다.", "창의적인 아이디어가 샘솟는 최적의 시기입니다.", "금전적 흐름이 긍정적으로 변화하고 있습니다."];
const zodiacs = ["쥐띠", "소띠", "호랑이띠", "토끼띠", "용띠", "뱀띠", "말띠", "양띠", "원숭이띠", "닭띠", "개띠", "돼지띠"];
const stars = ["물병자리", "물고기자리", "양자리", "황소자리", "쌍둥이자리", "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "궁수자리", "염소자리"];
const fortuneValSel = document.getElementById('fortune-val');
const updateFortuneOptions = () => {
    const type = document.getElementById('fortune-type').value;
    fortuneValSel.innerHTML = '';
    (type === 'zodiac' ? zodiacs : stars).forEach(v => fortuneValSel.innerHTML += `<option>${v}</option>`);
};
document.getElementById('fortune-type')?.addEventListener('change', updateFortuneOptions);
updateFortuneOptions();
document.getElementById('get-fortune-btn')?.addEventListener('click', () => {
    const res = document.getElementById('fortune-result');
    res.innerText = fortunes[Math.floor(Math.random()*fortunes.length)];
    res.classList.remove('hidden');
});

// --- Focus Engine (Pomodoro) ---
let pomoInterval;
document.getElementById('pomo-start')?.addEventListener('click', (e) => {
    const btn = e.target;
    if (btn.innerText === "Start Timer") {
        btn.innerText = "Pause";
        let time = 25 * 60;
        pomoInterval = setInterval(() => {
            time--;
            const m = Math.floor(time/60), s = time%60;
            document.getElementById('pomo-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            const progress = ((1500 - time) / 1500) * 100;
            document.getElementById('pomo-ring').style.setProperty('--progress', `${progress}%`);
            if (time <= 0) clearInterval(pomoInterval);
        }, 1000);
    } else {
        btn.innerText = "Start Timer";
        clearInterval(pomoInterval);
    }
});
document.getElementById('pomo-reset')?.addEventListener('click', () => {
    clearInterval(pomoInterval);
    document.getElementById('pomo-display').innerText = "25:00";
    document.getElementById('pomo-start').innerText = "Start Timer";
    document.getElementById('pomo-ring').style.setProperty('--progress', '0%');
});

// --- Calm Air Engine ---
let breathInterval;
document.getElementById('breath-btn')?.addEventListener('click', (e) => {
    const btn = e.target;
    const txt = document.getElementById('breath-text');
    if (btn.innerText === "Start Session") {
        btn.innerText = "Stop Session";
        let step = 0;
        const msgs = ["Inhale", "Hold", "Exhale"];
        const loop = () => {
            txt.innerText = msgs[step % 3];
            step++;
            breathInterval = setTimeout(loop, 4000);
        };
        loop();
    } else {
        btn.innerText = "Start Session";
        txt.innerText = "Ready";
        clearTimeout(breathInterval);
    }
});

// --- Insight Engine ---
const insights = [
    {t: "최선의 방어는 공격이다.", a: "손자"},
    {t: "단순함이 궁극의 정교함이다.", a: "레오나르도 다 빈치"},
    {t: "혁신은 리더와 추종자를 구분하는 잣대다.", a: "스티브 잡스"},
    {t: "위대한 일은 충동적으로 이루어지지 않고, 작은 일들이 모여 이루어진다.", a: "빈센트 반 고흐"}
];
const nextQuote = () => {
    const q = insights[Math.floor(Math.random()*insights.length)];
    document.getElementById('quote-text').innerText = `"${q.t}"`;
    document.getElementById('quote-author').innerText = `- ${q.a}`;
};
nextQuote();
document.getElementById('new-quote-btn')?.addEventListener('click', nextQuote);

// --- Smart Converter Engine ---
document.getElementById('unit-input')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const mode = document.getElementById('unit-mode').value;
    const res = document.getElementById('unit-result');
    if (isNaN(val)) { res.innerText = "Ready"; return; }
    let out = mode === 'py' ? (val * 3.3057).toFixed(2) + " ㎡" :
              mode === 'm2' ? (val / 3.3057).toFixed(2) + " 평" :
              mode === 'in' ? (val * 2.54).toFixed(2) + " ㎝" : (val / 2.54).toFixed(2) + " 인치";
    res.innerText = out;
});

// --- Vault Engine ---
document.getElementById('gen-pass-btn')?.addEventListener('click', () => {
    const len = document.getElementById('pass-len').value;
    const pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < len; i++) pass += pool.charAt(Math.floor(Math.random() * pool.length));
    document.getElementById('pass-result').innerText = pass;
});

// --- Decision Engine ---
document.getElementById('flip-coin-btn')?.addEventListener('click', () => {
    const obj = document.getElementById('coin-obj');
    const res = document.getElementById('coin-result');
    obj.style.transform = "rotateY(1080deg)";
    res.innerText = "Computing...";
    setTimeout(() => {
        obj.style.transform = "rotateY(0deg)";
        const heads = Math.random() > 0.5;
        obj.innerText = heads ? "🌕" : "🌑";
        res.innerText = heads ? "Heads (앞면)" : "Tails (뒷면)";
    }, 600);
});

// Community Sync
document.getElementById('refresh-comments')?.addEventListener('click', () => resetDisqus(activeTabId));

switchTab('home');
