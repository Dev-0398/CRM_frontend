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

      const result = await response.json();

      if (result.status === "error") {
        alert(result.msg || "Failed to fetch data");
        console.error("GET Error:", result);
        return null;
      }

      return result.response;
    } catch (error: any) {
      alert("Error fetching data: " + error.message);
      console.error("GET Exception:", error);
      return null;
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

      const result = await response.json();

      if (result.status === "error") {
        alert(result.msg || "Failed to create data");
        console.error("POST Error:", result);
        return null;
      }

      alert(result.msg || "Data successfully created!");
      return result.response;
    } catch (error: any) {
      alert("Error creating data: " + error.message);
      console.error("POST Exception:", error);
      return null;
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

      const result = await response.json();

      if (result.status === "error") {
        alert(result.msg || "Failed to update data");
        console.error("PATCH Error:", result);
        return null;
      }

      alert(result.msg || "Data successfully updated!");
      return result.response;
    } catch (error: any) {
      alert("Error updating data: " + error.message);
      console.error("PATCH Exception:", error);
      return null;
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

      const result = await response.json();

      if (result.status === "error") {
        alert(result.msg || "Failed to delete data");
        console.error("DELETE Error:", result);
        return false;
      }

      alert(result.msg || "Data successfully deleted!");
      return true;
    } catch (error: any) {
      alert("Error deleting data: " + error.message);
      console.error("DELETE Exception:", error);
      return false;
    }
  }
}
