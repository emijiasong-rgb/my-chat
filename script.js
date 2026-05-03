// === 1. 基础系统功能 ===

// 星期映射
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// 更新网络状态
function updateNetworkStatus() {
    const networkIcon = document.getElementById('network-icon');
    if (!networkIcon) return;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let bars = 4; 
    if (connection) {
        const type = connection.effectiveType || connection.type;
        if (type === '4g' || type === 'wifi') bars = 4;
        else if (type === '3g') bars = 3;
        else if (type === '2g') bars = 2;
        else if (type === 'slow-2g') bars = 1;
    }
    if (!navigator.onLine) bars = 0;
    const rects = networkIcon.querySelectorAll('rect');
    rects.forEach((rect, index) => {
        rect.setAttribute('opacity', index < bars ? '1' : '0.3');
    });
}

// 更新电量状态
function updateBatteryStatus() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            updateBatteryUI(battery);
            battery.addEventListener('levelchange', () => updateBatteryUI(battery));
            battery.addEventListener('chargingchange', () => updateBatteryUI(battery));
        });
    }
}

function updateBatteryUI(battery) {
    const level = Math.round(battery.level * 100);
    const isCharging = battery.charging;
    const batteryPercent = document.getElementById('battery-percent');
    const batteryLevel = document.getElementById('battery-level');
    if (batteryPercent) batteryPercent.textContent = level + '%';
    if (batteryLevel) {
        batteryLevel.setAttribute('width', Math.round((level / 100) * 18));
        batteryLevel.setAttribute('fill', isCharging ? '#34c759' : (level <= 20 ? '#ff3b30' : 'currentColor'));
    }
}

// 更新时钟
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    if(document.getElementById('clock')) document.getElementById('clock').innerText = h + ":" + m;
    if(document.getElementById('big-time')) document.getElementById('big-time').innerText = h + ":" + m;
    
    const dateStr = String(now.getMonth() + 1).padStart(2, '0') + "/" + String(now.getDate()).padStart(2, '0') + " " + weekDays[now.getDay()] + ".";
    if(document.getElementById('big-date')) document.getElementById('big-date').innerText = dateStr;
}

// 页面切换
function openPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById('page-' + pageId);
    if(targetPage) targetPage.classList.add('active');
    
    if(pageId === 'settings') {
        document.getElementById('nav-bar').style.display = 'none';
        document.getElementById('api-url-input').value = localStorage.getItem('api_url') || '';
        document.getElementById('api-key-input').value = localStorage.getItem('api_key') || '';
        document.getElementById('api-model-input').value = localStorage.getItem('api_model') || '';
        // 同步字体下拉框
        const savedFont = localStorage.getItem('user-font') || 'default';
        if(document.getElementById('font-family-select')) document.getElementById('font-family-select').value = savedFont;
    }
}

function switchTab(tabId) {
    openPage(tabId);
    document.getElementById('nav-bar').style.display = 'flex';
}

function goHome() {
    openPage('home');
    document.getElementById('nav-bar').style.display = 'none';
}

// === 2. 配置与字体核心逻辑 ===

// 字体应用函数
function applyFont(fontKey) {
    document.body.classList.remove('font-cute', 'font-serif', 'font-modern');
    if (fontKey && fontKey !== 'default') {
        document.body.classList.add('font-' + fontKey);
    }
}

// 唯一的保存函数 (API + 字体)
function saveSettings() {
    // 1. 保存 API 基础配置
    localStorage.setItem('api_url', document.getElementById('api-url-input').value);
    localStorage.setItem('api_key', document.getElementById('api-key-input').value);
    localStorage.setItem('api_model', document.getElementById('api-model-input').value);
    
    // 2. 保存并应用字体配置
    const fontSelect = document.getElementById('font-family-select');
    if (fontSelect) {
        const selectedFont = fontSelect.value;
        localStorage.setItem('user-font', selectedFont);
        applyFont(selectedFont); 
    }

    alert('所有配置已成功保存！');
    goHome();
}

// 拉取模型
async function fetchModels() {
    const url = document.getElementById('api-url-input').value;
    const key = document.getElementById('api-key-input').value;
    const listContainer = document.getElementById('model-list-container');
    if (!url || !key) { alert('请先填写地址和密钥！'); return; }

    listContainer.style.display = 'block';
    listContainer.innerHTML = '<div style="padding: 10px;">正在连接...</div>';

    try {
        const response = await fetch(`${url}/v1/models`, {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        const data = await response.json();
        if (data.data) {
            listContainer.innerHTML = '';
            data.data.forEach(m => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 12px; border-bottom: 0.5px solid #eee; cursor: pointer;';
                item.innerText = m.id;
                item.onclick = () => {
                    document.getElementById('api-model-input').value = m.id;
                    listContainer.style.display = 'none';
                };
                listContainer.appendChild(item);
            });
        }
    } catch (e) { listContainer.innerHTML = '拉取失败: ' + e.message; }
}

// === 3. 聊天逻辑 ===

function openChat(name) {
    document.getElementById('chat-user-name').innerText = name;
    const detail = document.getElementById('chat-detail');
    detail.classList.add('open');
    detail.style.display = 'flex';
}

function closeChat() {
    document.getElementById('chat-detail').classList.remove('open');
    setTimeout(() => { document.getElementById('chat-detail').style.display = 'none'; }, 300);
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('msg-container');
    const text = input.value.trim();
    if(!text) return;

    const myMsg = document.createElement('div');
    myMsg.className = 'msg sent';
    myMsg.innerText = text;
    container.appendChild(myMsg);
    input.value = '';

    const url = localStorage.getItem('api_url');
    const key = localStorage.getItem('api_key');
    const model = localStorage.getItem('api_model');
    if(!key || !url || !model) { alert('配置不完整！'); return; }

    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'msg recv';
    loadingMsg.innerText = '正在思考...';
    container.appendChild(loadingMsg);

    try {
        const response = await fetch(`${url}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({ model: model, messages: [{role: "user", content: text}] })
        });
        const data = await response.json();
        loadingMsg.innerText = data.choices[0].message.content;
    } catch (e) { loadingMsg.innerText = '错误: ' + e.message; }
    container.scrollTop = container.scrollHeight;
}

// === 4. 统一初始化入口 ===

document.addEventListener('DOMContentLoaded', () => {
    // 启动时钟和状态
    updateClock();
    setInterval(updateClock, 1000);
    updateNetworkStatus();
    updateBatteryStatus();

    // 恢复全局字体
    const savedFont = localStorage.getItem('user-font');
    if (savedFont) applyFont(savedFont);

    // 恢复头像和背景
    const savedAvatar = localStorage.getItem('savedAvatar');
    const savedBanner = localStorage.getItem('savedBanner');
    if (savedAvatar && document.getElementById('user-avatar')) document.getElementById('user-avatar').src = savedAvatar;
    if (savedBanner && document.getElementById('profile-banner')) document.getElementById('profile-banner').style.backgroundImage = `url(${savedBanner})`;

    // 设置图片上传监听
    const avInput = document.getElementById('avatar-upload');
    const baInput = document.getElementById('banner-upload');
    if(avInput) avInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => { 
            document.getElementById('user-avatar').src = ev.target.result;
            localStorage.setItem('savedAvatar', ev.target.result); 
        };
        reader.readAsDataURL(e.target.files[0]);
    });
    if(baInput) baInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => { 
            document.getElementById('profile-banner').style.backgroundImage = `url(${ev.target.result})`;
            localStorage.setItem('savedBanner', ev.target.result); 
        };
        reader.readAsDataURL(e.target.files[0]);
    });
});
