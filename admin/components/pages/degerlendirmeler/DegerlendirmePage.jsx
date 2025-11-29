import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Title from '@/components/design/title/Title';
import Table from '@/components/design/table/Table';
import DegerlendirmeDetayModal from './DegerlendirmeDetayModal';
import ConfirmModal from '@/components/design/confirmModal/ConfirmModal';
import { Button, Chip, Select, SelectItem, useDisclosure } from '@heroui/react';
import { fetchReviews, approveReview, deleteReview } from '@/store/slices/degerlendirmeSlice';
import { FaEye, FaTrash, FaStar, FaCheckCircle, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DegerlendirmePage = () => {
  const dispatch = useDispatch();
  const { reviews, isLoading } = useSelector((state) => state.degerlendirme);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchReviews(statusFilter));
  }, [dispatch, statusFilter]);

  const handleDetail = (review) => {
    setSelectedReview(review);
    onDetailOpen();
  };

  const handleApprove = async (id) => {
    try {
      await dispatch(approveReview({ id, is_approved: true })).unwrap();
      toast.success('Değerlendirme onaylandı');
      dispatch(fetchReviews(statusFilter));
    } catch (error) {
      toast.error(error || 'İşlem başarısız');
    }
  };

  const handleReject = async (id) => {
    try {
      await dispatch(approveReview({ id, is_approved: false })).unwrap();
      toast.success('Değerlendirme reddedildi');
      dispatch(fetchReviews(statusFilter));
    } catch (error) {
      toast.error(error || 'İşlem başarısız');
    }
  };

  const handleDelete = (review) => {
    setReviewToDelete(review);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      await dispatch(deleteReview(reviewToDelete.id)).unwrap();
      toast.success('Değerlendirme silindi');
      onDeleteClose();
      setReviewToDelete(null);
    } catch (error) {
      toast.error(error || 'Değerlendirme silinemedi');
    }
  };

  const handleDeleteModalClose = () => {
    onDeleteClose();
    setReviewToDelete(null);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={`text-sm ${
              index < rating ? 'text-yellow-400' : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'product_name',
      label: 'Ürün',
      render: (item) => (
        <div className="max-w-xs">
          <p className="text-white font-medium truncate">{item.product_name}</p>
          <p className="text-xs text-gray-400 truncate">{item.order_number}</p>
        </div>
      ),
    },
    {
      key: 'user_name',
      label: 'Müşteri',
      render: (item) => (
        <div className="max-w-xs">
          <p className="text-white truncate">{item.user_name}</p>
          {item.user_email && (
            <p className="text-xs text-gray-400 truncate">{item.user_email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Puan',
      render: (item) => renderStars(item.rating),
    },
    {
      key: 'comment',
      label: 'Yorum',
      render: (item) => (
        <div className="max-w-xs">
          {item.title && (
            <p className="text-white font-medium truncate mb-1">{item.title}</p>
          )}
          {item.comment && (
            <p className="text-sm text-gray-400 truncate">{item.comment}</p>
          )}
        </div>
      ),
    },
    {
      key: 'is_approved',
      label: 'Durum',
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.is_approved ? 'success' : 'warning'}
          startContent={item.is_approved ? <FaCheckCircle className="text-xs" /> : <FaClock className="text-xs" />}
        >
          {item.is_approved ? 'Onaylı' : 'Bekliyor'}
        </Chip>
      ),
    },
    {
      key: 'created_at',
      label: 'Tarih',
      render: (item) => (
        <span className="text-sm text-gray-400">
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
            onPress={() => handleDetail(item)}
          >
            <FaEye />
          </Button>
          {!item.is_approved && (
            <Button
              size="sm"
              variant="flat"
              color="secondary"
              isIconOnly
              onPress={() => handleApprove(item.id)}
            >
              <FaCheckCircle />
            </Button>
          )}
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
      <Title 
        title="Değerlendirmeler"
        subtitle="Müşteri yorumlarını yönetin"
      />

      {/* Filtre */}
      <div className="mt-6 mb-4 flex justify-end">
        <Select
          label="Durum Filtrele"
          placeholder="Tümü"
          selectedKeys={[statusFilter]}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="max-w-xs"
          variant="bordered"
        >
          <SelectItem key="all" value="all">
            Tümü
          </SelectItem>
          <SelectItem key="pending" value="pending">
            Onay Bekleyen
          </SelectItem>
          <SelectItem key="approved" value="approved">
            Onaylı
          </SelectItem>
        </Select>
      </div>

      <div className="mt-6">
        <Table
          columns={columns}
          data={reviews}
          searchable={true}
          searchKeys={['product_name', 'user_name', 'user_email', 'title', 'comment', 'order_number']}
          searchPlaceholder="Değerlendirme ara..."
          pagination={true}
          rowsPerPage={10}
          isLoading={isLoading}
          emptyText="Henüz değerlendirme yapılmamış"
        />
      </div>

      {/* Detay Modal */}
      <DegerlendirmeDetayModal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        review={selectedReview}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Silme Onay Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={handleDeleteModalClose}
        title="Değerlendirmeyi Sil"
        message={`Bu değerlendirmeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default DegerlendirmePage;