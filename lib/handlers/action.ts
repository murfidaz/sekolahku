"use server";

import { auth } from "@/auth";
import { Session } from "next-auth";
import { ZodError, ZodSchema } from "zod";
import { UnauthorizedError, ValidationError } from "../http-errors";

/**
 * @template T - tipe parameter yang akan diterima oleh action
 */
type ActionOptions<T> = {
  /** Parameter yang akan digunakan dalam action. */
  params?: T;

  /** Skema validasi menggunakan Zod. */
  schema?: ZodSchema<T>;

  /** Menentukan apakah action memerlukan otorisasi. Default: `false`. */
  authorize?: boolean;
};

/**
 * digunakan untuk proses pemanggilan server action pada nextjs
 * @template T - tipe parameter yang akan digunakan dalam action
 * @param param {ActionOptions<T>} options - konfigurasi action
 * @returns
 */
async function action<T>({
  params,
  schema,
  authorize = false,
}: ActionOptions<T>) {
  // jika schema & params ada isinya maka lakukan pengecekan
  if (schema && params) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>
        );
      } else {
        return new Error("Schema validation failed");
      }
    }
  }

  let sessions: Session | null = null;

  // jika action tersebut perlu autentikasi maka lakukan pengecekan
  if (authorize) {
    sessions = await auth();

    if (!sessions) {
      return new UnauthorizedError();
    }
  }

  // proses lainnya sepertik koneksi database dll

  return { params, sessions };
}

export default action;
