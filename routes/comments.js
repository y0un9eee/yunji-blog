const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/:postId', async (req, res) => {
    try {
        const [comments] = await pool.execute(
            `SELECT c.id, c.content, c.created_at, u.username
            FROM comments c JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC`,
            [req.params.postId]
        );
        res.json(comments);
    } catch {
        res.status(500).json({ error: '서버 오류가 발생했끼리' });
    }
});

router.post('/:postId', authenticate, async (req, res) => {
    const { content } = req.body;
    if (!content?.trim()) {
        return res.status(400).json({ error: '내용을 입력해주세요.' });
    }
    try {
        const [result] = await pool.execute(
            'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
            [req.params.postId, req.user.id, content.trim()]
        );
        res.json({ id: result.insertId, message: '댓글이 작성되었끼리' });
    } catch {
        res.status(500).json({ error: '서버 오류가 발생했끼리' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: '댓글을 찾을 수 없끼리' });
        if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: '권한이 없끼리' });
        }
        await pool.execute('DELETE FROM comments WHERE id = ?', [req.params.id]);
        res.json({ message: '댓글이 삭제되었끼리' });
    } catch {
        res.status(500).json({ error: '서버 오류가 발생했끼리' });
    }
});

module.exports = router;
