import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { journals } = body;

    if (!Array.isArray(journals)) {
      return NextResponse.json({ error: 'Data jurnal harus berupa array' }, { status: 400 });
    }

    const results = journals.map((j: { name: string; issn: string }) => {
      return DataService.checkPredatoryJournal(j.name || '', j.issn || '');
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
