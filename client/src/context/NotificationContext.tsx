import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  message: string;
  type: string;
  status: string;
}

interface NotificationContextType {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Use absolute URL for WebSocket
    const ws = new WebSocket(`ws://localhost:8888/api/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newNotification: Notification = {
        id: Date.now().toString(),
        message: data.message,
        type: data.type,
        status: data.status,
      };
      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    };

    ws.onopen = () => console.log('WebSocket Connected');
    ws.onerror = (err) => console.error('WebSocket Error:', err);
    ws.onclose = () => console.log('WebSocket Disconnected');

    return () => ws.close();
  }, [user]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, removeNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-center space-x-3 min-w-[300px] animate-slide-in ${
              n.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="text-2xl">{n.status === 'approved' ? '🎉' : '❌'}</span>
            <div>
              <p className="font-bold text-sm">Status Update</p>
              <p className="text-xs">{n.message}</p>
            </div>
            <button onClick={() => removeNotification(n.id)} className="ml-auto text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
