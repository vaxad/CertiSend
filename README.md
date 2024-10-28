16
<img width="1470" alt="certisend" src="https://res.cloudinary.com/db670bhmc/image/upload/v1730132711/keitnfbdy1wcbcsqcppl.png">
# CertiSend

**CertiSend** is a bulk email-sending tool that lets you upload a CSV file, customize each email’s content with placeholders, and generate personalized attachments for every recipient. Each record in the CSV will have a unique, customized email, complete with tailored text, font styles, and images. Designed with **Next.js**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**, CertiSend provides a seamless experience for managing bulk, customized communication.

## Features

- **CSV Upload**: Upload a CSV file with recipient data, and map CSV column names to dynamically replace placeholders in the subject and email body.
- **Dynamic Placeholders**: Use `${columnName}` in your subject or email body to insert each record’s respective value, enabling fully customized messaging.
- **Customizable Attachments**: Generate a unique image for each email with:
  - Custom text for each recipient, using values from the CSV columns.
  - Editable font properties (size, style, weight, font family).
  - Color, background color, and position settings for each text layer.
- **Bulk Emailing**: Automatically send all emails using your Gmail credentials (supports app-specific passwords for security).
  
## Tech Stack

- **Next.js**: Framework for building a robust and responsive web application.
- **TypeScript**: Ensures reliable, type-safe code.
- **Tailwind CSS**: Provides rapid styling and customization.
- **shadcn/ui**: Simplifies the user interface with pre-built components.

## Getting Started

### Prerequisites

- **Node.js** and **npm** installed on your machine.
- A **Gmail account** with an app-specific password (for sending emails).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vaxad/certisend.git
   cd certisend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:3000`.

### Usage

1. **Upload CSV**:
   - Prepare a CSV file with at least the following columns: `email`, and any additional columns you’d like to use in the email subject, body, or image text.
   - Upload the CSV file in CertiSend.

2. **Customize Image**:
   - Configure attachment text settings such as font size, font style, weight, color, and background color (you can also add custom fonts).
   - Adjust the position of each text layer on the image.

3. **Customize Email**:
   - Enter the **Subject** and **Body** of the email. Use `${columnName}` to dynamically replace text with the respective CSV values for each recipient.
   - Enter your Gmail email address and app-specific password for sending.

4. **Send Emails**:
   - Click the **Send** button to send customized emails in bulk.

## Example

Imagine your CSV has columns for `email`, `firstName`, and `role`. Here’s how you might configure CertiSend:

- **Subject**: `Hi ${firstName}, Your Certificate is Ready!`
- **Body**: `Hello ${firstName}, as a valued ${role}, we're pleased to provide your certificate.`
- **Attachment**: Each image will display the recipient’s name and role in the customized style and layout you defined.

Each recipient receives a personalized email with:
- Their name and role filled into the subject and body.
- An image attachment customized with their name and role.

## Security

To send emails, CertiSend requires your Gmail account and an app-specific password. Ensure that **2-Step Verification** is enabled on your Google account to create an app-specific password.

## Acknowledgements

- Inspired by the need for efficient and personalized bulk email solutions.
