(function () {
    "use strict";
    const sb = supabase.createClient(window.KLICKPIX_CONFIG.SUPABASE_URL, window.KLICKPIX_CONFIG.SUPABASE_ANON_KEY);

    async function initAdmin() {
        const { data: galleries } = await sb.from("pe_galleries").select("*").order("created_at", { ascending: false });
        
        // 1. Calculate Totals for Top Bar
        const totals = galleries.reduce((acc, g) => {
            acc.v += (g.visit_count || 0);
            acc.s += (g.purchase_count || 0);
            acc.r += parseFloat(g.total_revenue || 0);
            return acc;
        }, { v: 0, s: 0, r: 0 });

        document.getElementById("totalVisits").innerText = totals.v;
        document.getElementById("totalSales").innerText = totals.s;
        document.getElementById("totalRevenue").innerText = `$${totals.r.toFixed(2)}`;

        // 2. Render Gallery Cards
        let html = "";
        galleries.forEach(g => {
            html += `
            <div class="admin-card" style="background:white; padding:1.5rem; border-radius:12px; margin-bottom:1.5rem; border:1px solid #eee;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:1rem; margin-bottom:1rem;">
                    <div>
                        <h2 style="font-family:'Syne'">${g.title}</h2>
                        <small>Price: $${g.default_price} | Secret: ${g.secret_word}</small>
                    </div>
                    <div style="text-align:right;">
                        <div>Visits: ${g.visit_count} | Revenue: $${g.total_revenue}</div>
                        <a href="index.html?id=${g.id}" target="_blank" style="font-size:0.8rem; color:blue;">View Gallery</a>
                    </div>
                </div>

                <div class="upload-zone" style="background:#f9fafb; padding:1rem; border-radius:8px;">
                    <input type="file" id="file_${g.id}" multiple accept="image/*">
                    <button class="btn btn-brand" onclick="uploadPhotos('${g.id}')">Upload Pix</button>
                    <div id="progress_container_${g.id}" style="display:none; margin-top:10px; background:#eee; height:10px; border-radius:5px;">
                        <div id="bar_${g.id}" style="background:var(--brand-red); width:0%; height:100%; border-radius:5px; transition:width 0.3s;"></div>
                    </div>
                    <div id="status_${g.id}" style="font-size:0.8rem; margin-top:5px;"></div>
                </div>
            </div>`;
        });
        document.getElementById("adminGalleryList").innerHTML = html;
    }

    // CREATE EVENT
    window.createEvent = async () => {
        const title = document.getElementById("newTitle").value;
        const price = document.getElementById("newPrice").value || 15.00;
        if(!title) return alert("Title required");

        await sb.from("pe_galleries").insert([{ title, default_price: price, is_live: true }]);
        location.reload();
    };

    // UPLOAD WITH PROGRESS BAR
    window.uploadPhotos = async (gId) => {
        const files = document.getElementById(`file_${gId}`).files;
        const bar = document.getElementById(`bar_${gId}`);
        const container = document.getElementById(`progress_container_${gId}`);
        const status = document.getElementById(`status_${gId}`);

        if(files.length === 0) return;
        container.style.display = "block";

        for(let i=0; i<files.length; i++) {
            const file = files[i];
            const fileName = `${gId}/${Date.now()}-${file.name}`;
            
            status.innerText = `Uploading ${i+1} of ${files.length}...`;
            
            const { data, error } = await sb.storage.from('photos').upload(fileName, file);
            if(!error) {
                const { data: { publicUrl } } = sb.storage.from('photos').getPublicUrl(fileName);
                await sb.from('pe_photos').insert([{ gallery_id: gId, preview_url: publicUrl, full_res_url: publicUrl }]);
            }

            let percent = ((i + 1) / files.length) * 100;
            bar.style.width = percent + "%";
        }
        status.innerText = "Upload Complete!";
        setTimeout(() => location.reload(), 1500);
    };

    initAdmin();
})();