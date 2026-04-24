/* KLICKPIX CORE CONFIGURATION
  File: data.js
  Status: 100% LIVE
*/

(function() {
    "use strict";

    const CONFIG = {
        SUPABASE_URL: "https://ushkmoccmhebnjfoubxv.supabase.co",
        SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaGttb2NjbWhlYm5qZm91Ynh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDc2ODgsImV4cCI6MjA5MjU4MzY4OH0.tMpQwd9eBW0DSAq7VATYxMFf0vLzsIHDqee4-eFhEos",
        SUPABASE_BUCKET: "photos",
        PAYPAL_CLIENT_ID: "your-paypal-id-here", // We will hit this later
        CURRENCY_CODE: "NZD",
        CURRENCY_SYMBOL: "NZ$"
    };

    window.KLICKPIX_CONFIG = CONFIG;
    window.SUPABASE_URL = CONFIG.SUPABASE_URL;
    window.SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

    console.log("KlickPix Live Connection: Active");
})();