import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.SECRET_KEY;
export async function startSession(userId: number) {
  const token = jwt.sign(
    {
      data: userId,
    },
    SECRET_KEY,
    { expiresIn: 1000 * 60 * 60 * 2 }
  );

  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: false,
    expires: 1000 * 60 * 60 * 2,
  });

  return token;
}
