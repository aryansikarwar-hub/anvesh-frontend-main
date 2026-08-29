import { type CheckoutIntent } from '@/lib/types';

export interface RazorpayCheckoutResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): { open: () => void };
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise: Promise<boolean> | null = null;

/** Loads Razorpay Checkout once. Resolves false if the script cannot load. */
export function loadRazorpayCheckout(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Opens Razorpay Checkout and resolves with the handler payload, or null when
 * the traveller dismissed the modal. The result is never treated as proof of
 * payment: it is sent to the server, which verifies the signature itself.
 */
export async function openRazorpayCheckout(
  intent: CheckoutIntent,
): Promise<RazorpayCheckoutResult | null> {
  const loaded = await loadRazorpayCheckout();
  if (!loaded) throw new Error('Razorpay Checkout could not be loaded.');

  const Razorpay = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
  if (!Razorpay) throw new Error('Razorpay Checkout is unavailable.');

  return new Promise<RazorpayCheckoutResult | null>((resolve) => {
    const checkout = new Razorpay({
      key: intent.keyId,
      order_id: intent.providerOrderId,
      amount: intent.amountMinor,
      currency: intent.currency,
      name: intent.name,
      description: intent.description,
      prefill: intent.prefill,
      theme: { color: '#7a3e12' },
      handler: (response: RazorpayCheckoutResult) => resolve(response),
      modal: { ondismiss: () => resolve(null) },
    });
    checkout.open();
  });
}
