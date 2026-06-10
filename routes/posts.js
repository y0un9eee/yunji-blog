const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async(req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const offset = (page -1) *limit;

    try{
        const [posts] = await pool.execute(
            `SELECT p.id, p.title, p.created_at, p.updated_at, u.username AS author
            FROM posts p JOIN users u ON p.author_id = u.id
            ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        const [[{total}]] = await pool.execute('SELECT COUNT(*) AS total FROM posts');
        res.json({ posts, total, page, pages: Math.ceil(total / limit) });
    }catch{
        res.status(500).json({error: '서버 오류가 발생했끼리;'});
    }
});

router.get('/:id', async(req,res) => {
    try{
        const [rows] = await pool.execute(
            `SELECT p.id, p.title, p.content, p.created_at, p.updated_at, u.username AS author
            FROM posts p JOIN users u ON p.author_id = u.id
            WHERE p.id = ?`,
            [req.params.id]
        );
        if(!rows[0]) return res.status(404).json({error: '포스트를 못 찾겠끼리..'});
        res.json(rows[0]);
    }catch{
        res.status(500).json({ error: '서버 오류가 발생했끼리'});
    }
});

router.post('/', requireAdmin, async (req, res) => {
    const { title, content } = req.body;
    if(!title?.trim() || !content?.trim()){
        return res.status(400).json({ error: '제목과 내용을 입력해주세요.'});
    }

    try{
        const [result] = await pool.execute(
            'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
            [title.trim(), content, req.user.id]
        );
        res.json({ id: result.insertId, message: '포스트가 작성되었끼리'});
    }catch{
        res.status(500).json({ error: '서버 오류가 발생했끼리'});
    }
});

router.put('/:id', requireAdmin, async (req, res) => {
    const {title, content } = req.body;
    if(!title?.trim() || !content?.trim()){
        return res.status(400).json({ error: '제목과 내용을 입력하쇼'});
    }

    try{
        const [result] = await pool.execute(
            'UPDATE posts SET title = ?, content = ? WHERE id = ?',
            [title.trim(), content, req.params.id]
        );
        if(result.affectedRows === 0) return res.status(404).json({ error: ' 포스트를 찾을 수 없끼리'});
        res.json({ message: '포스트가 수정되었끼리'});
    }catch{
        res.status(500).json({ error: '서버 오류가 발생했끼리'});
    }
});

router.delete('/:id', requireAdmin, async (req, res) => {
    try{
        const [result] = await pool.execute('DELETE FROM posts WHERE id = ?', [req.params.id]);
        if(result.affectedRows === 0) return res.status(404).json({ error: '포스트를 찾을 수 없끼리'});
        res.json({ message: '포스트가 삭제되었끼리'});
    }catch{
        res.status(500).json({ error: '서버 오류가 발생했끼리'});
    }
});

module.exports = router;