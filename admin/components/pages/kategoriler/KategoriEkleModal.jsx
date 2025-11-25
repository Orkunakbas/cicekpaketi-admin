import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from '@heroui/react';
import { addCategory } from '@/store/slices/categoriesSlice';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';

const KategoriEkleModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { categories, isLoading } = useSelector((state) => state.categories);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language_code: router.locale || 'tr',
    parent_id: null,
    category_type: '',
    tags: '',
    icon: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Dil değiştiğinde formu güncelle
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      language_code: router.locale || 'tr'
    }));
  }, [router.locale]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.name) {
      toast.error('Kategori adı zorunludur');
      return;
    }

    try {
      const dataToSend = { ...formData };
      
      // Resim varsa ekle
      if (imageFile) {
        dataToSend.image = imageFile;
      }

      await dispatch(addCategory(dataToSend)).unwrap();
      toast.success('Kategori başarıyla eklendi');
      
      // Form temizle
      setFormData({
        name: '',
        description: '',
        language_code: router.locale || 'tr',
        parent_id: null,
        category_type: '',
        tags: '',
        icon: '',
      });
      setImageFile(null);
      setImagePreview(null);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error || 'Kategori eklenirken bir hata oluştu');
    }
  };

  return (
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
          <h3 className="text-xl font-semibold text-white">Yeni Kategori Ekle</h3>
          <p className="text-sm text-gray-400 font-normal">Yeni bir kategori oluşturun</p>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Kategori Adı */}
            <Input
              label="Kategori Adı"
              placeholder="Kategori adını girin"
              value={formData.name}
              onValueChange={(value) => handleChange('name', value)}
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
              placeholder="Kategori açıklamasını girin"
              value={formData.description}
              onValueChange={(value) => handleChange('description', value)}
              variant="bordered"
              minRows={3}
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
            />

            {/* Üst Kategori */}
            <Select
              label="Üst Kategori"
              placeholder="Üst kategori seçin (opsiyonel)"
              selectedKeys={formData.parent_id ? new Set([formData.parent_id.toString()]) : new Set([])}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                handleChange('parent_id', value ? parseInt(value) : null);
              }}
              variant="bordered"
              classNames={{
                label: "text-white",
                value: "text-white",
              }}
            >
              <SelectItem key="null" value="null">
                Ana Kategori
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </Select>

            {/* Kategori Tipi */}
            <Select
              label="Kategori Tipi"
              placeholder="Kategori tipi seçin"
              selectedKeys={formData.category_type ? new Set([formData.category_type]) : new Set([])}
              onSelectionChange={(keys) => handleChange('category_type', Array.from(keys)[0])}
              variant="bordered"
              classNames={{
                label: "text-white",
                value: "text-white",
              }}
            >
              <SelectItem key="Menu" value="Menu">
                Menü
              </SelectItem>
              <SelectItem key="Story" value="Story">
                Story
              </SelectItem>
            </Select>

            {/* Tags */}
            <Input
              label="Etiketler"
              value={formData.tags}
              onValueChange={(value) => handleChange('tags', value)}
              variant="bordered"
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
            />

            {/* Icon */}
            <Input
              label="İkon"
              value={formData.icon}
              onValueChange={(value) => handleChange('icon', value)}
              variant="bordered"
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
            />

            {/* Kategori Resmi */}
            <div className="space-y-2">
              <label className="text-sm text-white">Kategori Resmi</label>
              
              {imagePreview ? (
                <div className="relative w-[200px] h-[200px] bg-gray-900 rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Kategori önizleme" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    className="absolute top-2 right-2"
                    onPress={handleRemoveImage}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ) : (
                <div className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary/80 cursor-pointer"
                  />
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
            Kategori Ekle
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default KategoriEkleModal;
