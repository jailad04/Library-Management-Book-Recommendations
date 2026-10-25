import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      id: 'notif-1',
      title: 'Due Date Reminder',
      message: '"Designing Data-Intensive Applications" is due tomorrow (Oct 24). Please return or renew in time.',
      type: 'warning',
      read: false,
      timestamp: '2 hours ago'
    },
    {
      id: 'notif-2',
      title: 'New Personalized Recommendations',
      message: 'FastAPI recommendation service discovered 4 new titles matching your Software Architecture interests.',
      type: 'info',
      read: false,
      timestamp: '1 day ago'
    },
    {
      id: 'notif-3',
      title: 'Return Confirmed',
      message: 'Successfully recorded return of "Clean Code". Your borrowing record has been updated.',
      type: 'success',
      read: true,
      timestamp: '3 days ago'
    }
  ]
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action) => {
      const notif = state.items.find(n => n.id === action.payload);
      if (notif) notif.read = true;
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => { n.read = true; });
    },
    addNotification: (state, action) => {
      state.items.unshift({
        id: `notif-${Date.now()}`,
        read: false,
        timestamp: 'Just now',
        ...action.payload
      });
    }
  }
});

export const { markAsRead, markAllAsRead, addNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;
