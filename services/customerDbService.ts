// services/customerDbService.ts
// repair_history 테이블 기반 고객 검색 서비스

export interface CustomerDBEntry {
  id?: number;
  customer_name?: string;
  mobile?: string;
  company_name?: string;
  // 기존 호환성 유지용 필드
  고객명?: string;
  이동통신?: string;
  회사명?: string;
  회사전화1?: string;
  회사주소1?: string;
  직위?: string;
  position?: string;
}

// 고객명으로 repair_history에서 검색
export async function searchCustomersByName(name: string): Promise<CustomerDBEntry[]> {
  if (!name || name.trim() === '') return [];
  try {
    const res = await fetch(`/api/customers/search?name=${encodeURIComponent(name.trim())}`);
    if (!res.ok) return [];
    const data = await res.json();
    
    // 응답 데이터를 기존 형식과 호환되도록 변환
    return data.map((item: any) => ({
      고객명: item.customer_name || item['고객명_x'] || '',
      이동통신: item.mobile || item['이동통신_x'] || '',
      회사명: item.company_name || item['회사명'] || '',
      회사전화1: '',
      회사주소1: '',
      직위: '',
    }));
  } catch (error) {
    console.error('고객 검색 오류:', error);
    return [];
  }
}

// repair_history 전체 건수 조회
export async function getCustomerCount(): Promise<number> {
  try {
    const res = await fetch('/api/customers/count');
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

// ✅ SQL 파일 업로드 (기존 엑셀 업로드 대신)
export async function uploadSqlToServer(file: File): Promise<{ count: number; errors: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload-sql', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'SQL 업로드 실패');
  }
  return { count: data.count, errors: data.errors || 0 };
}

// 기존 엑셀 업로드 함수 (호환성 유지, 실제로는 사용 안 함)
export async function uploadExcelToServer(file: File): Promise<{ count: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload-excel', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || '업로드 실패');
  }
  return { count: data.count };
}
