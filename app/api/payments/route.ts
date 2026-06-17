import { NextResponse } from 'next/server';
import { createSheetRow } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body['Tanggal'] || !body['ID Order'] || !body['Jumlah Bayar ']) {
      return NextResponse.json(
        { error: 'Field Tanggal, ID Order, dan Jumlah Bayar wajib diisi.' },
        { status: 400 }
      );
    }

    // Save to Google Sheets via Apps Script
    const sheetResponse = await createSheetRow('Payments', body);

    if (sheetResponse?.status === 'error') {
      throw new Error(sheetResponse.message);
    }

    return NextResponse.json({ success: true, data: body }, { status: 201 });
  } catch (error: any) {
    console.error('API Payment POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
