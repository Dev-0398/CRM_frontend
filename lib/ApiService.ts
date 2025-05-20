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

      if (!response.ok) throw new Error(`GET failed: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      alert("Error fetching data: " + error.message);
      console.error("GET Error:", error);
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

      if (!response.ok) throw new Error(`POST failed: ${response.status}`);
      const data = await response.json();
      alert("Data successfully created!");
      return data;
    } catch (error) {
      alert("Error creating data: " + error.message);
      console.error("POST Error:", error);
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

      if (!response.ok) throw new Error(`PATCH failed: ${response.status}`);
      const data = await response.json();
      alert("Data successfully updated!");
      return data;
    } catch (error) {
      alert("Error updating data: " + error.message);
      console.error("PATCH Error:", error);
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

      if (!response.ok) throw new Error(`DELETE failed: ${response.status}`);
      alert("Data successfully deleted!");
      return true;
    } catch (error) {
      alert("Error deleting data: " + error.message);
      console.error("DELETE Error:", error);
      return false;
    }
  }
}
