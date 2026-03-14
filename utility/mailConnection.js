const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {

    await resend.emails.send({
      from: "PrintNest <onboarding@resend.dev>",
      to,
      subject,
      html
    });

    return true;

  } catch (error) {
    console.log("EMAIL ERROR", error);
    return false;
  }
};

module.exports = sendEmail;
