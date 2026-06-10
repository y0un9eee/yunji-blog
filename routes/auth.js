const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({error: '모든 필드를 입력하시끼리.'});
    }
    if(password.length < 6){
        return res.status(400).json({error: '비밀번호는 6자 이상이어야 합끼리.'});
    }
    try{
        const hashed = await bcrypt.hash(password, 10);
        await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashed]
        );
        res.json({message: '회원가입이 완료되었끼리.'})
    }catch(err){
        if(err.code === 'ER_DUP_ENTRY'){
            return res.status(400).json({error: '이미 사용 중인 이메일 또는 사용자명 입니끼리.'});
        }
        res.status(500).json({error: '서버 오류가 발생했끼리;;'});
    }
});

router.post('/login', async(req, res) =>{
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({error: '이메일과 비밀번호를 입력하라끼리!!'});
    }
    try{
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(401).json({error: '이메일 또는 비밀번호가 올바르지 않끼리..'});
        }

        const token = jwt.sign(
            {id: user.id, username: user.username, role: user.role},
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({user: {id: user.id, username: user.username, role: user.role }});
    }catch{
        res.status(500).json({error: '서버 오류가 발생했끼리..'});
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: '로그아웃 되었끼리~ 또 와주쇼.'});
});

router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user});
});

module.exports = router;