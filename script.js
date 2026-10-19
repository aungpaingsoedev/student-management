/*
  script.js - Student Information and Course Management System
  Prepared with AI assistance (Grok Bot). This must be acknowledged
  according to the lecturer's AI-use policy.

  Contents:
   1. Data (course array, student array)
   2. localStorage helpers
   3. Course Catalogue functions
   4. Registration form + validation
   5. Student Records functions
   6. Event listeners (start-up)
*/

/* ===================== 1. DATA ===================== */

// Array of course objects. Each object has name, code, description, duration (months), credits.
const courses = [
  { name: "Web Development Fundamentals", code: "WEB101", description: "Learn HTML, CSS and basic JavaScript to build websites.", duration: 3, credits: 3 },
  { name: "JavaScript Programming", code: "JS201", description: "Variables, functions, arrays, objects, DOM and events.", duration: 4, credits: 4 },
  { name: "Database Systems", code: "DB210", description: "Relational databases, SQL queries and data design.", duration: 4, credits: 3 },
  { name: "UI/UX Design", code: "UX150", description: "Design user-friendly interfaces and prototypes.", duration: 2, credits: 2 },
  { name: "Networking Basics", code: "NET120", description: "Computer networks, IP addressing and the internet.", duration: 3, credits: 3 },
  { name: "Python for Beginners", code: "PY110", description: "Introduction to programming using Python.", duration: 6, credits: 4 }
];

// Sample students used when nothing is saved yet (each student is an object).
const sampleStudents = [
  { id: "S001", name: "Aung Aung", email: "aungaung@example.com", gender: "Male", course: "WEB101", skills: ["HTML", "CSS"] },
  { id: "S002", name: "Su Su", email: "susu@example.com", gender: "Female", course: "JS201", skills: ["JavaScript"] },
  { id: "S003", name: "Kyaw Kyaw", email: "kyawkyaw@example.com", gender: "Male", course: "DB210", skills: ["Database", "Design"] }
];

const STORAGE_KEY = "scms_students";

// Main array that holds all student objects.
let students = loadStudents();

/* ===================== 2. LOCALSTORAGE ===================== */
/*
  Purpose: localStorage keeps the student list in the browser so records are
  still there after the page is refreshed or the browser is reopened.
  Limits: data is saved only in THIS browser on THIS computer (not shared),
  it is stored as plain text (not secure), the size limit is about 5 MB, and
  it is lost if the user clears browser data.
*/

// Load students from localStorage. Returns an array (sample data if nothing saved).
function loadStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn("Saved data was broken, using sample data.");
    }
  }
  return sampleStudents.slice(); // copy of the sample array
}

// Save the current students array into localStorage as a JSON string.
function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

/* ===================== 3. COURSE CATALOGUE ===================== */

// Find a course object by its code. Returns the object, or null if not found.
function findCourseByCode(code) {
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].code === code) {
      return courses[i];
    }
  }
  return null;
}

// Fill the course dropdown in the registration form from the courses array.
function populateCourseDropdown() {
  const select = document.getElementById("course");
  courses.forEach(function (course) {
    const option = document.createElement("option");
    option.value = course.code;
    option.textContent = course.code + " - " + course.name;
    select.appendChild(option);
  });
}

// Check if a course matches the search text and the duration filter. Returns true/false.
function courseMatches(course, searchText, durationType) {
  const text = searchText.toLowerCase();
  const matchesText = course.name.toLowerCase().includes(text) || course.code.toLowerCase().includes(text);

  let matchesDuration;
  if (durationType === "short") {
    matchesDuration = course.duration <= 3;
  } else if (durationType === "long") {
    matchesDuration = course.duration > 3;
  } else {
    matchesDuration = true; // "all"
  }
  return matchesText && matchesDuration;
}

// Draw course cards on the page. Uses current search box and filter values.
function renderCourses() {
  const list = document.getElementById("courseList");
  const message = document.getElementById("courseMessage");
  const searchText = document.getElementById("courseSearch").value.trim();
  const durationType = document.getElementById("durationFilter").value;

  list.innerHTML = "";
  let shown = 0;

  courses.forEach(function (course) {
    if (courseMatches(course, searchText, durationType)) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML =
        "<h3>" + course.name + "</h3>" +
        '<p class="code">' + course.code + "</p>" +
        "<p>" + course.description + "</p>" +
        '<p class="meta">Duration: ' + course.duration + " months | Credits: " + course.credits + "</p>";
      list.appendChild(card);
      shown++;
    }
  });

  message.textContent = shown === 0 ? "No matching course found." : "";
}

/* ===================== 4. REGISTRATION FORM ===================== */

// Simple email check using a regular expression. Returns true if valid.
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return pattern.test(email);
}

// Check if a Student ID already exists (case-insensitive). Returns true/false.
function isDuplicateId(id) {
  for (let i = 0; i < students.length; i++) {
    if (students[i].id.toLowerCase() === id.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// Show an error message under a field and add the red border.
function showError(fieldId, message) {
  document.getElementById(fieldId + "Error").textContent = message;
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.add("invalid");
  }
}

// Remove all error messages and red borders from the form.
function clearErrors() {
  const errors = document.querySelectorAll(".error");
  errors.forEach(function (el) {
    el.textContent = "";
  });
  document.querySelectorAll(".invalid").forEach(function (el) {
    el.classList.remove("invalid");
  });
}

// Read all values from the form and return them as one student object.
function getFormData() {
  const genderInput = document.querySelector('input[name="gender"]:checked');
  const skillInputs = document.querySelectorAll('input[name="skills"]:checked');
  const skills = [];
  skillInputs.forEach(function (box) {
    skills.push(box.value);
  });

  return {
    id: document.getElementById("studentId").value.trim().toUpperCase(),
    name: document.getElementById("studentName").value.trim(),
    email: document.getElementById("email").value.trim().toLowerCase(),
    gender: genderInput ? genderInput.value : "",
    course: document.getElementById("course").value,
    skills: skills
  };
}

// Validate a student object. Shows errors and returns true only if everything is valid.
function validateStudent(student) {
  let isValid = true;

  if (student.id === "") {
    showError("studentId", "Student ID is required.");
    isValid = false;
  } else if (student.id.length < 3) {
    showError("studentId", "Student ID must be at least 3 characters.");
    isValid = false;
  } else if (isDuplicateId(student.id)) {
    showError("studentId", "This Student ID already exists.");
    isValid = false;
  }

  if (student.name === "") {
    showError("studentName", "Student name is required.");
    isValid = false;
  } else if (student.name.length < 2) {
    showError("studentName", "Name must be at least 2 characters.");
    isValid = false;
  }

  if (student.email === "") {
    showError("email", "Email is required.");
    isValid = false;
  } else if (!isValidEmail(student.email)) {
    showError("email", "Please enter a valid email (e.g. name@example.com).");
    isValid = false;
  }

  if (student.gender === "") {
    showError("gender", "Please choose a gender.");
    isValid = false;
  }

  if (student.course === "") {
    showError("course", "Please select a course.");
    isValid = false;
  }

  return isValid;
}

// Show a success or fail message below the form.
function showFormMessage(text, type) {
  const message = document.getElementById("formMessage");
  message.textContent = text;
  message.className = "form-message " + type;
}

// Runs when the form is submitted.
function handleRegistration(event) {
  event.preventDefault(); // stop the page from reloading
  clearErrors();

  const student = getFormData();

  if (validateStudent(student)) {
    students.push(student);
    saveStudents();
    renderRecords();
    updateStats();
    showFormMessage("Student " + student.name + " (" + student.id + ") registered successfully!", "success");
    event.target.reset();
  } else {
    showFormMessage("Please fix the errors above and try again.", "fail");
  }
}

/* ===================== 5. STUDENT RECORDS ===================== */

// Return only the students whose ID or name contains the search text.
function filterStudents(searchText) {
  const text = searchText.trim().toLowerCase();
  if (text === "") {
    return students;
  }
  return students.filter(function (student) {
    return student.id.toLowerCase().includes(text) || student.name.toLowerCase().includes(text);
  });
}

// Draw the student table using the current search text.
function renderRecords() {
  const body = document.getElementById("recordsBody");
  const message = document.getElementById("recordMessage");
  const searchText = document.getElementById("recordSearch").value;
  const list = filterStudents(searchText);

  body.innerHTML = "";

  if (list.length === 0) {
    message.textContent = "No matching record found.";
    return;
  }
  message.textContent = "";

  for (const student of list) {
    const course = findCourseByCode(student.course);
    const courseName = course ? course.name : student.course;
    const skillsText = student.skills.length > 0 ? student.skills.join(", ") : "-";

    const row = document.createElement("tr");
    row.innerHTML =
      "<td>" + student.id + "</td>" +
      "<td>" + student.name + "</td>" +
      "<td>" + student.email + "</td>" +
      "<td>" + student.gender + "</td>" +
      "<td>" + courseName + "</td>" +
      "<td>" + skillsText + "</td>" +
      '<td><button class="btn btn-delete" data-id="' + student.id + '">Delete</button></td>';
    body.appendChild(row);
  }
}

// Delete a student by ID after asking for confirmation.
function deleteStudent(id) {
  if (!confirm("Delete student " + id + "?")) {
    return;
  }
  students = students.filter(function (student) {
    return student.id !== id;
  });
  saveStudents();
  renderRecords();
  updateStats();
}

// Update the number of courses and students on the home page.
function updateStats() {
  document.getElementById("courseCount").textContent = courses.length;
  document.getElementById("studentCount").textContent = students.length;
}

/* ===================== 6. EVENT LISTENERS ===================== */

// Start the app once the HTML has loaded.
document.addEventListener("DOMContentLoaded", function () {
  populateCourseDropdown();
  renderCourses();
  renderRecords();
  updateStats();

  // Form submit and reset
  const form = document.getElementById("registrationForm");
  form.addEventListener("submit", handleRegistration);
  // Clear errors when the form is reset (also runs after a successful submit).
  form.addEventListener("reset", function () {
    clearErrors();
  });
  // Clear the status message only when the user clicks the Reset button.
  form.querySelector('button[type="reset"]').addEventListener("click", function () {
    showFormMessage("", "");
  });

  // Remove a field's error as soon as the user types or changes it
  form.addEventListener("input", function (event) {
    event.target.classList.remove("invalid");
  });

  // Course search (typing) and filter (changing the dropdown)
  document.getElementById("courseSearch").addEventListener("input", renderCourses);
  document.getElementById("durationFilter").addEventListener("change", renderCourses);

  // Student records search
  document.getElementById("recordSearch").addEventListener("input", renderRecords);

  // Delete buttons (one listener on the table body handles every row)
  document.getElementById("recordsBody").addEventListener("click", function (event) {
    if (event.target.classList.contains("btn-delete")) {
      deleteStudent(event.target.getAttribute("data-id"));
    }
  });

  // Mobile menu toggle
  const navLinks = document.getElementById("navLinks");
  document.getElementById("menuToggle").addEventListener("click", function () {
    navLinks.classList.toggle("show");
  });
  // Close the mobile menu after clicking a link
  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("show");
    });
  });
});
