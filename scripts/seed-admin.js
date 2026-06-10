require('dotenv').config({ path: require('path').join(__dirname, '../.env' )});
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function main() {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@yunji-blog.com';
    const password = process.env.ADMIN_PASSWORD || 'admin1234';

    const hash = await bcrypt.hash(password, 10);

    await pool.execute(
        `INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, 'admin')
        ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'admin'`,
        [username, email, hash]
    );

    console.log('관리자 계정 생성 완료끼리');
    console.log(` 이메일: ${email}`);
    console.log( ` 비밀번호: ${password}`);
    console.log('로그인 후 반드시 비밀번호를 변경하시끼리');
    process.exit(0);
}

main().catch(err => {
    console.error('오류 : ', err.message);
    process.exit(1);
});