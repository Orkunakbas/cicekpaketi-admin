import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Title from '@/components/design/title/Title';
import Table from '@/components/design/table/Table';
import SiparisDetayModal from './SiparisDetayModal';
import { Button, Chip, Select, SelectItem, useDisclosure, Input } from '@heroui/react';
import { fetchOrders } from '@/store/slices/siparisSlice';
import { FaEye, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SiparisPage = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, pagination } = useSelector((state) => state.siparis);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [dispatch, statusFilter, currentPage]);

  const loadOrders = () => {
    dispatch(fetchOrders({
      status: statusFilter,
      search: searchTerm,
      page: currentPage,
      limit: 20
    }));
  };

  // Siparişleri parse et (string olan JSON alanlarını objeye çevir)
  const parsedOrders = React.useMemo(() => {
    return orders.map(order => {
      try {
        return {
          ...order,
          shipping_address: typeof order.shipping_address === 'string' 
            ? JSON.parse(order.shipping_address) 
            : order.shipping_address,
          billing_address: typeof order.billing_address === 'string' 
            ? JSON.parse(order.billing_address) 
            : order.billing_address,
          orderItems: order.orderItems?.map(item => ({
            ...item,
            variant_info: typeof item.variant_info === 'string' 
              ? JSON.parse(item.variant_info) 
              : item.variant_info
          })) || []
        };
      } catch (e) {
        console.error('Parse error:', e);
        return order;
      }
    });
  }, [orders]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const handleDetail = (order) => {
    setSelectedOrder(order);
    onDetailOpen();
  };

  const handleSuccess = () => {
    loadOrders();
  };

  // Sipariş durumu renkleri
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'primary',
      processing: 'secondary',
      shipped: 'default',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colors[status] || 'default';
  };

  // Sipariş durumu Türkçe
  const getStatusText = (status) => {
    const texts = {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      processing: 'Hazırlanıyor',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };
    return texts[status] || status;
  };

  // Ödeme durumu renkleri
  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      completed: 'success',
      failed: 'danger',
      refunded: 'default'
    };
    return colors[status] || 'default';
  };

  // Ödeme durumu Türkçe
  const getPaymentStatusText = (status) => {
    const texts = {
      pending: 'Beklemede',
      completed: 'Ödendi',
      failed: 'Başarısız',
      refunded: 'İade Edildi'
    };
    return texts[status] || status;
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const columns = [
    {
      key: 'order_number',
      label: 'Sipariş No',
      sortable: true,
      render: (order) => (
        <div className="font-semibold text-secondary">
          #{order.order_number}
        </div>
      ),
    },
    {
      key: 'customer_name',
      label: 'Müşteri',
      sortable: true,
      render: (order) => (
        <div>
          <div className="font-medium">{order.customer_name}</div>
          <div className="text-xs text-gray-500">{order.customer_email}</div>
        </div>
      ),
    },
    {
      key: 'item_count',
      label: 'Ürün',
      sortable: true,
      render: (order) => (
        <div className="text-center">
          <span className="text-sm">{order.item_count} Ürün</span>
        </div>
      ),
    },
    {
      key: 'total_amount',
      label: 'Tutar',
      sortable: true,
      render: (order) => (
        <div className="font-semibold">
          ₺{parseFloat(order.total_amount).toFixed(2)}
        </div>
      ),
    },
    {
      key: 'order_status',
      label: 'Sipariş Durumu',
      sortable: true,
      render: (order) => (
        <Chip color={getStatusColor(order.order_status)} size="sm" variant="flat">
          {getStatusText(order.order_status)}
        </Chip>
      ),
    },
    {
      key: 'payment_status',
      label: 'Ödeme Durumu',
      sortable: true,
      render: (order) => (
        <Chip color={getPaymentStatusColor(order.payment_status)} size="sm" variant="flat">
          {getPaymentStatusText(order.payment_status)}
        </Chip>
      ),
    },
    {
      key: 'created_at',
      label: 'Tarih',
      sortable: true,
      render: (order) => (
        <div className="text-sm text-gray-600">
          {formatDate(order.created_at)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (order) => (
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            color="secondary"
            variant="light"
            onPress={() => handleDetail(order)}
          >
            <FaEye className="text-lg" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title>Siparişler</Title>

      {/* Filtreler ve Arama */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        {/* Sol: Durum Filtresi */}
        <div className="w-full sm:w-auto">
          <Select
            label="Sipariş Durumu"
            placeholder="Tüm Siparişler"
            selectedKeys={[statusFilter]}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-[240px]"
            classNames={{
              label: "text-white",
              value: "text-white"
            }}
          >
            <SelectItem key="all" value="all">Tüm Siparişler</SelectItem>
            <SelectItem key="pending" value="pending">Beklemede</SelectItem>
            <SelectItem key="confirmed" value="confirmed">Onaylandı</SelectItem>
            <SelectItem key="processing" value="processing">Hazırlanıyor</SelectItem>
            <SelectItem key="shipped" value="shipped">Kargoda</SelectItem>
            <SelectItem key="delivered" value="delivered">Teslim Edildi</SelectItem>
            <SelectItem key="cancelled" value="cancelled">İptal Edildi</SelectItem>
          </Select>
        </div>

        {/* Sağ: Arama */}
        <div className="flex gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <Input
            placeholder="Sipariş no, müşteri adı veya email ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
            classNames={{
              label: "text-white",
              input: "text-white"
            }}
          />
          <Button
            color="secondary"
            onPress={handleSearch}
            className="min-w-[100px]"
          >
            <FaSearch className="mr-2" />
            Ara
          </Button>
        </div>
      </div>
      
      <div className="mt-6">
        <Table
          columns={columns}
          data={parsedOrders}
          pagination={true}
          rowsPerPage={20}
          isLoading={isLoading}
          emptyText="Henüz sipariş yok"
        />
      </div>

      {/* Pagination Info */}
      {pagination.total > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Toplam {pagination.total} sipariş - Sayfa {pagination.page} / {pagination.totalPages}
        </div>
      )}

      {/* Sipariş Detay Modal */}
      <SiparisDetayModal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        order={selectedOrder}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default SiparisPage;
