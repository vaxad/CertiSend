"use client"
import { TableRow } from '@/lib/types/table';
import React, { useRef, useState } from 'react'
import TableData from '../table-data';
import ImageEditor from '../image-editor';
import { TextPosition } from '@/lib/types/image';
import FormComponent from '../email-form';
import { Separator } from '../ui/separator';

export default function SendPage() {
    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [columns, setColumns] = useState<string[]>(['email', 'var1', 'var2']);
    const [image, setImage] = useState<string | null>(null);
    const [textPositions, setTextPositions] = useState<TextPosition[]>([]);
    const imageRef = useRef<HTMLDivElement>(null);

    return (
        <main>
            <TableData columns={columns} setColumns={setColumns} setTableData={setTableData} tableData={tableData} />
            <Separator className='my-2' />
            <ImageEditor columns={columns} image={image} imageRef={imageRef} setImage={setImage} setTextPositions={setTextPositions} tableData={tableData} textPositions={textPositions} />
            <Separator className='my-2' />
            <FormComponent columns={columns} imageRef={imageRef} tableData={tableData} textPositions={textPositions} setTextPositions={setTextPositions} />
        </main>
    )
}
