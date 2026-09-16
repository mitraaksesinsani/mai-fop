import * as XLSX from 'xlsx';

export interface ColumnDefinition {
  key: string;
  header?: string;
  label?: string;
  required?: boolean;
  example?: string | number;
}

/**
 * Export array of objects to an Excel file (.xlsx)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  fileName: string,
  columns: ColumnDefinition[]
) {
  // Map data to header labels
  const rows = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      const headerTitle = col.label || col.header || col.key;
      row[headerTitle] = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '';
    });
    return row;
  });

  const headerTitles = columns.map((c) => c.label || c.header || c.key);
  const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{}], {
    header: headerTitles,
  });

  // Auto column width
  const colWidths = columns.map((col) => {
    const title = col.label || col.header || col.key;
    const maxLen = Math.max(
      title.length,
      ...rows.map((r) => String(r[title] || '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 4, 12), 50) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  const finalName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, finalName);
}

/**
 * Download sample template Excel file (.xlsx) with header & example row
 */
export function downloadExcelTemplate(
  columns: ColumnDefinition[],
  fileName: string,
  sampleRows?: Record<string, any>[]
) {
  const sampleData: Record<string, any>[] = [];

  if (sampleRows && sampleRows.length > 0) {
    sampleRows.forEach((s) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        const title = col.label || col.header || col.key;
        row[title] = s[col.key] !== undefined ? s[col.key] : (col.example || '');
      });
      sampleData.push(row);
    });
  } else {
    const defaultRow: Record<string, any> = {};
    columns.forEach((col) => {
      const title = col.label || col.header || col.key;
      defaultRow[title] = col.example || '';
    });
    sampleData.push(defaultRow);
  }

  const worksheet = XLSX.utils.json_to_sheet(sampleData, {
    header: columns.map((c) => c.label || c.header || c.key),
  });

  const colWidths = columns.map((col) => ({
    wch: Math.max((col.label || col.header || col.key).length + 6, 16),
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  const finalName = fileName.endsWith('.xlsx') ? fileName : `Template_${fileName}.xlsx`;
  XLSX.writeFile(workbook, finalName);
}

/**
 * Parse uploaded Excel or CSV file into typed objects
 */
export async function parseImportFile<T = any>(
  file: File,
  columns: ColumnDefinition[]
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          return resolve([]);
        }

        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          return resolve([]);
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        // Map columns by matching header or key case-insensitively
        const headerMap = new Map<string, string>();
        columns.forEach((col) => {
          const title = col.label || col.header || col.key;
          headerMap.set(title.trim().toLowerCase(), col.key);
          headerMap.set(col.key.trim().toLowerCase(), col.key);
        });

        const parsedItems: T[] = rawJson
          .map((row) => {
            const item: Record<string, any> = {};
            Object.entries(row).forEach(([k, val]) => {
              const matchedKey = headerMap.get(k.trim().toLowerCase());
              if (matchedKey) {
                item[matchedKey] = typeof val === 'string' ? val.trim() : val;
              }
            });
            return item as T;
          })
          .filter((item: any) => {
            // Filter out totally empty rows
            return Object.values(item).some((v) => v !== '' && v !== null && v !== undefined);
          });

        resolve(parsedItems);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}
