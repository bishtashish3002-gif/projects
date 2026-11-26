(() => {
  const $ = (selector) => document.querySelector(selector);
  const profileForm = $("#profile-form"), status = $("#profile-status");
  const initials = (name) => (name || "S").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  function showPhoto(data) {
    const image = $("#profile-photo-preview"), fallback = $("#profile-initials");
    if (data) { image.src = data; image.hidden = false; fallback.hidden = true; }
    else { image.hidden = true; fallback.hidden = false; }
  }
  function fill(profile) {
    HubStore.set("profile", profile);
    $("#profile-name").value = profile.name || "";
    $("#profile-email").value = profile.email || "";
    $("#profile-dob").value = profile.dateOfBirth || "";
    $("#profile-age").value = profile.age ?? "";
    $("#profile-school").value = profile.school || "";
    $("#profile-program").value = profile.program || "";
    $("#profile-year").value = profile.studyYear || "";
    $("#profile-phone").value = profile.phone || "";
    $("#profile-initials").textContent = initials(profile.name);
    showPhoto(profile.photoData);
    $("#phone-status").textContent = profile.phoneVerified ? "Phone number verified." : "No verified phone number yet.";
    window.updateHubHeader?.(profile);
  }
  HubStore.api("/profile").then(({ profile }) => fill(profile)).catch((error) => { status.textContent = error.message; });
  $("#profile-dob").addEventListener("change", (event) => {
    const date = event.currentTarget.value ? new Date(`${event.currentTarget.value}T00:00:00`) : null;
    let age = date ? new Date().getFullYear() - date.getFullYear() : "";
    if (date && new Date().getMonth() * 100 + new Date().getDate() < date.getMonth() * 100 + date.getDate()) age--;
    $("#profile-age").value = age < 0 ? "" : age;
  });
  $("#profile-photo").addEventListener("change", (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) { status.textContent = "Choose a photo smaller than 500 KB."; event.currentTarget.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => showPhoto(reader.result);
    reader.readAsDataURL(file);
  });
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault(); status.textContent = "Saving…";
    try {
      const image = $("#profile-photo-preview");
      const { profile } = await HubStore.api("/profile", { method: "PUT", body: JSON.stringify({ name: $("#profile-name").value, dateOfBirth: $("#profile-dob").value, school: $("#profile-school").value, program: $("#profile-program").value, studyYear: $("#profile-year").value, ...(image.hidden ? {} : { photoData: image.src }) }) });
      fill(profile); const user = HubStore.get("user", {}); user.name = profile.name; HubStore.set("user", user); document.querySelectorAll("[data-user-name]").forEach((el) => el.textContent = profile.name); status.textContent = "Profile saved.";
    } catch (error) { status.textContent = error.message; }
  });
  $("#phone-form").addEventListener("submit", async (event) => {
    event.preventDefault(); const message = $("#phone-status"); message.textContent = "Sending…";
    try { const result = await HubStore.api("/profile/phone/request-verification", { method: "POST", body: JSON.stringify({ phone: $("#profile-phone").value, password: $("#phone-password").value }) }); message.textContent = result.message; $("#phone-code-form").hidden = false; }
    catch (error) { message.textContent = error.message; }
  });
  $("#phone-code-form").addEventListener("submit", async (event) => {
    event.preventDefault(); const message = $("#phone-status");
    try { const result = await HubStore.api("/profile/phone/verify", { method: "POST", body: JSON.stringify({ code: $("#phone-code").value }) }); message.textContent = result.message; $("#phone-code-form").hidden = true; }
    catch (error) { message.textContent = error.message; }
  });
  $("#password-otp-form").addEventListener("submit", async (event) => {
    event.preventDefault(); const message = $("#password-status"); message.textContent = "Sending…";
    try { const result = await HubStore.api("/profile/otp/request", { method: "POST", body: JSON.stringify({ channel: $("#otp-channel").value, password: $("#current-password").value }) }); message.textContent = result.message; $("#password-change-form").hidden = false; }
    catch (error) { message.textContent = error.message; }
  });
  $("#password-change-form").addEventListener("submit", async (event) => {
    event.preventDefault(); const message = $("#password-status"); message.textContent = "Updating password…";
    try { const result = await HubStore.api("/profile/password/change", { method: "POST", body: JSON.stringify({ code: $("#password-code").value, newPassword: $("#new-password").value }) }); localStorage.setItem("studentHub.token", result.token); HubStore.set("user", result.user); message.textContent = result.message; $("#password-change-form").hidden = true; $("#current-password").value = ""; $("#new-password").value = ""; $("#password-code").value = ""; }
    catch (error) { message.textContent = error.message; }
  });
})();
