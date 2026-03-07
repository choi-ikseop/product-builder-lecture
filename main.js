const URL = "https://teachablemachine.withgoogle.com/models/nohC-dlRd/";
let model, webcam, labelContainer, maxPredictions;

const startBtn = document.getElementById('start-btn');
const themeToggle = document.getElementById('theme-toggle');
const webcamContainer = document.getElementById('webcam-container');

// 테마 상태 관리
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

const initialTheme = localStorage.getItem('theme') || 'light';
updateThemeUI(initialTheme === 'dark');

themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    updateThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Teachable Machine 로직
async function init() {
    startBtn.style.display = 'none';
    webcamContainer.style.display = 'block';
    
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(250, 250, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    
    for (let i = 0; i < maxPredictions; i++) {
        const wrapper = document.createElement("div");
        wrapper.className = "label-wrapper";
        wrapper.innerHTML = `
            <div class="label-text">
                <span class="class-name"></span>
                <span class="probability"></span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
        labelContainer.appendChild(wrapper);
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const prob = (prediction[i].probability * 100).toFixed(0);
        
        const wrapper = labelContainer.childNodes[i];
        wrapper.querySelector('.class-name').innerText = className;
        wrapper.querySelector('.probability').innerText = prob + "%";
        wrapper.querySelector('.progress-fill').style.width = prob + "%";
    }
}

startBtn.addEventListener('click', init);
