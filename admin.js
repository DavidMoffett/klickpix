/* KLICKPIX ADMIN LOGIC 
   File: admin.js
   Status: 100% COMPLETE
*/

(function () {
  "use strict";

  const output = document.getElementById("adminGalleryList");

  async function initAdmin() {
    try {
      if (!window.KLICKPIX_CONFIG) {
        throw new Error("Configuration missing in data.js");
      }

      const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.KLICKPIX_CONFIG;
      const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Fetch all events from the database
      const { data: galleries, error } = await sb
        .from("pe_galleries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!galleries || galleries.length === 0) {
        output.innerHTML = `
          <div style="padding:2rem; border:2px dashed #d1d5db; border-radius:12px; text-align:center; opacity:0.6;">
            No events found. Create your first gallery in Supabase.
          </div>`;
        return;
      }

      let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
      galleries.forEach(g => {
        html += `
          <div class="admin-gallery-row">
            <div>
              <div style="font-size:1.2rem; font-weight:800; font-family:'Syne', sans-serif;">${g.title}</div>
              <div style="font-size:0.8rem; opacity:0.6; text-transform:uppercase; font-weight:700;">${g.is_live ? 'Live' : 'Draft'}</div>
            </div>
            <button class="btn btn-primary" onclick="alert('Manage Event ID: ${g.id}')">Manage Pix</button>
          </div>`;
      });
      output.innerHTML = html + '</div>';

    } catch (e) {
      console.error(e);
      output.innerHTML = `<div style="color:var(--brand-red); font-weight:bold;">Admin Error: ${e.message}</div>`;
    }
  }

  initAdmin();
})();