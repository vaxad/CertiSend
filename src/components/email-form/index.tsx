import React, { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { FormProps } from '@/lib/types/form';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { MailRequestBody } from '@/lib/types/mail';


const FormComponent = ({ columns, tableData, textPositions, imageRef, setTextPositions }: FormProps) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [senderMail, setSenderMail] = useState('');
    const [senderPassword, setSenderPassword] = useState('');

    const handleSendMail = async () => {
        for (const row of tableData) {
            const updatedTextPositions = textPositions.map((text) => ({
                ...text,
                column: row[text.column],
            }));

            setTextPositions(updatedTextPositions);

            if (imageRef.current) {
                const dataUrl = await htmlToImage.toPng(imageRef.current);

                setTextPositions(textPositions);

                let replacedSubject = subject;
                let replacedBody = body;

                columns.forEach((col) => {
                    const regex = new RegExp(`\\$\\{${col}\\}`, 'g');
                    replacedSubject = replacedSubject.replace(regex, row[col] || '');
                    replacedBody = replacedBody.replace(regex, row[col] || '');
                });

                const mailRequestBody = {
                    subject: replacedSubject,
                    body: replacedBody,
                    senderMail: senderMail || undefined,
                    senderPassword: senderPassword || undefined,
                    recipientMail: row.email,
                    attachments: [
                        {
                            filename: `image-${row.email}.png`,
                            content: dataUrl.split(',')[1],
                        },
                    ],
                };

                await sendMail(mailRequestBody);
            }
        }
    };

    const sendMail = async (mailRequestBody: MailRequestBody) => {
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
            toast.error('Error sending mail');
            console.error('Error sending mail:', error);
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <h2 className='text-lg font-semibold'>Email Form</h2>
            <div>
                <Label>Subject:</Label>
                <Input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                />
            </div>
            <div>
                <Label>Body:</Label>
                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter email body (use ${columnName} to reference table data)"
                />
            </div>
            <div>
                <Label>Sender Email:</Label>
                <Input
                    type="email"
                    value={senderMail}
                    onChange={(e) => setSenderMail(e.target.value)}
                    placeholder="Enter your email"
                />
            </div>
            <div>
                <Label>Sender App Password:</Label>
                <Input
                    type="password"
                    value={senderPassword}
                    onChange={(e) => setSenderPassword(e.target.value)}
                    placeholder="Enter your app password"
                />
            </div>
            <Button className='mt-4' onClick={handleSendMail}>Send Mail</Button>
        </div>
    );
};

export default FormComponent;
