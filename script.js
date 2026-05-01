// 更新时间
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0');
}
setInterval(updateClock, 1000);
updateClock();

// 基础页面切换逻辑
function openPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    
    if(pageId === 'settings') {
        document.getElementById('nav-bar').style.display = 'none';
        const savedKey = localStorage.getItem('user_api_key');
        if(savedKey) document.getElementById('api-key-input').value = savedKey;
    }
}

// 切换底部 Tab
function switchTab(tabId) {
    openPage(tabId);
    document.getElementById('nav-bar').style.display = 'flex';
    document.querySelectorAll('.nav-item').forEach((item, index) => {
        item.classList.remove('active');
        if(tabId === 'message' && index === 0) item.classList.add('active');
        if(tabId === 'contacts' && index === 1) item.classList.add('active');
    });
}

// 回桌面
function goHome() {
    openPage('home');
    document.getElementById('nav-bar').style.display = 'none';
    document.getElementById('chat-detail').classList.remove('open');
}

// 保存设置
function saveSettings() {
    const key = document.getElementById('api-key-input').value;
    localStorage.setItem('user_api_key', key);
    alert('API 设置已保存！');
    goHome();
}

// 聊天逻辑
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

function sendMessage() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('msg-container');
    if(!input.value.trim()) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg sent';
    msgDiv.innerText = input.value;
    container.appendChild(msgDiv);
    
    // 模拟自动回复
    const savedKey = localStorage.getItem('user_api_key');
    setTimeout(() => {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'msg recv';
        replyDiv.innerText = savedKey ? 'API 已设置成功！' : '请在设置中配置 API Key。';
        container.appendChild(replyDiv);
        container.scrollTop = container.scrollHeight;
    }, 1000);

    input.value = '';
    container.scrollTop = container.scrollHeight;
}
