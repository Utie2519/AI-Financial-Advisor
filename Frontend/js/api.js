const BASE_URL = "http://localhost:3000";

async function apiCall(url, method = "GET", body = null) {

    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
    };

    // Attach JWT Token
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {

        const res = await fetch(BASE_URL + url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        const data = await res.json();

        // Handle Unauthorized / Token Expired
        if (res.status === 401 || res.status === 403) {

            localStorage.removeItem("token");

            alert("Session expired. Please login again.");

            window.location.href = "/login.html";

            return null;
        }

        // Handle Other Errors
        if (!res.ok) {

            console.error("API ERROR:", data);

            throw new Error(data.message || "Something went wrong");
        }

        return data;

    } catch (error) {

        console.error("NETWORK/API ERROR:", error.message);

        alert(error.message);

        return null;
    }
}

/* ===========================
   Logout Function
=========================== */

function logout() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    // Remove stored JWT token
    localStorage.removeItem("token");

    // Clear other stored data if any
    // localStorage.clear();

    alert("Logged out successfully.");

    // Redirect to Login Page
    window.location.href = "/login.html";
}