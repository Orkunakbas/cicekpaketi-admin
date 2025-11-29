import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Title from '@/components/design/title/Title';
import Table from '@/components/design/table/Table';
import SozlesmeEkleModal from './SozlesmeEkleModal';
import SozlesmeSingleModal from './SozlesmeSingleModal';
import ConfirmModal from '@/components/design/confirmModal/ConfirmModal';
import { useDisclosure, Button } from '@heroui/react';
import { fetchTerms, deleteTerm, updateTermRank } from '@/store/slices/termSlice';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { RiDragMove2Fill } from "react-icons/ri";
import toast from 'react-hot-toast';

const SozlesmelerPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { terms, isLoading } = useSelector((state) => state.terms);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termToDelete, setTermToDelete] = useState(null);
  const draggedItemRef = useRef(null);

  useEffect(() => {
    dispatch(fetchTerms());
  }, [dispatch]);

  const handleAdd = () => {
    onOpen();
  };

  const handleSuccess = () => {
    dispatch(fetchTerms());
  };

  const handleEdit = (term) => {
    setSelectedTerm(term);
    onEditOpen();
  };

  const handleDelete = (term) => {
    setTermToDelete(term);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteTerm(termToDelete.id)).unwrap();
      toast.success('Sözleşme başarıyla silindi');
      onDeleteClose();
      setTermToDelete(null);
    } catch (error) {
      toast.error(error || 'Sözleşme silinirken hata oluştu');
    }
  };

  const handleDeleteModalClose = () => {
    onDeleteClose();
    setTermToDelete(null);
  };

  // Drag & Drop handlers
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
      // Hedef item'ın rank'ını yeni rank olarak gönder
      await dispatch(updateTermRank([
        { id: draggedItem.id, rank: targetItem.rank }
      ])).unwrap();

      toast.success('Sıralama güncellendi');
      dispatch(fetchTerms());
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
      sortable: false,
      width: 80,
      render: (term) => (
        <div 
          className="flex items-center justify-center cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={() => handleDragStart(term)}
        >
          <RiDragMove2Fill className="text-gray-400 text-xl" />
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Başlık',
      sortable: true,
      render: (term) => (
        <div className="font-medium text-white">{term.title}</div>
      ),
    },
    {
      key: 'description',
      label: 'Açıklama',
      sortable: false,
      render: (term) => (
        <div className="text-sm text-gray-400 line-clamp-2">
          {term.description ? (
            <div dangerouslySetInnerHTML={{ __html: term.description.substring(0, 100) + '...' }} />
          ) : '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      sortable: false,
      width: 120,
      render: (term) => (
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            color="warning"
            onClick={() => handleEdit(term)}
          >
            <FaEdit />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            color="danger"
            onClick={() => handleDelete(term)}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title>Sözleşmeler</Title>
      
      <div className="mt-6">
        <Table
          columns={columns}
          data={terms}
          searchable={true}
          searchKeys={['title']}
          searchPlaceholder="Sözleşme ara..."
          onAdd={handleAdd}
          addButtonText="Yeni Sözleşme"
          pagination={true}
          rowsPerPage={10}
          isLoading={isLoading}
          emptyText="Henüz sözleşme eklenmemiş"
          draggable={true}
          onRowDragOver={handleDragOver}
          onRowDrop={handleDrop}
        />
      </div>

      {/* Add Modal */}
      <SozlesmeEkleModal 
        isOpen={isOpen} 
        onClose={onClose}
        onSuccess={handleSuccess}
      />

      {/* Edit Modal */}
      {selectedTerm && (
        <SozlesmeSingleModal 
          isOpen={isEditOpen} 
          onClose={() => {
            onEditClose();
            setSelectedTerm(null);
          }}
          term={selectedTerm}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={handleDeleteModalClose}
        onConfirm={confirmDelete}
        title="Sözleşmeyi Sil"
        message={`"${termToDelete?.title}" sözleşmesini silmek istediğinize emin misiniz?`}
        confirmText="Sil"
        cancelText="İptal"
      />
    </div>
  );
};

export default SozlesmelerPage;
