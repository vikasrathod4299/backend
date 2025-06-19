import { PassThrough } from "stream";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
type SendEmailOptions = {
    from_email?: string;
    to: Array<{ email: string; type: string }>;
    subject: string;
    templateName: string;
    options: any;
};

export const createTemplate = async (templateName: string, data: any) => {
    const templatePath = path.resolve("src/templates", `${templateName}.html`);

    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
    }

    const contentTemplate = fs.readFileSync(templatePath, "utf-8");

    if (!contentTemplate) {
        throw new Error("Template not found");
    }

    const compiledTemplate = Handlebars.compile(contentTemplate);
    const html = compiledTemplate(data);
    return html;
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendEmailWithSMTP = async ({
    from_email,
    to,
    subject,
    templateName,
    options,
}: SendEmailOptions) => {
    try {
        const html = await createTemplate(templateName, options);

        const mailOptions = {
            from: from_email,
            to: to.map((email) => email.email).join(","),
            subject,
            html,
        };

        const res = await transporter.sendMail(mailOptions);
        console.log("Email sent:", res.response);

        return res;
    } catch (error: any) {
        throw new Error(`Error sending email: ${error.message}`);
    }
};

// export const generateBadge = async (userId: string, html: string) => {
//     try {
//         const pdfFileName = `badge-${userId}-${Date.now()}.pdf`;
//         const file = bucket.file(`badges/${pdfFileName}`);

//         const browser = await puppeteer.launch({
//             headless: true,
//             args: ["--no-sandbox", "--disable-setuid-sandbox"],
//         });

//         const page = await browser.newPage();
//         await page.setContent(html, { waitUntil: "networkidle0" });

//         const pdfBuffer = await page.pdf({
//             format: "A5",
//             printBackground: true,
//             margin: { top: "0.5cm", bottom: "0.5cm", left: "0.5cm", right: "0.5cm" },
//         });

//         await browser.close();

//         const passthroughStream = new PassThrough();
//         passthroughStream.end(pdfBuffer);

//         await new Promise<void>((resolve, reject) => {
//             passthroughStream
//                 .pipe(
//                     file.createWriteStream({
//                         metadata: {
//                             contentType: "application/pdf",
//                         },
//                         resumable: false,
//                     })
//                 )
//                 .on("error", reject)
//                 .on("finish", resolve);
//         });

//         await file.makePublic();

//         return file.publicUrl();
//     } catch (error) {
//         throw new Error(
//             `Failed to generate badge: ${error instanceof Error ? error.message : "Unknown error"
//             }`
//         );
//     }
// };

export const generateRandomKey = (length: number) => {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let index = 0; index < length; index++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const createToken = (
    payload: object,
    secret: string,
    expiresIn: string | object
): string => {
    return jwt.sign(payload, secret, expiresIn as any);
};
