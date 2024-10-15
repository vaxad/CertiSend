/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import * as htmlToImage from 'html-to-image';
import { ImageEditorProps, TextPosition } from '@/lib/types/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ImageEditor = ({ columns, tableData, image, imageRef, setImage, setTextPositions, textPositions }: ImageEditorProps) => {
    const [customFontName, setCustomFontName] = useState<string | null>(null);
    const styleSheetRef = useRef<HTMLStyleElement | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                setImage(event.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            const fontName = e.target.files[0].name.split('.')[0];

            reader.onload = (event: any) => {
                const fontBase64 = event.target.result;

                if (!styleSheetRef.current) {
                    const styleSheet = document.createElement('style');
                    document.head.appendChild(styleSheet);
                    styleSheetRef.current = styleSheet;
                }

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
                fontFamily: 'Arial',
            },
        ]);
    };

    const updateTextPosition = (id: number, updates: Partial<TextPosition>) => {
        setTextPositions((prev) =>
            prev.map((text) => (text.id === id ? { ...text, ...updates } : text))
        );
    };

    const handleExport = async () => {
        if (!imageRef.current) return;

        for (const row of tableData) {
            const updatedTextPositions = textPositions.map((text) => ({
                ...text,
                column: row[text.column],
            }));

            setTextPositions(updatedTextPositions);

            const dataUrl = await htmlToImage.toPng(imageRef.current);

            setTextPositions(textPositions);

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `image-${row.email}.png`;
            link.click();
        }
    };

    return (
        <div>
            <h2 className='text-xl font-semibold pb-4'>Image Upload and Text Placement</h2>
            <Input className='w-fit' type="file" accept="image/*" onChange={handleImageUpload} />

            {image && (
                <>
                    <div className='pt-4'>
                        <h3 className='text-lg font-medium pb-2'>Place columns on the image</h3>
                        <div className='flex gap-2 flex-wrap'>

                            {columns.map((column, index) => (
                                <Button key={index} onClick={() => addText(column)}>
                                    <Plus size={15} />
                                    <span className='pl-2'> {column}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h3 className='text-lg font-medium pb-2'>Upload Custom Font</h3>
                        <Input className='w-fit' type="file" accept=".ttf,.otf,.woff" onChange={handleFontUpload} />
                    </div>
                    <div
                        ref={imageRef}
                        style={{ position: 'relative', width: '100%', maxWidth: '800px', marginTop: '20px' }}
                    >
                        <img src={image} alt="uploaded" style={{ width: '100%', height: 'auto' }} />

                        {textPositions.map((text) => (
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
                </>
            )}

            {textPositions.length > 0 && (
                <div className='pt-4'>
                    <h3 className='text-lg font-medium pb-2'>Customize Text</h3>
                    {textPositions.map((text, ind) => (
                        <div key={text.id} className=''>
                            <h4 className='font-medium'>{ind + 1}. {text.column}</h4>
                            <div className='flex gap-2'>
                                <Label className='flex items-center gap-2'>
                                    Color:
                                    <Input
                                        className='w-16'
                                        type="color"
                                        value={text.color}
                                        onChange={(e) => updateTextPosition(text.id, { color: e.target.value })}
                                    />
                                </Label>
                                <Label className='flex items-center gap-2'>
                                    BG Color:
                                    <Input
                                        className='w-16'
                                        type="color"
                                        value={text.backgroundColor}
                                        onChange={(e) => updateTextPosition(text.id, { backgroundColor: e.target.value })}
                                    />
                                    {textPositions[text.id].backgroundColor !== "transparent" && <Button className='text-xs p-2' onClick={() => updateTextPosition(text.id, { backgroundColor: 'transparent' })}>Clear BG</Button>}
                                </Label>
                                <Label className='flex items-center gap-2'>
                                    Font Size:
                                    <Input
                                        className='min-w-16 w-fit'
                                        type="number"
                                        value={text.fontSize}
                                        onChange={(e) => updateTextPosition(text.id, { fontSize: parseInt(e.target.value) })}
                                    />
                                </Label>
                                <Label className='flex items-center gap-2'>
                                    Font Weight:
                                    <Select
                                        value={text.fontWeight}
                                        onValueChange={(v) => updateTextPosition(text.id, { fontWeight: v })}
                                    >
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Font Weight" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="bold">Bold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Label>
                                <Label className='flex items-center gap-2'>
                                    Font Style:
                                    <Select
                                        value={text.fontStyle}
                                        onValueChange={(v) => updateTextPosition(text.id, { fontStyle: v })}
                                    >
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Font Style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="italic">Italic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Label>
                                <Label className='flex items-center gap-2'>
                                    Font Family:
                                    <Select
                                        value={text.fontFamily}
                                        onValueChange={(v) => updateTextPosition(text.id, { fontFamily: v })}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Font Family" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Arial">Arial</SelectItem>
                                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                            <SelectItem value="Courier New">Courier New</SelectItem>
                                            {customFontName && <SelectItem value="custom">{customFontName}</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </Label>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {image &&
                <div className='flex justify-end'>
                    <Button variant="outline" onClick={handleExport} className='mt-4'>
                        Export Images
                    </Button>
                </div>}
        </div>
    );
};

export default ImageEditor;
