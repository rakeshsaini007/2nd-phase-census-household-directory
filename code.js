/**
 * ============================================================================
 * GOOGLE APPS SCRIPT (code.js) — MULTI-SHEET CENSUS HOUSEHOLD REGISTRY
 * ============================================================================
 * How to deploy:
 * 1. Open your Google Sheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any existing code in Code.gs and paste this entire file.
 * 4. Click Deploy -> New deployment (or Manage deployments -> Edit -> New version).
 * 5. Select type: Web app
 * 6. Set "Execute as": Me
 * 7. Set "Who has access": Anyone
 * 8. Click Deploy, authorize permissions, and copy the Web app URL.
 * 9. Paste that URL into src/config/appsScriptConfig.ts in the React app.
 */

var EXPECTED_HEADERS = [
  "परिवार के मुखिया का नाम",
  "मोबाइल नंबर",
  "जनगणना भवन नंबर",
  "जनगणना मकान नम्बर",
  "परिवार क्रमांक",
  "प्लॉट नम्बर",
  "स्व जनगणना SE ID 2nd Phase",
  "Total number of Members"
];

function normalizeText_(val) {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function resolveColumnMap_(headerRow) {
  var map = {
    headName: 0,
    mobileNumber: 1,
    buildingNumber: 2,
    houseNumber: 3,
    familyNumber: 4,
    plotNumber: 5,
    seId: 6,
    totalMembers: -1
  };

  if (!headerRow || headerRow.length === 0) {
    map.totalMembers = 7;
    return map;
  }

  for (var i = 0; i < headerRow.length; i++) {
    var h = normalizeText_(headerRow[i]);
    var hLower = h.toLowerCase();
    if (h === EXPECTED_HEADERS[0] || h.indexOf("मुखिया") !== -1) map.headName = i;
    else if (h === EXPECTED_HEADERS[1] || h.indexOf("मोबाइल") !== -1) map.mobileNumber = i;
    else if (h === EXPECTED_HEADERS[2] || h.indexOf("भवन") !== -1) map.buildingNumber = i;
    else if (h === EXPECTED_HEADERS[3] || h.indexOf("मकान") !== -1) map.houseNumber = i;
    else if (h === EXPECTED_HEADERS[4] || h.indexOf("परिवार क्रमांक") !== -1) map.familyNumber = i;
    else if (h === EXPECTED_HEADERS[5] || h.indexOf("प्लॉट") !== -1) map.plotNumber = i;
    else if (h === EXPECTED_HEADERS[6] || hLower.indexOf("se id") !== -1 || h.indexOf("स्व जनगणना") !== -1) map.seId = i;
    else if (h === EXPECTED_HEADERS[7] || hLower.indexOf("member") !== -1 || h.indexOf("सदस्य") !== -1) map.totalMembers = i;
  }

  if (map.totalMembers === -1) {
    map.totalMembers = Math.max(headerRow.length, 7);
  }

  return map;
}

function ensureHeadersExist_(sheet) {
  if (sheet.getLastRow() === 0) {
    var headerRange = sheet.getRange(1, 1, 1, EXPECTED_HEADERS.length);
    headerRange.setValues([EXPECTED_HEADERS]);
    headerRange.setFontWeight("bold");
    return;
  }

  var headerRow = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), EXPECTED_HEADERS.length)).getDisplayValues()[0];
  var colMap = resolveColumnMap_(headerRow);
  var membersCol = colMap.totalMembers + 1;
  var existingMembersHeader = normalizeText_(sheet.getRange(1, membersCol).getDisplayValue());
  if (!existingMembersHeader) {
    var cell = sheet.getRange(1, membersCol);
    cell.setValue(EXPECTED_HEADERS[7]);
    cell.setFontWeight("bold");
  }
}

function rowToRecord_(rowValues, rowIndex, colMap, sheetName) {
  return {
    rowIndex: rowIndex,
    sheetName: sheetName,
    headName: normalizeText_(rowValues[colMap.headName]),
    mobileNumber: normalizeText_(rowValues[colMap.mobileNumber]),
    buildingNumber: normalizeText_(rowValues[colMap.buildingNumber]),
    houseNumber: normalizeText_(rowValues[colMap.houseNumber]),
    familyNumber: normalizeText_(rowValues[colMap.familyNumber]),
    plotNumber: normalizeText_(rowValues[colMap.plotNumber]),
    seId: normalizeText_(rowValues[colMap.seId]),
    totalMembers: colMap.totalMembers >= 0 && colMap.totalMembers < rowValues.length
      ? normalizeText_(rowValues[colMap.totalMembers])
      : ""
  };
}

function readSingleSheet_(sheet) {
  var sheetName = sheet.getName();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    var headersOnly = lastRow === 1
      ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), EXPECTED_HEADERS.length)).getDisplayValues()[0]
      : EXPECTED_HEADERS;
    return {
      sheetName: sheetName,
      sheetId: sheet.getSheetId(),
      headers: headersOnly,
      records: []
    };
  }

  var values = sheet.getDataRange().getDisplayValues();
  var headers = values[0];
  var colMap = resolveColumnMap_(headers);
  var records = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var isEmpty = row.every(function (cell) {
      return normalizeText_(cell) === "";
    });
    if (isEmpty) continue;

    records.push(rowToRecord_(row, r + 1, colMap, sheetName));
  }

  return {
    sheetName: sheetName,
    sheetId: sheet.getSheetId(),
    headers: headers,
    records: records
  };
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET handler: returns ALL sheets in the Google Spreadsheet along with their records.
 * Uses getDisplayValues() so leading zeros (e.g., 0005, 002) are preserved.
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var allSheets = ss.getSheets();
    var requestedSheet = e && e.parameter && e.parameter.sheet ? String(e.parameter.sheet).trim() : "";

    if (requestedSheet) {
      var target = ss.getSheetByName(requestedSheet);
      if (!target) {
        return jsonResponse_({
          status: "error",
          message: "Sheet '" + requestedSheet + "' not found."
        });
      }
      var single = readSingleSheet_(target);
      return jsonResponse_({
        status: "success",
        sheets: [single],
        headers: single.headers,
        records: single.records
      });
    }

    var sheetsPayload = [];
    for (var i = 0; i < allSheets.length; i++) {
      sheetsPayload.push(readSingleSheet_(allSheets[i]));
    }

    var firstSheet = sheetsPayload.length > 0 ? sheetsPayload[0] : { headers: EXPECTED_HEADERS, records: [] };

    return jsonResponse_({
      status: "success",
      sheets: sheetsPayload,
      headers: firstSheet.headers,
      records: firstSheet.records
    });
  } catch (err) {
    return jsonResponse_({
      status: "error",
      message: err && err.message ? err.message : "Failed to read Google Sheets."
    });
  }
}

/**
 * POST handler: creates a new row or updates an existing row in the specified sheetName.
 * Accepts text/plain JSON body to avoid CORS preflight failures from Vercel/React.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var rawBody = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    var body = JSON.parse(rawBody);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var sheetName = normalizeText_(body.sheetName);
    var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
    if (!sheet) {
      return jsonResponse_({
        status: "error",
        message: "Target sheet '" + sheetName + "' was not found."
      });
    }

    ensureHeadersExist_(sheet);

    var values = sheet.getDataRange().getDisplayValues();
    var headers = values[0] || EXPECTED_HEADERS;
    var colMap = resolveColumnMap_(headers);
    var totalCols = Math.max(headers.length, EXPECTED_HEADERS.length, colMap.totalMembers + 1);

    var incoming = {
      rowIndex: body.rowIndex ? Number(body.rowIndex) : null,
      headName: normalizeText_(body.headName),
      mobileNumber: normalizeText_(body.mobileNumber),
      buildingNumber: normalizeText_(body.buildingNumber),
      houseNumber: normalizeText_(body.houseNumber),
      familyNumber: normalizeText_(body.familyNumber),
      plotNumber: normalizeText_(body.plotNumber),
      seId: normalizeText_(body.seId),
      totalMembers: normalizeText_(body.totalMembers)
    };

    if (!incoming.headName && !incoming.mobileNumber) {
      return jsonResponse_({
        status: "error",
        message: "Head of Family Name or Mobile Number is required."
      });
    }

    if (!/^P\d{11}$/.test(incoming.seId)) {
      return jsonResponse_({
        status: "error",
        message: 'SE ID (2nd Phase) must start with "P" followed by exactly 11 digits (e.g. P12345678901).'
      });
    }

    var targetRowIndex = null;

    if (incoming.rowIndex && incoming.rowIndex >= 2 && incoming.rowIndex <= sheet.getLastRow()) {
      targetRowIndex = incoming.rowIndex;
    }

    if (!targetRowIndex && incoming.mobileNumber) {
      for (var r = 1; r < values.length; r++) {
        var existingMobile = normalizeText_(values[r][colMap.mobileNumber]);
        if (existingMobile && existingMobile === incoming.mobileNumber) {
          targetRowIndex = r + 1;
          break;
        }
      }
    }

    if (!targetRowIndex && incoming.houseNumber && incoming.familyNumber) {
      for (var r2 = 1; r2 < values.length; r2++) {
        var existingHouse = normalizeText_(values[r2][colMap.houseNumber]);
        var existingFamily = normalizeText_(values[r2][colMap.familyNumber]);
        if (
          existingHouse === incoming.houseNumber &&
          existingFamily === incoming.familyNumber
        ) {
          targetRowIndex = r2 + 1;
          break;
        }
      }
    }

    var action = "saved";
    var writeRowIndex;

    if (targetRowIndex) {
      action = "updated";
      writeRowIndex = targetRowIndex;
    } else {
      action = "saved";
      writeRowIndex = sheet.getLastRow() + 1;
    }

    var rowArray = [];
    if (targetRowIndex && values[targetRowIndex - 1]) {
      rowArray = values[targetRowIndex - 1].slice();
    }
    while (rowArray.length < totalCols) {
      rowArray.push("");
    }

    rowArray[colMap.headName] = incoming.headName;
    rowArray[colMap.mobileNumber] = incoming.mobileNumber;
    rowArray[colMap.buildingNumber] = incoming.buildingNumber;
    rowArray[colMap.houseNumber] = incoming.houseNumber;
    rowArray[colMap.familyNumber] = incoming.familyNumber;
    rowArray[colMap.plotNumber] = incoming.plotNumber;
    rowArray[colMap.seId] = incoming.seId;
    rowArray[colMap.totalMembers] = incoming.totalMembers;

    var targetRange = sheet.getRange(writeRowIndex, 1, 1, totalCols);
    // Format as plain text ('@') BEFORE writing so leading zeros (0005, 002) are never stripped
    targetRange.setNumberFormat("@");
    targetRange.setValues([rowArray]);

    var savedRecord = rowToRecord_(rowArray, writeRowIndex, colMap, sheet.getName());

    return jsonResponse_({
      status: "success",
      action: action,
      sheetName: sheet.getName(),
      message:
        action === "updated"
          ? "Record updated successfully in '" + sheet.getName() + "' (Row " + writeRowIndex + ")."
          : "New record saved successfully to '" + sheet.getName() + "' (Row " + writeRowIndex + ").",
      rowIndex: writeRowIndex,
      record: savedRecord
    });
  } catch (err) {
    return jsonResponse_({
      status: "error",
      message: err && err.message ? err.message : "Failed to write to Google Sheet."
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignore) {}
  }
}
