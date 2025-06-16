import configs from "@/config"

const BASE_URL = configs.API_BASE_URL;

/**
 * ApiService handles HTTP requests to the backend API with authorization support.
 */
export default class ApiService {
  private token: string;
  private tokenType: string;

  /**
   * Initializes the ApiService instance.
   * @param token - The authentication token to be used in requests.
   * @param tokenType - The type of token used in the Authorization header. Default is "Bearer".
   */
  constructor(token: string, tokenType: string = "Bearer") {
    this.token = token;
    this.tokenType = tokenType;
  }

  /**
   * Returns the headers required for authenticated API requests.
   * @returns An object containing Content-Type and Authorization headers.
   */
  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "Authorization": `${this.tokenType} ${this.token}`,
    };
  }

  /**
   * Sends a GET request to the specified endpoint.
   * @param endpoint - API endpoint to fetch data from (e.g., "/users").
   * @returns The parsed JSON response if successful.
   * @throws Error if the request fails or response indicates an error.
   */
  async get(endpoint: string) {
    try {
      console.log(`[ApiService][GET] ${BASE_URL}${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: this.headers(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const result = await response.json();
        if (result.status === "error") {
          throw new Error(result.msg || "Failed to fetch data");
        }
        return result;
      }

      return null;
    } catch (error: any) {
      console.error("GET Exception:", error);
      throw error;
    }
  }

  /**
   * Sends a POST request to the specified endpoint with a JSON body.
   * @param endpoint - API endpoint to send data to (e.g., "/users").
   * @param body - The data to be sent in the request body.
   * @returns The parsed JSON response or success message.
   * @throws Error if the request fails or response indicates an error.
   */
  async post(endpoint: string, body: object) {
    try {
      console.log(`[ApiService][POST] ${BASE_URL}${endpoint}`, body);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const result = await response.json();
        if (result.status === "error") {
          throw new Error(result.msg || "Failed to create data");
        }
        return result.data || result;
      }

      return { msg: "Data created successfully" };
    } catch (error: any) {
      console.error("POST Exception:", error);
      throw error;
    }
  }

  /**
   * Sends a PATCH request to update data at the specified endpoint.
   * @param endpoint - API endpoint to update data at (e.g., "/users/1").
   * @param body - The partial data to update.
   * @returns The parsed JSON response or success message.
   * @throws Error if the request fails or response indicates an error.
   */
  async patch(endpoint: string, body: object) {
    try {
      console.log(`[ApiService][PATCH] ${BASE_URL}${endpoint}`, body);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: this.headers(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const result = await response.json();
        if (result.status === "error") {
          throw new Error(result.msg || "Failed to update data");
        }
        return result.data || result;
      }

      return { msg: "Data updated successfully" };
    } catch (error: any) {
      console.error("PATCH Exception:", error);
      throw error;
    }
  }

  /**
   * Sends a DELETE request to the specified endpoint.
   * @param endpoint - API endpoint to delete data from (e.g., "/users/1").
   * @returns True if deletion is successful.
   * @throws Error if the request fails or response indicates an error.
   */
  async delete(endpoint: string) {
    try {
      console.log(`[ApiService][DELETE] ${BASE_URL}${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: this.headers(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const result = await response.json();
        if (result.status === "error") {
          throw new Error(result.msg || "Failed to delete data");
        }
        return true;
      }

      return true;
    } catch (error: any) {
      console.error("DELETE Exception:", error);
      throw error;
    }
  }
}
