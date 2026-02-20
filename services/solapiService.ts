
// Frontend Service: Delegates sending to the Node.js backend via Proxy
// 이제 전체 주소 대신 '/api'만 사용하면 vite.config.ts의 설정에 따라 자동으로 5001번 포트로 연결됩니다.
const API_BASE_URL = '/api';

interface SolapiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Sends an Alimtalk message via the Node.js backend server.
 */
export async function sendAlimTalk(
  to: string, 
  variables: Record<string, string>,
  templateId: string
): Promise<SolapiResponse> {
  
  if (!templateId) {
    throw new Error("템플릿 ID가 설정되지 않았습니다.");
  }

  try {
    // 로컬 Node.js 서버로 요청 전송
    const response = await fetch(`${API_BASE_URL}/send-alimtalk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        variables,
        templateId
      }),
    });

    // 서버 응답 형식이 JSON인지 확인
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       // JSON이 아니라면(예: 404 HTML 페이지, 502 Bad Gateway 등) 텍스트를 읽어서 에러로 표시
       const text = await response.text();
       console.error("Server Error Response:", text);
       
       // Vite Proxy 에러인지, 서버 에러인지 구분 힌트
       let errorHint = "서버 설정을 확인하세요.";
       if (text.includes("ECONNREFUSED")) errorHint = "서버가 켜져있지 않습니다.";
       if (text.includes("Cannot POST")) errorHint = "API 주소가 잘못되었습니다.";
       
       throw new Error(`서버 오류 (${response.status}): ${errorHint}\n내용: ${text.slice(0, 100)}...`);
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || '서버 통신 중 오류가 발생했습니다.');
    }

    return result;
  } catch (error: any) {
    console.error("Alimtalk Send Error:", error);
    // "Failed to fetch"는 보통 아예 연결조차 안 될 때 발생
    if (error.message === 'Failed to fetch') {
      throw new Error("서버와 연결할 수 없습니다. 터미널에서 'npm start'가 실행 중인지 확인해주세요.");
    }
    throw error;
  }
}
