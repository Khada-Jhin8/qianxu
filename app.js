const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const YOUR_CODE = '3f969674-2e25-46ee-8535-b25f661be06a'; // 替换为您实际的唯一Code
const API_URL = `http://47.100.162.240:12121/api/notify/${YOUR_CODE}`; // 替换为您实际的API URL

// Middleware
app.use(cors()); // 允许跨域请求
app.use(bodyParser.json()); // 解析JSON请求体

// POST /api/contact
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;

    // 校验必填字段
    if (!message) {
        return res.status(400).json({ error: '消息内容是必填的.' });
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
