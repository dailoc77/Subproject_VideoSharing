const mysql = require('mysql2/promise'); // Sử dụng mysql2/promise để hỗ trợ async/await
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Cấu hình kết nối database
const config = {
  host: 'localhost',
  user: 'root',
  password: 'loc2003', // Thay đổi theo mật khẩu của bạn
  database: 'db_videosharingapp',
};

// Tạo pool kết nối
let db;
(async () => {
  try {
    db = await mysql.createPool(config); // Sử dụng createPool của mysql2/promise
    console.log('Kết nối MySQL thành công');
  } catch (err) {
    console.error('Kết nối MySQL thất bại:', err);
    process.exit(1); // Thoát chương trình nếu không kết nối được
  }
})();

// API lấy danh sách tài khoản và thông tin người dùng
app.get('/account', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.*, a.username AS account_user, a.pass
      FROM Account a
      INNER JOIN Users u ON a.idUser = u.idUser
    `);
    res.status(200).json(rows); // Trả về dữ liệu JSON
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tài khoản:', err);
    res.status(500).send('Lỗi server');
  }
});

// API lấy thông tin người dùng theo ID
app.get('/data', async (req, res) => {
  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ. Phải là số.' });
  }

  try {
    const [rows] = await db.query(`SELECT * FROM Users WHERE idUser = ?`, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu người dùng:', err);
    res.status(500).send('Lỗi server');
  }
});

// API lấy số lượng followers và following
app.get('/follow', async (req, res) => {
  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ. Phải là số.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT
        SUM(CASE WHEN f.id_following = ? THEN 1 ELSE 0 END) AS following_count,
        SUM(CASE WHEN f.id_followed = ? THEN 1 ELSE 0 END) AS followers_count
      FROM Follow f
    `, [id, id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Lỗi khi lấy số lượng followers/following:', err);
    res.status(500).send('Lỗi server');
  }
});

// API lấy danh sách người theo dõi
app.get('/followed', async (req, res) => {
  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ. Phải là số.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT f.id_following, u.*
      FROM Follow f
      INNER JOIN Users u ON u.idUser = f.id_following
      WHERE f.id_followed = ?
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người theo dõi:', err);
    res.status(500).send('Lỗi server');
  }
});

// API lấy danh sách người đang theo dõi
app.get('/following', async (req, res) => {
  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ. Phải là số.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT f.id_followed, u.*
      FROM Follow f
      INNER JOIN Users u ON u.idUser = f.id_followed
      WHERE f.id_following = ?
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người đang theo dõi:', err);
    res.status(500).send('Lỗi server');
  }
});

// API lấy danh sách video trong profile
app.get('/profilevideos', async (req, res) => {
  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ. Phải là số.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT p.url, p.idPost, u.idUser, u.avatar
      FROM Post p
      INNER JOIN Users u ON p.idUser = u.idUser
      WHERE p.type = 'video' AND p.idUser = ?
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách video:', err);
    res.status(500).send('Lỗi server');
  }
});

// API lấy danh sách ảnh trong profile
app.get('/profileimages', async (req, res) => {
  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ. Phải là số.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT p.url, p.idPost, u.idUser, u.avatar
      FROM Post p
      INNER JOIN Users u ON p.idUser = u.idUser
      WHERE p.type = 'image' AND p.idUser = ?
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách ảnh:', err);
    res.status(500).send('Lỗi server');
  }
});

// API tạo tài khoản mới
app.post('/register', async (req, res) => {
  const { username, sdt, email, accname, pass } = req.body;
  const avatar = 'https://imgur.com/a/QdlMMTF.png';

  if (!username || !sdt || !email || !accname || !pass) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin' });
  }

  try {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    const [resultUser] = await connection.query(`
      INSERT INTO Users (username, sdt, email, avatar, birthDay)
      VALUES (?, ?, ?, ?, NOW())
    `, [username, sdt, `${email}@gmail.com`, avatar]);

    const idUser = resultUser.insertId;

    await connection.query(`
      INSERT INTO Account (idUser, username, pass)
      VALUES (?, ?, ?)
    `, [idUser, accname, pass]);

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'Tạo tài khoản thành công!' });
  } catch (error) {
    console.error('Lỗi khi tạo tài khoản:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/savePost', async (req, res) => {
  const { idUser, type, url, content } = req.body;

  if (!idUser || !type || !url || !content) {
    return res.status(400).json({ error: 'Vui lòng cung cấp idUser, type, url và content.' });
  }

  try {
    const pool = req.app.locals.db;
    const [result] = await pool.query(`
      INSERT INTO Post (idUser, type, url, content, upload_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [idUser, type, url, content]);

    res.status(201).json({ message: 'Bài viết đã được lưu thành công!' });
  } catch (error) {
    console.error("Lỗi cơ sở dữ liệu:", error);
    res.status(500).json({ error: 'Lỗi khi lưu bài viết vào cơ sở dữ liệu.' });
  }
});


// API kiểm tra trạng thái "đang theo dõi"
app.get('/is-following', async (req, res) => {
  const { id_following, id_followed } = req.query;

  if (!id_following || !id_followed) {
    return res.status(400).json({ error: 'Thiếu id_following hoặc id_followed' });
  }

  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS is_following 
       FROM Follow 
       WHERE id_following = ? AND id_followed = ?`,
      [id_following, id_followed]
    );

    const isFollowing = rows[0].is_following > 0;
    res.status(200).json({ isFollowing });
  } catch (err) {
    console.error('Lỗi kiểm tra trạng thái follow:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// API để theo dõi người dùng
app.post('/follow', async (req, res) => {
  const { idFollowing, idFollowed } = req.body;

  try {
    await db.query(
      `INSERT INTO Follow (id_following, id_followed) VALUES (?, ?)`,
      [idFollowing, idFollowed]
    );

    res.status(200).json({ message: 'Đã theo dõi người dùng thành công' });
  } catch (err) {
    console.error('Lỗi khi theo dõi:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// API để hủy theo dõi người dùng
app.delete('/unfollow', async (req, res) => {
  const { idFollowing, idFollowed } = req.body;

  try {
    await db.query(
      `DELETE FROM Follow WHERE id_following = ? AND id_followed = ?`,
      [idFollowing, idFollowed]
    );

    res.status(200).json({ message: 'Đã hủy theo dõi người dùng thành công' });
  } catch (err) {
    console.error('Lỗi khi hủy theo dõi:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// API kiểm tra trạng thái "đã like"
app.get('/is-like', async (req, res) => {
  const { idPost, idUser } = req.query;

  if (!idPost || !idUser) {
    return res.status(400).json({ error: 'Thiếu idPost hoặc idUser' });
  }

  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS is_like 
       FROM \`Like\` 
       WHERE idPost = ? AND idUser = ?`,
      [idPost, idUser]
    );

    const is_Like = rows[0].is_like > 0;
    res.status(200).json({ is_Like });
  } catch (err) {
    console.error('Lỗi kiểm tra Like:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// API để like bài viết
app.post('/like', async (req, res) => {
  const { idUser, idPost } = req.body;

  try {
    await db.query(`INSERT INTO \`Like\` (idUser, idPost) VALUES (?, ?)`, [idUser, idPost]);
    res.status(200).json({ message: 'Đã like thành công' });
  } catch (err) {
    console.error('Lỗi khi like bài viết:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// API để unlike bài viết
app.post('/unlike', async (req, res) => {
  const { idUser, idPost } = req.body;

  try {
    await db.query(`DELETE FROM \`Like\` WHERE idUser = ? AND idPost = ?`, [idUser, idPost]);
    res.status(200).json({ message: 'Đã bỏ like thành công' });
  } catch (err) {
    console.error('Lỗi khi bỏ like bài viết:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

app.get('/imageStreaming4', async (req, res) => {
  try {
    const pool = req.app.locals.db;
    console.log(pool) // Assuming db is a MySQL connection pool
    const [rows] = await pool.query(`
      SELECT p.*, u.*
      FROM post p
      INNER JOIN users u ON p.idUser = u.idUser
      WHERE p.type = 'image'
      ORDER BY p.idPost DESC
      LIMIT 4;
    `);
    res.json(rows);
  } catch (err) {
    console.log('Error fetching image details:', err);
    res.status(500).send('Server Error');
  }
});


// API lấy danh sách stories
app.get('/stories', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.avatar, u.username 
      FROM Post p
      INNER JOIN Users u ON p.idUser = u.idUser
      WHERE type = 'story' AND TIMESTAMPDIFF(HOUR, upload_at, NOW()) <= 24
      ORDER BY p.idPost DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error('Lỗi khi lấy stories:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// API lấy danh sách stories theo người dùng
app.get('/Userstories', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.idUser, u.avatar, u.username, MAX(p.upload_at) AS latest_upload_at 
      FROM Post p
      INNER JOIN Users u ON p.idUser = u.idUser
      WHERE p.type = 'story' AND TIMESTAMPDIFF(HOUR, p.upload_at, GETDATE()) <= 24
      GROUP BY u.idUser, u.avatar, u.username
      ORDER BY latest_upload_at DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error('Lỗi khi lấy stories theo người dùng:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// Chạy server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
