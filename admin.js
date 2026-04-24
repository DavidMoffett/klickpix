/* KLICKPIX ADMIN - COMMAND CENTRE FIXED */
const sb = supabase.createClient(window.KLICKPIX_CONFIG.SUPABASE_URL, window.KLICKPIX_CONFIG.SUPABASE_ANON_KEY);

// 1. UNIQUE GLOBAL FUNCTION NAME
window.handleCreateEvent = async function() {
    console.log("Ignition: handleCreateEvent fired.");
    
    const titleEl = document.getElementById("newTitle");
    const priceEl = document.getElementById("newPrice");
    
    const title = titleEl.value.trim();
    const price = parseFloat(priceEl.value) || 15.00;

    if (!title) return alert("Please enter an Event Name");

    const { error } = await sb.from("pe_galleries").insert([{ 
        title: title, 
        default_price: price, 
        is_live: true 
    }]);

    if (error) {
        console.error("Supabase Error:", error);
        alert("Error: " + error.message);
    } else {
        console.log("Success: Event Created");
        location.reload();
    }
};

async function initAdmin() {
    console.log("Loading Admin Data...");
    const { data: galleries, error } = await sb.from("pe_galleries").select("*").order("created_at", { ascending: false });
    
    if(error) {
        console.error("Fetch Error:", error);
        return;
    }

    // Stats Math
    const totals = galleries.reduce((acc, g) => {
        acc.v += (g.visit_count || 0);
        acc.s += (g.purchase_count || 0);
        acc.r += parseFloat(g.total_revenue || 0);
        return acc;
    }, { v: 0, s: 0, r: 0 });

    document.getElementById("totalVisits").innerText = totals.v;
    document.getElementById("totalSales").innerText = totals.s;
    document.getElementById("totalRevenue").innerText = `$${totals.r.toFixed(2)}`;

    let html = "";
    galleries.forEach(g => {
        html += `
        <div class="admin-card" style="background:white; padding:1.5rem; border-radius:12px; margin-bottom:1.5rem; border:1px solid #eee; color:#111;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 style="font-family:'Syne'; margin:0;">${g.title}</h2>
                    <small>Price: $${g.default_price} | Secret: ${g.secret_word}</small>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold;">Visits: ${g.visit_count}</div>
                    <a href="index.html?id=${g.id}" target="_blank" style="color:var(--brand-red); font-size:0.8rem;">View Gallery</a>
                </div>
            </div>
            <hr style="margin:1rem 0; opacity:0.1;">
            <input type="file" id="file_${g.id}" multiple style="margin-bottom:10px; display:block;">
            <button class="btn btn-brand" onclick="window.uploadPhotos('${g.id}')">Upload Pix</button>
            <div id="status_${g.id}" style="font-size:0.8rem; margin-top:5px; font-weight:bold;"></div>
        </div>`;
    });
    document.getElementById("adminGalleryList").innerHTML = html || "<p>No events found.</p>";
}

window.uploadPhotos = async function(gId) {
    const fileInput = document.getElementById(`file_${gId}`);
    const files = fileInput.files;
    const status = document.getElementById(`status_${gId}`);

    if(files.length === 0) return alert("Select files first");
    
    status.innerText = "Uploading...";
    
    for(let file of files) {
        const fileName = `${gId}/${Date.now()}-${file.name}`;
        const { error } = await sb.storage.from('photos').upload(fileName, file);
        if(!error) {
            const { data: { publicUrl } } = sb.storage.from('photos').getPublicUrl(fileName);
            await sb.from('pe_photos').insert([{ 
                gallery_id: gId, 
                preview_url: publicUrl, 
                full_res_url: publicUrl,
                price: 15.00
            }]);
        }
    }
    location.reload();
};

initAdmin();