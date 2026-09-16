import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExcelImportExportProps {
  onImport: (file: File) => Promise<void>;
  onExport: () => Promise<void>;
  onDownloadTemplate: () => void;
  isLoading?: boolean;
}

export function ExcelImportExport({ onImport, onExport, onDownloadTemplate, isLoading }: ExcelImportExportProps) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await onImport(file);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="flex flex-wrap items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 h-[32px] my-[6px] mx-[8px] text-[13px] font-medium" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || importing}
        >
          {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Import
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 h-[32px] my-[6px] mx-[8px] text-[13px] font-medium" 
          onClick={handleExport}
          disabled={isLoading || exporting}
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 h-[32px] my-[6px] mx-[8px] text-[13px] font-medium text-muted-foreground hover:text-foreground" 
          onClick={onDownloadTemplate}
          disabled={isLoading}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Template
        </Button>
      </div>
    </div>
  );
}
