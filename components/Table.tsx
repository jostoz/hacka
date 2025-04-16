import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableProps {
  data?: Array<Record<string, any>>;
  columns?: Array<{
    key: string;
    label: string;
  }>;
}

export function Table({ 
  data = [], 
  columns = [] 
}: TableProps) {
  // Si no hay columnas definidas, usar las claves del primer objeto
  const tableColumns = columns.length > 0 
    ? columns 
    : Object.keys(data[0] || {}).map(key => ({ key, label: key }));

  return (
    <div className="w-full overflow-auto">
      <UITable>
        <TableHeader>
          <TableRow>
            {tableColumns.map((column) => (
              <TableHead key={column.key}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {tableColumns.map((column) => (
                <TableCell key={column.key}>
                  {row[column.key]?.toString() || ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </UITable>
    </div>
  );
} 