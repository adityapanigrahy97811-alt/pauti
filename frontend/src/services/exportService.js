import api from './api';
import toast from 'react-hot-toast';

/**
 * Trigger browser file download from an Axios blob response
 */
function triggerBlobDownload(response, defaultFilename) {
  let filename = defaultFilename;
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.indexOf('filename=') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Export Complete Accounts Multi-sheet Workbook
 */
export async function downloadCompleteAccountsExcel() {
  const toastId = toast.loading('Generating Ashtavinayak Mandal Complete Accounts 2026 Excel (.xlsx)...');
  try {
    const response = await api.get('/exports/complete-accounts', {
      responseType: 'blob'
    });
    triggerBlobDownload(response, 'Ashtavinayak_Mandal_Accounts_2026.xlsx');
    toast.success('Complete Accounts Excel (.xlsx) downloaded successfully! ताळेबंद एक्सेल डाऊनलोड झाली.', { id: toastId });
  } catch (error) {
    console.error('Export complete accounts error:', error);
    toast.error('Failed to export Complete Accounts Excel.', { id: toastId });
    throw error;
  }
}

/**
 * Export Collections Excel with optional filters
 */
export async function downloadCollectionsExcel(params = {}) {
  const toastId = toast.loading('Exporting Collections Excel...');
  try {
    const response = await api.get('/exports/collections', {
      params,
      responseType: 'blob'
    });
    triggerBlobDownload(response, 'Collections_Export_2026.xlsx');
    toast.success('Collections Excel downloaded successfully!', { id: toastId });
  } catch (error) {
    console.error('Export collections error:', error);
    toast.error('Failed to export collections Excel.', { id: toastId });
    throw error;
  }
}

/**
 * Export Expenses Excel with optional filters
 */
export async function downloadExpensesExcel(params = {}) {
  const toastId = toast.loading('Exporting Expenses Excel...');
  try {
    const response = await api.get('/exports/expenses', {
      params,
      responseType: 'blob'
    });
    triggerBlobDownload(response, 'Expenses_Export_2026.xlsx');
    toast.success('Expenses Excel downloaded successfully!', { id: toastId });
  } catch (error) {
    console.error('Export expenses error:', error);
    toast.error('Failed to export expenses Excel.', { id: toastId });
    throw error;
  }
}

/**
 * Export Donors Directory Excel
 */
export async function downloadDonorsExcel() {
  const toastId = toast.loading('Exporting Donors Directory Excel...');
  try {
    const response = await api.get('/exports/donors', {
      responseType: 'blob'
    });
    triggerBlobDownload(response, 'Donors_Directory_2026.xlsx');
    toast.success('Donors Directory Excel downloaded successfully!', { id: toastId });
  } catch (error) {
    console.error('Export donors error:', error);
    toast.error('Failed to export donors directory.', { id: toastId });
    throw error;
  }
}
