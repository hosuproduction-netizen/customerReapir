
// Proxy 설정에 따라 5000번 포트로 자동 연결됩니다.
const API_BASE_URL = '/api';

export interface CustomerDBEntry {
  company_name?: string;
  customer_name?: string;
  position?: string;
  address?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  
  // 기존 코드(App.tsx)와의 호환성을 위한 별칭 매핑
  "고객명"?: string; 
  "회사명"?: string;
  "회사주소1"?: string;
  "이동통신"?: string;
  "직위"?: string;
  "회사전화1"?: string;
  id?: number;
}

// 1. 고객 이름으로 검색 (서버 API)
export const searchCustomersByName = async (query: string): Promise<CustomerDBEntry[]> => {
  if (!query) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/customers/search?name=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      ...item,
      "고객명": item.customer_name,
      "회사명": item.company_name,
      "직위": item.position,
      "회사주소1": item.address,
      "이동통신": item.mobile,
      "회사전화1": item.phone
    }));
  } catch (error) {
    console.error("MySQL Search Error:", error);
    return [];
  }
};

// 2. 전체 고객 수 조회 (서버 API)
export const getCustomerCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/count`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    return 0;
  }
};

// 3. 엑셀 파일 업로드 (서버 API)
export const uploadExcelToServer = async (file: File): Promise<{count: number}> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload-excel`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || '업로드 실패');
  }
  
  return response.json();
};

export const saveCustomersToDB = async (data: any[]) => { console.warn('This function is deprecated.'); };
