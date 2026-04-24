(function () {
  "use strict";
  const app = document.getElementById("app");

  async function init() {
    try {
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.KLICKPIX_CONFIG;
      const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // 1. Get the Live Gallery
      const { data: galleries } = await sb.from("pe_galleries").select("*").eq("is_live", true).limit(1);
      
      if (!galleries || galleries.length === 0) {
        app.innerHTML = "<h2>No Live Events</h2>";
        return;
      }

      const g = galleries[0];

      // 2. Get ALL photos for this gallery (No extra filters)
      const { data: photos, error: pError } = await sb
        .from("pe_photos")
        .select("*")
        .eq("gallery_id", g.id);

      if (pError) throw pError;

      // 3. Render
      let html = `<h1 style="text-align:center; margin-bottom:2rem; font-family:'Syne'">${g.title}</h1><div class="photo-grid">`;
      
      if (photos.length === 0) {
        html += `<p style="grid-column: 1/-1; text-align:center; opacity:0.5;">No photos uploaded to this gallery yet.</p>`;
      }

      photos.forEach(p => {
        html += `
          <div class="photo-card">
            <img src="${p.preview_url}" class="photo-thumb" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Load+Error'">
            <div style="padding:1rem; font-weight:bold;">${window.KLICKPIX_CONFIG.CURRENCY_SYMBOL}${p.price}</div>
          </div>`;
      });
      
      app.innerHTML = html + "</div>";

    } catch (e) {
      app.innerHTML = "System Error: " + e.message;
    }
  }
  init();
})();