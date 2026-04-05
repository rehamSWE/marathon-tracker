function start() {
  let name = document.getElementById("name").value.trim();
  let phone = document.getElementById("phone").value.trim();

  // تحقق الاسم
  if (name === "" || name.length < 3) {
    alert("الاسم يجب ان يحتوي على الأقل 3 حروف");
    return;
  }

  // يمنع الأرقام في الاسم
  if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(name)) {
    alert("الاسم يجب ان يحتوي على حروف فقط");
    return;
  }

  // تحقق رقم الجوال (تفصيلي 🔥)
  if (phone === "") {
    alert("الرجاء إدخال رقم الجوال");
    return;
  }

  if (phone.length < 10) {
    alert("رقم الجوال ناقص");
    return;
  }

  if (phone.length > 10) {
    alert("رقم الجوال زائد");
    return;
  }

  if (!phone.startsWith("05")) {
    alert("رقم الجوال يجب ان يبدأ بـ 05");
    return;
  }

  if (!/^\d+$/.test(phone)) {
    alert("رقم الجوال يجب أن يحتوي على أرقام فقط");
    return;
  }

  // حفظ البيانات
  localStorage.setItem("name", name);
  localStorage.setItem("phone", phone);

  // تسجيل وقت البداية ⏱️ (ضد التلاعب)
  localStorage.setItem("startTime", Date.now());

  // الانتقال
  window.location.href = "counter.html";
}
