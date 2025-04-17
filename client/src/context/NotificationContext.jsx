import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const newNotification = {
      id: Date.now(),
      message,
      type
    };
    
    setNotifications(prevNotifications => {
      // If we already have 5 notifications, remove the oldest one
      if (prevNotifications.length >= 5) {
        const updatedNotifications = [newNotification, ...prevNotifications.slice(0, 4)];
        return updatedNotifications;
      }
      return [newNotification, ...prevNotifications];
    });
    
    // Remove this notification after 5 seconds
    setTimeout(() => {
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== newNotification.id)
      );
    }, 5000);
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  const removeNotification = useCallback((id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  // Helper function to get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Helper function to get background and text colors based on notification type
  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconText: 'text-green-500',
          darkIconBg: 'dark:bg-green-800',
          darkIconText: 'dark:text-green-200'
        };
      case 'error':
        return {
          iconBg: 'bg-red-100',
          iconText: 'text-red-500',
          darkIconBg: 'dark:bg-red-800',
          darkIconText: 'dark:text-red-200'
        };
      case 'warning':
        return {
          iconBg: 'bg-orange-100',
          iconText: 'text-orange-500',
          darkIconBg: 'dark:bg-orange-700',
          darkIconText: 'dark:text-orange-200'
        };
      default:
        return {
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-500',
          darkIconBg: 'dark:bg-blue-800',
          darkIconText: 'dark:text-blue-200'
        };
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .notification-slide-in {
            animation: slideIn 0.3s ease-out forwards;
          }
        `}
      </style>
      <div className="fixed top-24 right-4 z-50 flex flex-col space-y-2 w-80">
        {notifications.map(notification => {
          const styles = getNotificationStyles(notification.type);
          return (
            <div 
              key={notification.id}
              className="flex items-center w-full p-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800 transition-all duration-300 ease-in-out transform translate-x-0 opacity-100 notification-slide-in"
              role="alert"
            >
              <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 ${styles.iconText} ${styles.iconBg} rounded-lg ${styles.darkIconBg} ${styles.darkIconText}`}>
                {getIcon(notification.type)}
                <span className="sr-only">
                  {notification.type === 'success' ? 'Check icon' : 
                   notification.type === 'error' ? 'Error icon' : 
                   notification.type === 'warning' ? 'Warning icon' : 'Info icon'}
                </span>
              </div>
              <div className="ms-3 text-sm font-normal">{notification.message}</div>
              <button 
                type="button" 
                className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" 
                onClick={() => removeNotification(notification.id)}
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}; 