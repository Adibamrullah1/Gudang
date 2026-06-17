import { NextResponse } from 'next/server';
import { createSheetRow } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = body.type; // 'IN' or 'OUT'

    if (!type || (type !== 'IN' && type !== 'OUT')) {
      return NextResponse.json(
        { error: 'Field type harus "IN" atau "OUT".' },
        { status: 400 }
      );
    }

    if (!body['Tanggal'] || !body['Judul Buku'] || !body['Jumlah']) {
      return NextResponse.json(
        { error: 'Field Tanggal, Judul Buku, dan Jumlah wajib diisi.' },
        { status: 400 }
      );
    }

    // Determine which sheet config to use
    const sheetKey = type === 'IN' ? 'Inventory_In' : 'Inventory_Out';

    // Prepare payload (exclude 'type' field since it's not a column in the sheet)
    const payload: Record<string, unknown> = {
      'Tanggal': body['Tanggal'],
      'Judul Buku': body['Judul Buku'],
      'Jumlah': Number(body['Jumlah']),
    };
    if (body['Keterangan']) {
      payload['Keterangan'] = body['Keterangan'];
    }

    const sheetResponse = await createSheetRow(sheetKey, payload);

    if (sheetResponse?.status === 'error') {
      throw new Error(sheetResponse.message);
    }

    return NextResponse.json({ success: true, data: payload }, { status: 201 });
  } catch (error: any) {
    console.error('API Inventory POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
