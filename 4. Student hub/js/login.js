const existingUser = HubStore.get("user", null);
if (existingUser && localStorage.getItem("studentHub.token")) location.href = "dashboard.html";
document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.querySelector("#login-name").value.trim(),
    email = document.querySelector("#login-email").value.trim(),
    password = document.querySelector("#login-password").value,
    button = event.currentTarget.querySelector("button");
  button.disabled = true;
  button.textContent = "Signing in…";
  try {
    let response;
    try {
      response = await HubStore.api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      if (!/incorrect/.test(error.message)) throw error;
      response = await HubStore.api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
    }
    localStorage.setItem("studentHub.token", response.token);
    HubStore.set("user", response.user);
    HubStore.clearCachedStudyData();
    await HubStore.loadServerData();
    location.href = "dashboard.html";
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.textContent = "Continue to Student Utility Hub →";
  }
});

