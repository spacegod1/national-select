# Stripe Checkout setup

Pay my bill charges the balance on the patient's account through Stripe-hosted Checkout and writes the payment back to Firestore.

## Values to Replace

| Field | Current Value | What to Set |
| --- | --- | --- |
| `STRIPE_WEBHOOK_SECRET` | the Stripe CLI's local secret, in `.env.local` | In production, the signing secret of the Dashboard endpoint. See "Webhook" below. |
| `STRIPE_SECRET_KEY` | test key | A live restricted key when the clinic goes live. |
| `DOMAIN` | `http://localhost:3000` | The public site address in production. Stripe returns patients to it. |

The test Price `price_1Uc384Pz1kkmuiBgGvce9fAM` ("Urgent care visit (test)", $149) is no longer used by the code. It can be archived in the Stripe Dashboard.

## Configured Parameters

Set in [src/lib/billing/checkout.ts](src/lib/billing/checkout.ts).

| Parameter | Value |
| --- | --- |
| mode | `payment` |
| ui_mode | `hosted_page` |
| line_items | One item, "Urgent care bill", priced at the account balance in USD |
| metadata.accountNumber | The account being paid. Also copied to the PaymentIntent. |
| expires_at | 31 minutes after creation |
| adaptive_pricing | disabled, so every payment is in USD |
| billing_address_collection | `auto` |
| allow_promotion_codes | `false` |
| submit_type | `auto` |
| integration_identifier | `hosted_web_0001` |
| origin_context | `web` |

Only the account number is sent to Stripe. Charge descriptions and patient details stay in Firestore.

## How it works

1. The patient enters an account number and date of birth on Pay my bill and selects **Find my balance**.
2. **Pay $…** calls the `payBill` server action in [src/app/billing/actions.ts](src/app/billing/actions.ts). It checks the account number and date of birth again, reads the balance from Firestore, and creates the Checkout Session for that amount. The browser never supplies the amount.
3. Stripe collects the payment, then sends the patient to `/success?session_id=...`, or to `/cancel` if they leave.
4. `recordCheckoutPayment` in [src/lib/billing/checkout.ts](src/lib/billing/checkout.ts) asks Stripe for the session and, if it is paid, writes one document to `payments` (id = Checkout Session id), lowers the account balance, and marks the charges it covers as paid, oldest first. It runs from two places and records a session only once:
   - [src/app/api/stripe/webhook/route.ts](src/app/api/stripe/webhook/route.ts), on `checkout.session.completed` and `checkout.session.async_payment_succeeded`
   - [src/app/success/page.tsx](src/app/success/page.tsx), when the patient returns
5. Staff see the payment under **Payments** on the account page.

## Webhook

The webhook is required before going live. Without it, a payment is not recorded when the patient closes the tab before returning to the site.

Local testing. The [Stripe CLI](https://docs.stripe.com/stripe-cli) is installed (`npm install -g @stripe/cli`) and its signing secret is already in `.env.local`. Stripe cannot reach `localhost`, so events only arrive while the listener is running:

1. Run `stripe login` once and approve it in the browser.
2. Run `npm run stripe:listen` in a second terminal next to `npm run dev`. It runs `stripe listen` with the forwarding address and the three `--events` the webhook handles; this CLI version refuses to start without `--events`.
3. If it prints a `whsec_...` value different from the one in `.env.local`, replace `STRIPE_WEBHOOK_SECRET` with it.

Each delivery shows in that terminal as `--> checkout.session.completed` followed by `<-- [200] POST .../api/stripe/webhook`.

Production:

1. In the Stripe Dashboard, add an endpoint at `https://<your domain>/api/stripe/webhook`.
2. Subscribe it to `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`.
3. Put that endpoint's signing secret in `STRIPE_WEBHOOK_SECRET` on the server.

## Testing

Use a test key and the card `4242 4242 4242 4242`, any future expiry, and any CVC.

## Not handled yet

- Refunds and disputes made in Stripe are not written back to the account.
- Stripe emails a receipt only when "Successful payments" is turned on under customer emails in the Stripe Dashboard, and never in test mode. The Pay my bill page promises an emailed receipt.
- Partial payments and payment plans. The patient pays the whole balance.

## Resources

- https://docs.stripe.com/checkout/fulfillment
- https://docs.stripe.com/webhooks
- https://support.stripe.com
