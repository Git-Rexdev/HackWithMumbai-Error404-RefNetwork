// utils/email.js
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';


const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables");
    throw new Error("Email credentials not set in .env");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS  
    },
  });

  const handlebarOptions = {
    viewEngine: {
      extName: '.hbs',
      partialsDir: path.resolve('./views/email/'),
      layoutsDir: path.resolve('./views/email/'),
      defaultLayout: '',
    },
    viewPath: path.resolve('./views/email/'),
    extName: '.hbs',
  };

  transporter.use('compile', hbs(handlebarOptions));
  return transporter;
};

/**
 * Sends an email with provided options.
 * @param {Object} mailOptions 
 */
export const sendEmail = async (mailOptions) => {
  const transporter = createTransporter();
  try {
    const info = await transporter.sendMail({
      from: `"Referral Portal" <${process.env.EMAIL_USER}>`,
      ...mailOptions
    });
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email failed:", error.message);
    throw error;
  }
};
