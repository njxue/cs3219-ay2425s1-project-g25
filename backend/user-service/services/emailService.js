import nodemailer from "nodemailer";
import { emailOptions } from "../config/emailConfig";

const transporter = nodemailer.createTransport({
  host: emailOptions.smtp_host,
  port: emailOptions.smtp_port,
  auth: {
    user: emailOptions.user,
    pass: emailOptions.password,
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
  const emailOptions = { from: emailOptions.user, to, subject, text, html };
  try {
    await transporter.sendMail(emailOptions);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
