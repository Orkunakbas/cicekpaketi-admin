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
import { updateProduct, fetchSingleProduct, deleteVariant } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchOptionTypes, fetchOptionValues } from '@/store/slices/variantSlice';
import toast from 'react-hot-toast';
import UrunGuncelleForm from './UrunGuncelleForm';
import ConfirmModal from '../../design/confirmModal/ConfirmModal';

const UrunGuncelleModal = ({ isOpen, onClose, onSuccess, productId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, selectedProduct } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { optionTypes, optionValues } = useSelector((state) => state.variant);

  const [hasVariants, setHasVariants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVariantTypes, setSelectedVariantTypes] = useState([]);
  const [selectedVariantValues, setSelectedVariantValues] = useState({});
  const [variantCombinations, setVariantCombinations] = useState([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);
  
  // Silme modal state'i
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null); // Silinen varyant ID'leri

  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    category_id: [],
    brand: '',
    tags: '',
    price: '',
    stock_quantity: '',
    meta_title: '',
    meta_description: '',
    images: [],
  });

  // Kategorileri, varyant seçeneklerini ve ürün bilgisini çek
  useEffect(() => {
    if (isOpen && productId) {
      dispatch(fetchCategories(router.locale));
      dispatch(fetchSingleProduct(productId));
      dispatch(fetchOptionTypes(router.locale));
      dispatch(fetchOptionValues({ language_code: router.locale }));
    }
  }, [isOpen, productId, dispatch, router.locale]);

  // Ürün bilgilerini parse et ve forma doldur
  useEffect(() => {
    if (selectedProduct && optionTypes && optionTypes.length > 0 && optionValues && optionValues.length > 0) {
      console.log('📦 Gelen Ürün Verisi:', selectedProduct);

      // category_id parse et (string -> array)
      let categoryIds = [];
      if (selectedProduct.category_id) {
        try {
          categoryIds = JSON.parse(selectedProduct.category_id);
        } catch (e) {
          categoryIds = [selectedProduct.category_id];
        }
      }

      // is_variant kontrolü
      const isVariant = selectedProduct.is_variant === 1 || selectedProduct.is_variant === true;
      setHasVariants(isVariant);

      // Varyantsız ürün için
      if (!isVariant && selectedProduct.variants && selectedProduct.variants.length > 0) {
        const variant = selectedProduct.variants[0];
        
        // Resimler: önce product seviyesinde ara, yoksa variant'tan al
        const productImages = selectedProduct.images || variant.images || [];
        console.log('📸 Varyantsız Ürün Resimleri:', productImages);
        
        setFormData({
          name: selectedProduct.name || '',
          short_description: selectedProduct.short_description || '',
          description: selectedProduct.description || '',
          category_id: categoryIds,
          brand: selectedProduct.brand || '',
          tags: selectedProduct.tags || '',
          price: variant.price?.toString() || '',
          stock_quantity: variant.stock_quantity?.toString() || '',
          meta_title: selectedProduct.meta_title || '',
          meta_description: selectedProduct.meta_description || '',
          images: productImages,
        });
      }
      // Varyantlı ürün için
      else if (isVariant && selectedProduct.variants) {
        setFormData({
          name: selectedProduct.name || '',
          short_description: selectedProduct.short_description || '',
          description: selectedProduct.description || '',
          category_id: categoryIds,
          brand: selectedProduct.brand || '',
          tags: selectedProduct.tags || '',
          price: '',
          stock_quantity: '',
          meta_title: selectedProduct.meta_title || '',
          meta_description: selectedProduct.meta_description || '',
          images: [],
        });

        // Varyantları kombinasyonlara dönüştür
        const combinations = selectedProduct.variants.map(variant => ({
          id: variant.id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          material: variant.material,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          images: variant.images || [],
          label: [variant.color, variant.size, variant.material].filter(Boolean).join(' • '),
        }));
        
        setVariantCombinations(combinations);

        // Varyantlardan kullanılan tipleri ve değerleri çıkar
        const usedTypes = new Set();
        const usedValuesByType = {};

        selectedProduct.variants.forEach(variant => {
          // Renk kontrolü
          if (variant.color) {
            const colorType = optionTypes.find(t => t.name.toLowerCase() === 'renk' || t.name.toLowerCase() === 'color');
            if (colorType) {
              usedTypes.add(colorType.id);
              const colorValue = optionValues.find(v => 
                v.option_type_id === colorType.id && v.value === variant.color
              );
              if (colorValue) {
                if (!usedValuesByType[colorType.id]) {
                  usedValuesByType[colorType.id] = [];
                }
                if (!usedValuesByType[colorType.id].includes(colorValue.id)) {
                  usedValuesByType[colorType.id].push(colorValue.id);
                }
              }
            }
          }

          // Beden kontrolü
          if (variant.size) {
            const sizeType = optionTypes.find(t => t.name.toLowerCase() === 'beden' || t.name.toLowerCase() === 'size');
            if (sizeType) {
              usedTypes.add(sizeType.id);
              const sizeValue = optionValues.find(v => 
                v.option_type_id === sizeType.id && v.value === variant.size
              );
              if (sizeValue) {
                if (!usedValuesByType[sizeType.id]) {
                  usedValuesByType[sizeType.id] = [];
                }
                if (!usedValuesByType[sizeType.id].includes(sizeValue.id)) {
                  usedValuesByType[sizeType.id].push(sizeValue.id);
                }
              }
            }
          }

          // Materyal kontrolü
          if (variant.material) {
            const materialType = optionTypes.find(t => t.name.toLowerCase() === 'materyal' || t.name.toLowerCase() === 'material');
            if (materialType) {
              usedTypes.add(materialType.id);
              const materialValue = optionValues.find(v => 
                v.option_type_id === materialType.id && v.value === variant.material
              );
              if (materialValue) {
                if (!usedValuesByType[materialType.id]) {
                  usedValuesByType[materialType.id] = [];
                }
                if (!usedValuesByType[materialType.id].includes(materialValue.id)) {
                  usedValuesByType[materialType.id].push(materialValue.id);
                }
              }
            }
          }
        });

        setSelectedVariantTypes(Array.from(usedTypes));
        setSelectedVariantValues(usedValuesByType);
        
        console.log('✅ Varyantlar Yüklendi:', combinations);
        console.log('✅ Seçili Tipler:', Array.from(usedTypes));
        console.log('✅ Seçili Değerler:', usedValuesByType);
      }
    }
  }, [selectedProduct, optionTypes, optionValues]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Kombinasyon oluşturma fonksiyonu (yeni varyant eklemek için)
  const generateCombinations = () => {
    if (selectedVariantTypes.length === 0) {
      return;
    }

    const hasEmptyValues = selectedVariantTypes.some(typeId => {
      return !selectedVariantValues[typeId] || selectedVariantValues[typeId].length === 0;
    });

    if (hasEmptyValues) {
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
      stock_quantity: '',
      images: []
    }));

    setVariantCombinations(formatted);
  };

  // Otomatik kombinasyon oluştur
  useEffect(() => {
    // Sadece kullanıcı varyant seçimini değiştirdiyse yeni kombinasyon oluştur
    // İlk yükleme sırasında mevcut varyantları korumak için kontrol et
    if (selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0) {
      // Eğer seçim değiştiyse (kullanıcı etkileşimi) yeni kombinasyon oluştur
      const hasUserInteraction = selectedVariantTypes.length > 0 || Object.keys(selectedVariantValues).length > 0;
      if (hasUserInteraction) {
        generateCombinations();
      }
    } else {
      // Yeni ürün ekleme modunda her zaman oluştur
      generateCombinations();
    }
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
          isCover: false,
          isNew: true
        });

        loadedCount++;
        if (loadedCount === files.length) {
          const updated = variantCombinations.map(c => {
            if (c.id === combinationId) {
              const currentImages = c.images || [];
              const allImages = [...currentImages, ...newImages];
              if (!allImages.some(img => img.isCover || img.image_type === 'cover') && allImages.length > 0) {
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
        if (filteredImages.length > 0 && !filteredImages.some(img => img.isCover || img.image_type === 'cover')) {
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
          isCover: img.id === imageId,
          image_type: img.id === imageId ? 'cover' : 'gallery'
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
          isCover: false,
          isNew: true
        });

        loadedCount++;
        if (loadedCount === files.length) {
          const currentImages = formData.images || [];
          const allImages = [...currentImages, ...newImages];
          if (!allImages.some(img => img.isCover || img.image_type === 'cover') && allImages.length > 0) {
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
    if (filteredImages.length > 0 && !filteredImages.some(img => img.isCover || img.image_type === 'cover')) {
      filteredImages[0].isCover = true;
    }
    setFormData(prev => ({ ...prev, images: filteredImages }));
    toast.success('Resim silindi');
  };

  const handleSimpleSetCover = (imageId) => {
    const updatedImages = formData.images.map(img => ({
      ...img,
      isCover: img.id === imageId,
      image_type: img.id === imageId ? 'cover' : 'gallery'
    }));
    setFormData(prev => ({ ...prev, images: updatedImages }));
    toast.success('Kapak resmi ayarlandı');
  };

  // Delete butonuna tıklandığında modal aç
  const handleDeleteClick = (variant) => {
    setVariantToDelete(variant);
    setDeleteModalOpen(true);
  };

  // Varyant sil (Confirm edilince)
  const handleConfirmDelete = async () => {
    if (!variantToDelete) return;
    
    const variantId = variantToDelete.id;
    
    try {
      toast.loading('Varyant siliniyor...', { id: 'delete-variant' });
      
      // Redux slice ile backend'e istek gönder
      await dispatch(deleteVariant(variantId)).unwrap();
      
      toast.success('Varyant ve resimleri başarıyla silindi!', { id: 'delete-variant' });
      console.log('🗑️ Varyant veritabanından silindi:', variantId);
      
      // State'ten sil
      const updated = variantCombinations.filter(c => c.id !== variantId);
      setVariantCombinations(updated);
      
      // Modal'ı kapat
      setDeleteModalOpen(false);
      setVariantToDelete(null);
      
      // Ürün listesini yenile
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Varyant silme hatası:', error);
      toast.error(error || 'Varyant silinirken bir hata oluştu', { id: 'delete-variant' });
      setDeleteModalOpen(false);
      setVariantToDelete(null);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      console.log('⚠️ Zaten güncelleniyor, bekleyin...');
      return;
    }

    if (!formData.name) {
      toast.error('Ürün adı zorunludur');
      return;
    }

    if (hasVariants && variantCombinations.length === 0) {
      toast.error('En az 1 varyant olmalıdır');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        ...formData,
        category_id: JSON.stringify(formData.category_id),
        language_code: router.locale || 'tr'
      };

      // Varyantlı ürünse varyantları ekle
      if (hasVariants) {
        data.variants = variantCombinations;
        
        // Silinen varyantları ekle
        if (deletedVariantIds.length > 0) {
          data.deletedVariantIds = deletedVariantIds;
          console.log('🗑️ Silinecek Varyantlar:', deletedVariantIds);
        }
      }

      console.log('📤 Backend\'e Gönderilen Data:', data);

      await dispatch(updateProduct({ id: productId, data })).unwrap();
      toast.success('Ürün başarıyla güncellendi');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error(error || 'Ürün güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
              Ürünü Düzenle
            </h3>
            <p className="text-sm text-gray-400 font-normal">
              Ürün bilgilerini güncelleyin
            </p>
          </div>
          
          {/* Varyant Switch - Disabled (Değiştirilemez) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">Varyantlı Ürün</span>
            <Tooltip 
              content={
                <div className="px-1 py-2 max-w-xs">
                  <p className="text-xs text-white">
                    {hasVariants 
                      ? 'Bu ürün varyantlıdır'
                      : 'Bu ürün basit üründür'
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Not: Varyant durumu değiştirilemez
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
              isDisabled={true}
              color="success"
              size="sm"
            />
          </div>
        </ModalHeader>
        
        <ModalBody>
          <UrunGuncelleForm
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
            isUpdateMode={true}
            handleDeleteClick={handleDeleteClick}
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
            {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Varyant Silme Onay Modal'ı */}
    <ConfirmModal
      isOpen={deleteModalOpen}
      onClose={() => {
        setDeleteModalOpen(false);
        setVariantToDelete(null);
      }}
      title="Varyantı Sil"
      message={
        variantToDelete 
          ? `${variantToDelete.label} varyantını silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm resimleri de silinecektir.`
          : 'Varyantı silmek istediğinize emin misiniz?'
      }
      confirmText="Evet, Sil"
      cancelText="İptal"
      onConfirm={handleConfirmDelete}
    />
    </>
  );
};

export default UrunGuncelleModal;
