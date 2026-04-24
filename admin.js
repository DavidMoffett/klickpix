/* KLICKPIX ADMIN & UPLOAD ENGINE
   File: admin.js
   Status: 100% COMPLETE
*/

(function () {
  "use strict";

  const output = document.getElementById("adminGalleryList");

  async function initAdmin() {
    try {
      if (!window.KLICKPIX_CONFIG) throw new Error("Config missing");
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.KLICKPIX_CONFIG;
      const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // 1. Fetch Galleries
      const { data: galleries, error } = await sb
        .from("pe_galleries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!galleries || galleries.length === 0) {
        output.innerHTML = "<p>No events found. Create one in SQL first.</p>";
        return;
      }

      // 2. Render Management UI
      let html = '<div style="display: flex; flex-direction: column; gap: 2rem;">';
      
      galleries.forEach(g => {
        html += `
          <div style="background:#fff; padding:2rem; border-radius:12px; border:1px solid #e5e7eb;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h2 style="font-family:'Syne', sans-serif;">${g.title}</h2>
                <span style="font-weight:bold; color:${g.is_live ? 'green' : 'red'}">${g.is_live ? 'LIVE' : 'DRAFT'}</span>
            </div>
            
            <div style="background:#f9fafb; padding:1.5rem; border-radius:8px; border:2px dashed #d1d5db;">
                <p style="margin-bottom:1rem; font-weight:bold;">Upload New Pix:</p>
                <input type="file" id="file_${g.id}" accept="image/*" multiple style="margin-bottom:1rem;">
                <button class="btn btn-brand" onclick="window.uploadPhotos('${g.id}')">Upload to Gallery</button>
                <div id="status_${g.id}" style="margin-top:1rem; font-size:0.9rem;"></div>
            </div>
          </div>`;
      });
      output.innerHTML = html + '</div>';

      // 3. The Upload Logic
      window.uploadPhotos = async (galleryId) => {
        const fileInput = document.getElementById(`file_${galleryId}`);
        const status = document.getElementById(`status_${galleryId}`);
        const files = fileInput.files;

        if (files.length === 0) return alert("Select files first");

        status.innerText = "Starting upload...";

        for (const file of files) {
          const fileName = `${galleryId}/${Date.now()}-${file.name}`;
          
          // A. Push to Storage Bucket
          const { data: sData, error: sError } = await sb.storage
            .from('photos')
            .upload(fileName, file);

          if (sError) {
            status.innerText = `Error: ${sError.message}`;
            continue;
          }

          // B. Get Public URL
          const { data: { publicUrl } } = sb.storage.from('photos').getPublicUrl(fileName);

          // C. Write to Database Table
          const { error: dbError } = await sb.from('pe_photos').insert([{
            gallery_id: galleryId,
            title: file.name,
            preview_url: publicUrl,
            full_res_url: publicUrl, // For now, we use same URL for both
            is_live: true
          }]);

          if (dbError) {
            status.innerText = `DB Error: ${dbError.message}`;
          } else {
            status.innerHTML = `<span style="color:green;">Success: ${file.name} uploaded.</span>`;
          }
        }
        // Refresh to show changes if needed
        setTimeout(() => location.reload(), 1500);
      };

    } catch (e) {
      console.error(e);
      output.innerHTML = `<div style="color:red;">Admin Error: ${e.message}</div>`;
    }
  }

  initAdmin();
})();