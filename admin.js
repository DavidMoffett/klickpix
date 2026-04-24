const sb = supabase.createClient(window.KLICKPIX_CONFIG.SUPABASE_URL, window.KLICKPIX_CONFIG.SUPABASE_ANON_KEY);
const cache = {};

window.handleCreateEvent = async function() {
    const title = document.getElementById("newTitle").value.trim();
    const price = parseFloat(document.getElementById("newPrice").value) || 15.00;
    if (!title) return;
    await sb.from("pe_galleries").insert([{ title, default_price: price, is_live: true }]);
    location.reload();
};

window.deleteGallery = async function(id, title) {
    if (!confirm(`Confirm: Delete "${title}" and all its photos?`)) return;
    await sb.from("pe_photos").delete().eq("gallery_id", id);
    await sb.from("pe_galleries").delete().eq("id", id);
    location.reload();
};

async function initAdmin() {
    const { data: galleries } = await sb.from("pe_galleries").select("*").order("created_at", { ascending: false });
    
    const stats = galleries.reduce((acc, g) => {
        acc.v += (g.visit_count || 0);
        acc.r += parseFloat(g.total_revenue || 0);
        return acc;
    }, { v: 0, r: 0 });

    document.getElementById("totalVisits").innerText = stats.v;
    document.getElementById("totalRevenue").innerText = `$${stats.r.toFixed(2)}`;

    let html = "";
    galleries.forEach(g => {
        html += `
        <div class="admin-card" style="background:white; padding:2rem; border-radius:15px; margin-bottom:2rem; border:1px solid #eee;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 style="font-family:'Syne'; margin:0;">${g.title}</h2>
                    <p style="color:#666; font-size:0.9rem; margin:5px 0;">Price: NZD $${g.default_price}</p>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold; font-size:1.2rem;">$${g.total_revenue}</div>
                    <a href="index.html?id=${g.id}" target="_blank" style="color:#e11d48; text-decoration:none; font-weight:bold; font-size:0.8rem;">VIEW GALLERY</a>
                </div>
            </div>
            
            <div style="margin-top:1.5rem; background:#f9fafb; padding:1.5rem; border-radius:10px;">
                <input type="file" multiple onchange="window.cacheFiles(this, '${g.id}')" style="margin-bottom:10px;">
                <button class="btn btn-brand" onclick="window.upload('${g.id}', ${g.default_price})">UPLOAD IMAGES</button>
                <div id="status_${g.id}" style="margin-top:10px; font-size:0.8rem; font-weight:bold;"></div>
            </div>

            <button onclick="window.deleteGallery('${g.id}', '${g.title}')" style="margin-top:15px; background:none; border:none; color:#e11d48; cursor:pointer; font-size:0.7rem; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Delete Event</button>
        </div>`;
    });
    document.getElementById("adminGalleryList").innerHTML = html;
}

window.cacheFiles = (input, id) => {
    cache[id] = input.files;
    document.getElementById(`status_${id}`).innerText = `${input.files.length} images ready.`;
};

window.upload = async function(id, price) {
    const files = cache[id];
    if (!files) return alert("Select files first");
    const status = document.getElementById(`status_${id}`);
    for (let file of files) {
        const path = `${id}/${Date.now()}-${file.name}`;
        status.innerText = `Syncing ${file.name}...`;
        const { error } = await sb.storage.from('photos').upload(path, file);
        if (!error) {
            const { data: { publicUrl } } = sb.storage.from('photos').getPublicUrl(path);
            await sb.from('pe_photos').insert([{ gallery_id: id, preview_url: publicUrl, full_res_url: publicUrl, price: price }]);
        }
    }
    status.innerText = "Done!";
    setTimeout(() => location.reload(), 800);
};

initAdmin();