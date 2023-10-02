import { AppThunk, RootState } from "../../../app/store";

const selectVisualiser = (state: RootState) => state.visualiser;

export const init3d =
  (canvas: HTMLCanvasElement): AppThunk =>
  (_, getState) => {
    const {visualiser} = selectVisualiser(getState());
    visualiser.init3d(canvas);
  };