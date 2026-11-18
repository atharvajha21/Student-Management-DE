/**
 * Student Management System - Frontend Controller
 * Uses Vanilla JavaScript & Fetch API to communicate with Express.js backend.
 */

// Global State Cache
let allStudents = [];
let allCourses = [];
let allEnrollments = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadDashboard();

  // Set default dates to today
  const today = new Date().toISOString().split('T')[0];
  const attendDateInput = document.getElementById('attend-date-input');
  const enrollDateInput = document.getElementById('enroll-date-input');
  if (attendDateInput) attendDateInput.value = today;
  if (enrollDateInput) enrollDateInput.value = today;
});

// -----------------------------------------------------------------------------
// NAVIGATION TABS
// -----------------------------------------------------------------------------
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update button active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update view sections
      document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
      const activeSection = document.getElementById(`view-${targetTab}`);
      if (activeSection) activeSection.classList.add('active');

      // Load section data
      if (targetTab === 'dashboard') loadDashboard();
      if (targetTab === 'students') loadStudents();
      if (targetTab === 'courses') loadCourses();
      if (targetTab === 'enrollments') loadEnrollments();
      if (targetTab === 'attendance') loadAttendance();
    });
  });
}

// -----------------------------------------------------------------------------
// TOAST NOTIFICATIONS
// -----------------------------------------------------------------------------
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// -----------------------------------------------------------------------------
// 1. DASHBOARD CONTROLLER
// -----------------------------------------------------------------------------
async function loadDashboard() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const result = await res.json();

    if (result.status === 'success') {
      const data = result.data;
      document.getElementById('stat-students').innerText = data.totalStudents;
      document.getElementById('stat-courses').innerText = data.totalCourses;
      document.getElementById('stat-enrollments').innerText = data.totalEnrollments;
      document.getElementById('stat-attendance').innerText = data.totalAttendance;

      const recentTableBody = document.getElementById('recent-enrollments-body');
      if (data.recentEnrollments.length === 0) {
        recentTableBody.innerHTML = '<tr><td colspan="3" class="text-center">No recent enrollments logged.</td></tr>';
      } else {
        recentTableBody.innerHTML = data.recentEnrollments.map(e => `
          <tr>
            <td><strong>${escapeHtml(e.student.name)}</strong></td>
            <td><span class="badge badge-dept">${escapeHtml(e.student.department)}</span></td>
            <td>${escapeHtml(e.course.course_code)} — ${escapeHtml(e.course.course_name)}</td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    showToast('Failed to load dashboard metrics.', 'error');
  }
}

// -----------------------------------------------------------------------------
// 2. STUDENTS CONTROLLER
// -----------------------------------------------------------------------------
async function loadStudents() {
  try {
    const res = await fetch('/api/students');
    const result = await res.json();
    if (result.status === 'success') {
      allStudents = result.data;
      renderStudentsTable(allStudents);
    }
  } catch (err) {
    showToast('Failed to fetch students from database.', 'error');
  }
}

function renderStudentsTable(students) {
  const tbody = document.getElementById('students-table-body');
  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No students found in database.</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(s => `
    <tr>
      <td>#${s.student_id}</td>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.phone || '—')}</td>
      <td><span class="badge badge-dept">${escapeHtml(s.department)}</span></td>
      <td><span class="badge" style="background:#e0e7ff; color:#3730a3;">${s._count?.enrollments || 0} enrolled</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openEditStudentModal(${s.student_id})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteStudent(${s.student_id}, '${escapeHtml(s.name)}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function filterStudents() {
  const search = document.getElementById('student-search-input').value.toLowerCase().trim();
  const dept = document.getElementById('student-dept-filter').value;

  const filtered = allStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search);
    const matchDept = dept === '' || s.department === dept;
    return matchSearch && matchDept;
  });

  renderStudentsTable(filtered);
}

function openAddStudentModal() {
  document.getElementById('student-modal-title').innerText = 'Add New Student';
  document.getElementById('student-form').reset();
  document.getElementById('student-id-field').value = '';
  document.getElementById('student-modal').classList.add('active');
}

function openEditStudentModal(id) {
  const student = allStudents.find(s => s.student_id === id);
  if (!student) return;

  document.getElementById('student-modal-title').innerText = `Edit Student #${student.student_id}`;
  document.getElementById('student-id-field').value = student.student_id;
  document.getElementById('student-name-field').value = student.name;
  document.getElementById('student-email-field').value = student.email;
  document.getElementById('student-phone-field').value = student.phone || '';
  document.getElementById('student-dept-field').value = student.department;
  document.getElementById('student-modal').classList.add('active');
}

function closeStudentModal() {
  document.getElementById('student-modal').classList.remove('active');
}

async function handleSaveStudent(event) {
  event.preventDefault();
  const id = document.getElementById('student-id-field').value;
  const name = document.getElementById('student-name-field').value;
  const email = document.getElementById('student-email-field').value;
  const phone = document.getElementById('student-phone-field').value;
  const department = document.getElementById('student-dept-field').value;

  const payload = { name, email, phone, department };

  try {
    const isEdit = Boolean(id);
    const url = isEdit ? `/api/students/${id}` : '/api/students';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok) {
      showToast(result.message || 'Student saved successfully!', 'success');
      closeStudentModal();
      loadStudents();
      loadDashboard();
    } else {
      showToast(result.message || 'Operation failed.', 'error');
    }
  } catch (err) {
    showToast('Network error while saving student.', 'error');
  }
}

async function handleDeleteStudent(id, name) {
  if (!confirm(`Are you sure you want to delete student #${id} (${name})?\n\nNOTE: This will CASCADE delete all their enrollments and attendance records due to referential integrity!`)) {
    return;
  }

  try {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok) {
      showToast(result.message || 'Student deleted successfully.', 'success');
      loadStudents();
      loadDashboard();
    } else {
      showToast(result.message || 'Failed to delete student.', 'error');
    }
  } catch (err) {
    showToast('Network error while deleting student.', 'error');
  }
}

// -----------------------------------------------------------------------------
// 3. COURSES CONTROLLER
// -----------------------------------------------------------------------------
async function loadCourses() {
  try {
    const res = await fetch('/api/courses');
    const result = await res.json();
    if (result.status === 'success') {
      allCourses = result.data;
      renderCoursesTable(allCourses);
    }
  } catch (err) {
    showToast('Failed to fetch courses.', 'error');
  }
}

function renderCoursesTable(courses) {
  const tbody = document.getElementById('courses-table-body');
  if (courses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No courses configured.</td></tr>';
    return;
  }

  tbody.innerHTML = courses.map(c => `
    <tr>
      <td>#${c.course_id}</td>
      <td><strong><code>${escapeHtml(c.course_code)}</code></strong></td>
      <td>${escapeHtml(c.course_name)}</td>
      <td><span class="badge" style="background:#fef3c7; color:#92400e;">${c.credits} Credits</span></td>
      <td>${c._count?.enrollments || 0} students</td>
    </tr>
  `).join('');
}

async function handleCreateCourse(event) {
  event.preventDefault();
  const course_name = document.getElementById('course-name-input').value;
  const course_code = document.getElementById('course-code-input').value;
  const credits = document.getElementById('course-credits-input').value;

  try {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_name, course_code, credits })
    });

    const result = await res.json();
    if (res.ok) {
      showToast('Course added successfully!', 'success');
      document.getElementById('add-course-form').reset();
      loadCourses();
      loadDashboard();
    } else {
      showToast(result.message || 'Failed to add course.', 'error');
    }
  } catch (err) {
    showToast('Error saving course.', 'error');
  }
}

// -----------------------------------------------------------------------------
// 4. ENROLLMENTS CONTROLLER
// -----------------------------------------------------------------------------
async function loadEnrollments() {
  try {
    // Also refresh dropdown options
    const [enrRes, stdRes, crsRes] = await Promise.all([
      fetch('/api/enrollments'),
      fetch('/api/students'),
      fetch('/api/courses')
    ]);

    const enrData = await enrRes.json();
    const stdData = await stdRes.json();
    const crsData = await crsRes.json();

    if (stdData.status === 'success') {
      allStudents = stdData.data;
      const studentSelect = document.getElementById('enroll-student-select');
      studentSelect.innerHTML = '<option value="">-- Choose Student --</option>' +
        allStudents.map(s => `<option value="${s.student_id}">#${s.student_id}: ${escapeHtml(s.name)} (${escapeHtml(s.department)})</option>`).join('');
    }

    if (crsData.status === 'success') {
      allCourses = crsData.data;
      const courseSelect = document.getElementById('enroll-course-select');
      courseSelect.innerHTML = '<option value="">-- Choose Course --</option>' +
        allCourses.map(c => `<option value="${c.course_id}">[${escapeHtml(c.course_code)}] ${escapeHtml(c.course_name)} (${c.credits} credits)</option>`).join('');
    }

    if (enrData.status === 'success') {
      allEnrollments = enrData.data;
      renderEnrollmentsTable(allEnrollments);
    }
  } catch (err) {
    showToast('Failed to load enrollments data.', 'error');
  }
}

function renderEnrollmentsTable(enrollments) {
  const tbody = document.getElementById('enrollments-table-body');
  if (enrollments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No active enrollments recorded.</td></tr>';
    return;
  }

  tbody.innerHTML = enrollments.map(e => `
    <tr>
      <td>#${e.enrollment_id}</td>
      <td><strong>${escapeHtml(e.student.name)}</strong></td>
      <td><span class="badge badge-dept">${escapeHtml(e.student.department)}</span></td>
      <td><code>${escapeHtml(e.course.course_code)}</code> — ${escapeHtml(e.course.course_name)}</td>
      <td>${formatDate(e.enrollment_date)}</td>
      <td><span class="badge" style="background:#ecfdf5; color:#065f46;">${e._count?.attendances || 0} logs</span></td>
    </tr>
  `).join('');
}

async function handleCreateEnrollment(event) {
  event.preventDefault();
  const student_id = document.getElementById('enroll-student-select').value;
  const course_id = document.getElementById('enroll-course-select').value;
  const enrollment_date = document.getElementById('enroll-date-input').value;

  try {
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, course_id, enrollment_date })
    });

    const result = await res.json();
    if (res.ok) {
      showToast('Student enrolled successfully!', 'success');
      document.getElementById('enroll-form').reset();
      loadEnrollments();
      loadDashboard();
    } else {
      showToast(result.message || 'Enrollment failed.', 'error');
    }
  } catch (err) {
    showToast('Network error while processing enrollment.', 'error');
  }
}

// -----------------------------------------------------------------------------
// 5. ATTENDANCE CONTROLLER
// -----------------------------------------------------------------------------
async function loadAttendance() {
  try {
    // Populate active enrollments dropdown
    const enrRes = await fetch('/api/enrollments');
    const enrData = await enrRes.json();
    if (enrData.status === 'success') {
      allEnrollments = enrData.data;
      const select = document.getElementById('attend-enrollment-select');
      select.innerHTML = '<option value="">-- Choose Active Enrollment --</option>' +
        allEnrollments.map(e => `
          <option value="${e.enrollment_id}">
            #${e.enrollment_id}: ${escapeHtml(e.student.name)} in ${escapeHtml(e.course.course_code)}
          </option>
        `).join('');
    }

    // Fetch attendance log history
    const statusFilter = document.getElementById('attend-status-filter')?.value || '';
    const url = statusFilter ? `/api/attendance?status=${statusFilter}` : '/api/attendance';
    const res = await fetch(url);
    const result = await res.json();

    if (result.status === 'success') {
      renderAttendanceTable(result.data);
    }
  } catch (err) {
    showToast('Failed to load attendance logs.', 'error');
  }
}

function renderAttendanceTable(logs) {
  const tbody = document.getElementById('attendance-table-body');
  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No attendance logs found.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(l => {
    const isPresent = l.status === 'Present';
    const badgeClass = isPresent ? 'badge-present' : 'badge-absent';
    const icon = isPresent ? '🟢' : '🔴';
    return `
      <tr>
        <td>#${l.attendance_id}</td>
        <td><strong>${formatDate(l.attendance_date)}</strong></td>
        <td>${escapeHtml(l.enrollment.student.name)}</td>
        <td><code>${escapeHtml(l.enrollment.course.course_code)}</code></td>
        <td><span class="badge ${badgeClass}">${icon} ${l.status}</span></td>
      </tr>
    `;
  }).join('');
}

async function handleRecordAttendance(event) {
  event.preventDefault();
  const enrollment_id = document.getElementById('attend-enrollment-select').value;
  const attendance_date = document.getElementById('attend-date-input').value;
  const status = document.getElementById('attend-status-select').value;

  try {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollment_id, attendance_date, status })
    });

    const result = await res.json();
    if (res.ok) {
      showToast('Attendance recorded successfully!', 'success');
      loadAttendance();
      loadDashboard();
    } else {
      showToast(result.message || 'Failed to record attendance.', 'error');
    }
  } catch (err) {
    showToast('Network error while logging attendance.', 'error');
  }
}

// -----------------------------------------------------------------------------
// UTILITIES
// -----------------------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
