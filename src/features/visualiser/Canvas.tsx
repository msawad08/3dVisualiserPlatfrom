import React from "react";
import styles from "./visualiser.module.css"

type PropTypes  = {
    canvasRef:  React.RefObject<HTMLCanvasElement>
}

const CanvasComponent =function({canvasRef}: PropTypes){
    console.log(canvasRef.current);
    return <canvas className={styles.canvas} ref={canvasRef}/>
}

export const Canvas = React.memo(CanvasComponent, (prev)=> false)

