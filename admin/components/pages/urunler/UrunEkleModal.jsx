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
  Switch,
  Tooltip,
} from '@heroui/react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchOptionTypes, fetchOptionValues } from '@/store/slices/variantSlice';
import toast from 'react-hot-toast';
import UrunEkleForm from './UrunEkleForm';

const UrunEkleModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { optionTypes, optionValues } = useSelector((state) => state.variant);

  const [hasVariants, setHasVariants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVariantTypes, setSelectedVariantTypes] = useState([]);
  const [selectedVariantValues, setSelectedVariantValues] = useState({});
  const [variantCombinations, setVariantCombinations] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    category_id: [],
    brand: '',
    tags: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    product_features: '',
    meta_title: '',
    meta_description: '',
    images: [],
  });

  // Kategorileri ve varyant seçeneklerini çek
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategories(router.locale));
      dispatch(fetchOptionTypes(router.locale));
      dispatch(fetchOptionValues({ language_code: router.locale }));
    }
  }, [isOpen, dispatch, router.locale]);

  // Modal kapandığında formu temizle
  useEffect(() => {
    if (!isOpen) {
      setHasVariants(false);
      setIsSubmitting(false);
      setSelectedVariantTypes([]);
      setSelectedVariantValues({});
      setVariantCombinations([]);
      setFormData({
        name: '',
        short_description: '',
        description: '',
        category_id: [],
        brand: '',
        tags: '',
        price: '',
        discount_price: '',
        stock_quantity: '',
        product_features: '',
        meta_title: '',
        meta_description: '',
        images: [],
      });
    }
  }, [isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Kombinasyon oluşturma fonksiyonu
  const generateCombinations = () => {
    if (selectedVariantTypes.length === 0) {
      setVariantCombinations([]);
      return;
    }

    const hasEmptyValues = selectedVariantTypes.some(typeId => {
      return !selectedVariantValues[typeId] || selectedVariantValues[typeId].length === 0;
    });

    if (hasEmptyValues) {
      setVariantCombinations([]);
      return;
    }

    const arrays = selectedVariantTypes.map(typeId => {
      const type = optionTypes?.find(t => t.id === typeId);
      const values = selectedVariantValues[typeId] || [];
      return values.map(valueId => {
        const val = optionValues?.find(v => v.id === valueId);
        return {
          typeId,
          typeName: type?.name,
          valueId,
          valueName: val?.value,
          colorCode: val?.color_code
        };
      });
    });

    const cartesianProduct = (arr) => {
      return arr.reduce((acc, curr) => {
        return acc.flatMap(a => curr.map(c => [...a, c]));
      }, [[]]);
    };

    const combinations = cartesianProduct(arrays);
    
    const formatted = combinations.map((combo, index) => ({
      id: `combo-${index}`,
      items: combo,
      label: combo.map(c => c.valueName).join(' • '),
      price: '',
      discount_price: '',
      stock_quantity: '',
      product_features: '',
      images: []
    }));

    setVariantCombinations(formatted);
  };

  // Otomatik kombinasyon oluştur
  useEffect(() => {
    generateCombinations();
  }, [selectedVariantTypes, selectedVariantValues, optionTypes, optionValues]);

  // Kategorileri organize et (Ana kategoriler ve alt kategorileri birlikte)
  const organizeCategories = () => {
    if (!categories || categories.length === 0) return [];
    
    const mainCategories = categories.filter(cat => cat.parent_id === null);
    const subCategories = categories.filter(cat => cat.parent_id !== null);
    
    const organized = [];
    
    mainCategories.forEach(main => {
      organized.push({
        ...main,
        isMain: true
      });
      
      const subs = subCategories.filter(sub => sub.parent_id === main.id);
      subs.forEach(sub => {
        organized.push({
          ...sub,
          isMain: false
        });
      });
    });
    
    return organized;
  };

  // Resim ekleme fonksiyonu (varyantlı)
  const handleImageUpload = (combinationId, files) => {
    if (!files || files.length === 0) return;

    const newImages = [];
    let loadedCount = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} bir resim dosyası değil!`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} çok büyük! Maksimum 5MB olmalı.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          id: `img-${Date.now()}-${Math.random()}`,
          file: file,
          preview: e.target.result,
          isCover: false
        });

        loadedCount++;
        if (loadedCount === files.length) {
          const updated = variantCombinations.map(c => {
            if (c.id === combinationId) {
              const currentImages = c.images || [];
              const allImages = [...currentImages, ...newImages];
              if (!allImages.some(img => img.isCover) && allImages.length > 0) {
                allImages[0].isCover = true;
              }
              return { ...c, images: allImages };
            }
            return c;
          });
          setVariantCombinations(updated);
          toast.success(`${files.length} resim eklendi!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageDelete = (combinationId, imageId) => {
    const updated = variantCombinations.map(c => {
      if (c.id === combinationId) {
        const filteredImages = c.images.filter(img => img.id !== imageId);
        if (filteredImages.length > 0 && !filteredImages.some(img => img.isCover)) {
          filteredImages[0].isCover = true;
        }
        return { ...c, images: filteredImages };
      }
      return c;
    });
    setVariantCombinations(updated);
    toast.success('Resim silindi');
  };

  const handleSetCover = (combinationId, imageId) => {
    const updated = variantCombinations.map(c => {
      if (c.id === combinationId) {
        const updatedImages = c.images.map(img => ({
          ...img,
          isCover: img.id === imageId
        }));
        return { ...c, images: updatedImages };
      }
      return c;
    });
    setVariantCombinations(updated);
    toast.success('Kapak resmi ayarlandı');
  };

  // VARYANTSIZ ÜRÜNLER İÇİN RESİM FONKSİYONLARI
  const handleSimpleImageUpload = (files) => {
    if (!files || files.length === 0) return;

    const newImages = [];
    let loadedCount = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} bir resim dosyası değil!`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} çok büyük! Maksimum 5MB olmalı.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          id: `img-${Date.now()}-${Math.random()}`,
          file: file,
          preview: e.target.result,
          isCover: false
        });

        loadedCount++;
        if (loadedCount === files.length) {
          const currentImages = formData.images || [];
          const allImages = [...currentImages, ...newImages];
          if (!allImages.some(img => img.isCover) && allImages.length > 0) {
            allImages[0].isCover = true;
          }
          setFormData(prev => ({ ...prev, images: allImages }));
          toast.success(`${files.length} resim eklendi!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSimpleImageDelete = (imageId) => {
    const filteredImages = formData.images.filter(img => img.id !== imageId);
    if (filteredImages.length > 0 && !filteredImages.some(img => img.isCover)) {
      filteredImages[0].isCover = true;
    }
    setFormData(prev => ({ ...prev, images: filteredImages }));
    toast.success('Resim silindi');
  };

  const handleSimpleSetCover = (imageId) => {
    const updatedImages = formData.images.map(img => ({
      ...img,
      isCover: img.id === imageId
    }));
    setFormData(prev => ({ ...prev, images: updatedImages }));
    toast.success('Kapak resmi ayarlandı');
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      console.log('⚠️ Zaten submit ediliyor, bekleyin...');
      return;
    }

    if (!formData.name) {
      toast.error('Ürün adı zorunludur');
      return;
    }

    if (hasVariants && variantCombinations.length === 0) {
      toast.error('En az 1 varyant kombinasyonu oluşturmalısınız');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // category_id'nin her zaman array olduğundan emin ol
      let categoryIds = formData.category_id || [];
      if (!Array.isArray(categoryIds)) {
        categoryIds = [categoryIds];
      }
      // Sadece geçerli ID'leri tut
      categoryIds = categoryIds.filter(id => id);
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('short_description', formData.short_description || '');
      formDataToSend.append('category_id', JSON.stringify(categoryIds)); // FormData için stringify gerekli
      formDataToSend.append('brand', formData.brand || '');
      formDataToSend.append('tags', formData.tags || '');
      formDataToSend.append('language_code', router.locale || 'tr');
      formDataToSend.append('meta_title', formData.meta_title || '');
      formDataToSend.append('meta_description', formData.meta_description || '');
      formDataToSend.append('is_variant', hasVariants);

      if (!hasVariants) {
        formDataToSend.append('price', formData.price || '');
        formDataToSend.append('discount_price', formData.discount_price || '');
        formDataToSend.append('stock_quantity', formData.stock_quantity || '');
        formDataToSend.append('product_features', formData.product_features || '');

        const imageTypes = [];
        if (formData.images && formData.images.length > 0) {
          formData.images.forEach((image) => {
            formDataToSend.append('images', image.file);
            imageTypes.push(image.isCover ? 'cover' : 'gallery');
          });
          formDataToSend.append('imageTypes', JSON.stringify(imageTypes));
        }
      } else {
        const allImages = [];
        const imageMapping = [];

        variantCombinations.forEach((combo, variantIndex) => {
          if (combo.images && combo.images.length > 0) {
            combo.images.forEach((image, imgIndex) => {
              const globalImageIndex = allImages.length;
              allImages.push(image.file);
              
              imageMapping.push({
                variantIndex: variantIndex,
                imageIndex: globalImageIndex,
                isCover: image.isCover,
                sortOrder: imgIndex
              });
            });
          }
        });

        allImages.forEach(file => {
          formDataToSend.append('images', file);
        });

        formDataToSend.append('variantImageMapping', JSON.stringify(imageMapping));

        const combosForBackend = variantCombinations.map(combo => ({
          label: combo.label,
          items: combo.items,
          price: combo.price || '',
          discount_price: combo.discount_price || '',
          stock_quantity: combo.stock_quantity || '',
          product_features: combo.product_features || ''
        }));

        formDataToSend.append('variantCombinations', JSON.stringify(combosForBackend));
      }

      const response = await fetch(`/api/products/add`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ürün eklenemedi');
      }

      toast.success('Ürün başarıyla eklendi!');
      
      setFormData({
        name: '',
        short_description: '',
        description: '',
        category_id: [],
        brand: '',
        tags: '',
        price: '',
        discount_price: '',
        stock_quantity: '',
        product_features: '',
        meta_title: '',
        meta_description: '',
        images: [],
      });
      setHasVariants(false);
      setSelectedVariantTypes([]);
      setSelectedVariantValues({});
      setVariantCombinations([]);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      toast.error(error.message || 'Ürün eklenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <ModalHeader className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold text-white">
              Yeni Ürün Ekle
            </h3>
            <p className="text-sm text-gray-400 font-normal">
              Ürün bilgilerini ekleyin
            </p>
          </div>
          
          {/* Varyant Switch - Header Sağ */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">Varyantlı Ürün</span>
            <Tooltip 
              content={
                <div className="px-1 py-2 max-w-xs">
                  <p className="text-xs text-white">
                    {hasVariants 
                      ? 'Ürünün farklı renk, beden gibi varyantları olacak'
                      : 'Tek tip ürün (renk/beden varyasyonu yok)'
                    }
                  </p>
                </div>
              }
              placement="bottom"
            >
              <div className="cursor-help">
                <AiOutlineInfoCircle className="w-3.5 h-3.5 text-gray-400 hover:text-secondary transition-colors" />
              </div>
            </Tooltip>
            <Switch
              isSelected={hasVariants}
              onValueChange={setHasVariants}
              color="success"
              size="sm"
            />
          </div>
        </ModalHeader>
        
        <ModalBody>
          <UrunEkleForm
            hasVariants={hasVariants}
            formData={formData}
            handleChange={handleChange}
            categories={categories}
            organizeCategories={organizeCategories}
            optionTypes={optionTypes}
            optionValues={optionValues}
            selectedVariantTypes={selectedVariantTypes}
            setSelectedVariantTypes={setSelectedVariantTypes}
            selectedVariantValues={selectedVariantValues}
            setSelectedVariantValues={setSelectedVariantValues}
            variantCombinations={variantCombinations}
            setVariantCombinations={setVariantCombinations}
            handleSimpleImageUpload={handleSimpleImageUpload}
            handleSimpleImageDelete={handleSimpleImageDelete}
            handleSimpleSetCover={handleSimpleSetCover}
            handleImageUpload={handleImageUpload}
            handleImageDelete={handleImageDelete}
            handleSetCover={handleSetCover}
          />
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
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {isSubmitting ? 'Ekleniyor...' : 'Ürün Ekle'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UrunEkleModal;
