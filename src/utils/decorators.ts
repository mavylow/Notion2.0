import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

type IHandler<T> = (
  request: NextRequest,
  validatedData: T,
  cxt: any
) => Promise<NextResponse> | NextResponse;

export function withValidation<T>(schema: ZodSchema<T>, handler: IHandler<T>) {
  return async function (request: NextRequest, cxt: any) {
    try {
      if (!request) {
        return;
      }
      const reqBody = await request.json();
      const validatedData = schema.parse(reqBody);

      return await handler(request, validatedData, cxt);
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(e);
        return NextResponse.json(
          { error: "Validation error", message: e.message },
          { status: 400 }
        );
      }
      console.log(e);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
