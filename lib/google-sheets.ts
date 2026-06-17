// Helper API untuk berkomunikasi dengan Google Apps Script Web App

const getScriptUrl = () => {
  const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
  if (!url) {
    console.error('ERROR: NEXT_PUBLIC_APPS_SCRIPT_URL belum di-set di .env.local');
    return '';
  }
  return url;
};

export async function fetchSheetData(sheetName: string) {
  const url = getScriptUrl();
  if (!url) return [];

  try {
    const response = await fetch(`${url}?action=get_all&sheet=${sheetName}`, {
      method: 'GET',
      // Apps script mungkin butuh no-cors jika dipanggil dari browser langsung, 
      // tapi dari server component (API Routes) bisa langsung fetch biasa
    });
    const result = await response.json();
    if (result.status === 'success') {
      return result.data;
    } else {
      console.error('Error dari Apps Script:', result.message);
      return [];
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

export async function createSheetRow(sheetName: string, payload: Record<string, unknown>) {
  const url = getScriptUrl();
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        sheet: sheetName,
        payload: payload,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Create error:', error);
    return { status: 'error', message: String(error) };
  }
}

export async function updateSheetRow(sheetName: string, payload: { id: string; [key: string]: unknown }) {
  const url = getScriptUrl();
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        action: 'update',
        sheet: sheetName,
        payload: payload,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Update error:', error);
    return { status: 'error', message: String(error) };
  }
}

export async function deleteSheetRow(sheetName: string, id: string) {
  const url = getScriptUrl();
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete',
        sheet: sheetName,
        payload: { id },
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    return { status: 'error', message: String(error) };
  }
}

export async function cleanupEmptyRows(sheetName: string) {
  const url = getScriptUrl();
  if (!url) return { status: 'error', message: 'URL not configured' };

  try {
    const response = await fetch(`${url}?action=cleanup_empty&sheet=${sheetName}`, {
      method: 'GET',
    });
    return await response.json();
  } catch (error) {
    console.error('Cleanup error:', error);
    return { status: 'error', message: String(error) };
  }
}

