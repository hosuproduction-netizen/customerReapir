
CREATE DATABASE IF NOT EXISTS repair_system;
USE repair_system;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(100),
    position VARCHAR(50),
    address VARCHAR(255),
    mobile VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_name (customer_name),
    INDEX idx_mobile (mobile)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자의 SQL과 호환되는 repair_history 테이블 생성
CREATE TABLE IF NOT EXISTS repair_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `거래처코드` VARCHAR(100),
    `접수일` DATETIME,
    `접수자` VARCHAR(50),
    `영업담당_x` VARCHAR(50),
    `회사명` VARCHAR(100),
    `고객명_x` VARCHAR(50),
    `이동통신_x` VARCHAR(50),
    `상담내역` TEXT,
    `처리결과` TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 샘플 데이터 (사용자가 제공한 쿼리 예시)
-- 가지고 계신 SQL 파일의 모든 INSERT 문을 이 아래에 붙여넣으시면 됩니다.
INSERT INTO repair_history (`거래처코드`, `접수일`, `접수자`, `영업담당_x`, `회사명`, `고객명_x`, `이동통신_x`, `상담내역`, `처리결과`) 
VALUES ('000734A9AAC7CA4591D1D206B84873DD', '2017-02-23 00:00:00', '이경엽', '사용자', '매트릭스미디어', '조영현', '010-8999-4164', '방문드려 인사드림. 요즘 너무 조용하다고 함. 신제품 알려드림.', NULL);
