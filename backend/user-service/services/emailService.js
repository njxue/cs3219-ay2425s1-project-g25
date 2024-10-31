import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  const emailOptions = { from: process.env.SMTP_USER, to, subject, text, html };
  try {
    const res = await transporter.sendMail(emailOptions);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
