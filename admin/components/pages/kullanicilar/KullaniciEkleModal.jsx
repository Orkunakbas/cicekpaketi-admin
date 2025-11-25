import React, { useState } from 'react';
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
import { addUser } from '@/store/slices/userSlice';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const KullaniciEkleModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.name || !formData.surname) {
      toast.error('Ad ve soyad zorunludur');
      return;
    }

    if (!formData.email) {
      toast.error('Email zorunludur');
      return;
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Geçerli bir email adresi girin');
      return;
    }

    if (!formData.password) {
      toast.error('Şifre zorunludur');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      return;
    }

    try {
      // passwordConfirm'i çıkar, sadece gerekli alanları gönder
      const { passwordConfirm, ...userData } = formData;
      await dispatch(addUser(userData)).unwrap();
      toast.success('Kullanıcı başarıyla eklendi');
      
      // Form temizle
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirm: '',
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error || 'Kullanıcı eklenirken bir hata oluştu');
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
          <h3 className="text-xl font-semibold text-white">Yeni Kullanıcı Ekle</h3>
          <p className="text-sm text-gray-400 font-normal">Yeni bir kullanıcı oluşturun</p>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Ad */}
            <Input
              label="Ad"
              placeholder="Kullanıcının adını girin"
              value={formData.name}
              onValueChange={(value) => handleChange('name', value)}
              variant="bordered"
              isRequired
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
            />

            {/* Soyad */}
            <Input
              label="Soyad"
              placeholder="Kullanıcının soyadını girin"
              value={formData.surname}
              onValueChange={(value) => handleChange('surname', value)}
              variant="bordered"
              isRequired
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              placeholder="ornek@email.com"
              value={formData.email}
              onValueChange={(value) => handleChange('email', value)}
              variant="bordered"
              isRequired
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
            />

            {/* Telefon */}
            <Input
              label="Telefon"
              type="tel"
              placeholder="5551234567"
              value={formData.phone}
              onValueChange={(value) => handleChange('phone', value)}
              variant="bordered"
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
            />

            {/* Şifre */}
            <Input
              label="Şifre"
              type={showPassword ? "text" : "password"}
              placeholder="En az 6 karakter"
              value={formData.password}
              onValueChange={(value) => handleChange('password', value)}
              variant="bordered"
              isRequired
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <FaEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />

            {/* Şifre Tekrarı */}
            <Input
              label="Şifre Tekrarı"
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="Şifreyi tekrar girin"
              value={formData.passwordConfirm}
              onValueChange={(value) => handleChange('passwordConfirm', value)}
              variant="bordered"
              isRequired
              isInvalid={formData.passwordConfirm && formData.password !== formData.passwordConfirm}
              errorMessage={
                formData.passwordConfirm && formData.password !== formData.passwordConfirm
                  ? "Şifreler uyuşmuyor"
                  : ""
              }
              classNames={{
                label: "text-white",
                input: "text-white",
              }}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? (
                    <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <FaEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
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
            isDisabled={formData.passwordConfirm && formData.password !== formData.passwordConfirm}
          >
            Kullanıcı Ekle
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default KullaniciEkleModal;
