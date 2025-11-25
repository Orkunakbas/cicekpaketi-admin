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
  Select,
  SelectItem,
} from '@heroui/react';
import { updateCategory, fetchCategories } from '@/store/slices/categoriesSlice';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';

const KategoriSingleModal = ({ isOpen, onClose, category, onSuccess }) => {
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.categories);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: null,
    category_type: '',
    tags: '',
    icon: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  // Category değiştiğinde formu doldur
  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parent_id: category.parent_id || null,
        category_type: category.category_type || '',
        tags: category.tags || '',
        icon: category.icon || '',
      });
      
      // Varolan resmi göster
      if (category.image_url) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        setExistingImage(`${API_BASE_URL}/${category.image_url}`);
      } else {
        setExistingImage(null);
      }
      
      // Yeni resim seçimini temizle
      setImageFile(null);
      setImagePreview(null);
    }
  }, [category, isOpen]);

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
      setExistingImage(null); // Eski resmi gizle
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Varolan resmi geri göster
    if (category?.image_url) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      setExistingImage(`${API_BASE_URL}/${category.image_url}`);
    }
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.name) {
      toast.error('Kategori adı zorunludur');
      return;
    }

    if (!category) {
      toast.error('Kategori bilgisi bulunamadı');
      return;
    }

    try {
      const dataToSend = { ...formData };
      
      // Yeni resim varsa ekle
      if (imageFile) {
        dataToSend.image = imageFile;
      }

      await dispatch(updateCategory({ 
        id: category.id, 
        categoryData: dataToSend 
      })).unwrap();
      
      toast.success('Kategori başarıyla güncellendi');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error || 'Kategori güncellenirken bir hata oluştu');
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
          <h3 className="text-xl font-semibold text-white">Kategori Düzenle</h3>
          <p className="text-sm text-gray-400 font-normal">Kategori bilgilerini düzenleyin</p>
          {category && category.category_url && (
            <p className="text-xs text-gray-400">
              <strong className="text-blue-400">URL:</strong> {category.category_url}
            </p>
          )}
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
              selectedKeys={formData.parent_id ? new Set([formData.parent_id.toString()]) : new Set(['null'])}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                handleChange('parent_id', value === 'null' ? null : parseInt(value));
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
              {categories.filter(cat => cat.id !== category?.id).map((cat) => (
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
                    alt="Yeni resim önizleme" 
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
              ) : existingImage ? (
                <div className="relative w-[200px] h-[200px] bg-gray-900 rounded-lg overflow-hidden">
                  <img 
                    src={existingImage} 
                    alt="Mevcut kategori resmi" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="image-update"
                      className="hidden"
                    />
                    <label htmlFor="image-update">
                      <Button
                        size="sm"
                        color="secondary"
                        as="span"
                      >
                        Resmi Değiştir
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary/80 cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Resim yüklemek opsiyoneldir</p>
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
  );
};

export default KategoriSingleModal;
