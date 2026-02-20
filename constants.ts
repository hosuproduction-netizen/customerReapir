
// ⚠️ SECURITY WARNING: 
// In a real production application, never store your API Secret in the frontend code.
// It should be stored in a backend server env variable.
// We are doing this here only because this is a client-side demo request.

export const SOLAPI_CONFIG = {
  API_KEY: "NCSZ8FSYBKTT0P73",
  API_SECRET: "N9I0IRAEOFW31YPY1CVV9KNQ1EBUBTJS",
  SENDER_PHONE: "01044060775",
  PF_ID: "KA01PF251218003018262GX1gXT2BlQB",

  // 👇 [수정] 새로 만든 '입고 알림톡' 템플릿 ID를 아래 따옴표 안에 넣으세요
  ADMISSION_TEMPLATE_ID: "KA01TP260126040207439GUJpmkS8bcT",

  // 👇 [수정] 새로 만든 '택배(수리완료) 알림톡' 템플릿 ID를 아래 따옴표 안에 넣으세요
  COMPLETION_TEMPLATE_ID: "KA01TP260126071748626Kue1zDs2PF7",

  // (선택사항) 퀵서비스용 템플릿 ID (별도로 없다면 위와 동일하게 두셔도 됩니다)
  QUICK_TEMPLATE_ID: "KA01TP260126123700268qaF2N9Ja50I"
};
