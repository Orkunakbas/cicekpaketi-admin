import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Title from '@/components/design/title/Title';
import Table from '@/components/design/table/Table';
import SiparisDetayModal from './SiparisDetayModal';
import { Button, Chip, Select, SelectItem, useDisclosure, Input } from '@heroui/react';
import { fetchOrders, updateOrder } from '@/store/slices/siparisSlice';
import { FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SiparisPage = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, pagination } = useSelector((state) => state.siparis);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [dispatch, statusFilter, currentPage]);

  const loadOrders = () => {
    dispatch(fetchOrders({
      status: statusFilter,
      search: '',
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

  // Siparişleri filtrele (arama ve durum)
  const filteredOrders = React.useMemo(() => {
    let filtered = parsedOrders;

    // Arama filtresi
    if (searchValue) {
      filtered = filtered.filter(order => {
        const searchLower = searchValue.toLowerCase();
        return (
          order.order_number?.toLowerCase().includes(searchLower) ||
          order.customer_name?.toLowerCase().includes(searchLower) ||
          order.customer_email?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [parsedOrders, searchValue]);

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrder({
        id: orderId,
        orderData: { order_status: newStatus }
      })).unwrap();
      
      toast.success('Sipariş durumu güncellendi');
      loadOrders();
    } catch (error) {
      toast.error(error || 'Durum güncellenirken hata oluştu');
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrder({
        id: orderId,
        orderData: { payment_status: newStatus }
      })).unwrap();
      
      toast.success('Ödeme durumu güncellendi');
      loadOrders();
    } catch (error) {
      toast.error(error || 'Durum güncellenirken hata oluştu');
    }
  };

  // Sipariş durumu renkleri
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      preparing: 'primary',
      delivered: 'success',
      cancelled: 'danger',
      refunded: 'default'
    };
    return colors[status] || 'default';
  };

  // Sipariş durumu Türkçe
  const getStatusText = (status) => {
    const texts = {
      pending: 'Beklemede',
      preparing: 'Hazırlanıyor',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi',
      refunded: 'İade Edildi'
    };
    return texts[status] || status;
  };

  // Ödeme durumu renkleri
  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      failed: 'danger',
      refunded: 'default'
    };
    return colors[status] || 'default';
  };

  // Ödeme durumu Türkçe
  const getPaymentStatusText = (status) => {
    const texts = {
      pending: 'Beklemede',
      paid: 'Ödendi',
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
        <Select
          size="sm"
          variant="flat"
          color={order.order_status === 'shipped' ? 'default' : getStatusColor(order.order_status)}
          selectedKeys={[order.order_status]}
          onChange={(e) => handleStatusChange(order.id, e.target.value)}
          className="min-w-[140px]"
          classNames={{
            value: order.order_status === 'shipped' ? "text-purple-400 text-xs font-medium" : "text-xs font-medium",
            trigger: order.order_status === 'shipped' ? "bg-purple-600/20 data-[hover=true]:bg-purple-600/30" : ""
          }}
        >
          <SelectItem key="pending" value="pending">Beklemede</SelectItem>
          <SelectItem key="preparing" value="preparing">Hazırlanıyor</SelectItem>
          <SelectItem key="shipped" value="shipped">Kargoda</SelectItem>
          <SelectItem key="delivered" value="delivered">Teslim Edildi</SelectItem>
          <SelectItem key="cancelled" value="cancelled">İptal Edildi</SelectItem>
          <SelectItem key="refunded" value="refunded">İade Edildi</SelectItem>
        </Select>
      ),
    },
    {
      key: 'payment_status',
      label: 'Ödeme Durumu',
      sortable: true,
      render: (order) => (
        <Select
          size="sm"
          variant="flat"
          color={getPaymentStatusColor(order.payment_status)}
          selectedKeys={[order.payment_status]}
          onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
          className="min-w-[120px]"
          classNames={{
            value: "text-white text-xs font-medium"
          }}
        >
          <SelectItem key="pending" value="pending">Beklemede</SelectItem>
          <SelectItem key="paid" value="paid">Ödendi</SelectItem>
          <SelectItem key="failed" value="failed">Başarısız</SelectItem>
          <SelectItem key="refunded" value="refunded">İade Edildi</SelectItem>
        </Select>
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

      <div className="mt-6">
        {/* Filtre ve Arama Bölümü */}
        <div className="flex justify-between items-end gap-3 mb-4">
          <Input
            isClearable
            className="w-full max-w-xs"
            placeholder="Sipariş no, müşteri adı veya email ara..."
            variant="bordered"
            value={searchValue}
            onValueChange={setSearchValue}
            onClear={() => setSearchValue('')}
            startContent={
              <svg
                aria-hidden="true"
                fill="none"
                focusable="false"
                height="1em"
                role="presentation"
                viewBox="0 0 24 24"
                width="1em"
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
            }
          />
          
          <Select
            label="Sipariş Durumu"
            placeholder="Tüm Siparişler"
            variant="bordered"
            selectedKeys={[statusFilter]}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-[280px]"
            classNames={{
              label: "text-white",
              value: "text-white"
            }}
          >
            <SelectItem key="all" value="all">Tüm Siparişler</SelectItem>
            <SelectItem key="pending" value="pending">Beklemede</SelectItem>
            <SelectItem key="preparing" value="preparing">Hazırlanıyor</SelectItem>
            <SelectItem key="shipped" value="shipped">Kargoda</SelectItem>
            <SelectItem key="delivered" value="delivered">Teslim Edildi</SelectItem>
            <SelectItem key="cancelled" value="cancelled">İptal Edildi</SelectItem>
            <SelectItem key="refunded" value="refunded">İade Edildi</SelectItem>
          </Select>
        </div>

        <Table
          columns={columns}
          data={filteredOrders}
          pagination={true}
          rowsPerPage={20}
          isLoading={isLoading}
          emptyText="Henüz sipariş yok"
          searchable={false}
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
