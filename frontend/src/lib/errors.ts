export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

export interface ValidationError extends Error {
  field?: string;
  value?: unknown;
}

export class HttpError extends Error implements ApiError {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error
  );
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

export function getErrorMessage(error: unknown): string {
  if (isHttpError(error)) {
    return error.message;
  }

  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
}

export function getErrorStatus(error: unknown): number {
  if (isHttpError(error)) {
    return error.status;
  }

  if (isApiError(error)) {
    return error.status;
  }

  return 500;
}

export function handleApiError(error: unknown): { message: string; status: number } {
  const status = getErrorStatus(error);
  let message = getErrorMessage(error);

  switch (status) {
    case 400:
      message = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.";
      break;
    case 401:
      message = "Bạn cần đăng nhập để thực hiện hành động này.";
      break;
    case 403:
      message = "Bạn không có quyền thực hiện hành động này.";
      break;
    case 404:
      message = "Không tìm thấy dữ liệu yêu cầu.";
      break;
    case 409:
      message = "Dữ liệu đã tồn tại hoặc xung đột với dữ liệu hiện tại.";
      break;
    case 500:
      message = "Lỗi máy chủ. Vui lòng thử lại sau.";
      break;
  }

  return { message, status };
}
