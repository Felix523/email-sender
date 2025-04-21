import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import sgMail from "@sendgrid/mail";

dotenv.config();
if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not defined in the environment variables");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY
    }
});

app.post("/api/send-email", async (req: Request, res: Response) => {
    const { clientName, recipientEmail, subject, message } = req.body;

    console.log("Received email request:", req.body);

    let response;

    if (!recipientEmail) {
        response = res.status(400).json({ success: false, message: "Recipient email is required" });
        return response;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,               // sender address
        to: recipientEmail,                         // list of receivers
        subject: subject,      // Subject line
        text: message  // plain text body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", recipientEmail);
        response = res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.log("Error sending email:", error);
        response = res.status(500).json({ success: false, message: "Failed to send email" });
    }

    return response;
});

app.listen(PORT, () => console.log('Email sender running on PORT:', PORT));