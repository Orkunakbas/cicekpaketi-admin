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
import { updateUser } from '@/store/slices/userSlice';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const KullaniciSingleModal = ({ isOpen, onClose, user, onSuccess }) => {
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

  // User değiştiğinde formu doldur
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        passwordConfirm: '',
      });
    }
  }, [user, isOpen]);

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

    // Şifre girilmişse validasyon yap
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error('Şifre en az 6 karakter olmalıdır');
        return;
      }

      if (formData.password !== formData.passwordConfirm) {
        return;
      }
    }

    if (!user) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      // Eğer şifre girilmediyse, passwordConfirm ve password'u çıkar
      const { passwordConfirm, password, ...baseData } = formData;
      const userData = password ? { ...baseData, password } : baseData;

      await dispatch(updateUser({ 
        id: user.id, 
        userData 
      })).unwrap();
      
      toast.success('Kullanıcı başarıyla güncellendi');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error || 'Kullanıcı güncellenirken bir hata oluştu');
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
          <h3 className="text-xl font-semibold text-white">Kullanıcı Düzenle</h3>
          <p className="text-sm text-gray-400 font-normal">Kullanıcı bilgilerini düzenleyin</p>
          {user && user.email && (
            <p className="text-xs text-gray-400">
              <strong className="text-blue-400">Email:</strong> {user.email}
            </p>
          )}
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

            {/* Şifre Değiştirme Alanı */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-4">
                Şifreyi değiştirmek istemiyorsanız bu alanları boş bırakın
              </p>

              {/* Yeni Şifre */}
              <div className="space-y-4">
                <Input
                  label="Yeni Şifre"
                  type={showPassword ? "text" : "password"}
                  placeholder="En az 6 karakter (opsiyonel)"
                  value={formData.password}
                  onValueChange={(value) => handleChange('password', value)}
                  variant="bordered"
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

                {/* Yeni Şifre Tekrarı */}
                {formData.password && (
                  <Input
                    label="Yeni Şifre Tekrarı"
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
                )}
              </div>
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
            isDisabled={formData.password && formData.passwordConfirm && formData.password !== formData.passwordConfirm}
          >
            Güncelle
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default KullaniciSingleModal;
