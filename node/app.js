const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');



const app = express();
const PORT = process.env.PORT || 3000;
const YOUR_CODE = '3f969674-2e25-46ee-8535-b25f661be06a'; // 替换为您实际的唯一Code
const API_URL = `http://47.100.162.240:12121/api/notify/${YOUR_CODE}`; // 替换为您实际的API URL


const svgCaptcha = require('svg-captcha');


// Middleware
app.use(session({
    secret: 'your-secret-key', // 替换为您的秘密密钥
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // 在HTTP使用时设置为false，若使用HTTPS则需要设置为true
}));
// Middleware
app.use(cors()); // 允许跨域请求
app.use(bodyParser.json()); // 解析JSON请求体

// GET /api/captcha 生成验证码
app.get('/api/captcha', (req, res) => {

    const captcha = svgCaptcha.create({
        size: 4,
        noise: 2,
        color: true,
        background: '#cc9966'
    });
    req.session = req.session || {};
    req.session.captcha = captcha.text.toLowerCase();
    res.type('svg');
    res.status(200).send(captcha.data);
   
});

// POST /api/contact
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message, captcha } = req.body;
 

    // 校验必填字段
    if (!message || !name || !email || !phone) {

        return res.status(400).json({ error: '消息内容是必填的.' });
    }

    // 校验验证码
    if (!captcha ) { //简单判断是否存在。无实际意义
        return res.status(400).json({ error: '验证码错误.' });
    }

    // 构建要发送的内容
    const content = `
        *姓名*: ${name || '未提供'}
        *邮箱*: ${email || '未提供'}
        *联系电话*: ${phone || '未提供'}
        *留言*: ${message}
    `;

    // 准备要发送的请求
    const payload = {
        title: '网站有人提交信息啦', // 假设您需要一个固定的标题
        content: content
    };

    try {
        const response = await axios.post(API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error sending notification:', error);
        const statusCode = error.response ? error.response.status : 500;
        return res.status(statusCode).json({ error: '发送通知失败.' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

