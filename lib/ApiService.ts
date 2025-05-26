import configs from "@/config"
const BASE_URL = configs.API_BASE_URL;

export default class ApiService {
  static async get(endpoint: string) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
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

  static async post(endpoint: string, body: object) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
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

  static async patch(endpoint: string, body: object) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
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

  static async delete(endpoint: string) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
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
