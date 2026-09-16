import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataTablePaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  selectedCount?: number;
}

export function DataTablePagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  selectedCount,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-1">
      <div className="text-muted-foreground text-[13px] flex items-center my-[6px] mx-[8px]">
        {selectedCount !== undefined ? (
          <span>
            {selectedCount} of {totalItems} row(s) selected.
          </span>
        ) : (
          <span>
            Showing {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} of {totalItems} entries
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center">
        <div className="flex items-center text-[13px] text-muted-foreground my-[6px] mx-[8px]">
          <span className="mr-2 text-[13px]">Baris per halaman:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
              onPageChange(1);
            }}
          >
            <SelectTrigger className="h-[32px] w-[76px] text-[13px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()} className="text-[13px]">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-[13px] text-muted-foreground font-medium my-[6px] mx-[8px]">
          Hal {currentPage} dari {totalPages}
        </div>

        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || totalItems === 0}
            className="h-[32px] my-[6px] mx-[8px] px-3 text-[13px]"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalItems === 0}
            className="h-[32px] my-[6px] mx-[8px] px-3 text-[13px]"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
