"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export default function ConfirmModal({
  isOpen = false,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  isLoading = false,
}) {
  // "Kapat" butonu veya modal dışında tıklama
  const handleClose = () => {
    if (onClose && !isLoading) {
      onClose();
    }
  };

  // "Evet, Sil" butonu
  const handleConfirm = async () => {
    if (onConfirm) {
      // onConfirm fonksiyonunu çağır ve tamamlanmasını bekle
      // Modal'ı kapatma işlemini parent component'e bırak
      await onConfirm();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={handleClose}
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
      classNames={{
        base: "bg-dark",
        wrapper: "z-[99999]",
        backdrop: "z-[99998]",
        header: "",
        body: "",
        footer: "",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-300">{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={handleClose}
                className="text-gray-400"
                isDisabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button 
                color="danger" 
                onPress={handleConfirm}
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {confirmText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
