import React from "react";
import { Button, Input, Checkbox, Link, Form, Divider, Alert } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, clearSuccess } from '../../store/slices/adminSlice';
import Image from "next/image";

export default function Login() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [savedCredentials, setSavedCredentials] = React.useState({ email: '', password: '' });
  const [formData, setFormData] = React.useState({ email: '', password: '' });
  const dispatch = useDispatch();
  
  const { isLoading, error, successMessage, isAuthenticated } = useSelector((state) => state.admin);

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Component mount olduğunda localStorage'dan bilgileri yükle
  React.useEffect(() => {
    console.log('🎣 Webhook Test - Component initialized!');
    console.log('Component mount - localStorage kontrol ediliyor...');
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    
    console.log('Saved email:', savedEmail);
    console.log('Saved password:', savedPassword);
    
    if (savedEmail && savedPassword) {
      setSavedCredentials({ email: savedEmail, password: savedPassword });
      setFormData({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
      console.log('Credentials loaded from localStorage');
    }
  }, []);

  // Error'ı temizle component mount olduğunda
  React.useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  // Success durumunda 2 saniye loading göster
  React.useEffect(() => {
    if (successMessage && isAuthenticated) {
      setShowSuccess(true);
      
      const timer = setTimeout(() => {
        setShowSuccess(false);
        // Burada yönlendirme yapılabilir
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, isAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const credentials = {
      username: formData.email,
      password: formData.password
    };

    console.log('Form submit - rememberMe:', rememberMe);
    console.log('Credentials:', credentials);

    // Beni hatırla işlemi - form submit sırasında kaydet
    if (rememberMe) {
      console.log('Saving to localStorage...');
      localStorage.setItem('remembered_email', formData.email);
      localStorage.setItem('remembered_password', formData.password);
      console.log('Saved to localStorage');
    }

    dispatch(loginUser(credentials));
  };

  const handleRememberChange = (isSelected) => {
    setRememberMe(isSelected);
    
    // Eğer remember me kapatılırsa localStorage'ı temizle
    if (!isSelected) {
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remembered_password');
      setSavedCredentials({ email: '', password: '' });
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center ">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-6">
          <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center mb-2 relative">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill
              priority
              className="object-contain"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kcp/9k="
            />
          </div>
          <p className="text-xl text-foreground font-bold tracking-[0.3em] uppercase font-sans">ORWYS TEST</p>
          <p className="text-small text-default-500">Devam etmek için hesabınıza giriş yapın</p>
        </div>

        {error && (
          <Alert
            color="danger"
            description={error}
            isVisible={!!error}
            variant="faded"
            onClose={() => dispatch(clearError())}
          />
        )}

        {successMessage && (
          <Alert
            color="success"
            description={successMessage}
            isVisible={!!successMessage}
            variant="faded"
            onClose={() => dispatch(clearSuccess())}
          />
        )}

        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="E-posta Adresi"
            name="email"
            placeholder="E-posta adresinizi girin"
            type="email"
            variant="bordered"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            classNames={{
              input: "text-foreground",
              inputWrapper: "border-default-300",
              label: "text-foreground"
            }}
          />

          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Şifre"
            name="password"
            placeholder="Şifrenizi girin"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            classNames={{
              input: "text-foreground",
              inputWrapper: "border-default-300",
              label: "text-foreground"
            }}
          />

          <div className="flex w-full items-center justify-between px-1 py-2">
            <Checkbox 
              name="remember" 
              size="sm" 
              classNames={{ label: "text-foreground" }} 
              isSelected={rememberMe}
              onValueChange={handleRememberChange}
            >
              Beni hatırla
            </Checkbox>
            <Link className="text-primary hover:text-primary-600 transition-colors" href="#" size="sm">
              Şifremi unuttum?
            </Link>
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors" 
            color="primary" 
            type="submit"
            isLoading={isLoading || showSuccess}
            disabled={isLoading || showSuccess}
          >
            {showSuccess ? 'Giriş başarılı!' : isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </Form>
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1 bg-gray-200" />
          <p className="shrink-0 text-tiny text-gray-600">VEYA</p>
          <Divider className="flex-1 bg-gray-200" />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            startContent={<Icon icon="flat-color-icons:google" width={24} />}
            variant="bordered"
            disabled
            className="border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors bg-white"
          >
            Google ile devam et
          </Button>
          <Button
            startContent={<Icon className="text-gray-400" icon="fe:github" width={24} />}
            variant="bordered"
            disabled
            className="border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors bg-white"
          >
            Github ile devam et
          </Button>
        </div>
        <p className="text-center text-small text-gray-600">
          Hesap oluşturmak mı istiyorsunuz?&nbsp;
          <Link href="#" size="sm" className="text-gray-900 hover:text-blue-600">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}