import { sendVerificationEmail } from "@/helpers/sendEmail";
import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { Message } from "../../../model/User";
export async function POST(request: Request) {
  await dbConnection();
  try {
    const { username, email, password } = await request.json();
    const existingUserVerfiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerfiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken!",
        },
        { status: 400 }
      );
    }
    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(10000 * Math.random() * 90000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exist with this email!",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = bcrypt.hash(password, 10);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const user = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: Array<Message>,
      });
      await user.save();

      //send verification email
      const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
      );
      if (!emailResponse.success) {
        return Response.json(
          {
            success: false,
            message: emailResponse.message,
          },
          { status: 500 }
        );
      }
      return Response.json(
        {
          success: true,
          message: "User registered successfully. Please verify your email!",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error registering user!", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user!",
      },
      { status: 500 }
    );
  }
}
