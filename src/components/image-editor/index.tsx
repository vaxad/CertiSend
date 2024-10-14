import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import * as htmlToImage from 'html-to-image';
import FormComponent from './form';

interface Props {
    columns: string[];
    tableData: { [key: string]: string }[];
}

export interface TextPosition {
    id: number;
    column: string;
    x: number;
    y: number;
    color: string;
    backgroundColor: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: string;
    fontFamily: string;
}

const ImageOverlay: React.FC<Props> = ({ columns, tableData }) => {
    const [image, setImage] = useState<string | null>(null);
    const [textPositions, setTextPositions] = useState<TextPosition[]>([]);
    const [customFontName, setCustomFontName] = useState<string | null>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const styleSheetRef = useRef<HTMLStyleElement | null>(null);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                setImage(event.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // Handle custom font upload and generate a base64 string
    const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            const fontName = e.target.files[0].name.split('.')[0];

            reader.onload = (event: any) => {
                const fontBase64 = event.target.result;

                // Create or update a style element for the uploaded font
                if (!styleSheetRef.current) {
                    const styleSheet = document.createElement('style');
                    document.head.appendChild(styleSheet);
                    styleSheetRef.current = styleSheet;
                }

                // Insert a new @font-face rule for the uploaded font
                const styleSheet = styleSheetRef.current!;
                styleSheet.innerHTML = `
          @font-face {
            font-family: '${fontName}';
            src: url(${fontBase64}) format('truetype');
          }
        `;
                setCustomFontName(fontName);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // Add new text position to the image
    const addText = (column: string) => {
        setTextPositions([
            ...textPositions,
            {
                id: textPositions.length,
                column,
                x: 100,
                y: 100,
                color: 'black',
                backgroundColor: 'transparent',
                fontSize: 16,
                fontWeight: 'normal',
                fontStyle: 'normal',
                fontFamily: 'Arial', // Default font
            },
        ]);
    };

    // Update text position (dragging, size, style, etc.)
    const updateTextPosition = (id: number, updates: Partial<TextPosition>) => {
        setTextPositions((prev) =>
            prev.map((text) => (text.id === id ? { ...text, ...updates } : text))
        );
    };

    // Export images with table data
    const handleExport = async () => {
        if (!imageRef.current) return;

        for (const row of tableData) {
            const updatedTextPositions = textPositions.map((text) => ({
                ...text,
                column: row[text.column],
            }));

            // Temporarily set the updated text positions to display actual data
            setTextPositions(updatedTextPositions);

            // Export image with replaced data
            const dataUrl = await htmlToImage.toPng(imageRef.current);

            // Reset the text positions to placeholders for next iteration
            setTextPositions(textPositions);

            // You can display the generated image or download it
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `image-${row.email}.png`;
            link.click();
        }
    };

    return (
        <div>
            <h2>Image Upload and Text Placement</h2>
            <input type="file" accept="image/*" onChange={handleImageUpload} />

            <div style={{ marginTop: '20px' }}>
                <h3>Place columns on the image</h3>
                {columns.map((column, index) => (
                    <button key={index} onClick={() => addText(column)}>
                        Add {column}
                    </button>
                ))}
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Upload Custom Font</h3>
                <input type="file" accept=".ttf,.otf,.woff" onChange={handleFontUpload} />
            </div>

            {image && (
                <div
                    ref={imageRef}
                    style={{ position: 'relative', width: '100%', maxWidth: '800px', marginTop: '20px' }}
                >
                    <img src={image} alt="uploaded" style={{ width: '100%', height: 'auto' }} />

                    {textPositions.map((text, index) => (
                        <Draggable
                            key={text.id}
                            position={{ x: text.x, y: text.y }}
                            onStop={(e, data) =>
                                updateTextPosition(text.id, { x: data.x, y: data.y })
                            }
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    color: text.color,
                                    fontSize: `${text.fontSize}px`,
                                    fontWeight: text.fontWeight,
                                    fontStyle: text.fontStyle,
                                    backgroundColor: text.backgroundColor,
                                    fontFamily: text.fontFamily === 'custom' ? customFontName || "customFont" : text.fontFamily,
                                    padding: '2px 4px',
                                    cursor: 'move',
                                }}
                            >
                                {text.column}
                            </div>
                        </Draggable>
                    ))}
                </div>
            )}

            {textPositions.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Customize Text</h3>
                    {textPositions.map((text) => (
                        <div key={text.id} style={{ marginBottom: '10px' }}>
                            <h4>{text.column}</h4>
                            <label>
                                Color:
                                <input
                                    type="color"
                                    value={text.color}
                                    onChange={(e) => updateTextPosition(text.id, { color: e.target.value })}
                                />
                            </label>
                            <label>
                                Background Color:
                                <input
                                    type="color"
                                    value={text.backgroundColor}
                                    onChange={(e) => updateTextPosition(text.id, { backgroundColor: e.target.value })}
                                />
                            </label>
                            <label>
                                Font Size:
                                <input
                                    type="number"
                                    value={text.fontSize}
                                    onChange={(e) => updateTextPosition(text.id, { fontSize: parseInt(e.target.value) })}
                                />
                            </label>
                            <label>
                                Font Weight:
                                <select
                                    value={text.fontWeight}
                                    onChange={(e) => updateTextPosition(text.id, { fontWeight: e.target.value })}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="bold">Bold</option>
                                </select>
                            </label>
                            <label>
                                Font Style:
                                <select
                                    value={text.fontStyle}
                                    onChange={(e) => updateTextPosition(text.id, { fontStyle: e.target.value })}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="italic">Italic</option>
                                </select>
                            </label>
                            <label>
                                Font Family:
                                <select
                                    value={text.fontFamily}
                                    onChange={(e) => updateTextPosition(text.id, { fontFamily: e.target.value })}
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                    {customFontName && <option value="custom">{customFontName}</option>}
                                </select>
                            </label>
                        </div>
                    ))}
                </div>
            )}

            <button onClick={handleExport} style={{ marginTop: '20px' }}>
                Export Images with Data
            </button>
            <FormComponent columns={columns} tableData={tableData} textPositions={textPositions} imageRef={imageRef} setTextPositions={setTextPositions} />
        </div>
    );
};

export default ImageOverlay;
