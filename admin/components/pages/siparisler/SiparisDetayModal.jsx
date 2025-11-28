import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Textarea,
  Chip,
} from '@heroui/react';
import { updateOrder } from '@/store/slices/siparisSlice';
import toast from 'react-hot-toast';

const SiparisDetayModal = ({ isOpen, onClose, order, onSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.siparis);

  const [formData, setFormData] = useState({
    order_status: '',
    payment_status: '',
    tracking_number: '',
    shipping_company: '',
    admin_note: ''
  });

  // Parse order data
  const parsedOrder = React.useMemo(() => {
    if (!order) return null;
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
  }, [order]);

  // Order değiştiğinde formu doldur
  useEffect(() => {
    if (parsedOrder && isOpen) {
      setFormData({
        order_status: parsedOrder.order_status || '',
        payment_status: parsedOrder.payment_status || '',
        tracking_number: parsedOrder.tracking_number || '',
        shipping_company: parsedOrder.shipping_company || '',
        admin_note: parsedOrder.admin_note || ''
      });
    }
  }, [parsedOrder, isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!parsedOrder) {
      toast.error('Sipariş bilgisi bulunamadı');
      return;
    }

    try {
      await dispatch(updateOrder({
        id: parsedOrder.id,
        orderData: formData
      })).unwrap();

      toast.success('Sipariş başarıyla güncellendi');

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error || 'Sipariş güncellenirken bir hata oluştu');
    }
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

  if (!parsedOrder) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-dark",
        header: "",
        body: "py-6",
        footer: "",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>Sipariş Detayları</span>
            <span className="text-lg font-semibold text-secondary">#{parsedOrder.order_number}</span>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Durum Güncelleme */}
            <div className="bg-gray-900 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Sipariş Yönetimi</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sipariş Durumu */}
                <Select
                  label="Sipariş Durumu"
                  selectedKeys={[formData.order_status]}
                  onChange={(e) => handleChange('order_status', e.target.value)}
                  classNames={{
                    label: "text-white",
                    value: "text-white"
                  }}
                >
                  <SelectItem key="pending" value="pending">Beklemede</SelectItem>
                  <SelectItem key="confirmed" value="confirmed">Onaylandı</SelectItem>
                  <SelectItem key="processing" value="processing">Hazırlanıyor</SelectItem>
                  <SelectItem key="shipped" value="shipped">Kargoda</SelectItem>
                  <SelectItem key="delivered" value="delivered">Teslim Edildi</SelectItem>
                  <SelectItem key="cancelled" value="cancelled">İptal Edildi</SelectItem>
                </Select>

                {/* Ödeme Durumu */}
                <Select
                  label="Ödeme Durumu"
                  selectedKeys={[formData.payment_status]}
                  onChange={(e) => handleChange('payment_status', e.target.value)}
                  classNames={{
                    label: "text-white",
                    value: "text-white"
                  }}
                >
                  <SelectItem key="pending" value="pending">Beklemede</SelectItem>
                  <SelectItem key="completed" value="completed">Ödendi</SelectItem>
                  <SelectItem key="failed" value="failed">Başarısız</SelectItem>
                  <SelectItem key="refunded" value="refunded">İade Edildi</SelectItem>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kargo Şirketi */}
                <Input
                  label="Kargo Şirketi"
                  placeholder="Örn: Aras Kargo"
                  value={formData.shipping_company}
                  onChange={(e) => handleChange('shipping_company', e.target.value)}
                  classNames={{
                    label: "text-white",
                    input: "text-white"
                  }}
                />

                {/* Takip Numarası */}
                <Input
                  label="Kargo Takip No"
                  placeholder="Takip numarasını girin"
                  value={formData.tracking_number}
                  onChange={(e) => handleChange('tracking_number', e.target.value)}
                  classNames={{
                    label: "text-white",
                    input: "text-white"
                  }}
                />
              </div>

              {/* Admin Notu */}
              <Textarea
                label="Admin Notu"
                placeholder="Sipariş hakkında not ekleyin..."
                value={formData.admin_note}
                onChange={(e) => handleChange('admin_note', e.target.value)}
                minRows={3}
                classNames={{
                  label: "text-white",
                  input: "text-white"
                }}
              />
            </div>

            {/* Müşteri Bilgileri */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Müşteri Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ad Soyad:</span>
                  <span className="text-white font-medium">{parsedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">E-posta:</span>
                  <span className="text-white">{parsedOrder.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Telefon:</span>
                  <span className="text-white">{parsedOrder.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sipariş Tarihi:</span>
                  <span className="text-white">{formatDate(parsedOrder.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Sipariş Ürünleri */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Sipariş Ürünleri</h3>
              <div className="space-y-3">
                {parsedOrder.orderItems?.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-gray-800 rounded-lg">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.product_name}</h4>
                      {item.variant_info && (
                        <p className="text-xs text-gray-400 mt-1">
                          SKU: {item.variant_info.sku}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-400">Adet: {item.quantity}</span>
                        <span className="text-gray-400">Birim: ₺{parseFloat(item.price).toFixed(2)}</span>
                        <span className="text-secondary font-semibold">
                          Toplam: ₺{parseFloat(item.line_total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teslimat ve Fatura Adresi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Teslimat Adresi */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Teslimat Adresi</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  {parsedOrder.shipping_address?.address_type && (
                    <div className="mb-2">
                      <Chip size="sm" variant="flat" color="default">
                        {parsedOrder.shipping_address.address_type === 'bireysel' ? 'Bireysel' : 'Kurumsal'}
                      </Chip>
                    </div>
                  )}
                  {parsedOrder.shipping_address?.name && (
                    <p className="font-medium text-white">
                      {parsedOrder.shipping_address.name} {parsedOrder.shipping_address.surname}
                    </p>
                  )}
                  {parsedOrder.shipping_address?.company_name && (
                    <p className="font-medium text-white">{parsedOrder.shipping_address.company_name}</p>
                  )}
                  {parsedOrder.shipping_address?.phone && (
                    <p>{parsedOrder.shipping_address.phone}</p>
                  )}
                  {parsedOrder.shipping_address?.city && parsedOrder.shipping_address?.district && (
                    <p>{parsedOrder.shipping_address.city} / {parsedOrder.shipping_address.district}</p>
                  )}
                  {parsedOrder.shipping_address?.postal_code && (
                    <p>Posta Kodu: {parsedOrder.shipping_address.postal_code}</p>
                  )}
                  {parsedOrder.shipping_address?.address_line1 && (
                    <p className="text-gray-400 mt-2">{parsedOrder.shipping_address.address_line1}</p>
                  )}
                </div>
              </div>

              {/* Fatura Adresi */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-3">Fatura Adresi</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  {parsedOrder.billing_address?.address_type && (
                    <div className="mb-2">
                      <Chip size="sm" variant="flat" color="default">
                        {parsedOrder.billing_address.address_type === 'bireysel' ? 'Bireysel' : 'Kurumsal'}
                      </Chip>
                    </div>
                  )}
                  {parsedOrder.billing_address?.name && (
                    <p className="font-medium text-white">
                      {parsedOrder.billing_address.name} {parsedOrder.billing_address.surname}
                    </p>
                  )}
                  {parsedOrder.billing_address?.company_name && (
                    <p className="font-medium text-white">{parsedOrder.billing_address.company_name}</p>
                  )}
                  {parsedOrder.billing_address?.tax_office && parsedOrder.billing_address?.tax_number && (
                    <div className="text-xs text-gray-400 mt-1">
                      <p>Vergi Dairesi: {parsedOrder.billing_address.tax_office}</p>
                      <p>Vergi No: {parsedOrder.billing_address.tax_number}</p>
                    </div>
                  )}
                  {parsedOrder.billing_address?.phone && (
                    <p>{parsedOrder.billing_address.phone}</p>
                  )}
                  {parsedOrder.billing_address?.city && parsedOrder.billing_address?.district && (
                    <p>{parsedOrder.billing_address.city} / {parsedOrder.billing_address.district}</p>
                  )}
                  {parsedOrder.billing_address?.postal_code && (
                    <p>Posta Kodu: {parsedOrder.billing_address.postal_code}</p>
                  )}
                  {parsedOrder.billing_address?.address_line1 && (
                    <p className="text-gray-400 mt-2">{parsedOrder.billing_address.address_line1}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Müşteri Notu */}
            {parsedOrder.customer_note && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-base font-semibold text-white mb-2">Çiçek Notu</h3>
                <p className="text-sm text-gray-300">{parsedOrder.customer_note}</p>
              </div>
            )}

            {/* Ödeme Özeti */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Ödeme Özeti</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ara Toplam:</span>
                  <span className="text-white">₺{parseFloat(parsedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kargo:</span>
                  <span className="text-white">
                    {parseFloat(parsedOrder.shipping_cost) === 0 ? 'Ücretsiz' : `₺${parseFloat(parsedOrder.shipping_cost).toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Toplam:</span>
                    <span className="text-secondary">₺{parseFloat(parsedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-400">Ödeme Yöntemi:</span>
                  <span className="text-white capitalize">
                    {parsedOrder.payment_method === 'credit_card' ? 'Kredi Kartı' : 'Havale/EFT'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            className="text-gray-400"
          >
            Kapat
          </Button>
          <Button
            color="secondary"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Güncelle
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SiparisDetayModal;

