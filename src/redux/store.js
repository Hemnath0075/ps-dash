import {configureStore} from '@reduxjs/toolkit';
import DataReducer from './Features/DataSlice';

export const store = configureStore({
  reducer: {
    data: DataReducer,
  },
});
