<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KlickPix Command Centre</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="data.js"></script>
</head>
<body style="background:#f4f4f7; font-family: 'Syne', sans-serif; padding: 20px;">

<div id="admin-app" style="max-width:800px; margin:0 auto;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
        <h1>COMMAND CENTRE</h1>
        <button onclick="location.reload()" style="padding:8px 15px; border-radius:5px; cursor:pointer; font-family: 'Syne'; font-weight:bold;">REFRESH</button>
    </div>

    <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #ddd; margin-bottom:30px;">
        <h3 style="margin-top:0; font-size:0.9rem; color:#666;">NEW EVENT</h3>
        <div style="display:flex; gap:10px;">
            <input type="text" id="ev-title-input" placeholder="Event Name" style="flex:1; padding:12px; border:1px solid #ddd; border-radius:8px;">
            <button onclick="handleCreateEvent()" style="background:#e11d48; color:white; border:none; padding:0 25px; border-radius:8px; font-weight:bold; cursor:pointer;">CREATE</button>
        </div>
    </div>

    <div id="list-container">Connecting to Supabase...</div>
</div>

<script>
    const sb = supabase.createClient(window.KLICKPIX_CONFIG.SUPABASE_URL, window.KLICKPIX_CONFIG.SUPABASE_ANON_KEY);

    async function renderEvents() {
        const listDiv = document.getElementById('list-container');
        const { data: galleries, error } = await sb.from('pe_galleries').select('*').order('created_at', { ascending: false });

        if (error) {
            listDiv.innerHTML = "Error: " + error.message;
            return;
        }

        if (!galleries || galleries.length === 0) {
            listDiv.innerHTML = "<p style='color:#999; text-align:center; padding:40px; border:2px dashed #ddd; border-radius:12px;'>No events found. Create one above.</p>";
            return;
        }

        let html = '';
        galleries.forEach(g => {
            html += `
                <div style="background:#fff; padding:20px; border-radius:12px; margin-bottom:15px; border:1px solid #eee; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
                    <div style="flex:1;">
                        <div style="font-weight:bold; font-size:1.2rem;">${g.title}</div>
                        <div id="status-${g.id}" style="font-size:0.75rem; color:#e11d48; font-weight:bold; margin-top:5px; height:15px;"></div>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" id="up-${g.id}" multiple accept="image/*" style="display:none;" onchange="handleUpload('${g.id}')">
                        <label for="up-${g.id}" style="background:#111; color:white; padding:10px 20px; border-radius:8px; cursor:pointer; font-size:0.8rem; font-weight:bold;">UPLOAD PHOTOS</label>
                        <button onclick="deleteEvent('${g.id}')" style="background:none; border:none; color:#ccc; cursor:pointer; font-size:0.7rem; font-weight:bold;">DELETE</button>
                    </div>
                </div>`;
        });
        listDiv.innerHTML = html;
    }

    async function handleCreateEvent() {
        const titleInput = document.getElementById('ev-title-input');
        const title = titleInput.value;
        if (!title) return;
        const { error } = await sb.from('pe_galleries').insert([{ title: title, is_live: true }]);
        if (!error) { titleInput.value = ''; renderEvents(); }
    }

    async function handleUpload(gId) {
        const fileInput = document.getElementById(`up-${gId}`);
        const status = document.getElementById(`status-${gId}`);
        const files = Array.from(fileInput.files);
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            status.innerText = `PROCESSING ${i + 1} OF ${files.length}...`;
            
            const fileName = `${gId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            
            const { error: upErr } = await sb.storage.from('gallery-photos').upload(fileName, file);
            
            if (!upErr) {
                const { data: { publicUrl } } = sb.storage.from('gallery-photos').getPublicUrl(fileName);
                await sb.from('pe_photos').insert([{
                    gallery_id: gId,
                    preview_url: publicUrl,
                    full_res_url: publicUrl,
                    price: 15
                }]);
            }
        }
        status.innerText = "UPLOAD COMPLETE ✓";
        setTimeout(() => { status.innerText = ""; }, 4000);
    }

    async function deleteEvent(id) {
        if (!confirm("Delete this event and all photos?")) return;
        await sb.from('pe_galleries').delete().eq('id', id);
        renderEvents();
    }

    renderEvents();
</script>
</body>
</html>