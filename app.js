(function () {
  "use strict";
  const app = document.getElementById("app");

  async function init() {
    console.log("KlickPix Init: Starting...");
    try {
      if (!window.KLICKPIX_CONFIG) throw new Error("No data.js config");

      const sb = supabase.createClient(window.KLICKPIX_CONFIG.SUPABASE_URL, window.KLICKPIX_CONFIG.SUPABASE_ANON_KEY);

      // TEST: Fetch ALL galleries, ignore the "is_live" flag for now
      const { data: galleries, error: gError } = await sb
        .from("pe_galleries")
        .select("*")
        .limit(1);

      if (gError) throw gError;
      console.log("Galleries found:", galleries);

      if (!galleries || galleries.length === 0) {
        app.innerHTML = "<h1>No Galleries in Database</h1><p>The pipe is connected, but the bucket is empty.</p>";
        return;
      }

      // Fetch ALL photos for that gallery
      const { data: photos, error: pError } = await sb
        .from("pe_photos")
        .select("*")
        .eq("gallery_id", galleries[0].id);

      if (pError) throw pError;
      console.log("Photos found:", photos);

      let html = `<h1>${galleries[0].title}</h1><div class="photo-grid">`;
      photos.forEach(p => {
        html += `<div class="photo-card"><img src="${p.preview_url}" class="photo-thumb"></div>`;
      });
      app.innerHTML = html + "</div>";

    } catch (e) {
      console.error("KlickPix Critical Error:", e);
      app.innerHTML = "Error: " + e.message;
    }
  }
  init();
})();