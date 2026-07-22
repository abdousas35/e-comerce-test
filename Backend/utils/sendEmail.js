import nodemailer from "nodemailer";



export const sendEmail = async(options) => {
    if (!process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP credentials are not configured");
    }

    const transporter = nodemailer.createTransport({

        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        auth: {

            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
            
        },
        tls: {rejectUnauthorized: false},

    });
    const mailOptions = {

        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message


    }
    await transporter.sendMail(mailOptions);
    await transporter.close();

}
