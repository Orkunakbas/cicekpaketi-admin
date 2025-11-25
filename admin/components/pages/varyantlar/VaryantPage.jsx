import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Title from '@/components/design/title/Title';
import Table from '@/components/design/table/Table';
import VaryantEkleModal from './VaryantEkleModal';
import VaryantDegerModal from './VaryantDegerModal';
import ConfirmModal from '@/components/design/confirmModal/ConfirmModal';
import { Button, Chip, useDisclosure } from '@heroui/react';
import { fetchOptionTypes, deleteOptionType } from '@/store/slices/variantSlice';
import { FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VaryantPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { optionTypes, isLoading } = useSelector((state) => state.variant);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isValuesOpen, onOpen: onValuesOpen, onClose: onValuesClose } = useDisclosure();
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [editingType, setEditingType] = useState(null);

  useEffect(() => {
    // router.locale ile dil bazlı listeleme
    dispatch(fetchOptionTypes(router.locale));
  }, [dispatch, router.locale]);

  const handleAdd = () => {
    setEditingType(null);
    onOpen();
  };

  const handleEdit = (type) => {
    setEditingType(type);
    onOpen();
  };

  const handleSuccess = () => {
    dispatch(fetchOptionTypes(router.locale));
    setEditingType(null);
  };

  const handleModalClose = () => {
    setEditingType(null);
    onClose();
  };

  const handleManageValues = (type) => {
    setSelectedType(type);
    onValuesOpen();
  };

  const handleDelete = (type) => {
    setTypeToDelete(type);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;

    // Değer kontrolü - Eğer içinde değer varsa silinmesin
    if (typeToDelete.valueCount > 0) {
      toast.error(
        `Bu varyant tipinin ${typeToDelete.valueCount} adet değeri var. Önce tüm değerleri silmelisiniz!`,
        { 
          duration: 5000,
          icon: '⚠️',
        }
      );
      onDeleteClose();
      return;
    }

    try {
      await dispatch(deleteOptionType(typeToDelete.id)).unwrap();
      toast.success('Varyant tipi başarıyla silindi');
      setTypeToDelete(null);
      dispatch(fetchOptionTypes(router.locale));
      onDeleteClose();
    } catch (error) {
      toast.error(error || 'Varyant tipi silinirken bir hata oluştu');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Varyant Tipi',
      render: (item) => (
        <span className="text-sm font-medium">{item.name}</span>
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
      key: 'values',
      label: 'Değerler',
      render: (item) => (
        <div 
          onClick={() => handleManageValues(item)}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Chip
            size="md"
            variant="flat"
            color="secondary"
            className="cursor-pointer"
          >
            {item.valueCount || 0} Değer
          </Chip>
        </div>
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
      <Title>Varyant Tipleri</Title>
      
      <div className="mt-6">
        <Table
          columns={columns}
          data={optionTypes}
          searchable={true}
          searchKeys={['name']}
          searchPlaceholder="Varyant tipi ara..."
          onAdd={handleAdd}
          addButtonText="Yeni Varyant Tipi"
          pagination={true}
          rowsPerPage={10}
          isLoading={isLoading}
          emptyText="Henüz varyant tipi eklenmemiş"
        />
      </div>

      {/* Varyant Ekle/Düzenle Modal */}
      <VaryantEkleModal 
        isOpen={isOpen} 
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        editingType={editingType}
      />

      {/* Varyant Değerleri Modal */}
      <VaryantDegerModal 
        isOpen={isValuesOpen} 
        onClose={onValuesClose}
        optionType={selectedType}
        onSuccess={handleSuccess}
      />

      {/* Silme Onay Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title="Varyant Tipi Sil"
        message={`"${typeToDelete?.name}" varyant tipini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default VaryantPage;
