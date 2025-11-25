import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { Button, Chip, useDisclosure, Switch } from '@heroui/react';
import Title from '@/components/design/title/Title';
import Table from '@/components/design/table/Table';
import UrunEkleModal from './UrunEkleModal';
import UrunGuncelleModal from './UrunGuncelleModal';
import { fetchProducts, toggleProductActive, toggleProductFeatured, deleteProduct } from '@/store/slices/productSlice';
import { FaEdit, FaCubes, FaStar, FaRegStar, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/design/confirmModal/ConfirmModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const UrunPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { products, isLoading } = useSelector((state) => state.products);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [editingProductId, setEditingProductId] = React.useState(null);
  const [deletingProductId, setDeletingProductId] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  useEffect(() => {
    dispatch(fetchProducts(router.locale));
  }, [dispatch, router.locale]);

  const handleAdd = () => {
    onOpen();
  };

  const handleSuccess = () => {
    dispatch(fetchProducts(router.locale));
  };

  const handleEdit = (product) => {
    setEditingProductId(product.id);
    onEditOpen();
  };

  const handleEditModalClose = () => {
    setEditingProductId(null);
    onEditClose();
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const result = await dispatch(toggleProductActive(productId)).unwrap();
      toast.success(`Ürün ${result.is_active === 1 ? 'aktif' : 'pasif'} edildi`);
    } catch (error) {
      toast.error('Aktiflik durumu değiştirilemedi');
      console.error('Toggle active error:', error);
    }
  };

  const handleToggleFeatured = async (productId, currentStatus) => {
    try {
      const result = await dispatch(toggleProductFeatured(productId)).unwrap();
      toast.success(`Ürün ${result.is_featured === 1 ? 'öne çıkarıldı' : 'normalleştirildi'}`);
    } catch (error) {
      toast.error('Öne çıkarma durumu değiştirilemedi');
      console.error('Toggle featured error:', error);
    }
  };

  const handleDeleteClick = (product) => {
    setDeletingProductId(product.id);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(deletingProductId)).unwrap();
      toast.success('Ürün başarıyla silindi');
      onDeleteClose();
      setDeletingProductId(null);
    } catch (error) {
      toast.error('Ürün silinirken bir hata oluştu');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Resim',
      render: (item) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
          {item.coverImage ? (
            <img
              src={`${API_BASE_URL}/${item.coverImage}`}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <FaCubes />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Ürün Adı',
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-white">{item.name}</p>
          <p className="text-xs text-gray-400">{item.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Kategoriler',
      render: (item) => (
        <div>
          {item.categoryNames && item.categoryNames.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.categoryNames.map((catName, idx) => (
                <Chip key={idx} size="sm" variant="flat" color="primary" className="text-xs">
                  {catName}
                </Chip>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-500">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Fiyat',
      render: (item) => (
        <div className="text-sm">
          {item.minPrice && item.maxPrice ? (
            item.minPrice === item.maxPrice ? (
              <span className="text-white font-medium">{item.minPrice} ₺</span>
            ) : (
              <span className="text-gray-300">{item.minPrice} ₺ - {item.maxPrice} ₺</span>
            )
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'discount',
      label: 'İndirim',
      render: (item) => {
        // Varyantlardan indirimli fiyatları topla
        const discountPrices = item.variants
          ?.map(v => v.discount_price)
          .filter(price => price != null && price > 0) || [];
        
        if (discountPrices.length === 0) {
          return <span className="text-xs text-gray-500">-</span>;
        }
        
        const minDiscount = Math.min(...discountPrices);
        const maxDiscount = Math.max(...discountPrices);
        
        return (
          <div className="text-sm">
            {minDiscount === maxDiscount ? (
              <span className="text-green-400 font-medium">{minDiscount} ₺</span>
            ) : (
              <span className="text-green-400">{minDiscount} ₺ - {maxDiscount} ₺</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'featured',
      label: 'Öne Çıkanlar',
      align: 'center',
      render: (item) => (
        <button
          onClick={() => handleToggleFeatured(item.id, item.is_featured)}
          className={`p-2 rounded-lg transition-all ${
            item.is_featured === 1
              ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
              : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-500/10'
          }`}
          title={item.is_featured === 1 ? 'Öne çıkandan kaldır' : 'Öne çıkar'}
        >
          {item.is_featured === 1 ? (
            <FaStar className="w-5 h-5" />
          ) : (
            <FaRegStar className="w-5 h-5" />
          )}
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      align: 'center',
      render: (item) => (
        <Switch
          size="sm"
          isSelected={item.is_active === 1}
          onValueChange={() => handleToggleActive(item.id, item.is_active)}
          color="success"
        >
          <span className="text-xs text-gray-300">
            {item.is_active === 1 ? 'Aktif' : 'Pasif'}
          </span>
        </Switch>
      ),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
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
            onPress={() => handleDeleteClick(item)}
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title>Ürünler</Title>
      
      <div className="mt-6">
        <Table
          columns={columns}
          data={products}
          searchable={true}
          searchKeys={['name', 'slug']}
          searchPlaceholder="Ürün ara..."
          onAdd={handleAdd}
          addButtonText="Yeni Ürün"
          pagination={true}
          rowsPerPage={20}
          isLoading={isLoading}
          emptyText="Henüz ürün eklenmemiş"
        />
      </div>

      {/* Ürün Ekle Modal */}
      <UrunEkleModal 
        isOpen={isOpen} 
        onClose={onClose}
        onSuccess={handleSuccess}
      />

      {/* Ürün Güncelle Modal */}
      <UrunGuncelleModal 
        isOpen={isEditOpen} 
        onClose={handleEditModalClose}
        onSuccess={handleSuccess}
        productId={editingProductId}
      />

      {/* Ürün Silme Onay Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
        title="Ürün Sil"
        message="Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UrunPage;