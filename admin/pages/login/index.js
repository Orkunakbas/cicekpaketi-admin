"use client";

import React from "react";
import { Button, Input, Checkbox, Link, Form, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import Image from "next/image";

export default function Login() {
  const [isVisible, setIsVisible] = React.useState(false);
  const dispatch = useDispatch();
  
  const { isLoading, error } = useSelector((state) => state.auth);

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Error'ı temizle component mount olduğunda
  React.useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const credentials = {
      username: formData.get('username'),
      password: formData.get('password')
    };

    dispatch(loginUser(credentials));
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#080a17]">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-6">
          <div className=" rounded-full flex items-center justify-center mb-2">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={100}
              height={300}
              className=" object-contain"
            />
          </div>
          <p className="text-xl text-gray-400 font-bold tracking-[0.3em] uppercase font-sans">ORWYS</p>
          <p className="text-small text-gray-400">Devam etmek için hesabınıza giriş yapın</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="E-posta Adresi"
            name="username"
            placeholder="E-posta adresinizi girin"
            type="email"
            variant="bordered"
            classNames={{
              input: "text-white",
              inputWrapper: "border-gray-800 hover:border-gray-600 ",
              label: "text-gray-300"
            }}
          />

          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-gray-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-gray-400"
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
            classNames={{
              input: "text-white",
              inputWrapper: "border-gray-800 hover:border-gray-600 focus-within:border-blue-500",
              label: "text-gray-300"
            }}
          />

          <div className="flex w-full items-center justify-between px-1 py-2">
            <Checkbox name="remember" size="sm" classNames={{ label: "text-gray-400" }}>
              Beni hatırla
            </Checkbox>
            <Link className="text-gray-500 hover:text-gray-300 transition-colors" href="#" size="sm">
              Şifremi unuttum?
            </Link>
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors" 
            color="primary" 
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </Form>
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1 bg-gray-800" />
          <p className="shrink-0 text-tiny text-gray-600">VEYA</p>
          <Divider className="flex-1 bg-gray-800" />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            startContent={<Icon icon="flat-color-icons:google" width={24} />}
            variant="bordered"
            disabled
            className="border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors bg-gray-900/30"
          >
            Google ile devam et
          </Button>
          <Button
            startContent={<Icon className="text-gray-400" icon="fe:github" width={24} />}
            variant="bordered"
            disabled
            className="border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors bg-gray-900/30"
          >
            Github ile devam et
          </Button>
        </div>
        <p className="text-center text-small text-gray-400">
          Hesap oluşturmak mı istiyorsunuz?&nbsp;
          <Link href="#" size="sm" className="text-gray-300 hover:text-white">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}