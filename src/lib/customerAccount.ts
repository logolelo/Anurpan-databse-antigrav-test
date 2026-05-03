const CUSTOMER_ACCOUNT_GRAPHQL_URL = import.meta.env.VITE_CUSTOMER_ACCOUNT_GRAPHQL_URL as string | undefined;
const AUTH_URL = import.meta.env.VITE_CUSTOMER_AUTH_AUTH_URL as string | undefined;
const API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION as string || "2024-07";

let computedEndpoint: string | null = null;
if (CUSTOMER_ACCOUNT_GRAPHQL_URL) {
  computedEndpoint = CUSTOMER_ACCOUNT_GRAPHQL_URL;
} else if (AUTH_URL) {
  const match = AUTH_URL.match(/\/authentication\/(\d+)\//);
  if (match && match[1]) {
    computedEndpoint = `https://shopify.com/${match[1]}/account/customer/api/${API_VERSION}/graphql`;
  }
}

export async function customerAccountRequest(query: string, variables: Record<string, unknown> = {}) {
  const token = localStorage.getItem("customer_access_token");
  const endpoint = computedEndpoint;
  if (!token || !endpoint) return null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token,
  };
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  
  if (!res.ok) {
    // If the proxy returned a structured error, use it.
    if (typeof json === 'object' && json !== null && ('__httpError' in json || 'error' in json)) {
      return {
        ...(json as Record<string, unknown>),
        __httpError: (json as Record<string, unknown>).__httpError || `${res.status} ${res.statusText}`,
        __body: (json as Record<string, unknown>).__body || text
      };
    }
    return { __httpError: `${res.status} ${res.statusText}`, __body: text };
  }
  return json ?? { __body: text };
}

export const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrders($first: Int!) {
    customer {
      firstName
      lastName
      displayName
      emailAddress { emailAddress }
      orders(first: $first) {
        edges {
          node {
            id
            name
            number
            processedAt
            financialStatus
            fulfillmentStatus
            confirmationNumber
            cancelledAt
            email
            totalPrice {
              amount
              currencyCode
            }
            subtotal {
              amount
              currencyCode
            }
            totalShipping {
              amount
              currencyCode
            }
            totalTax {
              amount
              currencyCode
            }
            totalDuties {
              amount
              currencyCode
            }
            totalRefunded {
              amount
              currencyCode
            }
            totalTip {
              amount
              currencyCode
            }
            statusPageUrl
            shippingAddress {
              address1
              address2
              city
              zoneCode
              zip
              territoryCode
            }
            billingAddress {
              firstName
              lastName
              address1
              address2
              city
              zoneCode
              zip
              territoryCode
            }
            fulfillments(first: 10) {
              nodes {
                latestShipmentStatus
                estimatedDeliveryAt
                trackingInformation {
                  number
                  url
                }
              }
            }
            lineItems(first: 50) {
              nodes {
                id
                title
                quantity
                variantTitle
                sku
                productId
                totalPrice {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_ORDER_QUERY = `
  query CustomerOrder($id: ID!) {
    order(id: $id) {
            id
      name
      processedAt
      fulfillmentStatus
      totalPrice {
        amount
        currencyCode
      }
      lineItems(first: 50) {
        nodes {
          id
          title
          quantity
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export function getCustomerAccountEndpoint() {
  return computedEndpoint;
}
