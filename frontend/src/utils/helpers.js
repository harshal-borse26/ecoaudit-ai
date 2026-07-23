export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "N/A";
  }
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "₹0.00";
  return `₹${Number(amount).toFixed(2)}`;
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case "PENDING":
      return "badge bg-warning text-dark";
    case "PROCESSING":
      return "badge bg-info text-dark";
    case "COMPLETED":
      return "badge bg-success";
    case "FAILED":
      return "badge bg-danger";
    default:
      return "badge bg-secondary";
  }
}
