/**
 * KAFFFAH WAREHOUSE - GOOGLE APPS SCRIPT API (CUSTOM LAYOUT)
 * 
 * Script ini didesain KHUSUS untuk membaca layout Excel Anda yang memiliki
 * tabel berdampingan (side-by-side) dan merged cells tanpa merusak format aslinya!
 */

// KONFIGURASI LAYOUT SPESIFIK SESUAI FILE EXCEL ANDA
const CONFIG = {
  'Products': { 
    tab: 'Buku', 
    headerRow: 2, // Baris 2 adalah header (Nama Buku, Harga Produksi, dll)
    idColName: 'Nama Buku', // Kita pakai Nama Buku sebagai ID
    startCol: 1, endCol: 10,
    readOnly: true // Karena ada tabel Hasil Penjualan di bawahnya, Web hanya membaca dari sini
  },
  'Products_Sales': { 
    tab: 'Buku', 
    headerRow: 14, // Sesuai baris tabel Hasil Penjualan
    idColName: 'Nama Buku',
    startCol: 1, endCol: 10,
    readOnly: true
  },
  'Customers': { 
    tab: 'Customer', 
    headerRow: 1, 
    idColName: 'Nomor WA', // Pakai Nomor WA sebagai ID Customer
    startCol: 1, endCol: 3
  },
  'Orders': { 
    tab: 'Daftar Order', 
    headerRow: 1, 
    idColName: 'ID Order',
    startCol: 1, endCol: 11 // Membaca kolom A sampai K (Abaikan tabel Harga Buku di kolom M)
  },
  'Payments': { 
    tab: 'Log Pembayaran', 
    headerRow: 1, 
    idColName: 'ID Order', 
    startCol: 1, endCol: 6
  },
  'Inventory_In': { 
    tab: 'Log Barang', 
    headerRow: 2, // Header ada di baris 2 (Tanggal, Judul Buku, Jumlah, Keterangan)
    idColName: null, 
    startCol: 1, endCol: 4 // Kolom A sampai D (Barang Masuk)
  },
  'Inventory_Out': { 
    tab: 'Log Barang', 
    headerRow: 2, 
    idColName: null, 
    startCol: 6, endCol: 9 // Kolom F sampai I (Barang Keluar)
  }
};

function getSheetTarget(tabName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); // Menggunakan file yang sama
  return ss.getSheetByName(tabName);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'get_all') {
      const sheetKey = e.parameter.sheet;
      const conf = CONFIG[sheetKey];
      
      if (!conf) return responseJson({ status: 'error', message: 'Config tidak ditemukan' });
      
      const sheet = getSheetTarget(conf.tab);
      if (!sheet) return responseJson({ status: 'error', message: 'Sheet tidak ditemukan' });
      
      const data = readCustomLayout(sheet, conf);
      return responseJson({ status: 'success', data: data });
    }

    // Cleanup empty rows (rows where first column is empty)
    if (action === 'cleanup_empty') {
      const sheetKey = e.parameter.sheet;
      const conf = CONFIG[sheetKey];
      if (!conf) return responseJson({ status: 'error', message: 'Config tidak ditemukan' });
      
      const sheet = getSheetTarget(conf.tab);
      if (!sheet) return responseJson({ status: 'error', message: 'Sheet tidak ditemukan' });
      
      const lastRow = sheet.getLastRow();
      let deletedCount = 0;
      // Loop dari bawah ke atas agar index tidak bergeser saat delete
      for (let row = lastRow; row > conf.headerRow; row--) {
        const val = sheet.getRange(row, conf.startCol).getValue();
        if (val === "" || val === null) {
          sheet.deleteRow(row);
          deletedCount++;
        }
      }
      return responseJson({ status: 'success', message: deletedCount + ' baris kosong dihapus' });
    }

    return responseJson({ status: 'error', message: 'Action tidak dikenal' });
  } catch (error) {
    return responseJson({ status: 'error', message: error.toString() });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const sheetKey = body.sheet;
    const payload = body.payload;

    const conf = CONFIG[sheetKey];
    if (!conf) return responseJson({ status: 'error', message: 'Config tidak ditemukan' });
    if (conf.readOnly) return responseJson({ status: 'error', message: 'Tabel ini Read-Only' });

    const sheet = getSheetTarget(conf.tab);
    
    if (action === 'create') {
      const rows = Array.isArray(payload) ? payload : [payload];
      appendCustomLayout(sheet, conf, rows);
      return responseJson({ status: 'success', message: 'Data berhasil ditambahkan' });
    }

    if (action === 'update') {
      updateCustomLayout(sheet, conf, payload);
      return responseJson({ status: 'success', message: 'Data berhasil diupdate' });
    }

    if (action === 'delete') {
      deleteCustomLayout(sheet, conf, payload.id);
      return responseJson({ status: 'success', message: 'Data berhasil dihapus' });
    }

    return responseJson({ status: 'error', message: 'Action tidak dikenal' });
  } catch (error) {
    return responseJson({ status: 'error', message: error.toString() });
  }
}

/**
 * Membaca data dengan batasan kolom spesifik agar tidak membaca tabel sebelah
 */
function readCustomLayout(sheet, conf) {
  const lastRow = sheet.getLastRow();
  if (lastRow < conf.headerRow) return [];
  
  // Ambil data hanya sebatas kolom yang ditentukan
  const range = sheet.getRange(conf.headerRow, conf.startCol, (lastRow - conf.headerRow) + 1, (conf.endCol - conf.startCol) + 1);
  const values = range.getValues();
  
  const headers = values[0];
  const dataList = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    // Berhenti membaca jika kolom pertama kosong (menghindari membaca tabel Hasil Penjualan di bawahnya)
    if (row[0] === "" || row[0] === null) {
       // Khusus untuk tabel Buku, ada celah kosong sebelum tabel Hasil Penjualan
       if (conf.tab === 'Buku') break; 
       else continue; 
    }
    
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) obj[headers[j]] = row[j];
    }
    dataList.push(obj);
  }
  return dataList;
}

/**
 * Menambahkan data ke kolom spesifik tanpa merusak kolom di sebelahnya
 */
function appendCustomLayout(sheet, conf, rowsData) {
  // Cari baris kosong terakhir HANYA di kolom spesifik (startCol)
  const columnData = sheet.getRange(conf.headerRow, conf.startCol, sheet.getLastRow() || 1, 1).getValues();
  let insertRowIndex = conf.headerRow + columnData.length; // Default jika penuh
  
  for (let i = columnData.length - 1; i >= 0; i--) {
    if (columnData[i][0] !== "") {
      insertRowIndex = conf.headerRow + i + 1;
      break;
    }
  }

  // Ambil headers
  const headers = sheet.getRange(conf.headerRow, conf.startCol, 1, (conf.endCol - conf.startCol) + 1).getValues()[0];
  
  const mappedData = rowsData.map(rowObj => {
    return headers.map(header => rowObj[header] !== undefined ? rowObj[header] : "");
  });

  sheet.getRange(insertRowIndex, conf.startCol, mappedData.length, headers.length).setValues(mappedData);
}

/**
 * Mengupdate data di kolom spesifik
 */
function updateCustomLayout(sheet, conf, payload) {
  if (!payload.id || !conf.idColName) throw new Error("ID tidak valid");

  const columnData = sheet.getRange(conf.headerRow, conf.startCol, sheet.getLastRow() || 1, (conf.endCol - conf.startCol) + 1).getValues();
  const headers = columnData[0];
  const idIndex = headers.indexOf(conf.idColName);
  
  if (idIndex === -1) throw new Error(`Kolom pencarian ${conf.idColName} tidak ditemukan`);

  let targetRow = -1;
  for (let i = 1; i < columnData.length; i++) {
    if (columnData[i][idIndex] == payload.id) {
      targetRow = conf.headerRow + i;
      break;
    }
  }

  if (targetRow === -1) throw new Error("Data tidak ditemukan");

  for (const key in payload) {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      sheet.getRange(targetRow, conf.startCol + colIndex).setValue(payload[key]);
    }
  }
}

/**
 * Menghapus baris data berdasarkan ID
 */
function deleteCustomLayout(sheet, conf, id) {
  if (!id || !conf.idColName) throw new Error("ID tidak valid untuk delete");

  const columnData = sheet.getRange(conf.headerRow, conf.startCol, sheet.getLastRow() || 1, (conf.endCol - conf.startCol) + 1).getValues();
  const headers = columnData[0];
  const idIndex = headers.indexOf(conf.idColName);
  
  if (idIndex === -1) throw new Error(`Kolom ${conf.idColName} tidak ditemukan`);

  let targetRow = -1;
  for (let i = 1; i < columnData.length; i++) {
    if (String(columnData[i][idIndex]) == String(id)) {
      targetRow = conf.headerRow + i;
      break;
    }
  }

  if (targetRow === -1) throw new Error("Data dengan ID " + id + " tidak ditemukan");

  // Hapus baris dan geser ke atas
  sheet.deleteRow(targetRow);
}

function responseJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
