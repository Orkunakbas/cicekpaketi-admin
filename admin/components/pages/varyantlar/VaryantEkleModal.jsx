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
} from '@heroui/react';
import { addOptionType, updateOptionType } from '@/store/slices/variantSlice';
import toast from 'react-hot-toast';

const VaryantEkleModal = ({ isOpen, onClose, onSuccess, editingType }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading } = useSelector((state) => state.variant);

  const [formData, setFormData] = useState({
    name: '',
  });

  // Düzenleme modu için verileri doldur
  useEffect(() => {
    if (editingType) {
      setFormData({
        name: editingType.name || '',
      });
    } else {
      setFormData({
        name: '',
      });
    }
  }, [editingType, isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.name) {
      toast.error('Varyant tipi adı zorunludur');
      return;
    }

    try {
      const data = {
        ...formData,
        language_code: router.locale || 'tr'
      };

      if (editingType) {
        // Güncelleme modu
        await dispatch(updateOptionType({ id: editingType.id, data })).unwrap();
        toast.success('Varyant tipi başarıyla güncellendi');
      } else {
        // Ekleme modu
        await dispatch(addOptionType(data)).unwrap();
        toast.success('Varyant tipi başarıyla eklendi');
      }
      
      // Form temizle
      setFormData({
        name: '',
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error || `Varyant tipi ${editingType ? 'güncellenirken' : 'eklenirken'} bir hata oluştu`);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
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
            {editingType ? 'Varyant Tipini Düzenle' : 'Yeni Varyant Tipi Ekle'}
          </h3>
          <p className="text-sm text-gray-400 font-normal">
            Örn: Renk, Beden, Malzeme
          </p>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Varyant Tipi Adı */}
            <Input
              label="Varyant Tipi Adı"
              placeholder="Örn: Renk, Beden, Malzeme"
              value={formData.name}
              onValueChange={(value) => handleChange('name', value)}
              variant="bordered"
              isRequired
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
            />

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
            {editingType ? 'Güncelle' : 'Ekle'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VaryantEkleModal;
