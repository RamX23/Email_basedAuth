import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter using Gmail's SMTP settings
const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user:process.env.ADMIN_MAIL, 
        pass: process.env.ADMIN_PASS,
    },
	host: 'smtp.gmail.com',
    port: 587,
    secure: false,
});

export const sendVerificationEmail = async (toEmail, verificationToken) => {
    try {
        const mailOptions = {
            from: process.env.ADMIN_MAIL, 
            to: toEmail,                  
            subject: "Verify Your Email", 
            text: `Please use the following verification code: ${verificationToken}`, 
            html: `<p>Please use the following verification code: <strong>${verificationToken}</strong></p>`, 
        };

        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export const sendPasswordResetMaill=async(toEmail,PasswordResetToken)=>{
    try{
        const mailOptions = {
            from: process.env.ADMIN_MAIL, 
            to: toEmail,                  
            subject: "Reset File Manager Password", 
            text: `Please use the following verification`, 
            html: `<p>You requested to reset your password. Please click the link below to reset it:</p>
            <a href="${PasswordResetToken}">Reset Your Password</a>
            <p>If you did not request this, please ignore this email.</p>`, 
        };
        await transporter.sendMail(mailOptions)
        console.log("Passsword reset mail sent successfully.");
    }
    catch(error){
      console.error("Error Sending Password reset mail",error);
    }
    };


export const sendResetSuccessEmail=async(toEmail,PasswordResetToken)=>{
    try{
        const mailOptions = {
            from: process.env.ADMIN_MAIL, 
            to: toEmail,                  
            subject: "Password Reset successful", 
            text: `You'r Password successfully updated`, 
            html: `<p>Your password has been successfully updated.</p>`,
        };
        await transporter.sendMail(mailOptions)
        console.log("Passsword reset mail sent successfully.");
    }
    
    catch(error){
      console.error("Error Sending Password reset mail",error);
    }
}


