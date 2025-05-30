import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { Button, Card, CardBody } from '@heroui/react';
import { clearCredentials } from '../store/slices/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(clearCredentials());
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">🚀 CMS Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hoş geldin, <strong>{user?.username}</strong>
              </span>
              <span className="text-xs text-gray-500">
                ({user?.authority})
              </span>
              <Button
                color="danger"
                variant="flat"
                size="sm"
                onClick={handleLogout}
              >
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Welcome Card */}
          <Card className="mb-8">
            <CardBody>
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Hoş Geldin, {user?.username}! 🎉
                </h2>
                <p className="text-gray-600 mb-2">
                  Global Authentication Guard aktif!
                </p>
                <p className="text-sm text-gray-500">
                  Authority: {user?.authority} | Tüm sayfalar korunuyor
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Kullanıcılar</dt>
                      <dd className="text-lg font-medium text-gray-900">12</dd>
                    </dl>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📝</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">İçerikler</dt>
                      <dd className="text-lg font-medium text-gray-900">45</dd>
                    </dl>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🚀</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Durum</dt>
                      <dd className="text-lg font-medium text-gray-900">Aktif</dd>
                    </dl>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;