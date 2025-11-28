import React from 'react';
import {
  Table as HeroTable,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Button,
  Spinner,
} from "@heroui/react";

// Search Icon
const SearchIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const Table = ({
  columns = [],
  data = [],
  onAdd,
  addButtonText = "Yeni Ekle",
  searchable = true,
  searchPlaceholder = "Arama",
  searchKeys = [],
  emptyText = "Veri bulunamadı",
  isLoading = false,
  pagination = true,
  rowsPerPage = 5,
  className = "",
  draggable = false,
  onRowDragStart,
  onRowDragOver,
  onRowDrop,
}) => {
  const [page, setPage] = React.useState(1);
  const [filterValue, setFilterValue] = React.useState("");

  // Search filtreleme
  const filteredData = React.useMemo(() => {
    if (!filterValue || searchKeys.length === 0) return data;
    
    return data.filter((item) => {
      return searchKeys.some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [filterValue, data, searchKeys]);

  const pages = Math.ceil(filteredData.length / rowsPerPage);
  
  const items = React.useMemo(() => {
    if (!pagination) return filteredData;
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [page, filteredData, pagination, rowsPerPage]);

  const onSearchChange = React.useCallback((value) => {
    setFilterValue(value);
    setPage(1);
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  // Top Content - Search ve Add Button
  const topContent = React.useMemo(() => {
    if (!searchable && !onAdd) return null;
    
    return (
      <div className="flex justify-between items-center gap-3">
        {searchable && (
          <Input
            isClearable
            className="w-full max-w-xs"
            placeholder={searchPlaceholder}
            variant="bordered"
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
        )}
        {onAdd && (
          <Button 
            color="default" 
            variant="bordered"
            className="font-medium"
            onPress={onAdd}
            startContent={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            {addButtonText}
          </Button>
        )}
      </div>
    );
  }, [filterValue, onSearchChange, searchable, onAdd, addButtonText, searchPlaceholder]);

  // Bottom Content - Pagination
  const bottomContent = React.useMemo(() => {
    if (!pagination) return null;
    
    return (
      <div className="flex justify-between items-center">
        <span className="text-small text-gray-400">
          Toplam {filteredData.length} kayıt
        </span>
        {pages > 1 && (
          <Pagination
            isCompact
            showControls
            color="secondary"
            variant="light"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        )}
      </div>
    );
  }, [filteredData.length, page, pages, pagination]);

  return (
    <HeroTable
      aria-label="Veri tablosu"
      className={`custom-table ${className}`}
      classNames={{
        wrapper: "table-wrapper",
        th: "table-th",
        td: "table-td"
      }}
      topContent={topContent}
      topContentPlacement="outside"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
    >
      <TableHeader>
        {columns.map((column) => (
          <TableColumn key={column.key} align={column.align || 'start'}>
            {column.label}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody 
        items={items} 
        emptyContent={emptyText}
        isLoading={isLoading}
        loadingContent={<Spinner label="Yükleniyor..." />}
      >
        {(item) => {
          const itemIndex = items.indexOf(item);
          
          const rowProps = draggable ? {
            onDragOver: onRowDragOver,
            onDrop: () => onRowDrop(item),
          } : {};
          
          return (
            <TableRow 
              key={item.id}
              {...rowProps}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render ? column.render(item, itemIndex) : item[column.key]}
                </TableCell>
              ))}
            </TableRow>
          );
        }}
      </TableBody>
    </HeroTable>
  );
};

export default Table;
