import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
    // Membaca URL Database yang sudah Bapak setel di Netlify Dashboard
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    // 1. KETIKA GAME MEMINTA DATA PAPAN SKOR (Tombol "Lihat Papan Skor" diklik)
    if (req.method === 'GET') {
        try {
            // Cek dan buat tabel jika belum pernah ada (Otomatis)
            await sql`
                CREATE TABLE IF NOT EXISTS leaderboard (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50),
                    avatar VARCHAR(10),
                    score INT,
                    rank VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            
            // Ambil 10 orang dengan skor tertinggi
            const result = await sql`SELECT * FROM leaderboard ORDER BY score DESC, created_at ASC LIMIT 10`;
            
            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    // 2. KETIKA GAME MENGIRIM SKOR BARU (Saat game selesai)
    if (req.method === 'POST') {
        try {
            // Tangkap data nama, avatar, dan skor dari HTML
            const data = await req.json();
            
            // Masukkan data tersebut ke tabel database
            await sql`
                INSERT INTO leaderboard (name, avatar, score, rank) 
                VALUES (${data.name}, ${data.avatar}, ${data.score}, ${data.rank})
            `;
            
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    return new Response('Metode Tidak Diizinkan', { status: 405 });
};
