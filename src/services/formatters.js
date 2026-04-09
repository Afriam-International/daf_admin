export const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatCompactNumber(value = 0) {
  return compactNumber.format(Number(value || 0));
}

export function formatCurrency(value = 0) {
  return currency.format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) return "Recently";
  return dateTime.format(new Date(value));
}
