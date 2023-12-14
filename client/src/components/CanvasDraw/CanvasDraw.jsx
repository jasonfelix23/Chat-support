import { useState, useEffect } from 'react';
import { HexColorPicker } from "react-colorful";
import { useOnDraw } from '../Hooks';
import { palette, reset } from '../../assets';
import socketIOClient from 'socket.io-client';
import axios from 'axios';

import './CanvasDraw.css'

const CanvasDraw = ({ socket }) => {
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [color, setColor] = useState("#186333");
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const { setCanvasRef, onCanvasMouseDown, clear, getCanvasRef } = useOnDraw(onDraw);

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
            setCanvasSize({ width: newWidth - 15, height: newHeight });
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

    useEffect(() => {
        const canvasRef = getCanvasRef();
        const ctx = canvasRef.current?.getContext('2d');
        if (socket) {
            socket.on('draw-line', ({ prevPoint, currentPoint, color }) => {
                drawLine(prevPoint, currentPoint, ctx, 3, color);
            })

            socket.on('clear', clear);
        }
    }, [socket])

    const handleButtonClick = async () => {
        try {
            const canvas = getCanvasRef().current;

            if (canvas) {
                canvas.toBlob(async (blob) => {
                    const formData = new FormData();
                    formData.append('image', blob, 'canvas_image.png');

                    try {
                        const response = await axios.post('http://localhost:5000/uploadCanvasScreenshot', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });

                        const { fileName } = response.data;
                        const downloadUrl = `http://localhost:5000/downloadCanvasImage/${fileName}`;
                        window.open(downloadUrl, '_blank');

                    } catch (error) {
                        console.error('Error uploading image:', error);
                    }
                }, 'image/png');
            }
        } catch (error) {
            console.error('Error handling button click:', error);
        }
    };

    function onDraw(ctx, currentPoint, prevPoint) {
        socket.emit('draw-line', { prevPoint, currentPoint, color })
        drawLine(prevPoint, currentPoint, ctx, 3, color)
    }

    function drawLine(start, end, ctx, width, color) {
        console.log({ start, ctx, });
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

            <button
                className="rounded-full w-12 h-12 md:w-14 md:h-14 mb-1 absolute bg-gray-300"
                style={{ zIndex: 2, left: '100%' }}
                onClick={toggleColorPicker}
            >
                <img src={palette} alt='Icon' />
            </button>


            <button
                className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-gray-300 absolute"
                style={{ zIndex: 2, top: 'calc(30%)', left: 'calc(100%)' }}
                onClick={handleButtonClick}
            >
                <img src="download.png" alt="Download" style={{ width: '200%', height: '50%' }} className='object-cover' />

            </button>

            <button
                className="rounded-full w-100 h-12 md:w-14 md:h-14 absolute bg-gray-300"
                style={{ zIndex: 2, left: '100%', top: '60px' }}
                onClick={() => socket.emit('clear')}
            >
                <img src={reset} alt='Icon' className='object-cover' />
            </button>
            {colorPickerVisible && (
                <section className='small'>

                    <HexColorPicker
                        color={color}
                        onChange={handleColorChange}
                        className='absolute top-0 right-0'
                    // style={{ zIndex: 2, left: '100%' }}
                    />
                </section>
            )}
        </div>
    )
}

export default CanvasDraw