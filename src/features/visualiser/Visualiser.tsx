import React, { useEffect, useRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import { Canvas } from "./Canvas";
import { init3d } from "./visualiserThunks";

export function Visualiser(){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dispatch = useAppDispatch();


    useEffect(() => {
        // Initialize
        if (canvasRef.current != null) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            dispatch(init3d(canvas));
        }
      }, [canvasRef, dispatch]);

    return <Canvas canvasRef={canvasRef} />

}

