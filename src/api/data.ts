import apiClient from './client';

/**
 * Export the current user's data as a JSON file download.
 */
export async function exportUserData(): Promise<void> {
  const response = await apiClient.request('/accounts/data/export/', { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to export data');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition');
  let filename = 'thegarage_data_export.json';
  if (disposition) {
    const match = new RegExp(/filename="?([^"]+)"?/).exec(disposition);
    if (match) {
      filename = match[1];
    }
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Permanently delete the current user's account.
 */
export async function deleteAccount(): Promise<{ message: string }> {
  const response = await apiClient.request('/accounts/data/delete/', { method: 'POST' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to delete account');
  }

  return response.json();
}
