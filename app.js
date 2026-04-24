(function () {
    "use strict";
    const app = document.getElementById("app");

    const initGallery = async () => {
        if (!app) return;
        try {
            const sb = supabase.createClient(window.KLICKPIX_CONFIG.SUPABASE_URL, window.KLICKPIX_CONFIG.SUPABASE_ANON_KEY);
            const urlParams = new URLSearchParams(window.location.search);
            const gId = urlParams.get('id');

            // --- VIEW 1: SINGLE EVENT PHOTO GALLERY ---
            if (gId) {
                const { data: gallery } = await sb.from("pe_galleries").select("*").eq("id", gId).single();
                const { data: photos } = await sb.from("pe_photos").select("*").eq("gallery_id", gId).order("created_at", { ascending: true });

                let html = `
                    <div style="padding: 3rem 1rem; text-align:center;">
                        <button onclick="window.location.search=''" style="margin-bottom:1.5rem; background:#fff; border:1px solid #ddd; padding:8px 20px; border-radius:25px; cursor:pointer; font-weight:bold; font-size:0.75rem; text-transform:uppercase;">← Back to Events</button>
                        <h1 style="font-family:'Syne'; font-size:2.5rem; margin:0; text-transform:uppercase;">${gallery.title}</h1>
                    </div>
                    <div class="photo-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:20px; padding:20px; max-width:1400px; margin:0 auto;">`;

                photos.forEach(p => {
                    html += `
                        <div class="photo-card" style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.06); border:1px solid #eee;">
                            <img src="${p.preview_url}" style="width:100%; aspect-ratio:1/1; object-fit:cover; display:block;">
                            <div style="padding:15px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:1rem; font-weight:bold;">$${p.price || gallery.default_price}</span>
                                <button class="btn btn-brand" onclick="window.location.href='checkout.html?photo=${p.id}'" style="padding:6px 12px; font-size:0.75rem;">BUY NOW</button>
                            </div>
                        </div>`;
                });
                app.innerHTML = html + "</div>";
            } 
            
            // --- VIEW 2: MASTER INDEX (HERO CARDS ONLY) ---
            else {
                const { data: galleries } = await sb.from("pe_galleries").select("*").eq("is_live", true).order("created_at", { ascending: false });

                // Header removed, padding maintained for visual balance
                let html = `
                    <div style="padding: 4rem 0 2rem;"></div>
                    <div class="gallery-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:20px; padding:20px; max-width:1100px; margin:0 auto;">`;

                if (galleries && galleries.length > 0) {
                    galleries.forEach(g => {
                        html += `
                            <div class="event-card" onclick="window.location.search='?id=${g.id}'" style="cursor:pointer; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 20px rgba(0,0,0,0.05); border:1px solid #eee; transition:0.2s;">
                                <div style="height:140px; background:#111; display:flex; align-items:center; justify-content:center; color:white; font-family:'Syne'; font-size:1.1rem; padding:1rem; text-align:center; text-transform:uppercase;">${g.title}</div>
                                <div style="padding:15px; border-top:1px solid #f5f5f5;">
                                    <span style="font-weight:bold; font-size:0.7rem; color:#e11d48; letter-spacing:1px;">VIEW GALLERY →</span>
                                </div>
                            </div>`;
                    });
                } else {
                    html += `<div style="grid-column:1/-1; text-align:center; padding:10rem; opacity:0.4;">No active events.</div>`;
                }

                html += `</div>
                    <div style="position:fixed; bottom:20px; right:20px; opacity:0.1;">
                        <button onclick="window.accessAdmin()" style="background:none; border:none; cursor:pointer; font-size:0.6rem; font-weight:bold; letter-spacing:2px; color:#000;">ADMIN</button>
                    </div>`;

                app.innerHTML = html;
            }
        } catch (err) {
            app.innerHTML = '<div style="text-align:center; padding:5rem;"><h2>Connection Error</h2></div>';
        }
    };

    window.accessAdmin = function() {
        const pass = prompt("Key:");
        if (pass === "mzuri kabisa") {
            window.location.href = 'admin.html';
        } else {
            console.log("Unauthorized");
        }
    };

    initGallery();
})();