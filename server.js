
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import crypto from 'crypto'; 
import { createServer as createViteServer } from 'vite';

// --- 서버 설정 ---
const PORT = 3000;

// MySQL 설정
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'password', // ⚠️ 여기에 본인의 MySQL 비밀번호를 입력해야 합니다!
  database: 'repair_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Solapi(알림톡) 설정
const SOLAPI_CONFIG = {
  API_KEY: "NCSZ8FSYBKTT0P73",
  API_SECRET: "N9I0IRAEOFW31YPY1CVV9KNQ1EBUBTJS",
  SENDER_PHONE: "01044060775",
  PF_ID: "KA01PF251218003018262GX1gXT2BlQB"
};

async function startServer() {
  const app = express();
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(cors());
  app.use(express.json());

  // MySQL Connection Pool 생성
  const pool = mysql.createPool(DB_CONFIG);

  // --- API 라우트 ---

  // Solapi 인증 헤더 생성 함수
  function generateSolapiHeader() {
    const date = new Date().toISOString();
    const salt = crypto.randomBytes(16).toString('hex');
    const message = date + salt;
    
    const signature = crypto.createHmac('sha256', SOLAPI_CONFIG.API_SECRET)
      .update(message)
      .digest('hex');

    return `HMAC-SHA256 apiKey=${SOLAPI_CONFIG.API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;
  }

  // 1. 알림톡 발송 API
  app.post('/api/send-alimtalk', async (req, res) => {
    const { to, templateId, variables } = req.body;
    if (!to || !templateId) {
      return res.status(400).json({ success: false, message: '수신번호와 템플릿 ID는 필수입니다.' });
    }
    try {
      const authHeader = generateSolapiHeader();
      const response = await fetch('https://api.solapi.com/messages/v4/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          message: {
            to: to,
            from: SOLAPI_CONFIG.SENDER_PHONE,
            kakaoOptions: {
              pfId: SOLAPI_CONFIG.PF_ID,
              templateId: templateId,
              variables: variables || {},
              disableSms: true,
            },
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || data.message || '알림톡 발송 실패');
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 2. 엑셀 파일 업로드 API
  app.post('/api/upload-excel', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: '파일이 없습니다.' });
    let connection;
    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false, defval: "" });
      if (data.length === 0) return res.status(400).json({ success: false, message: '데이터가 없습니다.' });
      connection = await pool.getConnection();
      await connection.beginTransaction();
      await connection.query('TRUNCATE TABLE customers');
      const BATCH_SIZE = 1000;
      const query = `INSERT INTO customers (company_name, customer_name, position, address, mobile, phone, email) VALUES ?`;
      const findValue = (row, keys) => {
          for (const key of keys) {
              if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return String(row[key]).trim();
          }
          return '';
      };
      let totalInserted = 0;
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        const values = [];
        for (const row of batch) {
            const name = findValue(row, ['고객명', '이름', '성명', 'Customer Name', 'Name']);
            if (!name) continue;
            values.push([
              findValue(row, ['회사명', '상호', 'Company', '소속']),
              name,
              findValue(row, ['직위', '직급', 'Position']),
              findValue(row, ['회사주소1', '주소', 'Address', '배송지']),
              findValue(row, ['이동통신', '휴대폰', 'Mobile', '연락처', 'Phone', 'HP']),
              findValue(row, ['회사전화1', '전화', 'Tel', 'Tel No']),
              findValue(row, ['전자우편1', '이메일', 'Email', 'E-mail'])
            ]);
        }
        if (values.length > 0) {
            const [result] = await connection.query(query, [values]);
            totalInserted += result.affectedRows;
        }
      }
      await connection.commit();
      res.json({ success: true, count: totalInserted });
    } catch (error) {
      if (connection) await connection.rollback();
      res.status(500).json({ success: false, message: error.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // 3. 고객 검색 API
  app.get('/api/customers/search', async (req, res) => {
    const { name } = req.query;
    if (!name) return res.json([]);
    try {
      const [rows] = await pool.query('SELECT * FROM customers WHERE customer_name LIKE ? LIMIT 50', [`${name}%`]);
      res.json(rows);
    } catch (error) {
      res.json([]);
    }
  });

  // 4. 전체 고객 수 조회 API
  app.get('/api/customers/count', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM customers');
      res.json({ count: rows[0].count });
    } catch (error) {
      res.status(500).json({ count: 0 });
    }
  });

  // 5. 수리 이력 조회 API
  app.get('/api/repair-history', async (req, res) => {
    const { search } = req.query;
    let query = 'SELECT * FROM repair_history';
    let params = [];
    if (search) {
      query += ' WHERE `고객명_x` LIKE ? OR `이동통신_x` LIKE ? OR `회사명` LIKE ? OR `상담내역` LIKE ?';
      const searchPattern = `%${search}%`;
      params = [searchPattern, searchPattern, searchPattern, searchPattern];
    }
    query += ' ORDER BY `접수일` DESC LIMIT 100';
    try {
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Vite 미들웨어 설정 (개발 환경)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Unified Server running on http://localhost:${PORT}`);
  });
}

startServer();
