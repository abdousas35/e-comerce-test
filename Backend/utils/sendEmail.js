import { BrevoClient } from "@getbrevo/brevo";

export const sendEmail = async (options) => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("Brevo API key is not configured");
    }

    console.log("SENDER EMAIL USED:", process.env.SMTP_MAIL);

    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

    await client.transactionalEmails.sendTransacEmail({
        sender: { email: process.env.SMTP_MAIL, name: "Shop Easy" },
        to: [{ email: options.email }],
        subject: options.subject,
        textContent: options.message,
    });
};