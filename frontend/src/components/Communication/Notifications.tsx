import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, DollarSign, MessageSquare, Star, Info } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'investment' | 'message' | 'review' | 'other';
  read: boolean;
  createdAt: string;
}

export const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = (import.meta as any).env?.VITE_API_URL || '';

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to load notifications');

      const data: Notification[] = await res.json();
      setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <DollarSign size={24} className="text-green-500" />;
      case 'message':
        return <MessageSquare size={24} className="text-blue-500" />;
      case 'review':
        return <Star size={24} className="text-yellow-500" />;
      default:
        return <Info size={24} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00AEEF]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45] mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with your latest activities</p>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        {notifications.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Bell size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications yet</h3>
            <p className="text-gray-500">
              You'll see updates about investments, messages, and more here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-6 hover:bg-gray-50 transition cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-[#0B2C45] mb-1">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-[#00AEEF] rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
