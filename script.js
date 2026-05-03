// === 1. 基础系统功能 ===

// 星期映射（中英文）
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const weekDaysCN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 更新顶部状态栏时间
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = hours + ":" + minutes;
    
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = timeStr;
}

// 更新名片区域的大时钟
function updateBigClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekDay = weekDays[now.getDay()];
    
    const bigTimeEl = document.getElementById('big-time');
    const bigDateEl = document.getElementById('big-date');
    
    if(bigTimeEl) bigTimeEl.innerText = hours + ":" + minutes;
    if(bigDateEl) bigDateEl.innerText = month + "/" + day + " " + weekDay + ".";
}

// 每秒更新时间
setInterval(() => {
    updateClock();
    updateBigClock();
}, 1000);

// 初始化
updateClock();
updateBigClock();

// 基础页面切换逻辑
function openPage(pageId) {
    // 隐藏所有页面，显示目标页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById('page-' + pageId);
    if(targetPage) targetPage.classList.add('active');
    
    // 如果进入设置页，自动从本地存储读取并填充输入框
    if(pageId === 'settings') {
        document.getElementById('nav-bar').style.display = 'none';
        document.getElementById('api-url-input').value = localStorage.getItem('api_url') || '';
        document.getElementById('api-key-input').value = localStorage.getItem('api_key') || '';
        document.getElementById('api-model-input').value = localStorage.getItem('api_model') || '';
    }
}

// 切换底部 Tab（微信、联系人等）
function switchTab(tabId) {
    openPage(tabId);
    document.getElementById('nav-bar').style.display = 'flex';
}

// 返回桌面
function goHome() {
    openPage('home');
    document.getElementById('nav-bar').style.display = 'none';
    const chatDetail = document.getElementById('chat-detail');
    if(chatDetail) chatDetail.classList.remove('open');
}

// === 2. API 配置与模型拉取 ===

// 联网拉取模型列表
async function fetchModels() {
    const url = document.getElementById('api-url-input').value;
    const key = document.getElementById('api-key-input').value;
    const listContainer = document.getElementById('model-list-container');

    if (!url || !key) {
        alert('请先填写 API 地址和密钥后再拉取！');
        return;
    }

    listContainer.style.display = 'block';
    listContainer.innerHTML = '<div style="padding: 10px; color: #666;">正在连接服务器拉取模型...</div>';

    try {
        // 请求 API 站点的模型列表接口
        const response = await fetch(`${url}/v1/models`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${key}` }
        });

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            listContainer.innerHTML = ''; 
            data.data.forEach(model => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 12px; border-bottom: 0.5px solid #eee; cursor: pointer; color: #333;';
                item.innerText = model.id;
                
                // 点击模型项：自动填充并隐藏列表
                item.onclick = function() {
                    document.getElementById('api-model-input').value = model.id;
                    listContainer.style.display = 'none';
                    item.style.background = '#f0f0f0';
                };
                listContainer.appendChild(item);
            });
        } else {
            listContainer.innerHTML = '<div style="padding: 10px; color: red;">未获取到模型数据，请检查地址或Key</div>';
        }
    } catch (error) {
        listContainer.innerHTML = `<div style="padding: 10px; color: red;">连接失败: ${error.message}</div>`;
    }
}

// 保存所有设置到本地
function saveSettings() {
    localStorage.setItem('api_url', document.getElementById('api-url-input').value);
    localStorage.setItem('api_key', document.getElementById('api-key-input').value);
    localStorage.setItem('api_model', document.getElementById('api-model-input').value);
    alert('API 配置已成功保存！');
    goHome();
}

// === 3. 聊天逻辑 ===

function openChat(name) {
    document.getElementById('chat-user-name').innerText = name;
    const detail = document.getElementById('chat-detail');
    detail.classList.add('open');
    detail.style.display = 'flex';
}

function closeChat() {
    const detail = document.getElementById('chat-detail');
    detail.classList.remove('open');
    setTimeout(() => { detail.style.display = 'none'; }, 300);
}

// 发送消息并调用 AI 接口
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('msg-container');
    const text = input.value.trim();
    if(!text) return;

    // 显示用户发送的消息
    const myMsg = document.createElement('div');
    myMsg.className = 'msg sent';
    myMsg.innerText = text;
    container.appendChild(myMsg);
    input.value = '';

    // 读取配置
    const url = localStorage.getItem('api_url');
    const key = localStorage.getItem('api_key');
    const model = localStorage.getItem('api_model');

    if(!key || !url || !model) {
        alert('配置不完整，请先去“设置”页面完成配置并保存！');
        return;
    }

    // 显示 AI 正在输入的提示
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'msg recv';
    loadingMsg.innerText = '正在思考...';
    container.appendChild(loadingMsg);
    container.scrollTop = container.scrollHeight;

    try {
        // 调用 AI 对话接口
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
        if(data.choices && data.choices[0]) {
            loadingMsg.innerText = data.choices[0].message.content;
        } else {
            loadingMsg.innerText = "收到异常回复，请检查 API 状态。";
        }
    } catch (error) {
        loadingMsg.innerText = '请求失败: ' + error.message;
    }
    container.scrollTop = container.scrollHeight;
}
