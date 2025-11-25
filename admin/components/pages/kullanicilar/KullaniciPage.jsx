import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Title from '@/components/design/title/Title';
import Table from '@/components/design/table/Table';
import { fetchUsers, deleteUser } from '@/store/slices/userSlice';
import { Button, useDisclosure } from '@heroui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/design/confirmModal/ConfirmModal';
import KullaniciEkleModal from './KullaniciEkleModal';
import KullaniciSingleModal from './KullaniciSingleModal';

const KullaniciPage = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.users);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleAdd = () => {
    onOpen();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    onEditOpen();
  };

  const handleSuccess = () => {
    dispatch(fetchUsers());
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteUser(selectedUserId)).unwrap();
      toast.success('Kullanıcı başarıyla silindi!');
      setDeleteModalOpen(false);
      setSelectedUserId(null);
    } catch (error) {
      toast.error(error || 'Kullanıcı silinirken bir hata oluştu!');
    }
  };

  const openDeleteModal = (userId) => {
    setSelectedUserId(userId);
    setDeleteModalOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Ad Soyad',
      render: (item) => (
        <span className="text-sm font-medium">
          {item.name} {item.surname}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (item) => <span className="text-sm">{item.email}</span>,
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (item) => (
        <span className="text-sm">{item.phone || '-'}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Kayıt Tarihi',
      render: (item) => (
        <span className="text-sm">
          {new Date(item.created_at).toLocaleDateString('tr-TR')}
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
            onPress={() => openDeleteModal(item.id)}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title>Kullanıcılar</Title>

      <Table
        columns={columns}
        data={users}
        searchable={true}
        searchKeys={['name', 'surname', 'email', 'phone']}
        searchPlaceholder="Kullanıcı ara..."
        isLoading={isLoading}
        emptyText="Henüz kullanıcı bulunmamaktadır."
        onAdd={handleAdd}
        addButtonText="Yeni Kullanıcı Ekle"
        pagination={true}
        rowsPerPage={50}
      />

      {/* Kullanıcı Ekle Modal */}
      <KullaniciEkleModal 
        isOpen={isOpen} 
        onClose={onClose}
        onSuccess={handleSuccess}
      />

      {/* Kullanıcı Düzenle Modal */}
      <KullaniciSingleModal 
        isOpen={isEditOpen} 
        onClose={onEditClose}
        user={selectedUser}
        onSuccess={handleSuccess}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUserId(null);
        }}
        title="Kullanıcıyı Sil"
        message="Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default KullaniciPage;
