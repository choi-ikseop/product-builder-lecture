const URL = "https://teachablemachine.withgoogle.com/models/Yza9DNKd3/";
let model, labelContainer;

// DOM 요소
const themeToggle = document.getElementById('theme-toggle');
const tabContents = document.querySelectorAll('.tab-content');
const toolsLayout = document.getElementById('tools-layout');

// 1. 테마 관리
const updateThemeUI = (isDark) => {
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '🌙';
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '☀️';
    }
};
updateThemeUI(localStorage.getItem('theme') === 'dark');
themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    updateThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 2. Disqus 및 탭 전환
function resetDisqus(tabId) {
    const baseUrl = window.location.origin + window.location.pathname;
    const pageUrl = tabId === 'home' ? baseUrl : baseUrl + "#!" + tabId;
    const identifier = "daily-tools-v10-" + tabId;
    const discussionTitle = document.getElementById('discussion-title');
    if (discussionTitle) discussionTitle.innerText = `💬 ${tabId.toUpperCase()} 게시판`;

    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({ reload: true, config: function () { this.page.identifier = identifier; this.page.url = pageUrl; } });
    }
}

function switchTab(tabId) {
    const topSections = ['home', 'inquiry'];
    const isTool = !topSections.includes(tabId);
    
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) btn.classList.add('active');
    });

    if (isTool) {
        toolsLayout.classList.remove('hidden');
        topSections.forEach(s => document.getElementById(`${s}-section`).classList.add('hidden'));
    } else {
        toolsLayout.classList.add('hidden');
        topSections.forEach(s => {
            const el = document.getElementById(`${s}-section`);
            tabId === s ? el.classList.remove('hidden') : el.classList.add('hidden');
        });
    }

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

// 3. 도구별 로직
// --- Lotto ---
document.getElementById('generate-btn')?.addEventListener('click', () => {
    const container = document.getElementById('numbers');
    container.innerHTML = '';
    const nums = new Set();
    while (nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
    [...nums].sort((a,b)=>a-b).forEach(n => {
        const div = document.createElement('div');
        div.className = 'number';
        div.textContent = n;
        container.appendChild(div);
    });
});

// --- AI Gender (updated) ---
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
        document.getElementById('loading-spinner').style.display = 'block';
        await initModel();
        const pred = await model.predict(img);
        const container = document.getElementById('label-container');
        container.innerHTML = '';
        pred.sort((a,b)=>b.probability-a.probability).forEach(p => {
            const prob = (p.probability*100).toFixed(0);
            container.innerHTML += `<div class="label-wrapper"><div class="label-text"><span>${p.className}</span><span>${prob}%</span></div><div class="progress-bar"><div class="progress-fill" style="width:${prob}%"></div></div></div>`;
        });
        document.getElementById('loading-spinner').style.display = 'none';
    };
    reader.readAsDataURL(file);
});

// --- Fortune ---
const fortunes = ["오늘은 뜻밖의 행운이 찾아옵니다.", "신중한 판단이 필요한 하루입니다.", "주변 사람과의 대화에서 답을 찾으세요.", "미뤄왔던 일을 시작하기 좋은 날입니다.", "금전운이 상승하고 있습니다.", "건강을 위해 가벼운 산책을 추천합니다."];
const items = { zodiac: ["쥐띠", "소띠", "호랑이띠", "토끼띠", "용띠", "뱀띠", "말띠", "양띠", "원숭이띠", "닭띠", "개띠", "돼지띠"], star: ["물병자리", "물고기자리", "양자리", "황소자리", "쌍둥이자리", "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "궁수자리", "염소자리"] };
const typeSel = document.getElementById('fortune-type');
const valSel = document.getElementById('fortune-val');
const updateVal = () => { valSel.innerHTML = ''; items[typeSel.value].forEach(v => valSel.innerHTML += `<option>${v}</option>`); };
typeSel?.addEventListener('change', updateVal);
updateVal();
document.getElementById('get-fortune-btn')?.addEventListener('click', () => {
    const res = document.getElementById('fortune-result');
    res.innerText = fortunes[Math.floor(Math.random()*fortunes.length)];
    res.classList.remove('hidden');
});

// --- Breath ---
let breathing = false;
document.getElementById('breath-btn')?.addEventListener('click', (e) => {
    breathing = !breathing;
    const txt = document.getElementById('breath-text');
    e.target.innerText = breathing ? "가이드 중단" : "가이드 시작";
    if (breathing) {
        let step = 0;
        const cycle = () => {
            if (!breathing) return;
            const msgs = ["숨 들이마시기", "멈추기", "숨 내뱉기"];
            txt.innerText = msgs[step % 3];
            step++;
            setTimeout(cycle, 4000);
        };
        cycle();
    } else { txt.innerText = "준비"; }
});

// --- Pomodoro ---
let pomoInt;
document.getElementById('pomo-start')?.addEventListener('click', (e) => {
    if (e.target.innerText === "시작") {
        e.target.innerText = "일시정지";
        let time = 25 * 60;
        pomoInt = setInterval(() => {
            time--;
            const m = Math.floor(time/60), s = time%60;
            document.getElementById('pomo-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            if (time <= 0) clearInterval(pomoInt);
        }, 1000);
    } else {
        e.target.innerText = "시작";
        clearInterval(pomoInt);
    }
});
document.getElementById('pomo-reset')?.addEventListener('click', () => {
    clearInterval(pomoInt);
    document.getElementById('pomo-display').innerText = "25:00";
    document.getElementById('pomo-start').innerText = "시작";
});

// --- Quote ---
const quotes = [
    {t: "가장 큰 위험은 위험을 감수하지 않는 것이다.", a: "마크 저커버그"},
    {t: "어제보다 나은 오늘을 만드는 것은 당신의 몫이다.", a: "알 수 없음"},
    {t: "성공은 최종적인 것이 아니며, 실패는 치명적인 것이 아니다.", a: "윈스턴 처칠"},
    {t: "시작하는 방법은 말을 그만두고 행동하는 것이다.", a: "월트 디즈니"}
];
document.getElementById('new-quote-btn')?.addEventListener('click', () => {
    const q = quotes[Math.floor(Math.random()*quotes.length)];
    document.getElementById('quote-text').innerText = `"${q.t}"`;
    document.getElementById('quote-author').innerText = `- ${q.a}`;
});

// --- Unit ---
document.getElementById('unit-input')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const mode = document.getElementById('unit-mode').value;
    const res = document.getElementById('unit-result');
    if (isNaN(val)) { res.innerText = "값을 입력하세요."; return; }
    let out = "";
    if (mode === 'py') out = `${(val * 3.3057).toFixed(2)} ㎡`;
    else if (mode === 'm2') out = `${(val / 3.3057).toFixed(2)} 평`;
    else if (mode === 'in') out = `${(val * 2.54).toFixed(2)} ㎝`;
    else if (mode === 'cm') out = `${(val / 2.54).toFixed(2)} 인치`;
    res.innerText = `결과: ${out}`;
});

// --- Password ---
document.getElementById('gen-pass-btn')?.addEventListener('click', () => {
    const len = document.getElementById('pass-len').value;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let ret = "";
    for (let i = 0; i < len; i++) ret += charset.charAt(Math.floor(Math.random() * charset.length));
    document.getElementById('pass-result').innerText = ret;
});

// --- Coin ---
document.getElementById('flip-coin-btn')?.addEventListener('click', () => {
    const obj = document.getElementById('coin-obj');
    const res = document.getElementById('coin-result');
    obj.classList.add('flip');
    res.innerText = "던지는 중...";
    setTimeout(() => {
        obj.classList.remove('flip');
        const side = Math.random() > 0.5 ? "앞면" : "뒷면";
        obj.innerText = side === "앞면" ? "🌕" : "🌑";
        res.innerText = `결과는 [${side}] 입니다!`;
    }, 600);
});

switchTab('home');
