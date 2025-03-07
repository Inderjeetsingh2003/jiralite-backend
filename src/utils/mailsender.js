import { transport } from "../config/nodemailer.config.js";

export const sendmail = async (token, messageToSend, email, invitationUrl) => {
  try {
    const info = await transport.sendMail({
      from: "rahulsocialpilot@gmail.com",
      to: email,
      subject: "get access as a member",
      html: `<h1>${messageToSend}</h1><a href=${invitationUrl}?token=${token}>  click here to join</a>`,
    });

    return { success: true, message: "user invite successfully" };
  } catch (error) {
    return { success: false, message: "unable to send the mail" };
  }
};

export const sendMailToInform = async (messageToSend, email) => {
  try {
    const info = await transport.sendMail({
      from: "rahulsocialpilot@gmail.com",
      to: email,
      subject: "get access as a member",
      html: `<h1>${messageToSend}</h1>`,
    });

    return { success: true, message: "user invite successfully" };
  } catch (error) {
    return { success: false, message: "unable to send the mail" };
  }
};
