// ====================================================
//  67 Winery — Shift System v3.1 (FIXED)
// ====================================================

const SS = SpreadsheetApp.getActiveSpreadsheet();

// Convert any value to "HH:MM" string (handles Date objects from Sheets)
function toTimeStr(val) {
  if (!val && val !== 0) return '';
  if (val instanceof Date) {
    return String(val.getHours()).padStart(2,'0') + ':' + String(val.getMinutes()).padStart(2,'0');
  }
  return String(val).trim();
}

function setupSheets() {
  let empSheet = SS.getSheetByName('עובדים');
  if (!empSheet) {
    empSheet = SS.insertSheet('עובדים');
    empSheet.getRange('A1:B1').setValues([['שם','קוד']]);
    empSheet.getRange('A1:B1').setFontWeight('bold');
  }

  let resSheet = SS.getSheetByName('תגובות');
  if (!resSheet) {
    resSheet = SS.insertSheet('תגובות');
    resSheet.getRange('A1:F1').setValues([['שם עובד','קוד','תאריך','משמרת','העדפה','חותמת זמן']]);
    resSheet.getRange('A1:F1').setFontWeight('bold');
  }
  resSheet.getRange('C:D').setNumberFormat('@');

  let assignSheet = SS.getSheetByName('שיבוצים');
  if (!assignSheet) {
    assignSheet = SS.insertSheet('שיבוצים');
    assignSheet.getRange('A1:E1').setValues([['שם עובד','קוד','תאריך','משמרת','חותמת זמן']]);
    assignSheet.getRange('A1:E1').setFontWeight('bold');
  }
  assignSheet.getRange('C:D').setNumberFormat('@');

  let cfgSheet = SS.getSheetByName('הגדרות');
  if (!cfgSheet) {
    cfgSheet = SS.insertSheet('הגדרות');
    cfgSheet.getRange('A1:B5').setValues([
      ['חודש', new Date().getMonth()+2],['שנה', new Date().getFullYear()],
      ['סטטוס','פתוח'],['סיסמת מנהל','admin67'],['שכר לשעה',40]
    ]);
    cfgSheet.getRange('A1:A5').setFontWeight('bold');
  } else {
    if (!cfgSheet.getRange('A5').getValue()) {
      cfgSheet.getRange('A5:B5').setValues([['שכר לשעה',40]]);
    }
  }

  let shiftSheet = SS.getSheetByName('תבניות משמרות');
  if (!shiftSheet) {
    shiftSheet = SS.insertSheet('תבניות משמרות');
    shiftSheet.getRange('A1:D1').setValues([['יום (0-6)','שם יום','שעת התחלה','שעת סיום']]);
    shiftSheet.getRange('A1:D1').setFontWeight('bold');
  }
  // Force text format on time columns
  shiftSheet.getRange('C:D').setNumberFormat('@');

  // Write defaults if empty
  if (shiftSheet.getLastRow() <= 1) {
    const defaults = [
      [2,'שלישי','17:00','00:00'],[3,'רביעי','16:00','00:00'],[3,'רביעי','17:00','00:00'],
      [4,'חמישי','17:00','22:00'],[4,'חמישי','17:00','00:00'],[4,'חמישי','17:30','00:00'],
      [5,'שישי','08:00','16:00'],[5,'שישי','08:00','16:00'],[5,'שישי','10:00','17:00'],[5,'שישי','12:00','17:00'],
      [6,'מוצ"ש','20:00','00:00'],[6,'מוצ"ש','20:00','00:00'],
    ];
    shiftSheet.getRange(2,1,defaults.length,4).setValues(defaults);
    shiftSheet.getRange(2,3,defaults.length,2).setNumberFormat('@');
  }

  SpreadsheetApp.getUi().alert('הגיליון מוכן!');
}

function generateCodes() {
  const sheet = SS.getSheetByName('עובדים');
  const names = sheet.getRange('A2:A').getValues().flat().filter(n=>n);
  names.forEach((name,i) => {
    if (!sheet.getRange(`B${i+2}`).getValue())
      sheet.getRange(`B${i+2}`).setValue(Math.random().toString(36).substring(2,8));
  });
  SpreadsheetApp.getUi().alert('קודים נוצרו!');
}

// --- Web App ---
function doGet(e) {
  const action = e.parameter.action||'';
  const callback = e.parameter.callback||'';
  let result = {};
  switch(action) {
    case 'config': result=getConfig(); break;
    case 'employees': result=getEmployees(); break;
    case 'identify': result=identifyEmployee(e.parameter.code||''); break;
    case 'responses': result=getAllResponses(); break;
    case 'my_responses': result=getMyResponses(e.parameter.code||''); break;
    case 'shift_templates': result=getShiftTemplates(); break;
    case 'assignments': result=getAllAssignments(); break;
    case 'my_assignments': result=getMyAssignments(e.parameter.code||''); break;
    default: result={error:'Unknown action'};
  }
  return callback
    ? ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT)
    : ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    switch(data.action) {
      case 'submit_prefs': return handleSubmitPrefs(data);
      case 'save_config': return handleSaveConfig(data);
      case 'save_shifts': return handleSaveShifts(data);
      case 'add_employee': return handleAddEmployee(data);
      case 'remove_employee': return handleRemoveEmployee(data);
      case 'clear_responses': return handleClearResponses(data);
      case 'save_assignments': return handleSaveAssignments(data);
      default: return jr({error:'Unknown'});
    }
  } catch(err) { return jr({error:err.message}); }
}

function jr(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function handleSubmitPrefs(data) {
  const emp = identifyEmployee(data.code);
  if (emp.error) return jr({error:'עובד לא מזוהה'});
  if (getConfig().status !== 'פתוח') return jr({error:'סגור'});

  const sheet = SS.getSheetByName('תגובות');
  const ts = new Date().toLocaleString('he-IL');

  // Delete old
  const all = sheet.getDataRange().getValues();
  for (let i=all.length-1; i>=1; i--) {
    if (String(all[i][1])===String(data.code)) sheet.deleteRow(i+1);
  }
  // Write new as plain strings
  const rows = data.preferences.map(p => [emp.name, String(data.code), String(p.date), String(p.shift), String(p.pref), ts]);
  if (rows.length) {
    const sr = sheet.getLastRow()+1;
    sheet.getRange(sr,1,rows.length,6).setValues(rows);
    sheet.getRange(sr,3,rows.length,2).setNumberFormat('@');
  }
  return jr({success:true, count:rows.length});
}

function handleSaveConfig(data) {
  const s = SS.getSheetByName('הגדרות');
  if (data.month!==undefined) s.getRange('B1').setValue(data.month);
  if (data.year!==undefined) s.getRange('B2').setValue(data.year);
  if (data.status!==undefined) s.getRange('B3').setValue(data.status);
  if (data.hourlyRate!==undefined) s.getRange('B5').setValue(data.hourlyRate);
  return jr({success:true});
}

function handleSaveShifts(data) {
  const sheet = SS.getSheetByName('תבניות משמרות');
  const lr = sheet.getLastRow();
  if (lr>1) sheet.getRange(2,1,lr-1,4).clear();
  const shifts = data.shifts;
  if (shifts.length) {
    // Write as plain text strings
    const rows = shifts.map(s => [s.day, s.dayName, String(s.start), String(s.end)]);
    sheet.getRange(2,1,rows.length,4).setValues(rows);
    sheet.getRange(2,3,rows.length,2).setNumberFormat('@');
  }
  return jr({success:true});
}

function handleSaveAssignments(data) {
  const sheet = SS.getSheetByName('שיבוצים');
  const ts = new Date().toLocaleString('he-IL');
  const lr = sheet.getLastRow();
  if (lr>1) sheet.deleteRows(2,lr-1);
  const rows = data.assignments;
  if (rows.length) {
    const vals = rows.map(r => [r.name, String(r.code), String(r.date), String(r.shift), ts]);
    sheet.getRange(2,1,vals.length,5).setValues(vals);
    sheet.getRange(2,3,vals.length,2).setNumberFormat('@');
  }
  return jr({success:true, count:rows.length});
}

function handleAddEmployee(data) {
  const sheet = SS.getSheetByName('עובדים');
  const name = data.name.trim();
  if (!name) return jr({error:'שם ריק'});
  if (sheet.getRange('A2:A').getValues().flat().includes(name)) return jr({error:'קיים'});
  const code = Math.random().toString(36).substring(2,8);
  sheet.getRange(sheet.getLastRow()+1,1,1,2).setValues([[name,code]]);
  return jr({success:true,name,code});
}

function handleRemoveEmployee(data) {
  const sheet = SS.getSheetByName('עובדים');
  const all = sheet.getDataRange().getValues();
  for (let i=all.length-1;i>=1;i--) {
    if (all[i][1]===data.code) { sheet.deleteRow(i+1); return jr({success:true}); }
  }
  return jr({error:'לא נמצא'});
}

function handleClearResponses() {
  const s1 = SS.getSheetByName('תגובות');
  if (s1.getLastRow()>1) s1.deleteRows(2,s1.getLastRow()-1);
  const s2 = SS.getSheetByName('שיבוצים');
  if (s2 && s2.getLastRow()>1) s2.deleteRows(2,s2.getLastRow()-1);
  return jr({success:true});
}

// --- Getters (with Date-to-string conversion) ---
function getConfig() {
  const s = SS.getSheetByName('הגדרות');
  return { month:s.getRange('B1').getValue(), year:s.getRange('B2').getValue(),
    status:s.getRange('B3').getValue(), hourlyRate:s.getRange('B5').getValue()||40 };
}

function getEmployees() {
  return SS.getSheetByName('עובדים').getRange('A2:B').getValues().filter(r=>r[0]).map(r=>({name:r[0],code:String(r[1])}));
}

function identifyEmployee(code) {
  const d = SS.getSheetByName('עובדים').getRange('A2:B').getValues().filter(r=>r[0]);
  const f = d.find(r=>String(r[1])===String(code));
  return f ? {name:f[0],code:String(f[1])} : {error:'not found'};
}

function getShiftTemplates() {
  const sheet = SS.getSheetByName('תבניות משמרות');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length<=1) return [];
  return data.slice(1).filter(r=>r[0]!=='').map(r=>({
    day: r[0],
    dayName: String(r[1]),
    start: toTimeStr(r[2]),
    end: toTimeStr(r[3])
  }));
}

function getAllResponses() {
  const data = SS.getSheetByName('תגובות').getDataRange().getValues();
  if (data.length<=1) return [];
  return data.slice(1).map(r=>({
    name:r[0], code:String(r[1]), date:String(r[2]), shift:String(r[3]), pref:String(r[4]), timestamp:r[5]
  }));
}

function getMyResponses(code) { return getAllResponses().filter(r=>r.code===String(code)); }

function getAllAssignments() {
  const sheet = SS.getSheetByName('שיבוצים');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length<=1) return [];
  return data.slice(1).map(r=>({
    name:r[0], code:String(r[1]), date:String(r[2]), shift:String(r[3])
  }));
}

function getMyAssignments(code) { return getAllAssignments().filter(r=>r.code===String(code)); }

function onOpen() {
  SpreadsheetApp.getUi().createMenu('67 משמרות')
    .addItem('הקמה ראשונית','setupSheets')
    .addItem('צור קודים','generateCodes')
    .addToUi();
}
