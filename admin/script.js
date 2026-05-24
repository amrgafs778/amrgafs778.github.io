const API_BASE = '';

document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupTabs();
    setupForm();
    setupDragDrop();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
            
            if (targetId === 'deploy') {
                updatePostCount();
            }
            
            if (targetId === 'images') {
                loadImages();
            }
        });
    });
}

function setupForm() {
    const form = document.getElementById('post-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePost();
    });
}

async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE}/api/posts`);
        const posts = await response.json();
        
        const postsList = document.getElementById('posts-list');
        postsList.innerHTML = '';
        
        if (posts.length === 0) {
            postsList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">还没有文章，点击"新建文章"开始创作吧！</p>';
            return;
        }
        
        posts.forEach(post => {
            const card = createPostCard(post);
            postsList.appendChild(card);
        });
    } catch (error) {
        console.error('加载文章失败:', error);
        alert('加载文章失败，请检查服务器是否运行');
    }
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const categories = post.categories ? 
        (Array.isArray(post.categories) ? post.categories.join(', ') : post.categories) : '';
    const tags = post.tags ? 
        (Array.isArray(post.tags) ? post.tags.join(', ') : post.tags) : '';
    
    card.innerHTML = `
        <h3>${post.title || '无标题'}</h3>
        <div class="meta">
            <span>📅 ${post.date || '未知日期'}</span>
            ${categories ? `<span>📁 ${categories}</span>` : ''}
            ${tags ? `<span>🏷️ ${tags}</span>` : ''}
        </div>
        <div class="post-actions">
            <button class="edit-btn" onclick="editPost('${post.filename}')">编辑</button>
            <button class="delete-btn" onclick="deletePost('${post.filename}')">删除</button>
        </div>
    `;
    
    return card;
}

function showNewPost() {
    document.getElementById('editor-title').textContent = '新建文章';
    document.getElementById('post-form').reset();
    document.getElementById('post-filename').value = '';
    
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="new"]').classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('new').classList.add('active');
}

async function editPost(filename) {
    try {
        const response = await fetch(`${API_BASE}/api/posts/${filename}`);
        const post = await response.json();
        
        document.getElementById('editor-title').textContent = '编辑文章';
        document.getElementById('post-filename').value = filename;
        document.getElementById('post-title').value = post.title || '';
        document.getElementById('post-categories').value = 
            post.categories ? (Array.isArray(post.categories) ? post.categories.join(', ') : post.categories) : '';
        document.getElementById('post-tags').value = 
            post.tags ? (Array.isArray(post.tags) ? post.tags.join(', ') : post.tags) : '';
        document.getElementById('post-content').value = post.body || '';
        
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="new"]').classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById('new').classList.add('active');
    } catch (error) {
        console.error('加载文章失败:', error);
        alert('加载文章失败');
    }
}

async function savePost() {
    const filename = document.getElementById('post-filename').value;
    const title = document.getElementById('post-title').value;
    const categoriesStr = document.getElementById('post-categories').value;
    const tagsStr = document.getElementById('post-tags').value;
    const body = document.getElementById('post-content').value;
    
    const categories = categoriesStr ? categoriesStr.split(',').map(c => c.trim()) : [];
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];
    
    const postData = {
        title,
        categories,
        tags,
        body,
        date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    };
    
    try {
        let response;
        if (filename) {
            response = await fetch(`${API_BASE}/api/posts/${filename}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
        } else {
            response = await fetch(`${API_BASE}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('文章保存成功！');
            loadPosts();
            
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelector('[data-tab="posts"]').classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('posts').classList.add('active');
        } else {
            alert('保存失败：' + result.error);
        }
    } catch (error) {
        console.error('保存文章失败:', error);
        alert('保存文章失败');
    }
}

async function deletePost(filename) {
    if (!confirm('确定要删除这篇文章吗？此操作不可恢复！')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/posts/${filename}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('文章已删除');
            loadPosts();
        } else {
            alert('删除失败：' + result.error);
        }
    } catch (error) {
        console.error('删除文章失败:', error);
        alert('删除文章失败');
    }
}

function previewPost() {
    const title = document.getElementById('post-title').value || '无标题';
    const content = document.getElementById('post-content').value;
    
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = `
        <h1>${title}</h1>
        <div>${marked.parse(content)}</div>
    `;
    
    document.getElementById('preview-modal').style.display = 'block';
}

function closePreview() {
    document.getElementById('preview-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('preview-modal');
    if (event.target == modal) {
        closePreview();
    }
}

async function syncBlog() {
    const syncText = document.getElementById('sync-text');
    const syncLoading = document.getElementById('sync-loading');
    const syncStatus = document.getElementById('sync-status');
    
    syncText.style.display = 'none';
    syncLoading.style.display = 'inline';
    syncStatus.className = 'status-message';
    syncStatus.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE}/api/sync`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        syncText.style.display = 'inline';
        syncLoading.style.display = 'none';
        
        if (result.success) {
            syncStatus.className = 'status-message success';
            syncStatus.textContent = '✓ 同步成功！博客已更新，访问 http://localhost:4000 查看效果';
        } else {
            syncStatus.className = 'status-message error';
            syncStatus.textContent = '✗ 同步失败：' + result.error;
        }
    } catch (error) {
        syncText.style.display = 'inline';
        syncLoading.style.display = 'none';
        syncStatus.className = 'status-message error';
        syncStatus.textContent = '✗ 同步失败：' + error.message;
    }
}

async function deployBlog() {
    const deployText = document.getElementById('deploy-text');
    const deployLoading = document.getElementById('deploy-loading');
    const deployStatus = document.getElementById('deploy-status');
    
    deployText.style.display = 'none';
    deployLoading.style.display = 'inline';
    deployStatus.className = 'status-message';
    deployStatus.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE}/api/deploy`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        deployText.style.display = 'inline';
        deployLoading.style.display = 'none';
        
        if (result.success) {
            deployStatus.className = 'status-message success';
            deployStatus.textContent = '✓ 部署成功！请访问 https://amrgafs778.github.io 查看你的博客';
        } else {
            deployStatus.className = 'status-message error';
            deployStatus.textContent = '✗ 部署失败：' + result.error;
        }
    } catch (error) {
        deployText.style.display = 'inline';
        deployLoading.style.display = 'none';
        deployStatus.className = 'status-message error';
        deployStatus.textContent = '✗ 部署失败：' + error.message;
    }
}

async function updatePostCount() {
    try {
        const response = await fetch(`${API_BASE}/api/posts`);
        const posts = await response.json();
        document.getElementById('post-count').textContent = posts.length;
    } catch (error) {
        document.getElementById('post-count').textContent = '0';
    }
}

function setupDragDrop() {
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#FF69B4';
        uploadArea.style.background = 'rgba(255, 182, 193, 0.2)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#FFB6C1';
        uploadArea.style.background = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#FFB6C1';
        uploadArea.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadMultipleImages(files);
        }
    });
}

function insertImage() {
    document.getElementById('image-upload').click();
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const textarea = document.getElementById('post-content');
            const imageMarkdown = `![${file.name}](${result.url})`;
            
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            
            textarea.value = text.substring(0, start) + imageMarkdown + text.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
            textarea.focus();
            
            alert('图片上传成功！已插入到文章中。');
        } else {
            alert('上传失败：' + result.error);
        }
    } catch (error) {
        console.error('上传图片失败:', error);
        alert('上传图片失败');
    }
    
    event.target.value = '';
}

async function handleMultipleImageUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    await uploadMultipleImages(files);
    event.target.value = '';
}

async function uploadMultipleImages(files) {
    const statusDiv = document.getElementById('upload-status');
    statusDiv.className = 'status-message';
    statusDiv.textContent = `正在上传 ${files.length} 张图片...`;
    statusDiv.style.display = 'block';
    
    let successCount = 0;
    let failCount = 0;
    
    for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            failCount++;
        }
    }
    
    if (failCount === 0) {
        statusDiv.className = 'status-message success';
        statusDiv.textContent = `✓ 成功上传 ${successCount} 张图片！`;
    } else {
        statusDiv.className = 'status-message error';
        statusDiv.textContent = `上传完成：成功 ${successCount} 张，失败 ${failCount} 张`;
    }
    
    loadImages();
}

async function loadImages() {
    try {
        const response = await fetch(`${API_BASE}/api/images`);
        const images = await response.json();
        
        const grid = document.getElementById('images-grid');
        grid.innerHTML = '';
        
        if (images.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px; grid-column: 1/-1;">还没有上传图片</p>';
            return;
        }
        
        images.forEach(image => {
            const card = createImageCard(image);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('加载图片失败:', error);
    }
}

function createImageCard(image) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const size = formatFileSize(image.size);
    const date = new Date(image.uploadTime).toLocaleDateString('zh-CN');
    
    card.innerHTML = `
        <img src="${image.url}" alt="${image.filename}" loading="lazy">
        <div class="image-info">
            <p><strong>${image.filename}</strong></p>
            <p>大小：${size}</p>
            <p>上传时间：${date}</p>
            <div class="image-actions">
                <button class="copy-btn" onclick="copyImageUrl('${image.url}')">复制链接</button>
                <button class="delete-image-btn" onclick="deleteImage('${image.filename}')">删除</button>
            </div>
        </div>
    `;
    
    return card;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function copyImageUrl(url) {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
        alert('图片链接已复制：' + fullUrl);
    }).catch(() => {
        prompt('复制以下链接：', fullUrl);
    });
}

async function deleteImage(filename) {
    if (!confirm('确定要删除这张图片吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/images/${filename}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('图片已删除');
            loadImages();
        } else {
            alert('删除失败：' + result.error);
        }
    } catch (error) {
        console.error('删除图片失败:', error);
        alert('删除图片失败');
    }
}

function insertLink() {
    const url = prompt('请输入链接地址：', 'https://');
    if (!url) return;
    
    const text = prompt('请输入链接文本：', '链接文本');
    if (!text) return;
    
    const textarea = document.getElementById('post-content');
    const linkMarkdown = `[${text}](${url})`;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = textarea.value;
    
    textarea.value = content.substring(0, start) + linkMarkdown + content.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + linkMarkdown.length;
    textarea.focus();
}

function insertCode() {
    const code = prompt('请输入代码：');
    if (!code) return;
    
    const textarea = document.getElementById('post-content');
    const codeMarkdown = `\`\`\`\n${code}\n\`\`\``;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = textarea.value;
    
    textarea.value = content.substring(0, start) + codeMarkdown + content.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + codeMarkdown.length;
    textarea.focus();
}

let chatMessages = [];

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const sendText = document.getElementById('send-text');
    const sendLoading = document.getElementById('send-loading');
    
    sendText.style.display = 'none';
    sendLoading.style.display = 'inline';
    
    addMessage('user', message);
    input.value = '';
    
    chatMessages.push({
        role: 'user',
        content: message
    });
    
    try {
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: chatMessages
            })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        
        addMessage('assistant', '');
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        break;
                    }
                    
                    try {
                        const json = JSON.parse(data);
                        if (json.content) {
                            assistantMessage += json.content;
                            updateLastMessage(assistantMessage);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }
        
        chatMessages.push({
            role: 'assistant',
            content: assistantMessage
        });
        
    } catch (error) {
        console.error('发送消息失败:', error);
        addMessage('assistant', '抱歉，发生了错误：' + error.message);
    }
    
    sendText.style.display = 'inline';
    sendLoading.style.display = 'none';
}

function addMessage(role, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatar = role === 'user' ? '👤' : '<img src="logos_avatar.webp" alt="逻各斯" />';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${formatMessage(content)}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateLastMessage(content) {
    const messagesContainer = document.getElementById('chat-messages');
    const lastMessage = messagesContainer.lastElementChild;
    if (lastMessage) {
        const contentDiv = lastMessage.querySelector('.message-content');
        if (contentDiv) {
            contentDiv.innerHTML = formatMessage(content);
        }
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessage(content) {
    return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
