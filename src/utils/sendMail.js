import nodemailer from 'nodemailer';

export const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP connection established successfully');
  } catch (error) {
    console.error('Error establishing SMTP connection:', error);
    throw new Error('SMTP connection failed');
  }

  return await transporter.sendMail(options);
};
