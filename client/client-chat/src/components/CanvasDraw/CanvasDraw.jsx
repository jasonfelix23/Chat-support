import { useState, useEffect } from 'react';
import { HexColorPicker } from "react-colorful";
import { useOnDraw } from '../Hooks';
import { palette } from '../../assets';

const CanvasDraw = () => {
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [color, setColor] = useState("#b32aa9");
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const { setCanvasRef, onCanvasMouseDown } = useOnDraw(onDraw);

    const toggleColorPicker = () => {
        setColorPickerVisible((prevVisible) => !prevVisible);
    };

    const handleColorChange = (newColor) => {
        setColor(newColor);
        // You can perform additional actions when the color changes if needed
    };

    useEffect(() => {
        const handleResize = () => {
            const canvasContainer = document.getElementById('canvas-container');
            const newWidth = canvasContainer.offsetWidth;
            const newHeight = canvasContainer.offsetHeight;
            setCanvasSize({ width: newWidth, height: newHeight });
        };

        // Initial setup
        handleResize();

        // Attach event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // This effect runs once when the component mounts

    function onDraw(ctx, point, prevPoint) {
        drawLine(prevPoint, point, ctx, 3, color)
    }

    function drawLine(start, end, ctx, width, color) {
        console.log(start);
        start = start ?? end;
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(start.x, start.y, 1, 0, 2 * Math.PI);
        ctx.fill();
    }
    return (
        <div id="canvas-container" className="relative w-5/6 h-5/6">
            <canvas
                width={canvasSize.width}
                height={canvasSize.height}
                className='border border-black bg-white absolute inset-0  h-full rounded-md'
                ref={setCanvasRef}
                onMouseDown={onCanvasMouseDown}
            />
            {/* <HexColorPicker className='absolute' color={color} onChange={setColor} style={{ zIndex: 2, left: '80%' }} /> */}
            <button
                className="rounded-full w-16 h-16 absolute bg-gray-300"
                style={{ zIndex: 2, left: '100%' }}
                onClick={toggleColorPicker}
            >
                <img src={palette} alt='Icon' />
            </button>
            {colorPickerVisible && (

                <HexColorPicker
                    color={color}
                    onChange={handleColorChange}
                    className='absolute top-10 left-10 ml-2'
                    style={{ zIndex: 2, left: '70%' }}
                />
            )}
        </div>
    )
}

export default CanvasDraw