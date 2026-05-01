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
    
    // 如果进入设置页，把保存的值显示出来
    if(pageId === 'settings') {
        document.getElementById('nav-bar').style.display = 'none';
        document.getElementById('api-url-input').value = localStorage.getItem('api_url') || '';
        document.getElementById('api-key-input').value = localStorage.getItem('api_key') || '';
        document.getElementById('api-model-input').value = localStorage.getItem('api_model') || 'gemini-2.5-pro';
    }
}

function switchTab(tabId) {
    openPage(tabId);
    document.getElementById('nav-bar').style.display = 'flex';
}

function goHome() {
    openPage('home');
    document.getElementById('nav-bar').style.display = 'none';
    document.getElementById('chat-detail').classList.remove('open');
}

// 保存设置
function saveSettings() {
    localStorage.setItem('api_url', document.getElementById('api-url-input').value);
    localStorage.setItem('api_key', document.getElementById('api-key-input').value);
    localStorage.setItem('api_model', document.getElementById('api-model-input').value);
    alert('配置已保存！');
    goHome();
}

function openChat(name) {
    document.getElementById('chat-user-name').innerText = name;
    document.getElementById('chat-detail').classList.add('open');
    document.getElementById('chat-detail').style.display = 'flex';
}

function closeChat() {
    document.getElementById('chat-detail').classList.remove('open');
    setTimeout(() => { document.getElementById('chat-detail').style.display = 'none'; }, 300);
}

// 核心功能：发送消息并呼叫 AI
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('msg-container');
    const text = input.value.trim();
    if(!text) return;

    // 显示用户消息
    const myMsg = document.createElement('div');
    myMsg.className = 'msg sent';
    myMsg.innerText = text;
    container.appendChild(myMsg);
    input.value = '';

    // 获取配置
    const url = localStorage.getItem('api_url');
    const key = localStorage.getItem('api_key');
    const model = localStorage.getItem('api_model');

    if(!key || !url) {
        alert('请先去设置页面配置 API 密钥和地址！');
        return;
    }

    // 显示“正在思考...”
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'msg recv';
    loadingMsg.innerText = '正在思考...';
    container.appendChild(loadingMsg);
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(`${url}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{role: "user", content: text}]
            })
        });

        const data = await response.json();
        // 提取 AI 回复的内容
        loadingMsg.innerText = data.choices[0].message.content;
    } catch (error) {
        loadingMsg.innerText = '出错了: ' + error.message;
    }
    container.scrollTop = container.scrollHeight;
}
