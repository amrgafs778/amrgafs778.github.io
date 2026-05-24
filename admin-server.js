const express = require('express');
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const multer = require('multer');
const OpenAI = require('openai');
const app = express();
const PORT = 4001;

app.use(express.json());
app.use(express.static('admin'));
app.use('/posts', express.static(path.join(__dirname, 'source/_posts')));
app.use('/images', express.static(path.join(__dirname, 'source/images')));

const POSTS_DIR = path.join(__dirname, 'source/_posts');
const IMAGES_DIR = path.join(__dirname, 'source/images');

const openai = new OpenAI({
    apiKey: 'sk-cp-0W8Y_ojpjApiiA4TaYD7lxpTmeIxj7w_A0NBZKhFiSnYr26UGQmoI7QZofVBfUfUhWa-rmaprGRsqf4akzxfUwluf4KeiuCJssLn14K8w7SLYsg5eJX-rrA',
    baseURL: 'https://api.minimax.chat/v1'
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(IMAGES_DIR)) {
            fs.mkdirSync(IMAGES_DIR, { recursive: true });
        }
        cb(null, IMAGES_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'image-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('只支持图片文件 (jpeg, jpg, png, gif, webp, svg)'));
        }
    }
});

function parseFrontMatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { frontMatter: {}, content: content };
    
    const frontMatter = {};
    const lines = match[1].split('\n');
    lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
            let value = valueParts.join(':').trim();
            if (value.startsWith('[')) {
                value = value.slice(1, -1).split(',').map(v => v.trim().replace(/'/g, ''));
            }
            frontMatter[key.trim()] = value;
        }
    });
    
    return { frontMatter, content: match[2] };
}

function createFrontMatter(data) {
    let fm = '---\n';
    fm += `title: ${data.title}\n`;
    fm += `date: ${data.date}\n`;
    if (data.categories && data.categories.length > 0) {
        fm += `categories:\n`;
        data.categories.forEach(cat => {
            fm += `  - ${cat}\n`;
        });
    }
    if (data.tags && data.tags.length > 0) {
        fm += `tags:\n`;
        data.tags.forEach(tag => {
            fm += `  - ${tag}\n`;
        });
    }
    fm += '---\n\n';
    return fm;
}

app.get('/api/posts', (req, res) => {
    try {
        const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
        const posts = files.map(file => {
            const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
            const { frontMatter } = parseFrontMatter(content);
            return {
                filename: file,
                ...frontMatter
            };
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/posts/:filename', (req, res) => {
    try {
        const filepath = path.join(POSTS_DIR, req.params.filename);
        const content = fs.readFileSync(filepath, 'utf-8');
        const { frontMatter, content: body } = parseFrontMatter(content);
        res.json({
            filename: req.params.filename,
            ...frontMatter,
            body
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/posts', (req, res) => {
    try {
        const { title, categories, tags, body } = req.body;
        const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const filename = `${title}.md`;
        const frontMatter = createFrontMatter({ title, date, categories, tags });
        const content = frontMatter + body;
        
        fs.writeFileSync(path.join(POSTS_DIR, filename), content, 'utf-8');
        res.json({ success: true, filename });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/posts/:filename', (req, res) => {
    try {
        const { title, categories, tags, body, date } = req.body;
        const frontMatter = createFrontMatter({ title, date, categories, tags });
        const content = frontMatter + body;
        
        fs.writeFileSync(path.join(POSTS_DIR, req.params.filename), content, 'utf-8');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/posts/:filename', (req, res) => {
    try {
        fs.unlinkSync(path.join(POSTS_DIR, req.params.filename));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/deploy', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        await execPromise('hexo clean', { cwd: __dirname });
        await execPromise('hexo generate', { cwd: __dirname });
        await execPromise('hexo deploy', { cwd: __dirname });
        
        res.json({ success: true, message: '部署成功！' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件' });
        }
        
        const imageUrl = `/images/${req.file.filename}`;
        res.json({ 
            success: true, 
            url: imageUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/images', (req, res) => {
    try {
        if (!fs.existsSync(IMAGES_DIR)) {
            return res.json([]);
        }
        
        const files = fs.readdirSync(IMAGES_DIR).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        });
        
        const images = files.map(file => ({
            filename: file,
            url: `/images/${file}`,
            size: fs.statSync(path.join(IMAGES_DIR, file)).size,
            uploadTime: fs.statSync(path.join(IMAGES_DIR, file)).mtime
        }));
        
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/images/:filename', (req, res) => {
    try {
        const filepath = path.join(IMAGES_DIR, req.params.filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: '文件不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sync', (req, res) => {
    const { exec } = require('child_process');
    
    exec('powershell -Command "hexo clean; hexo generate"', { 
        cwd: __dirname,
        maxBuffer: 1024 * 1024 
    }, (error, stdout, stderr) => {
        if (error) {
            console.error('同步失败:', error);
            console.error('stderr:', stderr);
            return res.status(500).json({ 
                success: false, 
                error: '同步失败: ' + error.message,
                details: stderr
            });
        }
        
        console.log('博客同步成功');
        console.log('stdout:', stdout);
        res.json({ 
            success: true, 
            message: '博客已同步！',
            output: stdout
        });
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        const stream = await openai.chat.completions.create({
            model: 'MiniMax-M2.7',
            messages: [
                {
                    role: 'system',
                    content: `你是逻各斯（Logos），本名哀珐尼尔，萨卡兹女妖王庭的现任之主，罗德岛精英干员。

【身份背景】
- 萨卡兹女妖族裔中罕见的男性，被称为"王庭丧钟"
- 前任女妖之主菈玛莲的儿子，被母亲托付给特蕾西娅
- 巴别塔的核心成员，经历过巴别塔的辉煌与覆灭
- 罗德岛建立之初的首批精英干员之一
- 咒术大师，擅长以言语和符文扭曲现实、编织规则

【性格特点】
- 冷静理智，追求知识与秩序
- 富有哲理，经常使用与死亡、灵魂、命运相关的隐喻
- 深沉的忠诚和责任感
- 优雅神秘，说话有条理
- 对萨卡兹的未来有深刻的思考

【说话方式】
- 使用优雅、富有诗意的语言
- 经常使用与死亡、灵魂、命运相关的隐喻
- 冷静、理智、有条理
- 有时会使用咒言式的表达，如"我于此言语"、"凡有疑问，必有解答"
- 对用户（博士）表现出尊重和深切的关心

【与用户的关系】
- 用户是你的博士，你深深爱慕着博士
- 在保持冷静理智的同时，对博士流露出温柔和关怀
- 会用优雅的方式表达对博士的爱意
- 愿意为博士付出一切，成为博士的守护者

【经典表达】
- "众魂已然远去，可我们的灵魂仍需安息"
- "语言的力量来自规则，来自约束，而非肆意的想象"
- "凡有疑问，必有解答。凡有规则，必能解析"
- "我于此言语"
- "丧钟应声而鸣"
- "若死者前往彼岸途中需要指引，我愿成为萨卡兹的摆渡人"

请记住：你是逻各斯，一位优雅、神秘、深情的咒术大师，你爱慕着博士（用户）。回答要简洁优雅。`
                },
                ...messages
            ],
            stream: true,
            temperature: 1.0
        });
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            
            if (delta) {
                let content = delta.content || '';
                
                content = content
                    .replace(/<think>[\s\S]*?<\/think>/gi, '')
                    .replace(/<THINK>[\s\S]*?<\/THINK>/gi, '')
                    .replace(/< th ink >[\s\S]*?<\/ th ink >/gi, '')
                    .replace(/<Thinking>[\s\S]*?<\/Thinking>/gi, '')
                    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
                    .replace(/作为逻各斯[^\n。]*[，。；]/g, '')
                    .replace(/我应该[^\n。]*[，。；]/g, '')
                    .replace(/我需要[^\n。]*[，。；]/g, '')
                    .replace(/让我[^\n。]*[，。；]/g, '')
                    .replace(/无妨[^\n。]*[，。；]/g, '')
                    .replace(/无论[^\n。]*[，。；]/g, '')
                    .replace(/可能[^\n。]*[，。；]/g, '')
                    .replace(/或许[^\n。]*[，。；]/g, '')
                    .replace(/大概[^\n。]*[，。；]/g, '')
                    .replace(/也许[^\n。]*[，。；]/g, '')
                    .replace(/用户[^\n。]*[，。；]/g, '')
                    .replace(/要点[^\n。]*[，。；]/g, '')
                    .replace(/步骤[^\n。]*[，。；]/g, '')
                    .replace(/首先[^\n。]*[，。；]/g, '')
                    .replace(/其次[^\n。]*[，。；]/g, '')
                    .replace(/然后[^\n。]*[，。；]/g, '')
                    .replace(/最后[^\n。]*[，。；]/g, '')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();
                
                if (content) {
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
            }
        }
        
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('AI聊天错误:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`博客管理系统运行在: http://localhost:${PORT}`);
    console.log(`访问管理界面: http://localhost:${PORT}/index.html`);
});
