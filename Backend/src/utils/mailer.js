async function sendEmail({ to, subject, text }) {
  const mode = process.env.MAIL_MODE || "console";
  if (mode === "console") {
    console.log("\n--- EMAIL (DEV MODE) ---");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(text);
    console.log("--- END EMAIL ---\n");
    return;
  }
  // You can plug nodemailer later if needed.
  throw new Error("MAIL_MODE not supported in this simple version.");
}

module.exports = { sendEmail };