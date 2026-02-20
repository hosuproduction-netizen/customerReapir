
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 설정 ---
// 주의: MySQL 설치 시 설정한 root 비밀번호를 아래 'password' 부분에 입력해야 합니다.
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'password', // <--- MySQL 설치할 때 정한 비밀번호로 변경하세요!
  multipleStatements: true // 여러 쿼리를 한 번에 실행하기 위해 필요
};

const DBNAME = 'repair_system';

async function setup() {
  console.log('🔄 데이터베이스 설정을 시작합니다...');
  let connection;

  try {
    // 1. SQL 파일 읽기
    const sqlPath = path.join(__dirname, 'db_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`✅ SQL 파일 읽기 성공 (${sqlPath})`);

    // 2. MySQL 접속
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ MySQL 접속 성공!');

    // 3. 데이터베이스 생성 및 선택 (SQL 파일에 포함되어 있을 수 있지만 안전을 위해 확인)
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DBNAME}`);
    await connection.query(`USE ${DBNAME}`);
    console.log(`✅ 데이터베이스 선택 완료 (${DBNAME})`);

    // 4. SQL 실행
    await connection.query(sql);
    console.log('✅ SQL 스크립트 실행 완료');

    console.log('\n🎉 모든 설정이 완료되었습니다! 이제 npm start로 서버를 실행하세요.');

  } catch (error) {
    console.error('\n❌ 오류가 발생했습니다:');
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 비밀번호가 틀린 것 같습니다. setup-db.js 파일의 password를 확인해주세요.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('👉 MySQL 프로그램이 켜져있지 않거나 설치되지 않았습니다.');
    } else if (error.code === 'ENOENT') {
      console.error('👉 db_schema.sql 파일을 찾을 수 없습니다.');
    } else {
      console.error(error);
    }
  } finally {
    if (connection) await connection.end();
  }
}

setup();
