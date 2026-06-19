# ONA Live Stats — GymDesk → Zapier → LifeOS

GymDesk has no public API to pull from, so we **push** stats in: GymDesk fires an event → Zapier catches it → Zapier POSTs the numbers to a LifeOS endpoint → they appear on your ONA screen as a green **"Live · GymDesk"** card.

The app side is built (`/api/ona-webhook` + the live card). Three connections left — all yours, because they involve secrets I can't handle.

---

## 1. Add 4 environment variables in Vercel

Vercel → your **Life-OS** project → Settings → Environment Variables. Add all four (check Production + Preview + Development):

| Key | Value | Where to get it |
|---|---|---|
| `SUPABASE_URL` | `https://nuhpeeimvmdrcrljbzjv.supabase.co` | your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | the **service_role** secret | Supabase → Settings → API → `service_role` (NOT the anon key) |
| `ONA_WEBHOOK_SECRET` | invent a long random string | make one up — you'll paste it into Zapier too |
| `ONA_USER_ID` | your account's user id | Supabase → Authentication → Users → your row → copy the UID |

The service-role key is powerful — it lives only in Vercel's server env, never in the app or the browser. Then **Redeploy** so the vars take effect.

## 2. Create the Zap in Zapier

- **Trigger:** GymDesk (search "Gymdesk" as the app) → pick the event you want to track, e.g. *New Member*, *New Payment*, or *Attendance*. (Add more Zaps later for other events.)
- **Action:** *Webhooks by Zapier* → **POST**.
  - **URL:** `https://life-os-ochre-one.vercel.app/api/ona-webhook?token=YOUR_ONA_WEBHOOK_SECRET`
  - **Payload type:** JSON
  - **Data:** map GymDesk fields to any of these keys (send only what you have):
    `members`, `active_members`, `mrr`, `nps`, `attendance_week`, `new_members_month`, `churn_month`, `visits_today`
  - To **count up** instead of set a value, send an `inc` object, e.g. `{ "inc": { "visits_today": 1 } }` on each check-in.
  - Optional: `source` (a label, e.g. `"gymdesk-new-member"`).

Example JSON body (a daily snapshot Zap):

```json
{ "members": 412, "active_members": 388, "mrr": 24180, "visits_today": 0, "source": "gymdesk-daily" }
```

## 3. Test it

In Zapier, run a test on the webhook step. You should get `{ "ok": true, ... }`. Open LifeOS → **ONA** → the green **Live · GymDesk** card appears with the numbers and a "just now" timestamp. Done — it updates every time the Zap fires.

---

**Notes**
- The header stats (Members / MRR / NPS) stay manually editable — the Live card is the auto-fed truth from GymDesk, kept separate on purpose.
- The endpoint rejects any request without the correct `token`, so only your Zap can write.
- A good starting setup: one daily "snapshot" Zap for members/MRR, plus a per-check-in Zap that increments `visits_today`.
