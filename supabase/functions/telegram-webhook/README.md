# Telegram group auto-sync

## How it works
1. Staff creates a group in Al-Bayan (Groups page) and sets a **group code**
   (e.g. `S22-22`) in the group form.
2. Staff puts that same code somewhere in the Telegram group's title
   (e.g. "Al-Bayan — S22-22 — Speaking Club").
3. The bot is added to that Telegram group.
4. Telegram calls `telegram-webhook` → it reads the chat title, finds the
   code, matches it to the group in the DB, and saves the chat id.
5. From then on, `telegram-send` can message that group directly.

## Deploy (Supabase CLI)
```
supabase functions deploy telegram-webhook
supabase functions deploy telegram-send
supabase secrets set TELEGRAM_BOT_TOKEN=<your bot token>
supabase secrets set TELEGRAM_WEBHOOK_SECRET=<any random string you choose>
```

## Register the webhook with Telegram (run once)
```
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<project-ref>.supabase.co/functions/v1/telegram-webhook" \
  -d "secret_token=<same TELEGRAM_WEBHOOK_SECRET>"
```

## Test sending a message
```
curl -X POST "https://<project-ref>.supabase.co/functions/v1/telegram-send" \
  -H "content-type: application/json" \
  -d '{"group_code":"S22-22","message":"Ertaga dars 18:30 da."}'
```
