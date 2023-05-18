import React, { useEffect, useRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import { Canvas } from "./Canvas";
import { init3d } from "./visualiserThunks";
import styles from "./visualiser.module.css"


export function Visualiser() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize
    if (canvasRef.current != null) {
      const canvas: HTMLCanvasElement = canvasRef.current;
      dispatch(init3d(canvas));
    }
  }, [canvasRef, dispatch]);

  return (
    <div>
      <Canvas canvasRef={canvasRef} />
      <div className={styles.license}><a href="https://skfb.ly/oCWqC">2018 Nissan Leaf NISMO RC"</a> by Donovy2025 is licensed under <a href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution</a><br/><a href="/3dModels/nissanLeaf/license.txt">License.txt</a> </div>
    </div>
  );
}
