/**
 * GOOGLE APPS SCRIPT КӨДІ (GOOGLE ТАБЛИЦАНЫ БАЙЛАНЫСТЫРУ ҮШІН)
 * 
 * НҰСҚАУЛЫҚ:
 * 1. Жаңа Google Таблица ашыңыз (tables.google.com).
 * 2. Жоғарғы мәзірден: "Расширения" (Extensions) -> "Apps Script" басыңыз.
 * 3. Ашылған терезедегі барлық кодты өшіріп, төмендегі кодты толығымен қойыңыз.
 * 4. "Сохранить" (Ctrl+S) басыңыз.
 * 5. Жоғарғы оң жақтағы "Начать развертывание" (Deploy) -> "Новое развертывание" (New deployment) басыңыз.
 * 6. Сол жақтағы шестеренка белгісінен "Веб-приложение" (Web app) таңдаңыз.
 * 7. "Кто имеет доступ" (Who has access) бөлімінде МІНДЕТТІ ТҮРДЕ: "Все" (Anyone) таңдаңыз!
 * 8. "Развернуть" батырмасын басып, берілген сілтемені (URL веб-приложения) көшіріп алыңыз.
 * 9. Осы сілтемені біздің жобадағы `js/config.js` файлындағы `googleSheetScriptUrl` мәніне қойыңыз.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();

    // Егер бірінші қатар бос болса, баған тақырыптарын жазамыз
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Уақыты (Дата)", 
        "Қонақтың аты-жөні (Имя)", 
        "Қатысу мәртебесі (Статус)", 
        "Қонақтар саны (Количество)", 
        "Ізгі тілек (Пожелание)"
      ]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#F5ECDD");
      sheet.setFrozenRows(1);
    }

    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    sheet.appendRow([
      data.dateLocal || new Date().toLocaleString(),
      data.name,
      data.attendance,
      data.guestCount || "1",
      data.wishes || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("RSVP Webhook жұмыс істеп тұр!");
}
