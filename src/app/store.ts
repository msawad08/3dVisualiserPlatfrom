import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { visualiserReducer } from '../features/visualiser/visualiser.slice';

export const store = configureStore({
  reducer: {
    visualiser: visualiserReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

