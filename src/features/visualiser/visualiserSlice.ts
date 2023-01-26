import { createSlice } from "@reduxjs/toolkit";
import { Visualiser } from "./visulaiser";

export interface VisualiserState {
    visualiser: Visualiser
}

const initialState: VisualiserState = {
    visualiser: new Visualiser()
}

export const storePrefix = "visualiser";

export const visualiserSlice = createSlice({
    name: storePrefix,
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
    },
});

export const visualiserReducer =  visualiserSlice.reducer;