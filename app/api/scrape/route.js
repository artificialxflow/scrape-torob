import { spawn } from 'child_process';

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'آدرس دسته‌بندی ارسال نشده است.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // اجرای اسکریپت scrape.js با child_process
    const child = spawn('node', ['scrape.js', url], { cwd: process.cwd() });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    return await new Promise((resolve) => {
      child.on('close', (code) => {
        if (code === 0) {
          resolve(new Response(output, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }));
        } else {
          resolve(new Response(errorOutput || JSON.stringify({ error: 'خطا در اجرای اسکریپت اسکرپینگ' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }));
        }
      });
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'خطا در API', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 