import { NextResponse } from 'next/server';
import { createSheetRow, deleteSheetRow } from '@/lib/google-sheets';
import { OrderSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const result = OrderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.issues },
        { status: 400 }
      );
    }

    const validData = result.data;

    // Map Zod schema fields → Google Sheets column headers
    // Sheet "Daftar Order" headers: ID Order, Tanggal, Nama, No WA, Judul Buku, Qty, Harga Satuan, Harga Total, Status, Total Terbayar, Sisa
    const sheetPayload: Record<string, unknown> = {
      'ID Order': validData.id,
      'Tanggal': validData.order_date,
      'Nama': validData.customer_name,
      'Instansi': validData.institution || '',
      'No WA': validData.phone_number,
      'Ekspedisi': validData.ekspedisi || '',
      'Alamat Lengkap': validData.alamat || '',
      'Judul Buku': validData.items.map((item: any) => `${item.title} (${item.qty}x @ ${item.price})`).join(', '),
      'Qty': validData.items.reduce((acc: number, item: any) => acc + item.qty, 0),
      'Harga Satuan': 0,
      'Harga Total': validData.total_amount,
      'Status': validData.status,
      'Total Terbayar': validData.paid_amount,
    };

    const sheetResponse = await createSheetRow('Orders', sheetPayload);

    if (sheetResponse?.status === 'error') {
      throw new Error(sheetResponse.message);
    }

    return NextResponse.json({ success: true, data: validData }, { status: 201 });
  } catch (error: any) {
    console.error('API Order POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'ID Order wajib diisi' }, { status: 400 });
    }

    const sheetResponse = await deleteSheetRow('Orders', orderId);

    if (sheetResponse?.status === 'error') {
      throw new Error(sheetResponse.message);
    }

    return NextResponse.json({ success: true, message: `Order ${orderId} berhasil dihapus` });
  } catch (error: any) {
    console.error('API Order DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
