(function() {
    const messages = [
        "你好呀！欢迎来到我的博客~",
        "今天也要加油哦！",
        "有什么想了解的吗？",
        "希望你能喜欢这里的内容！",
        "记得多喝水，注意休息~",
        "博客还在不断完善中呢~",
        "感谢你的访问！",
        "有什么建议可以留言哦~",
        "今天天气真不错呢！",
        "加油，你是最棒的！",
        "看到你真开心！",
        "希望你能找到想要的内容~",
        "记得常来看看我哦~",
        "博客会越来越好的！",
        "你的支持是我最大的动力！"
    ];

    const hoverMessages = [
        "嘿嘿，你在看什么？",
        "想和我聊天吗？",
        "点我试试看~",
        "我在这里等你哦~"
    ];

    let messageTimeout = null;
    let isShowingMessage = false;

    function createMessageBubble() {
        const bubble = document.createElement('div');
        bubble.id = 'live2d-message';
        bubble.style.cssText = `
            position: fixed;
            right: 350px;
            bottom: 280px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px 20px;
            border-radius: 15px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            color: #333;
            max-width: 250px;
            z-index: 9999;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
        `;
        document.body.appendChild(bubble);
        return bubble;
    }

    function showMessage(message, duration = 4000) {
        if (isShowingMessage) return;
        
        let bubble = document.getElementById('live2d-message');
        if (!bubble) {
            bubble = createMessageBubble();
        }

        isShowingMessage = true;
        bubble.textContent = message;
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';

        if (messageTimeout) {
            clearTimeout(messageTimeout);
        }

        messageTimeout = setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateY(10px)';
            setTimeout(() => {
                isShowingMessage = false;
            }, 300);
        }, duration);
    }

    function getRandomMessage(messageArray) {
        return messageArray[Math.floor(Math.random() * messageArray.length)];
    }

    function initLive2DInteraction() {
        const checkLive2D = setInterval(() => {
            const live2dCanvas = document.getElementById('live2d') || 
                                document.querySelector('canvas[style*="live2d"]') ||
                                document.querySelector('#waifu canvas');
            
            if (live2dCanvas) {
                clearInterval(checkLive2D);
                
                live2dCanvas.style.cursor = 'pointer';
                
                live2dCanvas.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showMessage(getRandomMessage(messages), 5000);
                });

                live2dCanvas.addEventListener('mouseenter', function() {
                    if (!isShowingMessage) {
                        showMessage(getRandomMessage(hoverMessages), 3000);
                    }
                });

                setTimeout(() => {
                    showMessage("欢迎来到我的博客！我是初音未来~", 6000);
                }, 2000);
            }
        }, 500);

        setTimeout(() => {
            clearInterval(checkLive2D);
        }, 10000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLive2DInteraction);
    } else {
        initLive2DInteraction();
    }

    setInterval(() => {
        if (!isShowingMessage && Math.random() < 0.1) {
            showMessage(getRandomMessage(messages), 4000);
        }
    }, 30000);
})();
