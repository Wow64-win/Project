// 1. Load Student Database from browser storage, or start with default samples
let studentDatabase = JSON.parse(localStorage.getItem('cvsu_student_db')) || {
    "261010001": { name: "Juan Dela Cruz", program: "BS Information Technology" },
    "261010002": { name: "Maria Santos", program: "BS Computer Science" }
};

const attendanceLogData = [];
const attendanceRecordsSet = new Set();

// Handle New Student Registration Form
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let id = document.getElementById('newId').value.trim();
    let name = document.getElementById('newName').value.trim();
    let program = document.getElementById('newProgram').value.trim();

    // Validate prefix
    if (!id.startsWith("26101")) {
        alert("Registration Failed: Student ID must start with 26101.");
        return;
    }

    // Save into database object
    studentDatabase[id] = { name: name, program: program };

    // Save permanently into browser memory (localStorage)
    localStorage.setItem('cvsu_student_db', JSON.stringify(studentDatabase));

    alert(`Successfully registered ${name} (${id})!`);
    
    // Clear registration inputs
    document.getElementById('newId').value = '';
    document.getElementById('newName').value = '';
    document.getElementById('newProgram').value = '';
});

// Function to handle logging attendance
function markAttendance(studentId) {
    let id = studentId.trim();
    if (!id) return;

    // Rule check: Must start with 26101
    if (!id.startsWith("26101")) {
        alert(`Access Denied: "${id}" is not a valid CvSU Main Indang ID (Must start with 26101).`);
        return;
    }

    // Check if student is registered in the database
    if (!studentDatabase[id]) {
        alert(`Access Denied: ID "${id}" is not registered in the system yet. Please register this student first using the form below.`);
        return;
    }

    // Check if already checked in today
    if (attendanceRecordsSet.has(id)) {
        alert(`Student ID ${id} is already checked in today!`);
        return;
    }

    let studentInfo = studentDatabase[id];
    attendanceRecordsSet.add(id);
    
    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();

    // Store log item for export
    attendanceLogData.push({
        id: id,
        name: studentInfo.name,
        program: studentInfo.program,
        time: `${currentDate} ${currentTime}`
    });

    const tbody = document.getElementById('logTableBody');
    if (attendanceRecordsSet.size === 1) {
        tbody.innerHTML = ''; // Remove placeholder
    }

    // Add row to UI table
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${id}</strong></td>
        <td>${studentInfo.name}</td>
        <td>${studentInfo.program}</td>
        <td>${currentTime}</td>
    `;
    tbody.prepend(row);
}

// Export Logs to Organized Text File
function exportLogsToText() {
    if (attendanceLogData.length === 0) {
        alert("No attendance logs available to export yet.");
        return;
    }

    let fileContent = "=========================================\r\n";
    fileContent += " CvSU MAIN (INDANG) ATTENDANCE REPORT     \r\n";
    fileContent += ` Date Generated: ${new Date().toLocaleString()}\r\n`;
    fileContent += "=========================================\r\n\r\n";

    attendanceLogData.forEach((log, index) => {
        fileContent += `[${index + 1}] ID: ${log.id}\r\n`;
        fileContent += `    Name: ${log.name}\r\n`;
        fileContent += `    Program: ${log.program}\r\n`;
        fileContent += `    Timestamp: ${log.time}\r\n`;
        fileContent += "-----------------------------------------\r\n";
    });

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CvSU_Attendance_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Form Submission Handler for Attendance
document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputField = document.getElementById('studentIdInput');
    markAttendance(inputField.value);
    inputField.value = '';
});

// QR Code Scanner Handlers
function onScanSuccess(decodedText, decodedResult) {
    markAttendance(decodedText);
}

function onScanFailure(error) {
    // Silent ignore during active scanning frames
}

let html5QrCode = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: 250 },
    false
);
html5QrCode.render(onScanSuccess, onScanFailure);