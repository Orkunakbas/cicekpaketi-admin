'use client'

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
} from '@heroui/react';
import { updateTerm } from '@/store/slices/termSlice';
import toast from 'react-hot-toast';
import Editor from '@/components/design/editor/Editor';

const SozlesmeSingleModal = ({ isOpen, onClose, term, onSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.terms);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen && term) {
      setFormData({
        title: term.title || '',
        description: term.description || '',
      });
    }
  }, [isOpen, term]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      await dispatch(updateTerm({
        id: term.id,
        termData: formData
      })).unwrap();
      toast.success('Sözleşme başarıyla güncellendi');
      onClose();
      onSuccess();
    } catch (error) {
      toast.error(error || 'Sözleşme güncellenirken hata oluştu');
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
        backdrop: "bg-black/50",
        header: "border-b border-gray-800",
        body: "py-6",
        footer: "border-t border-gray-800",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-white">Sözleşmeyi Düzenle</h2>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Başlık"
              placeholder="Örn: Gizlilik Politikası"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              variant="bordered"
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
              isRequired
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Açıklama <span className="text-danger">*</span>
              </label>
              
              <Editor 
                content={formData.description}
                onChange={(html) => handleChange('description', html)}
                placeholder="Sözleşme içeriğini yazın..."
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="light" 
            onPress={onClose}
            isDisabled={isLoading}
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

export default SozlesmeSingleModal;
