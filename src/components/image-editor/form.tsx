import React, { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { TextPosition } from '.';


type TableData = Record<string, string>;

type Attachment = {
    filename: string;
    content: string;
};

type ImageOverlayProps = {
    columns: string[];
    tableData: TableData[];
    textPositions: TextPosition[];
    imageRef: React.RefObject<HTMLDivElement>;
    setTextPositions: React.Dispatch<React.SetStateAction<TextPosition[]>>
    // onImageGenerate: (email: string, imageBase64: string) => void; // Callback after image is generated
};

const FormComponent = ({ columns, tableData, textPositions, imageRef, setTextPositions }: ImageOverlayProps) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [senderMail, setSenderMail] = useState('');
    const [senderPassword, setSenderPassword] = useState('');

    const handleSendMail = async () => {
        for (const row of tableData) {
            // Step 1: Replace placeholders in text positions with actual values from the current row
            const updatedTextPositions = textPositions.map((text) => ({
                ...text,
                column: row[text.column], // replace column name with actual value
            }));

            // Step 2: Temporarily set the updated text positions to display actual data
            setTextPositions(updatedTextPositions);

            // Step 3: Export image with replaced data
            if (imageRef.current) {
                const dataUrl = await htmlToImage.toPng(imageRef.current);

                // Step 4: Reset the text positions to placeholders for the next iteration
                setTextPositions(textPositions);

                // Step 5: Prepare email subject and body with placeholders replaced
                let replacedSubject = subject;
                let replacedBody = body;

                columns.forEach((col) => {
                    const regex = new RegExp(`\\$\\{${col}\\}`, 'g');
                    replacedSubject = replacedSubject.replace(regex, row[col] || '');
                    replacedBody = replacedBody.replace(regex, row[col] || '');
                });

                // Step 6: Prepare the email request body
                const mailRequestBody = {
                    subject: replacedSubject,
                    body: replacedBody,
                    senderMail: senderMail || undefined, // Use undefined to fallback to env variables
                    senderPassword: senderPassword || undefined,
                    recipientMail: row.email, // Send to the recipient in tableData
                    attachments: [
                        {
                            filename: `image-${row.email}.png`,
                            content: dataUrl.split(',')[1], // Send the base64 part without metadata
                        },
                    ],
                };

                // Step 7: Send the email
                await sendMail(mailRequestBody);
            }
        }
    };

    const generateImage = async (positions: TextPosition[], entry: TableData): Promise<string> => {
        // Implement your logic here to generate image based on textPositions
        // This should return the image as a base64 string
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        // Draw the image and text (simplified for illustration)
        // Use positions to determine where and how to draw text
        positions.forEach((pos) => {
            ctx.font = `${pos.fontWeight} ${pos.fontSize}px ${pos.fontStyle}`;
            ctx.fillStyle = pos.color;
            ctx.fillText(entry[pos.column], pos.x, pos.y);
        });

        return canvas.toDataURL('image/png').split(',')[1]; // Get base64 image content without metadata
    };

    const sendMail = async (mailRequestBody: any) => {
        try {
            const response = await fetch('/api/mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mailRequestBody),
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error sending mail:', error);
        }
    };

    return (
        <div>
            <h2>Email Form</h2>
            <div>
                <label>Subject:</label>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                />
            </div>
            <div>
                <label>Body:</label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter email body (use ${columnName} to reference table data)"
                />
            </div>
            <div>
                <label>Sender Email:</label>
                <input
                    type="email"
                    value={senderMail}
                    onChange={(e) => setSenderMail(e.target.value)}
                    placeholder="Enter your email"
                />
            </div>
            <div>
                <label>Sender App Password:</label>
                <input
                    type="password"
                    value={senderPassword}
                    onChange={(e) => setSenderPassword(e.target.value)}
                    placeholder="Enter your app password"
                />
            </div>
            <button onClick={handleSendMail}>Send Mail</button>
        </div>
    );
};

export default FormComponent;
