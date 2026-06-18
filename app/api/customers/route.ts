import { NextResponse } from 'next/server';
import { createSheetRow } from '@/lib/google-sheets';
import { CustomerSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = CustomerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.issues },
        { status: 400 }
      );
    }

    const validData = result.data;

    const sheetPayload: Record<string, unknown> = {
      'Nama Lembaga': validData.institution_name || '',
      'NAMA': validData.name,
      'Nomor WA': validData.phone_number,
    };

    const sheetResponse = await createSheetRow('Customers', sheetPayload);

    if (sheetResponse?.status === 'error') {
      throw new Error(sheetResponse.message);
    }

    return NextResponse.json({ success: true, data: validData }, { status: 201 });
  } catch (error: any) {
    console.error('API Customer POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
