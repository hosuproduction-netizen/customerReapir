
// Ticket 인터페이스 정의 (App.tsx와 데이터 구조 맞춤)
export interface SheetTicketData {
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  productName: string;
  serial: string;
  symptom: string;
  requestNotes: string;
  repairLogs: string; // 문자열로 변환된 로그
  repairResult: string;
  completionDate: string;
  trackingNumber: string;
  quickServiceNumber: string;
  purchaseLocation: string;
}

/**
 * 티켓 데이터를 구글 시트 웹 앱 형식에 맞춰 변환하고 전송합니다.
 * @param tickets 전송할 티켓 목록
 * @param webAppUrl 구글 앱스 스크립트 웹 앱 URL
 */
export async function sendTicketsToSheet(tickets: any[], webAppUrl: string): Promise<boolean> {
  const url = webAppUrl.trim();
  
  if (!url.startsWith('https://script.google.com/macros/s/')) {
    throw new Error('올바른 Google Web App URL이 아닙니다.');
  }

  // 데이터 매핑: 앱의 데이터 구조를 구글 시트가 기대하는 평문 데이터로 변환
  const payload = tickets.map(t => ({
    '접수일': formatDate(t.createdAt),
    '완료일': formatDate(t.completionDate),
    '고객명': t.customerName,
    '연락처': formatPhoneNumber(t.phone || ''),
    '주소': t.address || '',
    '제품명': t.productName || '',
    'S/N': t.serial || '',
    '증상': t.symptom || '',
    '점검요청': t.requestNotes || '',
    '수리내역': (t.repairLogs || []).map((l: any) => `[${l.date}] ${l.content}`).join(' / '),
    '수리결과': t.repairResult || '',
    '운송장': t.trackingNumber || '',
    '퀵기사번호': t.quickServiceNumber || '',
    '구매처': t.purchaseLocation || ''
  }));

  try {
    // no-cors 모드: 브라우저 보안 정책상 응답을 읽을 수는 없지만 전송은 가능합니다.
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error('Google Sheet Sync Error:', error);
    throw error;
  }
}

// 헬퍼 함수들
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
};

const formatPhoneNumber = (phone: string): string => {
  const cleaned = String(phone || '').replace(/[^0-9]/g, '');
  if (cleaned.length === 11) return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  return phone;
};
