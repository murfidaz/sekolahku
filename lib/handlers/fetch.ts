import { ActionResponse } from "@/types/global";
import { RequestError } from "../http-errors";
import logger from "../logger";
import handleError from "./error";

/**
 * opsi untuk digunakan ketika pengambilan data
 */
interface fetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * pengecekan apakah error benar benar error
 * @param error
 * @returns
 */
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * digunakan untuk pengambilan data menggunakan http fetch,
 * dengan content-type: application/json
 * dan timeout default 5000ms
 * @param url
 * @param options
 */
export async function fetchHandler<T>(
  url: string,
  options: fetchOptions = {}
): Promise<ActionResponse<T>> {
  const {
    timeout = 5000,
    headers: customerHeaders = {},
    ...restOptions
  } = options;

  // buatkan controller beserta idnya yang akan digunakan untuk timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  // pembuatan variable headers
  const defaultHeaders: HeadersInit = {
    "Content-Type": "aplication/json",
    Accept: "application/json",
  };
  const headers: HeadersInit = { ...defaultHeaders, ...customerHeaders };
  const config: RequestInit = {
    ...restOptions,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);

    clearTimeout(id);

    if (!response.ok) {
      throw new RequestError(response.status, `HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    const error = isError(err) ? err : new Error("Unknown error");

    if (error.name === "AbortError") {
      logger.warn(`Request to ${url} time out`);
    } else {
      logger.error(`Error fetching ${url}: ${error.message}`);
    }
    return handleError(error) as ActionResponse<T>;
  }
}
