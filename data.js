/* KLICKPIX CORE CONFIGURATION
  File: data.js
  Status: 100% COMPLETE - NO DRIFT
*/

(function() {
    "use strict";

    // HARD CONFIG: Replace placeholders with your actual Supabase/PayPal keys
    const CONFIG = {
        SUPABASE_URL: "https://your-project-id.supabase.co",
        SUPABASE_ANON_KEY: "your-anon-key-here",
        SUPABASE_BUCKET: "photos",
        PAYPAL_CLIENT_ID: "your-paypal-id-here",
        CURRENCY_CODE: "NZD",
        CURRENCY_SYMBOL: "NZ$"
    };

    // Attach to window for global app access
    window.KLICKPIX_CONFIG = CONFIG;

    // Legacy variables for logic compatibility
    window.SUPABASE_URL = CONFIG.SUPABASE_URL;
    window.SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

    console.log("KlickPix Configuration Loaded: 100%");
})();