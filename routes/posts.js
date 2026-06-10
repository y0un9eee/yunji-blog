const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async(req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    try{
        const [posts] = await pool.query(
            `SELECT p.id, p.title, p.created_at, p.updated_at, u.username AS author
            FROM posts p JOIN users u ON p.author_id = u.id
            ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`
        );
        const [[{total}]] = await pool.query('SELECT COUNT(*) AS total FROM posts');
        res.json({ posts, total, page, pages: Math.ceil(total / limit) });
    }catch(err){
        console.error('GET /posts error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async(req, res) => {
    try{
        const [rows] = await pool.query(
            `SELECT p.id, p.title, p.content, p.created_at, p.updated_at, u.username AS author
            FROM posts p JOIN users u ON p.author_id = u.id
            WHERE p.id = ${parseInt(req.params.id)}`
        );
        if(!rows[0]) return res.status(404).json({ error: '포스트를 찾을 수 없습니다.' });
        res.json(rows[0]);
    }catch(err){
        console.error('GET /posts/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/', requireAdmin, async (req, res) => {
    const { title, content } = req.body;
    if(!title?.trim() || !content?.trim()){
        return res.status(400).json({ error: '제목과 내용을 입력해주세요.' });
    }

    try{
        const [result] = await pool.execute(
            'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
            [title.trim(), content, req.user.id]
        );
        res.json({ id: result.insertId, message: '포스트가 작성되었끼리' });
    }catch(err){
        console.error('POST /posts error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', requireAdmin, async (req, res) => {
    const { title, content } = req.body;
    if(!title?.trim() || !content?.trim()){
        return res.status(400).json({ error: '제목과 내용을 입력해주세요.' });
    }

    try{
        const [result] = await pool.execute(
            'UPDATE posts SET title = ?, content = ? WHERE id = ?',
            [title.trim(), content, parseInt(req.params.id)]
        );
        if(result.affectedRows === 0) return res.status(404).json({ error: '포스트를 찾을 수 없습니다.' });
        res.json({ message: '포스트가 수정되었끼리' });
    }catch(err){
        console.error('PUT /posts/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', requireAdmin, async (req, res) => {
    try{
        const [result] = await pool.execute('DELETE FROM posts WHERE id = ?', [parseInt(req.params.id)]);
        if(result.affectedRows === 0) return res.status(404).json({ error: '포스트를 찾을 수 없습니다.' });
        res.json({ message: '포스트가 삭제되었끼리' });
    }catch(err){
        console.error('DELETE /posts/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
