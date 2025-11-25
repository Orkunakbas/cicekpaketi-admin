import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Title from '@/components/design/title/Title';
import Table from '@/components/design/table/Table';
import KategoriEkleModal from './KategoriEkleModal';
import KategoriSingleModal from './KategoriSingleModal';
import ConfirmModal from '@/components/design/confirmModal/ConfirmModal';
import { Button, Chip, useDisclosure } from '@heroui/react';
import { fetchCategories, deleteCategory, updateCategoryRank } from '@/store/slices/categoriesSlice';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { RiDragMove2Fill } from "react-icons/ri";
import toast from 'react-hot-toast';

const KategoriPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { categories, isLoading } = useSelector((state) => state.categories);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const draggedItemRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Kategorileri hiyerarşik sıraya koy
  const hierarchicalCategories = React.useMemo(() => {
    const result = [];
    const categoryMap = {};
    
    // Tüm kategorileri map'e ekle
    categories.forEach(cat => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });
    
    // Ana kategorileri bul ve alt kategorileri yerleştir
    categories.forEach(cat => {
      if (cat.parent_id === null) {
        result.push(categoryMap[cat.id]);
      } else if (categoryMap[cat.parent_id]) {
        categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
      }
    });
    
    // Hiyerarşik düz listeye çevir (flatten)
    const flattenCategories = (cats, level = 0) => {
      const flat = [];
      cats.forEach(cat => {
        flat.push({ ...cat, level });
        if (cat.children && cat.children.length > 0) {
          flat.push(...flattenCategories(cat.children, level + 1));
        }
      });
      return flat;
    };
    
    return flattenCategories(result);
  }, [categories]);

  const handleAdd = () => {
    onOpen();
  };

  const handleSuccess = () => {
    dispatch(fetchCategories());
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    onEditOpen();
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await dispatch(deleteCategory(categoryToDelete.id)).unwrap();
      toast.success('Kategori başarıyla silindi');
      setCategoryToDelete(null);
    } catch (error) {
      toast.error(error || 'Kategori silinirken bir hata oluştu');
    }
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
      // Hedef item'ın rank'ını yeni rank olarak gönder
      await dispatch(updateCategoryRank({
        id: draggedItem.id,
        newRank: targetItem.rank
      })).unwrap();

      toast.success('Sıralama güncellendi');
      dispatch(fetchCategories());
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
      key: 'name',
      label: 'Kategori Adı',
      render: (item) => (
        <div className="flex items-center gap-2" style={{ paddingLeft: `${item.level * 24}px` }}>
          {item.level > 0 && (
            <span className="text-gray-500">└─</span>
          )}
          <span>{item.name}</span>
        </div>
      ),
    },
    {
      key: 'category_type',
      label: 'Tip',
      render: (item) => (
        item.category_type ? (
          <Chip 
            size="sm" 
            variant="flat" 
            color={item.category_type === 'Menu' ? 'success' : 'warning'}
          >
            {item.category_type}
          </Chip>
        ) : null
      ),
    },
    {
      key: 'parent_id',
      label: 'Seviye',
      render: (item) => (
        <Chip 
          size="sm" 
          variant="flat" 
          color={item.parent_id ? 'default' : 'primary'}
        >
          {item.parent_id ? 'Alt Kategori' : 'Ana Kategori'}
        </Chip>
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
      render: (item, index) => (
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
      <Title>Kategoriler</Title>
      
      <div className="mt-6">
        <Table
          columns={columns}
          data={hierarchicalCategories}
          searchable={true}
          searchKeys={['name', 'description', 'category_url']}
          searchPlaceholder="Kategori ara..."
          onAdd={handleAdd}
          addButtonText="Yeni Kategori"
          pagination={true}
          rowsPerPage={10}
          isLoading={isLoading}
          emptyText="Henüz kategori eklenmemiş"
          draggable={true}
          onRowDragOver={handleDragOver}
          onRowDrop={handleDrop}
        />
      </div>

      {/* Kategori Ekle Modal */}
      <KategoriEkleModal 
        isOpen={isOpen} 
        onClose={onClose}
        onSuccess={handleSuccess}
      />

      {/* Kategori Düzenle Modal */}
      <KategoriSingleModal 
        isOpen={isEditOpen} 
        onClose={onEditClose}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />

      {/* Silme Onay Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title="Kategori Sil"
        message={`"${categoryToDelete?.name}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default KategoriPage;
