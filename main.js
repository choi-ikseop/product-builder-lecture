const URL = "https://teachablemachine.withgoogle.com/models/Yza9DNKd3/";
let model, labelContainer;
let activeTabId = 'home'; // Global tracking of active tab

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
    const identifier = "omnikit-v3-final-" + tabId;
    
    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = identifier;
                this.page.url = pageUrl;
            }
        });
    } else {
        window.disqus_config = function () {
            this.page.url = pageUrl;
            this.page.identifier = identifier;
        };
        (function() {
            var d = document, s = d.createElement('script');
            s.src = 'https://productbuilder-j0ykvmteku.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();
    }
}

function switchTab(tabId) {
    activeTabId = tabId;
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
        globalSections.forEach(s => {
            const el = document.getElementById(`${s}-section`);
            if (el) el.classList.add('hidden');
        });
    } else {
        toolsLayout.classList.add('hidden');
        globalSections.forEach(s => {
            const el = document.getElementById(`${s}-section`);
            if (el) {
                if (tabId === s) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
        });
    }

    // Tab Content Visibility inside Tools
    const innerToolSections = ['lotto', 'gender', 'dinner', 'fortune', 'breath', 'pomo', 'quote', 'unit', 'pass', 'coin'];
    innerToolSections.forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (el) {
            if (tabId === s) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    resetDisqus(tabId);
}

document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-tab]');
    if (target) {
        e.preventDefault();
        const tabId = target.getAttribute('data-tab');
        switchTab(tabId);
    }
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
        img.src = event.target.result;
        img.style.display = 'block';
        
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.classList.remove('hidden');
        
        await initModel();
        const pred = await model.predict(img);
        
        const container = document.getElementById('label-container');
        container.innerHTML = '';
        pred.sort((a,b)=>b.probability-a.probability).forEach(p => {
            const prob = (p.probability*100).toFixed(0);
            container.innerHTML += `
                <div class="data-row" style="margin-bottom:1rem; text-align:left;">
                    <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:0.3rem;">
                        <span>${p.className}</span><span>${prob}%</span>
                    </div>
                    <div style="height:10px; background:#eee; border-radius:5px; overflow:hidden;">
                        <div style="height:100%; background:var(--p-indigo); width:${prob}%; transition:width 0.5s;"></div>
                    </div>
                </div>`;
        });
        if (spinner) spinner.classList.add('hidden');
    };
    reader.readAsDataURL(file);
});

// --- Food Lab Engine ---
document.getElementById('recommend-menu-btn')?.addEventListener('click', () => {
    const menus = window.allMenus || [];
    const container = document.getElementById('menu-image-container');
    container.innerHTML = '⌛';
    
    setTimeout(() => {
        const recipe = menus[Math.floor(Math.random() * menus.length)];
        container.innerHTML = `<img src="https://images.unsplash.com/photo-${recipe.id}?auto=format&fit=crop&w=800&q=80" style="width:100%; height:100%; object-fit:cover;">`;
        document.getElementById('menu-name').innerText = recipe.name;
        document.getElementById('recipe-ingredients').innerText = `주재료: ${recipe.ingredients}`;
        const stepList = document.getElementById('recipe-steps');
        stepList.innerHTML = '';
        recipe.steps.forEach(s => {
            const li = document.createElement('li');
            li.innerText = s;
            stepList.appendChild(li);
        });
        document.getElementById('recipe-container').classList.remove('hidden');
    }, 500);
});

// --- Fortune Engine ---
const fortunes = ["오늘은 뜻밖의 행운이 찾아옵니다.", "신중한 판단이 필요한 하루입니다.", "주변 사람과의 대화에서 답을 찾으세요.", "미뤄왔던 일을 시작하기 좋은 날입니다.", "금전운이 상승하고 있습니다.", "건강을 위해 가벼운 산책을 추천합니다."];
const zodiacs = ["쥐띠", "소띠", "호랑이띠", "토끼띠", "용띠", "뱀띠", "말띠", "양띠", "원숭이띠", "닭띠", "개띠", "돼지띠"];
const stars = ["물병자리", "물고기자리", "양자리", "황소자리", "쌍둥이자리", "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "궁수자리", "염소자리"];
const fortuneValSel = document.getElementById('fortune-val');
const updateFortuneOptions = () => {
    const type = document.getElementById('fortune-type').value;
    fortuneValSel.innerHTML = '';
    (type === 'zodiac' ? zodiacs : stars).forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.innerText = v;
        fortuneValSel.appendChild(opt);
    });
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
    if (btn.innerText === "시작") {
        btn.innerText = "일시정지";
        let time = 25 * 60;
        pomoInterval = setInterval(() => {
            time--;
            const m = Math.floor(time/60), s = time%60;
            document.getElementById('pomo-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            if (time <= 0) {
                clearInterval(pomoInterval);
                alert("집중 시간이 끝났습니다!");
            }
        }, 1000);
    } else {
        btn.innerText = "시작";
        clearInterval(pomoInterval);
    }
});
document.getElementById('pomo-reset')?.addEventListener('click', () => {
    clearInterval(pomoInterval);
    document.getElementById('pomo-display').innerText = "25:00";
    document.getElementById('pomo-start').innerText = "시작";
});

// --- Calm Air Engine ---
let breathInterval;
document.getElementById('breath-btn')?.addEventListener('click', (e) => {
    const btn = e.target;
    const txt = document.getElementById('breath-text');
    if (btn.innerText === "가이드 시작") {
        btn.innerText = "가이드 중단";
        let step = 0;
        const msgs = ["들이마시기", "멈추기", "내뱉기"];
        const loop = () => {
            txt.innerText = msgs[step % 3];
            step++;
            breathInterval = setTimeout(loop, 4000);
        };
        loop();
    } else {
        btn.innerText = "가이드 시작";
        txt.innerText = "준비";
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
    if (isNaN(val)) { res.innerText = "결과 대기 중"; return; }
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
    res.innerText = "생각 중...";
    setTimeout(() => {
        obj.style.transform = "rotateY(0deg)";
        const heads = Math.random() > 0.5;
        obj.innerText = heads ? "🌕" : "🌑";
        res.innerText = heads ? "앞면" : "뒷면";
    }, 600);
});

// Community Sync
document.getElementById('refresh-comments')?.addEventListener('click', () => resetDisqus(activeTabId));

switchTab('home');
