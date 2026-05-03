import { supabase } from '@/integrations/supabase/client';

export type EventType = 'product_view' | 'add_to_cart' | 'purchase';

// Generate a random UUID
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getVisitorId() {
  if (typeof window === 'undefined') return '';
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
}

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

const throttles = new Map<string, number>();

export async function trackEvent(event_type: EventType, product_id: string) {
  if (typeof window === 'undefined') return;

  const throttleKey = `${event_type}_${product_id}`;
  const lastFired = throttles.get(throttleKey) || 0;
  const now = Date.now();

  // 30 seconds throttle client-side
  if (now - lastFired < 30000) {
    return;
  }

  throttles.set(throttleKey, now);

  const visitor_id = getVisitorId();
  const session_id = getSessionId();

  try {
    await supabase.functions.invoke('track-event', {
      body: {
        event_type,
        product_id,
        visitor_id,
        session_id,
      }
    });
  } catch (error) {
    console.error('Failed to track event', error);
  }
}

export async function mergeIdentity(customer_id: string) {
  if (typeof window === 'undefined') return;
  const visitor_id = getVisitorId();
  try {
    await supabase.functions.invoke('track-event', {
      body: {
        action: 'merge',
        visitor_id,
        customer_id
      }
    });
  } catch (error) {
    console.error('Failed to merge identity', error);
  }
}
