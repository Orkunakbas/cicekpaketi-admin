import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Title from '@/components/design/title/Title';
import Table from '@/components/design/table/Table';
import BannerEkleModal from './BannerEkleModal';
import BannerSingleModal from './BannerSingleModal';
import ConfirmModal from '@/components/design/confirmModal/ConfirmModal';
import { Button, useDisclosure } from '@heroui/react';
import { fetchBanners, deleteBanner, updateBannerRank } from '@/store/slices/bannerSlice';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { RiDragMove2Fill } from "react-icons/ri";
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const BannerPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { banners, isLoading } = useSelector((state) => state.banners);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const draggedItemRef = useRef(null);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const handleAdd = () => {
    onOpen();
  };

  const handleSuccess = () => {
    dispatch(fetchBanners());
  };

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    onEditOpen();
  };

  const handleDelete = (banner) => {
    setBannerToDelete(banner);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    try {
      await dispatch(deleteBanner(bannerToDelete.id)).unwrap();
      toast.success('Banner başarıyla silindi');
      onDeleteClose();
      setBannerToDelete(null);
    } catch (error) {
      toast.error(error || 'Banner silinirken bir hata oluştu');
    }
  };

  const handleDeleteModalClose = () => {
    onDeleteClose();
    setBannerToDelete(null);
  };

  const handleDragStart = (item) => {
    draggedItemRef.current = item;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (targetItem) => {
    const draggedItem = draggedItemRef.current;
    
    if (!draggedItem || draggedItem.id === targetItem.id) {
      draggedItemRef.current = null;
      return;
    }

    try {
      await dispatch(updateBannerRank({
        id: draggedItem.id,
        newRank: targetItem.rank
      })).unwrap();

      toast.success('Sıralama güncellendi');
      dispatch(fetchBanners());
    } catch (error) {
      toast.error(error || 'Sıralama güncellenirken bir hata oluştu');
    } finally {
      draggedItemRef.current = null;
    }
  };

  const columns = [
    {
      key: 'rank',
      label: 'Sıra',
      render: (item) => (
        <div 
          className="flex items-center justify-center cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={() => handleDragStart(item)}
        >
          <RiDragMove2Fill className="text-gray-400 text-xl" />
        </div>
      ),
    },
    {
      key: 'banner_image',
      label: 'Banner Resmi',
      render: (item) => (
        item.banner_image ? (
          <img 
            src={`${API_BASE_URL}/${item.banner_image}`} 
            alt={item.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-gray-600 text-xs">Resim Yok</span>
          </div>
        )
      ),
    },
    {
      key: 'title',
      label: 'Başlık',
      render: (item) => (
        <div>
          <div className="font-semibold text-white">{item.title}</div>
          {item.description && (
            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'button_text',
      label: 'Buton',
      render: (item) => (
        item.button_text ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-300">{item.button_text}</span>
            {item.button_link && (
              <span className="text-xs text-gray-500">{item.button_link}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-600">-</span>
        )
      ),
    },
    {
      key: 'colors',
      label: 'Renkler',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.background_color && (
            <div className="flex items-center gap-1">
              <div 
                className="w-6 h-6 rounded border border-gray-700"
                style={{ backgroundColor: item.background_color }}
              />
              <span className="text-xs text-gray-400">BG</span>
            </div>
          )}
          {item.button_color && (
            <div className="flex items-center gap-1">
              <div 
                className="w-6 h-6 rounded border border-gray-700"
                style={{ backgroundColor: item.button_color }}
              />
              <span className="text-xs text-gray-400">BTN</span>
            </div>
          )}
          {!item.background_color && !item.button_color && (
            <span className="text-gray-600">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'language_code',
      label: 'Dil',
      render: (item) => (
        <span className="text-gray-300">
          {item.language_code ? item.language_code.toUpperCase() : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            isIconOnly
            onPress={() => handleEdit(item)}
          >
            <FaEdit />
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            isIconOnly
            onPress={() => handleDelete(item)}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title>Banner'lar</Title>
      
      <div className="mt-6">
        <Table
          columns={columns}
          data={banners}
          searchable={true}
          searchKeys={['title', 'description', 'button_text']}
          searchPlaceholder="Banner ara..."
          onAdd={handleAdd}
          addButtonText="Yeni Banner"
          pagination={true}
          rowsPerPage={10}
          isLoading={isLoading}
          emptyText="Henüz banner eklenmemiş"
          draggable={true}
          onRowDragOver={handleDragOver}
          onRowDrop={handleDrop}
        />
      </div>

      {/* Banner Ekle Modal */}
      <BannerEkleModal 
        isOpen={isOpen} 
        onClose={onClose}
        onSuccess={handleSuccess}
      />

      {/* Banner Düzenle Modal */}
      <BannerSingleModal 
        isOpen={isEditOpen} 
        onClose={onEditClose}
        banner={selectedBanner}
        onSuccess={handleSuccess}
      />

      {/* Silme Onay Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={handleDeleteModalClose}
        title="Banner Sil"
        message={`"${bannerToDelete?.title}" banner'ını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default BannerPage;
