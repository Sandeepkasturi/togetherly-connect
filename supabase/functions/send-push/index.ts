import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import WebPush from "https://esm.sh/web-push@3.6.7";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
        const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
        const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "mailto:support@togetherly.example";

        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            console.error("Missing VAPID secrets");
            return new Response(JSON.stringify({ error: "Server configuration error: VAPID keys missing" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            });
        }

        WebPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

        const { userId, title, body, icon, url } = await req.json();

        if (!userId) {
            throw new Error("userId is required");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get subscriptions for the user
        const { data: subscriptions, error: subError } = await supabase
            .from("push_subscriptions")
            .select("subscription")
            .eq("user_id", userId);

        if (subError) throw subError;

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({ message: "No subscriptions found for user" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        const payload = JSON.stringify({
            title: title || "Togetherly",
            body: body || "You have a new notification",
            icon: icon || "https://fssyqzpwtanamntkgyfz.supabase.co/storage/v1/object/public/profile-photos/logo.png",
            data: { url: url || "/" },
        });

        const results = await Promise.all(
            subscriptions.map(async (sub: any) => {
                try {
                    await WebPush.sendNotification(sub.subscription, payload);
                    return { status: "success" };
                } catch (err: any) {
                    console.error("Error sending push:", err);
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        await supabase.from("push_subscriptions").delete().eq("subscription", sub.subscription);
                    }
                    return { status: "error", error: err.message };
                }
            })
        );

        return new Response(JSON.stringify({ results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Edge Function Exception:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

