const BASE_URL = "http://127.0.0.1:8000";

export default class ApiService {
  static async get(endpoint: string) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.msg || `HTTP error! status: ${response.status}`);
        }
        if (result.status === "error") {
          console.error("GET Error:", result);
          throw new Error(result.msg || "Failed to fetch data");
        }
        return result.response;
      } else {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return null;
      }
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

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.msg || `HTTP error! status: ${response.status}`);
        }
        if (result.status === "error") {
          console.error("POST Error:", result);
          throw new Error(result.msg || "Failed to create data");
        }
        return result.response;
      } else {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return { msg: "Data created successfully" };
      }
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

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.msg || `HTTP error! status: ${response.status}`);
        }
        if (result.status === "error") {
          console.error("PATCH Error:", result);
          throw new Error(result.msg || "Failed to update data");
        }
        return result;
      } else {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return { msg: "Data updated successfully" };
      }
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

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.msg || `HTTP error! status: ${response.status}`);
        }
        if (result.status === "error") {
          console.error("DELETE Error:", result);
          throw new Error(result.msg || "Failed to delete data");
        }
        return true;
      } else {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
      }
    } catch (error: any) {
      console.error("DELETE Exception:", error);
      throw error;
    }
  }
}
