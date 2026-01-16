import { NextRequest, NextResponse } from 'next/server';
import { listFiles, getFile, saveFile, getLifeMapScores } from '@/lib/api';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    const type = searchParams.get('type'); // 'list' | 'file' | 'lifemap'

    if (type === 'lifemap') {
        return NextResponse.json(getLifeMapScores());
    }

    if (type === 'list' && path) {
        return NextResponse.json(listFiles(path));
    }

    if (type === 'file' && path) {
        const file = getFile(path);
        if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(file);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { path, content } = body;

    if (!path || content === undefined) {
        return NextResponse.json({ error: 'Missing path or content' }, { status: 400 });
    }

    try {
        saveFile(path, content);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

    try {
        const { deleteFile } = await import('@/lib/api');
        const success = deleteFile(path);
        if (success) return NextResponse.json({ success: true });
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
