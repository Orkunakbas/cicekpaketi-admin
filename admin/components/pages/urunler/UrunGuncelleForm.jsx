import React, { Fragment } from 'react';
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Checkbox,
  Accordion,
  AccordionItem,
  Button,
} from '@heroui/react';
import { FaStar, FaTrash, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const UrunGuncelleForm = ({
  hasVariants,
  formData,
  handleChange,
  categories,
  organizeCategories,
  // Varyant yönetimi
  optionTypes,
  optionValues,
  selectedVariantTypes,
  setSelectedVariantTypes,
  selectedVariantValues,
  setSelectedVariantValues,
  variantCombinations,
  setVariantCombinations,
  // Resim yönetimi (basit)
  handleSimpleImageUpload,
  handleSimpleImageDelete,
  handleSimpleSetCover,
  // Resim yönetimi (varyantlı)
  handleImageUpload,
  handleImageDelete,
  handleSetCover,
  // Güncelleme modu
  isUpdateMode = false,
  handleDeleteClick = () => {},
}) => {
  return (
    <Tabs 
      aria-label="Ürün Bilgileri"
      color="secondary"
      variant="underlined"
      classNames={{
        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
        cursor: "w-full bg-secondary",
        tab: "max-w-fit px-0 h-12",
        tabContent: "group-data-[selected=true]:text-secondary"
      }}
    >
      {/* Temel Bilgiler Tab */}
      <Tab key="temel" title="Temel Bilgiler">
        <div className="py-4 space-y-6">
          {/* VARYANTSIZ İÇİN - Basit Form */}
          {!hasVariants && (
            <div className="grid grid-cols-2 gap-6">
              {/* Sol Kolon */}
              <div className="space-y-4">
                {/* Ürün Adı */}
                <Input
                  label="Ürün Adı"
                  placeholder="Örn: Klasik Beyaz Tişört"
                  value={formData.name}
                  onValueChange={(value) => handleChange('name', value)}
                  variant="bordered"
                  isRequired
                  classNames={{
                    label: "text-white",
                    input: "text-white",
                  }}
                />

                {/* Kısa Açıklama */}
                <Textarea
                  label="Kısa Açıklama"
                  placeholder="Ürün hakkında kısa bir açıklama yazın..."
                  value={formData.short_description}
                  onValueChange={(value) => handleChange('short_description', value)}
                  variant="bordered"
                  minRows={3}
                  classNames={{
                    label: "text-white",
                    input: "text-white",
                  }}
                />

                {/* Açıklama */}
                <Textarea
                  label="Detaylı Açıklama"
                  placeholder="Ürün hakkında detaylı bilgi yazın..."
                  value={formData.description}
                  onValueChange={(value) => handleChange('description', value)}
                  variant="bordered"
                  minRows={6}
                  classNames={{
                    label: "text-white",
                    input: "text-white",
                  }}
                />

                {/* Resimler */}
                <div className="w-full bg-gray-900/30 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white">
                      Ürün Resimleri {formData.images?.length > 0 && `(${formData.images.length})`}
                    </p>
                    <label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSimpleImageUpload(e.target.files)}
                      />
                      <Button
                        as="span"
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<FaImage />}
                      >
                        Resim Ekle
                      </Button>
                    </label>
                  </div>

                  {/* Resim Önizlemeleri */}
                  {formData.images && formData.images.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {formData.images.map((image) => (
                        <div 
                          key={image.id}
                          className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-700 hover:border-secondary transition-colors"
                        >
                          <img
                            src={image.preview || `${API_BASE_URL}/${image.image_url}`}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Kapak Badge */}
                          {(image.isCover || image.image_type === 'cover') && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                              <FaStar className="w-3 h-3" />
                              Kapak
                            </div>
                          )}

                          {/* Hover Aksiyonlar */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!(image.isCover || image.image_type === 'cover') && (
                              <Button
                                isIconOnly
                                size="sm"
                                color="warning"
                                variant="flat"
                                onPress={() => handleSimpleSetCover(image.id)}
                              >
                                <FaStar />
                              </Button>
                            )}
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => handleImageDeleteClick(image)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                      <FaImage className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                      <p className="text-sm text-gray-500 font-medium">Henüz resim eklenmedi</p>
                      <p className="text-xs text-gray-600 mt-1">Birden fazla resim ekleyebilirsiniz</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sağ Kolon */}
              <div className="space-y-4">
                {/* Fiyat, İndirim, Stok - 3 Sütun */}
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Fiyat (₺)"
                    placeholder="100.00"
                    type="number"
                    value={formData.price}
                    onValueChange={(value) => handleChange('price', value)}
                    variant="bordered"
                    classNames={{
                      label: "text-white",
                      input: "text-white",
                    }}
                  />

                  <Input
                    label="İndirim (₺)"
                    placeholder="80.00"
                    type="number"
                    value={formData.discount_price}
                    onValueChange={(value) => handleChange('discount_price', value)}
                    variant="bordered"
                    classNames={{
                      label: "text-white",
                      input: "text-white",
                    }}
                  />

                  <Input
                    label="Stok"
                    placeholder="50"
                    type="number"
                    value={formData.stock_quantity}
                    onValueChange={(value) => handleChange('stock_quantity', value)}
                    variant="bordered"
                    classNames={{
                      label: "text-white",
                      input: "text-white",
                    }}
                  />
                </div>

                {/* Kategori (Multi-Select) */}
                <Select
                  label="Kategori"
                  placeholder="Kategoriler seçin (birden fazla seçilebilir)"
                  selectionMode="multiple"
                  selectedKeys={formData.category_id && Array.isArray(formData.category_id) ? new Set(formData.category_id.map(String)) : new Set()}
                  onSelectionChange={(keys) => {
                    const selectedIds = Array.from(keys).map(Number);
                    handleChange('category_id', selectedIds);
                  }}
                  variant="bordered"
                  classNames={{
                    label: "text-white",
                    value: "text-white",
                    trigger: "text-white",
                  }}
                >
                  {organizeCategories().map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      classNames={{
                        base: category.isMain ? "" : "pl-6",
                        title: category.isMain ? "font-semibold text-white" : "text-gray-300"
                      }}
                    >
                      {category.isMain ? category.name : `➜ ${category.name}`}
                    </SelectItem>
                  ))}
                </Select>

                {/* Marka */}
                <Input
                  label="Marka"
                  placeholder="Örn: Nike, Adidas"
                  value={formData.brand}
                  onValueChange={(value) => handleChange('brand', value)}
                  variant="bordered"
                  classNames={{
                    label: "text-white",
                    input: "text-white",
                  }}
                />

                {/* Etiketler */}
                <Input
                  label="Etiketler"
                  placeholder="Örn: spor, günlük, rahat"
                  value={formData.tags}
                  onValueChange={(value) => handleChange('tags', value)}
                  variant="bordered"
                  classNames={{
                    label: "text-white",
                    input: "text-white",
                  }}
                />

                {/* Ürün Özellikleri */}
                <Textarea
                  label="Ürün Özellikleri"
                  placeholder="Ürün özelliklerini giriniz..."
                  value={formData.product_features}
                  onValueChange={(value) => handleChange('product_features', value)}
                  variant="bordered"
                  minRows={4}
                  classNames={{
                    label: "text-white",
                    input: "text-white",
                  }}
                />
              </div>
            </div>
          )}

          {/* VARYANTLI İÇİN - Varyant Yönetimi */}
          {hasVariants && (
            <div className="space-y-6">
              {/* Genel Bilgiler */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Ürün Adı (Genel)"
                    placeholder="Örn: Klasik Tişört"
                    value={formData.name}
                    onValueChange={(value) => handleChange('name', value)}
                    variant="bordered"
                    isRequired
                    classNames={{
                      label: "text-white",
                      input: "text-white",
                    }}
                  />

                  {/* Kısa Açıklama */}
                  <Textarea
                    label="Kısa Açıklama (Genel)"
                    placeholder="Ürün hakkında kısa bir açıklama yazın..."
                    value={formData.short_description}
                    onValueChange={(value) => handleChange('short_description', value)}
                    variant="bordered"
                    minRows={3}
                    classNames={{
                      label: "text-white",
                      input: "text-white",
                    }}
                  />

                  {/* Detaylı Açıklama */}
                  <Textarea
                    label="Detaylı Açıklama (Genel)"
                    placeholder="Ürün hakkında detaylı bilgi yazın..."
                    value={formData.description}
                    onValueChange={(value) => handleChange('description', value)}
                    variant="bordered"
                    minRows={6}
                    classNames={{
                      label: "text-white",
                      input: "text-white",
                    }}
                  />
                </div>
                <div className="space-y-4">
                  {/* Kategori (Multi-Select) */}
                  <Select
                    label="Kategori"
                    placeholder="Kategoriler seçin (birden fazla seçilebilir)"
                    selectionMode="multiple"
                    selectedKeys={formData.category_id && Array.isArray(formData.category_id) ? new Set(formData.category_id.map(String)) : new Set()}
                    onSelectionChange={(keys) => {
                      const selectedIds = Array.from(keys).map(Number);
                      handleChange('category_id', selectedIds);
                    }}
                    variant="bordered"
                    classNames={{
                      label: "text-white",
                      value: "text-white",
                      trigger: "text-white",
                    }}
                  >
                    {organizeCategories().map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        classNames={{
                          base: category.isMain ? "" : "pl-6",
                          title: category.isMain ? "font-semibold text-white" : "text-gray-300"
                        }}
                      >
                        {category.isMain ? category.name : `➜ ${category.name}`}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Marka */}
                  <Input
                    label="Marka"
                    placeholder="Örn: Nike, Adidas"
                    value={formData.brand}
                    onValueChange={(value) => handleChange('brand', value)}
                    variant="bordered"
                    classNames={{
                      label: "text-white",
                      input: "text-white",
                    }}
                  />

                  {/* Etiketler */}
                  <Input
                    label="Etiketler"
                    placeholder="Örn: spor, günlük, rahat"
                    value={formData.tags}
                    onValueChange={(value) => handleChange('tags', value)}
                    variant="bordered"
                    classNames={{
                      label: "text-white",
                      input: "text-white",
                    }}
                  />
                </div>
              </div>

              {/* Varyant Yönetimi */}
              <div className="border-t border-gray-700 pt-6 space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">Varyant Yönetimi</h3>
                </div>

                {/* 1. Varyant Tipleri Seç */}
                <div className="bg-card border border-gray-700 rounded-xl p-6">
                  <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    {isUpdateMode && selectedVariantTypes.length > 0 ? 'Varyant Tipleri' : 'Varyant Tiplerini Seç'}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {optionTypes && optionTypes.length > 0 ? optionTypes
                      .filter(type => {
                        // Güncelleme modunda sadece seçili tipleri göster
                        if (isUpdateMode && selectedVariantTypes.length > 0) {
                          return selectedVariantTypes.includes(type.id);
                        }
                        // Yeni ekleme modunda tüm tipleri göster
                        return true;
                      })
                      .map((type) => {
                        const isDisabled = isUpdateMode && selectedVariantTypes.length > 0;
                        return (
                      <label
                        key={type.id}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedVariantTypes.includes(type.id)
                            ? 'border-secondary bg-secondary/10 shadow-lg shadow-secondary/20'
                            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                            } ${isDisabled ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <Checkbox
                          isSelected={selectedVariantTypes.includes(type.id)}
                              isDisabled={isDisabled}
                          onValueChange={(checked) => {
                                if (isDisabled) return;
                            if (checked) {
                              setSelectedVariantTypes([...selectedVariantTypes, type.id]);
                            } else {
                              setSelectedVariantTypes(selectedVariantTypes.filter(id => id !== type.id));
                              const newValues = { ...selectedVariantValues };
                              delete newValues[type.id];
                              setSelectedVariantValues(newValues);
                            }
                          }}
                          classNames={{
                            base: "m-0",
                          }}
                        />
                        <span className="font-medium text-white">{type.name}</span>
                            {isDisabled && (
                              <span className="ml-auto text-xs text-gray-500">(Sabit)</span>
                            )}
                      </label>
                        );
                      }) : (
                      <div className="col-span-3 text-center py-8">
                        <p className="text-sm text-gray-400">
                          Varyant tipi bulunamadı. Lütfen önce "Varyantlar" sayfasından varyant tipleri ekleyin.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Değerleri Seç */}
                {selectedVariantTypes.length > 0 && (
                  <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-white">
                      Değerleri Seç
                    </h4>
                    {selectedVariantTypes.map((typeId) => {
                      const type = optionTypes?.find(t => t.id === typeId);
                      const values = optionValues?.filter(v => v.option_type_id === typeId) || [];
                      
                      return (
                        <div key={typeId} className="space-y-2">
                          <p className="text-sm text-gray-300 font-medium">{type?.name}</p>
                          <div className="flex flex-wrap gap-3">
                            {values.length > 0 ? values.map((value) => {
                              // Güncelleme modunda bu değeri kullanan varyant var mı kontrol et
                              const isUsedInExistingVariants = isUpdateMode && variantCombinations.some(combo => 
                                typeof combo.id === 'number' && // Sadece DB'den gelen varyantlar
                                combo.items?.some(item => item.valueId === value.id)
                              );
                              
                              return (
                              <Checkbox
                                key={value.id}
                                isSelected={selectedVariantValues[typeId]?.includes(value.id)}
                                onValueChange={(checked) => {
                                  const current = selectedVariantValues[typeId] || [];
                                    
                                    // Değer kaldırılıyorsa ve mevcut varyantlarda kullanılıyorsa uyar
                                    if (!checked && isUsedInExistingVariants) {
                                      const affectedVariants = variantCombinations.filter(combo => 
                                        typeof combo.id === 'number' &&
                                        combo.items?.some(item => item.valueId === value.id)
                                      );
                                      
                                      toast.error(
                                        `"${value.value}" değeri ${affectedVariants.length} mevcut varyant tarafından kullanılıyor. Önce bu varyantları silmelisiniz.`,
                                        { duration: 4000 }
                                      );
                                      return;
                                    }
                                    
                                  if (checked) {
                                    setSelectedVariantValues({
                                      ...selectedVariantValues,
                                      [typeId]: [...current, value.id]
                                    });
                                  } else {
                                    setSelectedVariantValues({
                                      ...selectedVariantValues,
                                      [typeId]: current.filter(id => id !== value.id)
                                    });
                                      
                                      // Yeni eklenen (henüz DB'de olmayan) varyantları temizle
                                      const updated = variantCombinations.filter(combo => 
                                        typeof combo.id === 'number' || // DB'den gelen varyantları koru
                                        !combo.items?.some(item => item.valueId === value.id) // Kaldırılan değeri içermeyen yeni varyantları koru
                                      );
                                      setVariantCombinations(updated);
                                  }
                                }}
                                classNames={{
                                  label: "text-white",
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {value.color_code && (
                                    <div 
                                      className="w-4 h-4 rounded border border-gray-600"
                                      style={{ backgroundColor: value.color_code }}
                                    />
                                  )}
                                  <span>{value.value}</span>
                                    {isUsedInExistingVariants && (
                                      <span className="text-xs text-warning-500 ml-1">(Kullanımda)</span>
                                    )}
                                </div>
                              </Checkbox>
                              );
                            }) : (
                              <p className="text-xs text-orange-400">
                                "{type?.name}" için değer bulunamadı. Lütfen "Varyantlar" sayfasından değer ekleyin.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. ACCORDION'LAR - Her Varyant için Tam Bilgiler */}
                {variantCombinations.length > 0 && (
                  <div className=" bg-card border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-secondary rounded-full"></span>
                        Varyant Bilgilerini Girin
                      </h4>
                      <span className="px-3 py-1 bg-secondary/20 text-secondary text-sm font-semibold rounded-full">
                        {variantCombinations.length} varyant
                      </span>
                    </div>
                    <Accordion variant="splitted">
                      {variantCombinations.map((combination, index) => (
                        <AccordionItem
                          key={combination.id}
                          aria-label={`Varyant ${index + 1}`}
                          title={
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-gray-400">#{index + 1}</span>
                                {combination.items?.map((item, i) => (
                                  <Fragment key={i}>
                                    {item.colorCode && (
                                      <div 
                                        className="w-5 h-5 rounded-md border-2 border-gray-600 shadow-sm"
                                        style={{ backgroundColor: item.colorCode }}
                                      />
                                    )}
                                    <span className="text-white font-semibold">
                                      {item.valueName}
                                    </span>
                                    {i < combination.items.length - 1 && (
                                      <span className="text-secondary">•</span>
                                    )}
                                  </Fragment>
                                )) || (
                                  <>
                                    {combination.color && <span className="text-white font-semibold">{combination.color}</span>}
                                    {combination.size && <span className="text-white font-semibold">• {combination.size}</span>}
                                  </>
                                )}
                              </div>
                              {isUpdateMode && (
                                <div 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                      // Eğer bu mevcut bir varyantsa (number ID), modal aç
                                      if (typeof combination.id === 'number') {
                                        handleDeleteClick(combination);
                                      } else {
                                        // Yeni eklenen varyant (henüz DB'de yok), sadece state'ten sil
                                        const updated = variantCombinations.filter(c => c.id !== combination.id);
                                        setVariantCombinations(updated);
                                        toast.success('Varyant kaldırıldı');
                                      }
                                    }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 text-danger-500 transition-colors cursor-pointer relative"
                                  style={{ zIndex: 999 }}
                                    title="Varyantı Sil"
                                  >
                                  <FaTrash className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          }
                          classNames={{
                            base: "bg-gray-800/50 border border-gray-700/50 hover:border-gray-600",
                            title: "text-white",
                            trigger: "py-4",
                          }}
                        >
                          <div className="space-y-4 py-2 px-2">
                            {/* Fiyat, İndirimli Fiyat ve Stok */}
                            <div className="grid grid-cols-3 gap-4">
                              <Input
                                label="Fiyat (₺)"
                                type="number"
                                placeholder="100.00"
                                value={combination.price?.toString() || combination.price || ''}
                                onValueChange={(value) => {
                                  const updated = variantCombinations.map(c => 
                                    c.id === combination.id ? { ...c, price: value } : c
                                  );
                                  setVariantCombinations(updated);
                                }}
                                variant="bordered"
                                classNames={{
                                  label: "text-white",
                                  input: "text-white",
                                }}
                              />
                              <Input
                                label="İndirim (₺)"
                                type="number"
                                placeholder="80.00"
                                value={combination.discount_price?.toString() || combination.discount_price || ''}
                                onValueChange={(value) => {
                                  const updated = variantCombinations.map(c => 
                                    c.id === combination.id ? { ...c, discount_price: value } : c
                                  );
                                  setVariantCombinations(updated);
                                }}
                                variant="bordered"
                                classNames={{
                                  label: "text-white",
                                  input: "text-white",
                                }}
                              />
                              <Input
                                label="Stok"
                                type="number"
                                placeholder="50"
                                value={combination.stock_quantity?.toString() || combination.stock_quantity || ''}
                                onValueChange={(value) => {
                                  const updated = variantCombinations.map(c => 
                                    c.id === combination.id ? { ...c, stock_quantity: value } : c
                                  );
                                  setVariantCombinations(updated);
                                }}
                                variant="bordered"
                                classNames={{
                                  label: "text-white",
                                  input: "text-white",
                                }}
                              />
                            </div>

                            {/* Resimler */}
                            <div className="w-full bg-gray-900/30 border border-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-white">
                                  Resimler {combination.images?.length > 0 && `(${combination.images.length})`}
                                </p>
                                <label>
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(combination.id, e.target.files)}
                                  />
                                  <Button
                                    as="span"
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    startContent={<FaImage />}
                                  >
                                    Resim Ekle
                                  </Button>
                                </label>
                              </div>

                              {/* Resim Önizlemeleri */}
                              {combination.images && combination.images.length > 0 ? (
                                <div className="grid grid-cols-4 gap-3">
                                  {combination.images.map((image) => (
                                    <div 
                                      key={image.id}
                                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-700 hover:border-secondary transition-colors"
                                    >
                                      <img
                                        src={image.preview || `${API_BASE_URL}/${image.image_url}`}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                      />
                                      
                                      {/* Kapak Badge */}
                                      {(image.isCover || image.image_type === 'cover') && (
                                        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                                          <FaStar className="w-3 h-3" />
                                          Kapak
                                        </div>
                                      )}

                                      {/* Hover Aksiyonlar */}
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {!(image.isCover || image.image_type === 'cover') && (
                                          <Button
                                            isIconOnly
                                            size="sm"
                                            color="warning"
                                            variant="flat"
                                            onPress={() => handleSetCover(combination.id, image.id)}
                                          >
                                            <FaStar />
                                          </Button>
                                        )}
                                        <Button
                                          isIconOnly
                                          size="sm"
                                          color="danger"
                                          variant="flat"
                                          onPress={() => handleImageDelete(combination.id, image.id)}
                                        >
                                          <FaTrash />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                                  <FaImage className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                                  <p className="text-sm text-gray-500">Henüz resim eklenmedi</p>
                                  <p className="text-xs text-gray-600 mt-1">Birden fazla resim ekleyebilirsiniz</p>
                                </div>
                              )}
                            </div>

                            {/* Ürün Özellikleri */}
                            <Textarea
                              label="Ürün Özellikleri"
                              placeholder="Bu varyant için ürün özelliklerini giriniz..."
                              value={combination.product_features}
                              onValueChange={(value) => {
                                const updated = variantCombinations.map(c => 
                                  c.id === combination.id ? { ...c, product_features: value } : c
                                );
                                setVariantCombinations(updated);
                              }}
                              variant="bordered"
                              minRows={3}
                              classNames={{
                                label: "text-white",
                                input: "text-white",
                              }}
                            />
                          </div>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Tab>

      {/* SEO ve Ayarlar Tab */}
      <Tab key="seo" title="SEO ve Ayarlar">
        <div className="py-4 space-y-4">
          {/* Meta Başlık */}
          <Input
            label="Meta Başlık"
            placeholder="SEO için meta başlık"
            value={formData.meta_title}
            onValueChange={(value) => handleChange('meta_title', value)}
            variant="bordered"
            classNames={{
              label: "text-white",
              input: "text-white",
            }}
          />

          {/* Meta Açıklama */}
          <Textarea
            label="Meta Açıklama"
            placeholder="SEO için meta açıklama"
            value={formData.meta_description}
            onValueChange={(value) => handleChange('meta_description', value)}
            variant="bordered"
            minRows={5}
            classNames={{
              label: "text-white",
              input: "text-white",
            }}
          />

          {/* Bilgilendirme */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-400">
              💡 <strong>Not:</strong> Ürün URL'si otomatik olarak ürün adından oluşturulacaktır. 
              Varyantları ürün eklendikten sonra ekleyebilirsiniz.
            </p>
          </div>
        </div>
      </Tab>
    </Tabs>
  );
};

export default UrunGuncelleForm;
