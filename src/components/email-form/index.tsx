import React, { useState } from 'react';
import { FormProps } from '@/lib/types/form';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { MailRequestBody } from '@/lib/types/mail';
import { Info } from 'lucide-react';


const FormComponent = ({ columns, tableData, textPositions, imageRef, image }: FormProps) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [senderMail, setSenderMail] = useState('');
    const [senderPassword, setSenderPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendMail = async () => {
        const generatedImages: { email: string; dataUrl: string }[] = [];
        if (!subject || !body || !senderMail || !senderPassword) {
            toast.error('Please fill all fields');
            return;
        }
        if (loading) return;
        setLoading(true);
        for (const row of tableData) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = imageRef.current?.clientWidth || 500;
            canvas.height = imageRef.current?.clientHeight || 500;

            if (image) {
                const baseImage = new Image();
                baseImage.src = image
                await new Promise((resolve) => {
                    baseImage.onload = () => {
                        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
                        resolve(true);
                    };
                });
            }

            const updatedTextPositions = textPositions.map((text) => ({
                ...text,
                column: row[text.column],
            }));

            updatedTextPositions.forEach((text) => {
                ctx.font = `${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
                ctx.textAlign = "left";

                const textMetrics = ctx.measureText(text.column);
                const textWidth = textMetrics.width;
                const textHeight = text.fontSize;

                ctx.fillStyle = text.backgroundColor;
                ctx.fillRect(text.x - 10, text.y - textHeight, textWidth + 10, textHeight + 10);

                ctx.fillStyle = text.color;
                ctx.fillText(text.column, text.x, text.y);
            });

            const dataUrl = canvas.toDataURL("image/png");

            generatedImages.push({
                email: row.email,
                dataUrl,
            });
        }

        for (const row of tableData) {
            const imageInfo = generatedImages.find((img) => img.email === row.email);
            if (imageInfo) {
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
                            content: imageInfo.dataUrl.split(',')[1],
                        },
                    ],
                };

                await sendMail(mailRequestBody);
            }
        }
        setLoading(false);
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
            await response.json();
            toast.success("Mail sent successfully to " + mailRequestBody.recipientMail);
        } catch (error) {
            toast.error('Error sending mail');
            console.error('Error sending mail:', error);
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <h2 className='text-xl font-semibold'>Email Form</h2>
            <div>
                <Label>Subject:</Label>
                <Input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject (use ${columnName} to reference table data)"
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
                <Label>Sender Gmail:</Label>
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
            <a href='https://support.google.com/accounts/answer/185833' className='flex items-center gap-2 p-2 bg-foreground/10 rounded-md'>
                <Info size={16} />
                <h2 className='text-sm'>Get more information about app passwords</h2>
            </a>
            <Button disabled={loading} className='mt-4' onClick={handleSendMail}>Send Mail</Button>
        </div>
    );
};

export default FormComponent;
