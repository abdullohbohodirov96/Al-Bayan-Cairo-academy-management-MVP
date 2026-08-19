# SMS integration design

The MVP deliberately does **not** put an SMS API key into React/Vite. A browser bundle is public, so provider secrets must stay server-side.

## Flow

```text
payment due date
    ↓
enqueue_payment_reminders(reference_date)
    ↓
notification_jobs (idempotent queue)
    ↓
Supabase Edge Function: process-reminders
    ↓
SMS provider adapter / webhook
    ↓
notification_logs + provider message id/status
```

## Default rules
- 3 days before due date
- on due date
- 2 days after due date
- 7 days after due date (created but disabled by default)

## Variables supported by payment templates
- `{{name}}`
- `{{amount}}`
- `{{due_date}}`
- `{{student_code}}` is present in the queued payload and can be added to a template

## Secrets
Set these as Supabase Edge Function secrets, never as `VITE_*` values:

```text
SMS_WEBHOOK_URL=https://your-provider-adapter.example/send
SMS_WEBHOOK_TOKEN=...
SMS_SENDER=ALBAYAN
```

The adapter receives JSON similar to:

```json
{
  "to": "+998901234567",
  "from": "ALBAYAN",
  "message": "...",
  "metadata": {
    "job_id": "...",
    "student_id": "..."
  }
}
```

This lets us connect Eskiz, Play Mobile, Twilio or another vendor later without rewriting the CRM. Only the small adapter/Edge Function contract changes.

## Scheduler
Call the SQL function once per day:

```sql
select public.enqueue_payment_reminders(current_date);
```

Then invoke `process-reminders` on a short recurring schedule. The queue uses a unique `dedupe_key`, so rerunning the daily enqueue does not create the same reminder twice.

## Delivery receipts
When the selected SMS provider is known, add a small webhook function that maps provider statuses to:
- `sent`
- `delivered`
- `failed`

and updates both `notification_jobs` and `notification_logs`.
