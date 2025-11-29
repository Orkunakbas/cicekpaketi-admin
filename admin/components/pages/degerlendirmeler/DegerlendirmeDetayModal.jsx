import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@heroui/react';
import { FaStar, FaCheckCircle, FaSearchPlus } from 'react-icons/fa';
import Image from 'next/image';

const DegerlendirmeDetayModal = ({ isOpen, onClose, review, onApprove, onReject }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (!review) return null;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`${
          index < rating ? 'text-yellow-400' : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-dark",
          header: "",
          body: "py-6",
          footer: ""
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold text-white">Değerlendirme Detayı</h3>
            <p className="text-sm text-gray-400 font-normal">Müşteri değerlendirmesini görüntüleyin</p>
          </ModalHeader>

          <ModalBody>
            {/* Durum */}
            <div className="flex items-center gap-3 mb-6">
              <Chip
                size="sm"
                color={review.is_approved ? 'success' : 'warning'}
                variant="flat"
                startContent={review.is_approved ? <FaCheckCircle className="text-xs" /> : null}
              >
                {review.is_approved ? 'Onaylanmış' : 'Onay Bekliyor'}
              </Chip>
              
              {review.is_verified_purchase && (
                <Chip size="sm" color="success" variant="flat">
                  Onaylı Alıcı
                </Chip>
              )}
            </div>

            {/* Ürün ve Müşteri - Yan Yana */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">Ürün</p>
                <p className="text-white font-semibold">{review.product_name}</p>
                {review.order_number && (
                  <p className="text-sm text-gray-400 mt-1">
                    Sipariş: {review.order_number}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Müşteri</p>
                <p className="text-white font-semibold">{review.user_name}</p>
                {review.user_email && (
                  <p className="text-sm text-gray-400 mt-1">{review.user_email}</p>
                )}
              </div>
            </div>

            {/* Puan ve Tarih - Yan Yana */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">Puan</p>
                <div className="flex gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Tarih</p>
                <p className="text-gray-300 text-sm">
                  {new Date(review.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Başlık */}
            {review.title && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Başlık</p>
                <p className="text-white font-semibold">{review.title}</p>
              </div>
            )}

            {/* Yorum */}
            {review.comment && (
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Yorum</p>
                <p className="text-gray-300 leading-relaxed">{review.comment}</p>
              </div>
            )}

            {/* Resim */}
            {review.review_image && (
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Fotoğraf</p>
                <div 
                  className="relative w-[200px] h-[200px] rounded-xl overflow-hidden border border-gray-700 cursor-pointer group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/${review.review_image}`}
                    alt="Review"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FaSearchPlus className="text-white text-2xl" />
                  </div>
                </div>
              </div>
            )}

            {/* Faydalı Sayısı */}
            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">Bu değerlendirmeyi</p>
                <p className="text-lg font-bold text-white">{review.helpful_count || 0}</p>
                <p className="text-sm text-gray-400">kişi faydalı buldu</p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            {!review.is_approved ? (
              <>
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-gray-400"
                >
                  İptal
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => {
                    onReject(review.id);
                    onClose();
                  }}
                >
                  Reddet
                </Button>
                <Button
                  color="secondary"
                  onPress={() => {
                    onApprove(review.id);
                    onClose();
                  }}
                >
                  Onayla
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-gray-400"
                >
                  Kapat
                </Button>
                <Button
                  color="warning"
                  variant="flat"
                  onPress={() => {
                    onReject(review.id);
                    onClose();
                  }}
                >
                  Onayı Kaldır
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Resim Büyütme Modal */}
      {review?.review_image && (
        <Modal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          size="5xl"
          hideCloseButton={false}
          classNames={{
            base: "bg-dark"
          }}
        >
          <ModalContent>
            <ModalBody className="p-4">
              <div className="relative w-full h-[80vh]">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/${review.review_image}`}
                  alt="Review Full"
                  fill
                  className="object-contain"
                />
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default DegerlendirmeDetayModal;

