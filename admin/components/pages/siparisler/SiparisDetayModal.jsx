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
import { FaWhatsapp } from 'react-icons/fa';

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
      preparing: 'primary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'danger',
      refunded: 'default'
    };
    return colors[status] || 'default';
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

  // WhatsApp linki oluştur
  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    // Telefon numarasını temizle (sadece rakamlar)
    const cleanPhone = phone.replace(/\D/g, '');
    // Eğer 90 ile başlıyorsa olduğu gibi kullan, 0 ile başlıyorsa 90 ekle
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('90')) {
      formattedPhone = cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      formattedPhone = '90' + cleanPhone.substring(1);
    } else {
      formattedPhone = '90' + cleanPhone;
    }
    return `https://wa.me/${formattedPhone}`;
  };

  if (!parsedOrder) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      classNames={{
        base: "bg-dark h-screen m-0 rounded-none",
        wrapper: "z-[9999] items-start",
        backdrop: "z-[9998]",
        header: "border-b border-gray-800",
        body: "py-6 overflow-y-auto",
        footer: "border-t border-gray-800",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between gap-4 pr-12">
          <span className="text-xl font-semibold text-white">Sipariş Detayları</span>
          <span className="text-lg font-semibold text-secondary">#{parsedOrder.order_number}</span>
        </ModalHeader>

        <ModalBody>
          <div className="grid grid-cols-12 gap-6">
            {/* SOL TARAF - Ana İçerik (8 sütun) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Müşteri Bilgileri */}
              <div className="border border-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Müşteri Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Ad Soyad:</span>
                    <p className="text-white font-medium mt-1">{parsedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">E-posta:</span>
                    <p className="text-white mt-1">{parsedOrder.customer_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Telefon:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-white">{parsedOrder.customer_phone}</p>
                      {parsedOrder.customer_phone && (
                        <a
                          href={getWhatsAppLink(parsedOrder.customer_phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-400 transition-colors"
                        >
                          <FaWhatsapp size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Sipariş Tarihi:</span>
                    <p className="text-white mt-1">{formatDate(parsedOrder.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Sipariş Ürünleri */}
              <div className="border border-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Sipariş Ürünleri</h3>
                <div className="space-y-3">
                  {parsedOrder.orderItems?.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 border border-gray-700 rounded-lg">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-base">{item.product_name}</h4>
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
                <div className="border border-gray-700 rounded-lg p-4">
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
                      <div className="flex items-center gap-2">
                        <p>{parsedOrder.shipping_address.phone}</p>
                        <a
                          href={getWhatsAppLink(parsedOrder.shipping_address.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-400 transition-colors"
                        >
                          <FaWhatsapp size={18} />
                        </a>
                      </div>
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
                <div className="border border-gray-700 rounded-lg p-4">
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
                      <div className="flex items-center gap-2">
                        <p>{parsedOrder.billing_address.phone}</p>
                        <a
                          href={getWhatsAppLink(parsedOrder.billing_address.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-400 transition-colors"
                        >
                          <FaWhatsapp size={18} />
                        </a>
                      </div>
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
                <div className="border border-gray-700 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-white mb-2">Çiçek Notu</h3>
                  <p className="text-sm text-gray-300">{parsedOrder.customer_note}</p>
                </div>
              )}

              {/* Ödeme Özeti */}
              <div className="border border-gray-700 rounded-lg p-5">
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

            {/* SAĞ TARAF - Sipariş Yönetimi (4 sütun) */}
            <div className="col-span-12 lg:col-span-4">
              <div className="border border-gray-700 rounded-lg p-5 space-y-4 lg:sticky lg:top-0">
                <h3 className="text-lg font-semibold text-white mb-4">Sipariş Yönetimi</h3>

                {/* Sipariş Durumu */}
                <Select
                  label="Sipariş Durumu"
                  variant="flat"
                  color={formData.order_status === 'shipped' ? 'default' : getStatusColor(formData.order_status)}
                  selectedKeys={[formData.order_status]}
                  onChange={(e) => handleChange('order_status', e.target.value)}
                  classNames={{
                    label: "text-white",
                    value: formData.order_status === 'shipped' ? "text-purple-400 font-medium" : "font-medium",
                    trigger: formData.order_status === 'shipped' ? "bg-purple-600/20 data-[hover=true]:bg-purple-600/30" : ""
                  }}
                >
                  <SelectItem key="pending" value="pending">Beklemede</SelectItem>
                  <SelectItem key="preparing" value="preparing">Hazırlanıyor</SelectItem>
                  <SelectItem key="shipped" value="shipped">Kargoda</SelectItem>
                  <SelectItem key="delivered" value="delivered">Teslim Edildi</SelectItem>
                  <SelectItem key="cancelled" value="cancelled">İptal Edildi</SelectItem>
                  <SelectItem key="refunded" value="refunded">İade Edildi</SelectItem>
                </Select>

                {/* Ödeme Durumu */}
                <Select
                  label="Ödeme Durumu"
                  variant="flat"
                  color={getPaymentStatusColor(formData.payment_status)}
                  selectedKeys={[formData.payment_status]}
                  onChange={(e) => handleChange('payment_status', e.target.value)}
                  classNames={{
                    label: "text-white",
                    value: "font-medium"
                  }}
                >
                  <SelectItem key="pending" value="pending">Beklemede</SelectItem>
                  <SelectItem key="paid" value="paid">Ödendi</SelectItem>
                  <SelectItem key="failed" value="failed">Başarısız</SelectItem>
                  <SelectItem key="refunded" value="refunded">İade Edildi</SelectItem>
                </Select>

                {/* Kargo Şirketi */}
                <Input
                  label="Kargo Şirketi"
                  variant="bordered"
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
                  variant="bordered"
                  placeholder="Takip numarasını girin"
                  value={formData.tracking_number}
                  onChange={(e) => handleChange('tracking_number', e.target.value)}
                  classNames={{
                    label: "text-white",
                    input: "text-white"
                  }}
                />

                {/* Admin Notu */}
                <Textarea
                  label="Admin Notu"
                  variant="bordered"
                  placeholder="Sipariş hakkında not ekleyin..."
                  value={formData.admin_note}
                  onChange={(e) => handleChange('admin_note', e.target.value)}
                  minRows={4}
                  classNames={{
                    label: "text-white",
                    input: "text-white"
                  }}
                />
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

