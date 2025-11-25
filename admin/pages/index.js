import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";

// Search Icon
const SearchIcon = (props) => {
  return (
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
};

// Plus Icon
const PlusIcon = ({size = 24, width, height, ...props}) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M6 12h12" />
        <path d="M12 18V6" />
      </g>
    </svg>
  );
};

const Dashboard = () => {
  const [page, setPage] = React.useState(1);
  const [filterValue, setFilterValue] = React.useState("");
  
  // Örnek veri
  const sampleData = [
    { id: 1, name: "Ahmet Yılmaz", email: "ahmet@example.com", role: "Admin", status: "Aktif" },
    { id: 2, name: "Ayşe Kaya", email: "ayse@example.com", role: "Editor", status: "Aktif" },
    { id: 3, name: "Mehmet Demir", email: "mehmet@example.com", role: "User", status: "Pasif" },
    { id: 4, name: "Fatma Şahin", email: "fatma@example.com", role: "Editor", status: "Aktif" },
    { id: 5, name: "Ali Özkan", email: "ali@example.com", role: "User", status: "Aktif" },
    { id: 6, name: "Zeynep Arslan", email: "zeynep@example.com", role: "Admin", status: "Aktif" },
    { id: 7, name: "Murat Kılıç", email: "murat@example.com", role: "User", status: "Pasif" },
    { id: 8, name: "Elif Çelik", email: "elif@example.com", role: "Editor", status: "Aktif" },
  ];

  const rowsPerPage = 5;

  // Search filtreleme
  const filteredData = React.useMemo(() => {
    if (!filterValue) return sampleData;
    return sampleData.filter((item) =>
      item.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.email.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [filterValue]);

  const pages = Math.ceil(filteredData.length / rowsPerPage);
  
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [page, filteredData]);

  const onSearchChange = React.useCallback((value) => {
    setFilterValue(value);
    setPage(1);
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  // Top Content - Search ve Add New Button
  const topContent = React.useMemo(() => {
    return (
      <div className="flex justify-between items-center gap-3">
        <Input
          isClearable
          className="w-40"
          placeholder="Arama"
          variant="bordered"
         
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={onClear}
          onValueChange={onSearchChange}
        />
        <Button 
          color="default" 
          variant="bordered"
          className="font-medium"
          startContent={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Yeni Ekle
        </Button>
      </div>
    );
  }, [filterValue, onSearchChange]);

  return (
    <div className='p-5'>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Toplam Kullanıcılar */}
        <Card className="bg-card border border-gray-700">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Kullanıcılar</p>
                <p className="text-3xl font-bold mt-2">1,234</p>
              </div>
              <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-sm">+12.5%</span>
                <span className="text-gray-400 text-sm">Bu ay</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Aktif Projeler */}
        <Card className="bg-card border border-gray-700">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Aktif Projeler</p>
                <p className="text-3xl font-bold mt-2">45</p>
              </div>
              <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-sm">+8.2%</span>
                <span className="text-gray-400 text-sm">Bu hafta</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Gelir */}
        <Card className="bg-card border border-gray-700">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Gelir</p>
                <p className="text-3xl font-bold mt-2">₺45.2K</p>
              </div>
              <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-sm">+23.1%</span>
                <span className="text-gray-400 text-sm">Bu ay</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Table
        aria-label="Kullanıcı tablosu"
        className="custom-table"
        classNames={{
          wrapper: "table-wrapper",
          th: "table-th",
          td: "table-td"
        }}
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={
          <div className="flex justify-between items-center">
            <span className="text-small">
              Toplam {filteredData.length} kullanıcı
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
        }
        bottomContentPlacement="outside"
      >
        <TableHeader>
          <TableColumn key="name">İsim</TableColumn>
          <TableColumn key="email">E-posta</TableColumn>
          <TableColumn key="role">Rol</TableColumn>
          <TableColumn key="status">Durum</TableColumn>
        </TableHeader>
        <TableBody items={items} emptyContent={"Kullanıcı bulunamadı"}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.role}</TableCell>
              <TableCell>{item.status}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Dashboard;