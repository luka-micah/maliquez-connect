class ApiResponse {
  statusCode: number;
  data: unknown;
  message: string;
  success: boolean;

  constructor(statusCode: number, data: unknown, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success(data: unknown, message = 'Success'): ApiResponse {
    return new ApiResponse(200, data, message);
  }

  static created(data: unknown, message = 'Created successfully'): ApiResponse {
    return new ApiResponse(201, data, message);
  }

  static paginated(data: unknown, pagination: Record<string, unknown>): Record<string, unknown> {
    return {
      success: true,
      data,
      pagination,
      message: 'Success',
    };
  }
}

export default ApiResponse;
