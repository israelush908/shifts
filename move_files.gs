/**
 * OpenClaw — 67 Winery
 * ממשק: Google Apps Script
 * מטרה: הזזת 47 קבצים מהתיקייה הראשית לתיקיות המתאימות
 * הרצה: script.google.com → New Project → הדבק → Run → moveAllFiles
 */

function moveAllFiles() {

  // ======= מיפוי תיקיות יעד =======
  const FOLDERS = {
    NAHАЛИМ:    '15ialnePQnYEnHle0Y3UVWEi4R8O8y7y5', // נהלים ו-SOPs
    RECIPES:    '1Hf6iep4BgSGer2oyXKEWR9_to_vpbv-x', // מתכונים ומחירון מנות
    CHECKLISTS: '1eFji_fbjwXY1kEpvHsHRXNA6Gzfqvh-5', // צ'קליסטים פתיחה וסגירה
    TRAINING:   '1VeGY_k0OxT0VQRN-WmvBNXSCt4eDngx6', // הדרכות ומדרג
    SHIFTS:     '12PhJJNXIXGFRDNC3sQCeMe0kNliOO_5t', // שיבוצים
    KPI:        '1x-41jeW1Sh5sWa7EctkR1hwhYACIyii3', // ביצועים ו-SPH
    EVENT_PRICE:'1Opgic9oR4y2ubua9I6I-KL1HckkdcGA5', // מחירוני אירועים
    EVENT_LOG:  '1WmVOPiVt5zFDpmCZxy5Pqq4JTkrmIrEB', // לוג אירועים
    INVENTORY:  '1q5gdW3G6tFnj4mV2jpHpg9XPounBHn9f', // ספירת מלאי
    OPS_LOG:    '1PC-rDL781ipAVEKAe5jIv37qEEg_fCTw', // לוג תפעולי
    REPORTS:    '10MipunzLSluBQrwpItqmtwOl_9ZGJ-uQ', // דוחות יומיים
  };

  // ======= רשימת ההזזות =======
  // פורמט: [fileId, targetFolderKey, 'שם הקובץ']
  const MOVES = [

    // ── נהלים ו-SOPs ──────────────────────────────────────────────────
    ['1ZPDlI9w6Z6doTTWibDBM3j7kB761dkYG', 'NAHАЛИМ',    'נוהל שגרות ניהול אינטראקטיבי.docx'],
    ['1T3KO0vOc296A41Zm58X8lrYj0sZ6BVzB', 'NAHАЛИМ',    'נוהל גיוס וסינון עובדי מטבח.docx'],
    ['1wZ2UeObLaBv_wJocCvr0v1eGQ7AGgED8', 'NAHАЛИМ',    'נוהל עבודה: ביטול מנות, הנחות ושימוש בקופה.docx'],
    ['1yN65HYy5w87IlzZA4eSUDidSfEuAvn2A', 'NAHАЛИМ',    'נוהל קליטת עובד.docx'],
    ['1kaaR0ZmLvU3zCE1OVnc3Flh11lz2NzGf', 'NAHАЛИМ',    'נהלי פיקוח על חריגים במשמרת.docx'],
    ['16ksnVqKGqKmF5bU5pMH7QRJBWp34VdfP', 'NAHАЛИМ',    'חיזוק ליבת העסק: נהלים וצ\'קליסטים.docx'],
    ['1nLqIWGe__P-UeJbm5RdLhgwCT_VtLOEx', 'NAHАЛИМ',    'עדכון נהלים- צ\'קליסט.docx'],
    ['1ZrQCvi9OhTaz-1ctepIX8VYalLLXt8O9', 'NAHАЛИМ',    'עומס פסים במטבח בימי שישי.xlsx'],

    // ── מתכונים ומחירון מנות ──────────────────────────────────────────
    ['1K15OIYPsTI6VnKQxJwhkmhRIzbtSHQW_', 'RECIPES',    'פלטת גבינות חודשית עונתית ומרוויחה.docx'],
    ['1WDRyoAEH_zt84LVdjKyhVFHCPH6krCsQ', 'RECIPES',    'מבחן תפריט.docx'],
    ['1nmK9GpUnWY77DLECcGLbwxyp0Ib2OugD', 'RECIPES',    'חישוב כמויות לסרוויס.xlsx'],
    ['1eOigStUetFdPcivK_tG98999As_na6jJ', 'RECIPES',    'חישוב כמויות לסרוויס (1).xlsx'],
    ['18-D-hX5RBuRVf_HSDNZeBkfq0g1Mk91m', 'RECIPES',    'תוכנית_הכנות_שלישי_מקביליות (1).xlsx'],

    // ── צ'קליסטים פתיחה וסגירה ────────────────────────────────────────
    ['1x3bY0wb0mAhp_7PYvOaEGOR1NXcnkQoc', 'CHECKLISTS', 'נוהל פתיחה וסגירה מטבח.docx'],

    // ── הדרכות ומדרג ──────────────────────────────────────────────────
    ['17vPbfj6wdKms3u7TFwbRIeAeACABmJt7', 'TRAINING',   'נוהל דירוג עובדים אינטראקטיבי.docx'],
    ['1bKT4FvLcAoEZxYlClL4GWbsHEd6Dg0lI', 'TRAINING',   'נוהל דירוג עובדים אינטראקטיבי.pdf'],
    ['1D7gNBHcqpdnClvOI6sdoNzW-yWbm78iT', 'TRAINING',   'חומר למידה לעובד.docx'],
    ['1uKqkHJF43WOcGosABtTCdViWnyeC4w9z', 'TRAINING',   'עותק של ספר לימוד יומי: COO מרכז המבקרים.docx'],
    ['1lsOJbKwomDTGpEavmiCdUVsHI_YMeC_j', 'TRAINING',   'דמתי מרכז מבקרים התלמדויות (1).docx'],
    ['1O_cfJecq_Ux_3_HfnGraiye9z-l86Nlx', 'TRAINING',   'תכנית החניכה לאחמ"ש.docx'],
    ['1u9P387xxQJCAw5Ipjsd2lQ00AHzsXTDh', 'TRAINING',   'הגדרות תפקידים.docx'],
    ['146V6DR8xgLH101hrmd94YANsCWIpyO5_', 'TRAINING',   'תוכנית תמרוץ לצוות המטבח.docx'],
    ['1H4MTupa-VbwXAelcRGYE83OzNRJCSWOs', 'TRAINING',   'התלמדות מטבח.xlsx'],
    ['1sXb-uog7QM1mJcBMd7wowg4L7lnoflHq', 'TRAINING',   'תוכנית "חבר מביא חבר".docx'],
    ['1XeVPQh0OFcZTTagThNXep7ELl4dB36aT', 'TRAINING',   'חבר מביא חבר.docx'],
    ['1dzG46q-nL34PmUK3AK3of6wy7XhMnS4C', 'TRAINING',   'הגדרת תפקיד לרכז תפעול.docx'],

    // ── שיבוצים ───────────────────────────────────────────────────────
    ['105nuKbVW0dBGjAao-dmapS3CUzjvrrjx', 'SHIFTS',     'משמרות.docx'],

    // ── ביצועים ו-SPH ─────────────────────────────────────────────────
    ['12-62fxeOkHtbi9Y7utA9WHu9Bfb-v_Rf', 'KPI',        'עדכון חשוב – תחרות מכירות.docx'],
    ['1wSHGR-X5Uo4a55rdvLviNB-4QFAV9u4l', 'KPI',        'מכירות מלצרים 1.ods'],
    ['1VMgU_huaDNPRHZS8sJGT2uXALrEIr8Pq', 'KPI',        'מכירות מלצרים 1.xlsx'],

    // ── מחירוני אירועים ───────────────────────────────────────────────
    ['1PokG9eU8M7ZvJR4R9x-Om_TdJDHWJs62', 'EVENT_PRICE','ניהול לידים ואירועים במערכת CRM.docx'],
    ['1mmoVzU6FUm3MUcqHAgcujxQ-o-qZE4m5', 'EVENT_PRICE','הנגשת אמנת מנהלת אירועים לעממית.docx'],
    ['1i7swbRKIB6QX0RELtcapRwTEqO8vLsob', 'EVENT_PRICE','מהלך שיחה B2B.docx'],

    // ── לוג אירועים ───────────────────────────────────────────────────
    ['1nIbasMJIerctpEHB1GnYMZO1cFRPw6C0', 'EVENT_LOG',  'סיכום_אירוע_Forter_משק_דמתי.docx'],

    // ── ספירת מלאי ────────────────────────────────────────────────────
    ['18m9Nw_JyVRstd4jlSXim9_H5FIEalpH2', 'INVENTORY',  'מלאי יין.xlsx'],

    // ── לוג תפעולי ────────────────────────────────────────────────────
    ['1cvZZJLPa1okoShd64sQPTr_i-6OXy4Et', 'OPS_LOG',    'L O G B O O K — דוח מוכנות למשמרת.docx'],
    ['1VJ8ebTOH76Hwb3qCO-wq6p1hrw6aPaUk', 'OPS_LOG',    'ישיבת מטה: נתונים, היערכות ופתרונות.docx'],
    ['1bNAm46O7tMGVcQk_vXj-auNSRX_YzUly', 'OPS_LOG',    'ישיבת צוות מוצש בערב.docx'],
    ['1qvpRWn73mHRHp_cmCEqgNpyZhMHRLQGP', 'OPS_LOG',    'ישיבת מטה 2_11_2025.docx'],
    ['1RRFsxyElnj4p-jTucuVFX4avaRciTUR-', 'OPS_LOG',    'ישיבת מטה 16_11.docx'],
    ['1mO50t1YnNiEd7eMJJspXr4794kKxdHxt', 'OPS_LOG',    'מנהל תפעול מרכז מבקרים (דאשבורד משימות).csv'],
    ['1yRAKg8ORXzNdH8lmnrIxex_W8rn3XAEV', 'OPS_LOG',    'מנהל תפעול מרכז מבקרים (1).xlsx'],
    ['1jA07AMzZiVLIp3-R-L4sgrnUGfl1QrQHrgbrzoIKyLU', 'OPS_LOG', 'יקב: מביוגרפיה עסקית לאוטונומיה דיגיטלית'],
    ['1rYolRBC17G4CTPEPgPTAiYJeJHREebv0', 'OPS_LOG',    'אוקיי בוא נערוך את האמנה הראשונה.docx'],
    ['1Ez6YvbJLwkDwTj6tUBGjEGH0YSSuUJqt', 'OPS_LOG',    'דמתי מרכז מבקרים - ליבה.xlsx'],

    // ── דוחות יומיים ──────────────────────────────────────────────────
    ['108Vgp4UCzt2sHDuRXr1J238i-RstHga3', 'REPORTS',    'ניתוח סקר לקוחות ודוח חריגים.docx'],
    ['1jqX942AdgCYYQXCd0Lj_tb18dml5iImq', 'REPORTS',    'יקב דמתי 67 - סקר לקוחות שבועי.docx'],
  ];

  // ======= ביצוע ההזזות =======
  let moved = 0;
  let failed = 0;
  const log = [];

  for (const [fileId, folderKey, name] of MOVES) {
    try {
      const file = DriveApp.getFileById(fileId);
      const targetFolder = DriveApp.getFolderById(FOLDERS[folderKey]);
      file.moveTo(targetFolder);
      moved++;
      log.push(`✅ ${name} → ${folderKey}`);
      Logger.log(`✅ ${name}`);
    } catch (e) {
      failed++;
      log.push(`❌ FAILED: ${name} — ${e.message}`);
      Logger.log(`❌ FAILED: ${name} — ${e.message}`);
    }
  }

  // ======= סיכום =======
  const summary = `
════════════════════════════════
📊 סיכום הזזות — OpenClaw 67 Winery
════════════════════════════════
✅ הוזזו בהצלחה: ${moved} קבצים
❌ נכשלו:        ${failed} קבצים
📁 סה"כ:         ${MOVES.length} קבצים
════════════════════════════════
${log.join('\n')}
  `.trim();

  Logger.log(summary);
  Browser.msgBox(summary.substring(0, 1000)); // הצג popup קצר
}
