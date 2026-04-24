/* KLICKPIX PUBLIC LOGIC 
   File: app.js
   Status: 100% COMPLETE
*/

(function () {
  "use strict";

  const app = document.getElementById("app");

  async function init() {
    try {
      // 1. Verify Configuration exists
      if (!window.KLICKPIX_CONFIG) {
        app.innerHTML = '<div style="color:red; padding:2rem;">Error: Configuration (data.js) not found.</div>';
        return;
      }

      const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.KLICKPIX_CONFIG;
      
      // Initialize Supabase client
      const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // 2. Fetch the most recent Live Gallery
      const { data: galleries, error: gError } = await sb
        .from("pe_galleries")
        .select("*")
        .eq("is_live", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (gError) throw gError;

      if (!galleries || galleries.length === 0) {
        app.innerHTML = `
          <div style="padding:3rem; text-align:center; background:#fff; border-radius:12px; border:1px solid #eee;">
            <h2 style="font-family:'Syne', sans-serif;">No Live Events</h2>
            <p style="opacity:0.7;">Check back soon for new Pix.</p>
          </div>`;
        return;
      }

      const activeGallery = galleries[0];

      // 3. Fetch Photos for this gallery
      const { data: photos, error: pError } = await sb
        .from("pe_photos")
        .select("*")
        .eq("gallery_id", activeGallery.id)
        .eq("is_live", true)
        .order("sort_order", { ascending: true });

      if (pError) throw pError;

      // 4. Build the Gallery UI
      let html = `
        <div style="margin-bottom: 3rem; text-align: center;">
            <h1 style="font-size: 3rem; margin-bottom: 0.5rem; font-family: 'Syne', sans-serif; letter-spacing:-1px;">${activeGallery.title}</h1>
            <p style="opacity: 0.6; font-weight: 500;">Select your high-resolution Pix below.</p>
        </div>
        <div class="photo-grid">
      `;

      photos.forEach(p => {
        html += `
          <div class="photo-card">
            <img src="${p.preview_url}" class="photo-thumb" alt="${p.title}" onclick="window.location.href='checkout.html?id=${p.id}'">
            <div style="padding: 1.2rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight:800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px;">${p.title}</span>
                <span style="color:var(--brand-red); font-weight:800;">${window.KLICKPIX_CONFIG.CURRENCY_SYMBOL}${p.price || '15.00'}</span>
            </div>
          </div>`;
      });

      app.innerHTML = html + '</div>';

    } catch (e) {
      console.error(e);
      app.innerHTML = `
        <div style="padding:2rem; background:#fee2e2; color:#b91c1c; border-radius:12px; font-weight:bold; border:1px solid #fecaca;">
            System Error: ${e.message}
        </div>`;
    }
  }

  init();
})();