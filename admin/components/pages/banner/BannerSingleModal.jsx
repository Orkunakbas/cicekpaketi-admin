import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import { updateBanner, deleteBannerImage } from '@/store/slices/bannerSlice';
import ConfirmModal from '@/components/design/confirmModal/ConfirmModal';
import toast from 'react-hot-toast';
import { FaTrash, FaImage } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const BannerSingleModal = ({ isOpen, onClose, banner, onSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.banners);
  const { isOpen: isDeleteImageOpen, onOpen: onDeleteImageOpen, onClose: onDeleteImageClose } = useDisclosure();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background_color: '',
    button_text: '',
    button_color: '',
    button_link: '',
  });

  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [existingBannerImage, setExistingBannerImage] = useState(null);

  // Banner değiştiğinde formu doldur
  useEffect(() => {
    if (banner && isOpen) {
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        background_color: banner.background_color || '',
        button_text: banner.button_text || '',
        button_color: banner.button_color || '',
        button_link: banner.button_link || '',
      });
      
      // Varolan banner resmini göster
      if (banner.banner_image) {
        setExistingBannerImage(`${API_BASE_URL}/${banner.banner_image}`);
      } else {
        setExistingBannerImage(null);
      }
      
      // Yeni resim seçimini temizle
      setBannerImage(null);
      setBannerImagePreview(null);
    }
  }, [banner, isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setExistingBannerImage(null);
    }
  };

  const handleRemoveBannerImage = () => {
    // Eğer yeni yüklenen bir resim varsa, sadece önizlemeyi kaldır
    if (bannerImagePreview && bannerImage) {
      setBannerImage(null);
      setBannerImagePreview(null);
      if (banner?.banner_image) {
        setExistingBannerImage(`${API_BASE_URL}/${banner.banner_image}`);
      }
      return;
    }

    // Eğer DB'deki mevcut resmi siliyorsa, onay modalını aç
    if (existingBannerImage && banner?.banner_image) {
      onDeleteImageOpen();
    }
  };

  const confirmDeleteImage = async () => {
    try {
      await dispatch(deleteBannerImage(banner.id)).unwrap();
      toast.success('Banner resmi başarıyla silindi');
      setExistingBannerImage(null);
      onDeleteImageClose();
      
      // Başarılı silme sonrası callback
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error || 'Banner resmi silinirken bir hata oluştu');
      onDeleteImageClose();
    }
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.title) {
      toast.error('Banner başlığı zorunludur');
      return;
    }

    if (!banner) {
      toast.error('Banner bilgisi bulunamadı');
      return;
    }

    try {
      const dataToSend = { ...formData };
      
      // Yeni banner resmi varsa ekle
      if (bannerImage) {
        dataToSend.banner_image = bannerImage;
      }

      await dispatch(updateBanner({ 
        id: banner.id, 
        bannerData: dataToSend 
      })).unwrap();
      
      toast.success('Banner başarıyla güncellendi');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error || 'Banner güncellenirken bir hata oluştu');
    }
  };

  return (
    <>
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
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
          <h3 className="text-xl font-semibold text-white">Banner Düzenle</h3>
          <p className="text-sm text-gray-400 font-normal">Banner bilgilerini düzenleyin</p>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
              {/* Banner Başlığı */}
              <Input
                label="Banner Başlığı"
                placeholder="Başlık girin"
                value={formData.title}
                onValueChange={(value) => handleChange('title', value)}
                variant="bordered"
                isRequired
                classNames={{
                  label: "text-white",
                  input: "text-white",
                }}
              />

              {/* Açıklama */}
              <Textarea
                label="Açıklama"
                placeholder="Banner açıklamasını girin"
                value={formData.description}
                onValueChange={(value) => handleChange('description', value)}
                variant="bordered"
                minRows={3}
                classNames={{
                  label: "text-white",
                  input: "text-white",
                }}
              />

            {/* Arka Plan Rengi */}
            <div className="space-y-2">
              <label className="text-sm text-white">Arka Plan Rengi</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={formData.background_color || '#000000'}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="w-16 h-10 rounded-lg cursor-pointer"
                />
                <Input
                  placeholder="#FF5733"
                  value={formData.background_color}
                  onValueChange={(value) => handleChange('background_color', value)}
                  variant="bordered"
                  classNames={{
                    input: "text-white",
                  }}
                />
              </div>
            </div>

              {/* Buton Yazısı */}
              <Input
                label="Buton Yazısı"
                placeholder="Hemen İncele"
                value={formData.button_text}
                onValueChange={(value) => handleChange('button_text', value)}
                variant="bordered"
                classNames={{
                  label: "text-white",
                  input: "text-white",
                }}
              />

              {/* Buton Rengi */}
              <div className="space-y-2">
                <label className="text-sm text-white">Buton Rengi</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.button_color || '#000000'}
                    onChange={(e) => handleChange('button_color', e.target.value)}
                    className="w-16 h-10 rounded-lg cursor-pointer"
                  />
                  <Input
                    placeholder="#4ECDC4"
                    value={formData.button_color}
                    onValueChange={(value) => handleChange('button_color', value)}
                    variant="bordered"
                    classNames={{
                      input: "text-white",
                    }}
                  />
                </div>
              </div>

              {/* Buton Linki */}
              <Input
                label="Buton Linki"
                placeholder="/kampanyalar"
                value={formData.button_link}
                onValueChange={(value) => handleChange('button_link', value)}
                variant="bordered"
                classNames={{
                  label: "text-white",
                  input: "text-white",
                }}
              />

            {/* Banner Resmi */}
            <div className="space-y-2">
              <label className="text-sm text-white">Banner Resmi</label>
              
              {bannerImagePreview || existingBannerImage ? (
                <div className="relative w-[200px] h-[200px] bg-gray-900 rounded-lg overflow-hidden">
                  <img 
                    src={bannerImagePreview || existingBannerImage} 
                    alt="Banner önizleme" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    className="absolute top-2 right-2"
                    onPress={handleRemoveBannerImage}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ) : (
                <div className="w-full border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-secondary transition-colors">
                  <label className="flex flex-col items-center cursor-pointer">
                    <FaImage className="w-12 h-12 text-gray-600 mb-2" />
                    <span className="text-sm text-gray-400">Banner görseli yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="light" 
            onPress={onClose}
            className="text-gray-400"
          >
            İptal
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

    {/* Resim Silme Onay Modal */}
    <ConfirmModal
      isOpen={isDeleteImageOpen}
      onClose={onDeleteImageClose}
      title="Banner Resmini Sil"
      message="Banner resmini silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      confirmText="Evet, Sil"
      cancelText="İptal"
      onConfirm={confirmDeleteImage}
    />
    </>
  );
};

export default BannerSingleModal;
