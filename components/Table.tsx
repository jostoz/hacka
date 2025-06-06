import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Tipo para representar una columna de la tabla
interface TableColumn {
  key: string;
  label: string;
}

// Props genéricos para la tabla
interface TableProps<T extends Record<string, unknown>> {
  data?: T[];
  columns?: TableColumn[];
  rowKey?: keyof T;  // Nueva prop para especificar qué campo usar como key
}

// Type guard para validar que un valor es un registro válido
function isValidRecord<T extends Record<string, unknown>>(value: unknown): value is T {
  return typeof value === 'object' && value !== null;
}

export function Table<T extends Record<string, unknown>>({ 
  data = [], 
  columns = [],
  rowKey  // Si no se proporciona, intentaremos usar 'id' o generaremos un key único
}: TableProps<T>) {
  // Si no hay columnas definidas, usar las claves del primer objeto
  const tableColumns = columns.length > 0 
    ? columns 
    : (data[0] && isValidRecord<T>(data[0]) 
        ? Object.keys(data[0]).map(key => ({ key, label: key }))
        : []);

  // Función para obtener una key única para cada fila
  const getRowKey = (row: T, index: number): string => {
    if (rowKey && row[rowKey] !== undefined) {
      return String(row[rowKey]);
    }
    if ('id' in row && row.id !== undefined) {
      return String(row.id);
    }
    // Si no hay un identificador único, usamos una combinación de valores
    return `${index}-${Object.values(row).join('-')}`;
  };

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
            <TableRow key={getRowKey(row, index)}>
              {tableColumns.map((column) => (
                <TableCell key={column.key}>
                  {isValidRecord<T>(row) && row[column.key] !== undefined
                    ? String(row[column.key])
                    : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </UITable>
    </div>
  );
} 