import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto'; 
import { createServer as createViteServer } from 'vite';

// --- 서버 설정 ---
const PORT = 3000;

// MySQL 설정
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '12345', // ⚠️ 여기에 본인의 MySQL 비밀번호를 입력해야 합니다!
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
  // SQL 파일은 용량이 클 수 있으므로 최대 200MB까지 허용
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 200 * 1024 * 1024 }
  });

  app.use(cors());
  app.use(express.json());

  // MySQL Connection Pool 생성
  const pool = mysql.createPool(DB_CONFIG);

  // DB 연결 확인
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL 데이터베이스 연결 성공!');
    const [rows] = await conn.query('SELECT COUNT(*) as count FROM repair_history');
    console.log(`📊 현재 repair_history 테이블 데이터 수: ${rows[0].count}건`);
    conn.release();
  } catch (error) {
    console.error('❌ MySQL 연결 실패:', error.message);
    console.error('👉 DB_CONFIG의 비밀번호와 데이터베이스 이름을 확인해주세요.');
  }

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

  // 2. ✅ SQL 파일 업로드 API (새로 추가!)
  // - .sql 파일을 업로드하면 repair_history 테이블에 데이터를 반영합니다
  app.post('/api/upload-sql', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: '파일이 없습니다.' });
    
    let connection;
    try {
      const sqlContent = req.file.buffer.toString('utf8');
      
      // SQL 파일에서 INSERT 문만 추출
      const insertStatements = [];
      const lines = sqlContent.split('\n');
      let currentStatement = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('--')) continue; // 빈 줄, 주석 건너뜀
        
        currentStatement += ' ' + trimmed;
        
        if (trimmed.endsWith(';')) {
          const stmt = currentStatement.trim();
          // repair_history INSERT 문만 처리
          if (stmt.toUpperCase().startsWith('INSERT INTO') && 
              stmt.toLowerCase().includes('repair_history')) {
            insertStatements.push(stmt);
          }
          currentStatement = '';
        }
      }
      
      if (insertStatements.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'SQL 파일에서 repair_history INSERT 문을 찾을 수 없습니다.' 
        });
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();
      
      // 기존 데이터 삭제 후 새로 삽입
      await connection.query('TRUNCATE TABLE repair_history');
      
      let totalInserted = 0;
      let errorCount = 0;
      
      for (const stmt of insertStatements) {
        try {
          await connection.query(stmt);
          totalInserted++;
        } catch (err) {
          errorCount++;
          // 개별 INSERT 오류는 계속 진행
          console.warn(`⚠️ INSERT 오류 (건너뜀): ${err.message}`);
        }
      }
      
      await connection.commit();
      console.log(`✅ SQL 업로드 완료: ${totalInserted}건 삽입, ${errorCount}건 오류`);
      
      res.json({ 
        success: true, 
        count: totalInserted,
        errors: errorCount,
        message: `${totalInserted}건이 성공적으로 업로드되었습니다.`
      });
      
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('❌ SQL 업로드 오류:', error.message);
      res.status(500).json({ success: false, message: error.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // 3. ✅ 고객 검색 API (repair_history 기반으로 수정!)
  // - 고객명으로 검색하면 해당 고객의 전화번호 + 상담이력을 모두 반환
  app.get('/api/customers/search', async (req, res) => {
    const { name } = req.query;
    if (!name || name.trim() === '') return res.json([]);
    try {
      const searchPattern = `%${name.trim()}%`;
      
      // repair_history에서 고객명으로 검색 (중복 제거하여 고객 목록 반환)
      const [rows] = await pool.query(
        `SELECT DISTINCT 
           \`고객명_x\` as customer_name,
           \`이동통신_x\` as mobile,
           \`회사명\` as company_name
         FROM repair_history 
         WHERE \`고객명_x\` LIKE ? 
            OR \`회사명\` LIKE ?
            OR \`이동통신_x\` LIKE ?
         ORDER BY \`고객명_x\`
         LIMIT 50`,
        [searchPattern, searchPattern, searchPattern]
      );
      
      console.log(`🔍 검색어: "${name}" → ${rows.length}명 검색됨`);
      res.json(rows);
    } catch (error) {
      console.error('❌ 검색 오류:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 4. ✅ 고객별 전체 상담이력 조회 API (새로 추가!)
  // - 특정 고객명을 클릭하면 해당 고객의 모든 상담 이력을 반환
  app.get('/api/customers/history', async (req, res) => {
    const { name } = req.query;
    if (!name) return res.json([]);
    try {
      const [rows] = await pool.query(
        `SELECT * FROM repair_history 
         WHERE \`고객명_x\` = ?
         ORDER BY \`접수일\` DESC`,
        [name]
      );
      res.json(rows);
    } catch (error) {
      console.error('❌ 고객 이력 조회 오류:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 5. repair_history 전체 건수 조회 API
  app.get('/api/customers/count', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM repair_history');
      res.json({ count: rows[0].count });
    } catch (error) {
      console.error('❌ 건수 조회 오류:', error.message);
      res.status(500).json({ count: 0 });
    }
  });

  // 6. 수리 이력 조회 API (고객 상담내역 탭)
  app.get('/api/repair-history', async (req, res) => {
    const { search } = req.query;
    let query = 'SELECT * FROM repair_history';
    let params = [];
    if (search && search.trim()) {
      query += ' WHERE `고객명_x` LIKE ? OR `이동통신_x` LIKE ? OR `회사명` LIKE ? OR `상담내역` LIKE ?';
      const searchPattern = `%${search.trim()}%`;
      params = [searchPattern, searchPattern, searchPattern, searchPattern];
    }
    query += ' ORDER BY `접수일` DESC LIMIT 100';
    try {
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error('❌ 수리 이력 조회 오류:', error.message);
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
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
  });
}

startServer();
