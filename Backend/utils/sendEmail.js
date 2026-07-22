import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export const sendEmail = async (options) => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("Brevo API key is not configured");
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: process.env.SMTP_MAIL, name: "Your Store Name" };
    sendSmtpEmail.to = [{ email: options.email }];
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.textContent = options.message;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
};