import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("Resend API key is not configured");
    }

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: options.email,
        subject: options.subject,
        text: options.message,
    });
};