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
  Chip,
} from '@heroui/react';
import { fetchOptionValues, addOptionValue, deleteOptionValue } from '@/store/slices/variantSlice';
import { FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VaryantDegerModal = ({ isOpen, onClose, optionType, onSuccess }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { optionValues, isLoading } = useSelector((state) => state.variant);

  const [newValue, setNewValue] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isOpen && optionType) {
      // Değerleri getir (dil + option_type_id filtreleme)
      dispatch(fetchOptionValues({ 
        language_code: router.locale,
        option_type_id: optionType.id 
      }));
    }
  }, [isOpen, optionType, dispatch, router.locale]);

  const handleAddValue = async () => {
    if (!newValue) {
      toast.error('Değer adı zorunludur');
      return;
    }

    try {
      const data = {
        option_type_id: optionType.id,
        value: newValue,
        language_code: router.locale || 'tr',
        color_code: isColorType() ? newColorCode : null,
      };

      await dispatch(addOptionValue(data)).unwrap();
      toast.success('Değer başarıyla eklendi');
      
      // Form temizle
      setNewValue('');
      setNewColorCode('#000000');
      setShowAddForm(false);
      
      // Listeyi güncelle
      dispatch(fetchOptionValues({ 
        language_code: router.locale,
        option_type_id: optionType.id 
      }));

      // Parent component'i güncelle (valueCount için)
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error || 'Değer eklenirken bir hata oluştu');
    }
  };

  const handleDeleteValue = async (id) => {
    try {
      await dispatch(deleteOptionValue(id)).unwrap();
      toast.success('Değer başarıyla silindi');
      
      // Listeyi güncelle
      dispatch(fetchOptionValues({ 
        language_code: router.locale,
        option_type_id: optionType.id 
      }));

      // Parent component'i güncelle (valueCount için)
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error || 'Değer silinirken bir hata oluştu');
    }
  };

  // Renk tipi mi kontrol et
  const isColorType = () => {
    return optionType?.name?.toLowerCase().includes('renk') || 
           optionType?.name?.toLowerCase().includes('color');
  };

  if (!optionType) return null;

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
          <h3 className="text-xl font-semibold text-white">
            {optionType.name} - Değerleri Yönet
          </h3>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Yeni Değer Ekle Butonu */}
            {!showAddForm && (
              <Button
                color="primary"
                variant="flat"
                startContent={<FaPlus />}
                onPress={() => setShowAddForm(true)}
                fullWidth
              >
                Yeni Değer Ekle
              </Button>
            )}

            {/* Yeni Değer Ekleme Formu */}
            {showAddForm && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
                <Input
                  label="Değer Adı"
                  placeholder={`Örn: ${isColorType() ? 'Siyah, Beyaz' : 'S, M, L'}`}
                  value={newValue}
                  onValueChange={setNewValue}
                  variant="bordered"
                  isRequired
                  classNames={{
                    label: "text-white",
                    input: "text-white",
                  }}
                />

                {isColorType() && (
                  <div className="space-y-2">
                    <label className="text-sm text-white">Renk Kodu</label>
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        <input
                          type="color"
                          value={newColorCode}
                          onChange={(e) => setNewColorCode(e.target.value)}
                          className="w-20 h-10 rounded-lg cursor-pointer border-2 border-gray-600 bg-transparent"
                          style={{ padding: '2px' }}
                        />
                      </div>
                      <Input
                        value={newColorCode}
                        onValueChange={setNewColorCode}
                        variant="bordered"
                        placeholder="#000000"
                        className="flex-1"
                        classNames={{
                          input: "text-white uppercase",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    color="secondary"
                    onPress={handleAddValue}
                    isLoading={isLoading}
                    size="sm"
                  >
                    Ekle
                  </Button>
                  <Button
                    variant="light"
                    onPress={() => {
                      setShowAddForm(false);
                      setNewValue('');
                      setNewColorCode('#000000');
                    }}
                    size="sm"
                  >
                    İptal
                  </Button>
                </div>
              </div>
            )}

            {/* Değerler Listesi */}
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-center text-gray-400 py-8">Yükleniyor...</p>
              ) : optionValues.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  Henüz değer eklenmemiş
                </p>
              ) : (
                optionValues.map((value) => (
                  <div 
                    key={value.id}
                    className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {value.color_code && (
                        <div 
                          className="w-8 h-8 rounded border-2 border-gray-600"
                          style={{ backgroundColor: value.color_code }}
                        />
                      )}
                      <div>
                        <p className="text-white font-medium">{value.value}</p>
                        {value.color_code && (
                          <p className="text-xs text-gray-400">{value.color_code}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      isIconOnly
                      onPress={() => handleDeleteValue(value.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                ))
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
            Kapat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VaryantDegerModal;

