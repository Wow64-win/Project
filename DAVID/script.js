function switchTab(tabName) {
    const homePage = document.getElementById('homePage');
    const aboutPage = document.getElementById('aboutPage');
    const navHome = document.getElementById('navHome');
    const navAbout = document.getElementById('navAbout');

    if (tabName === 'home') {
        homePage.classList.add('active-page');
        aboutPage.classList.remove('active-page');
        navHome.classList.add('active');
        navAbout.classList.remove('active');
    } else if (tabName === 'about') {
        aboutPage.classList.add('active-page');
        homePage.classList.remove('active-page');
        navAbout.classList.add('active');
        navHome.classList.remove('active');
    }
}

let studentDatabase = JSON.parse(localStorage.getItem('cvsu_student_db')) || {
    "261010001": { name: "Juan Dela Cruz", program: "BS Information Technology" },
    "261010002": { name: "Maria Santos", program: "BS Computer Science" }
};

const attendanceLogData = [];
const attendanceRecordsSet = new Set();

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let id = document.getElementById('newId').value.trim();
    let name = document.getElementById('newName').value.trim();
    let program = document.getElementById('newProgram').value.trim();

    if (!id.startsWith("26101")) {
        alert("Registration Failed: Student ID must start with 26101.");
        return;
    }

    studentDatabase[id] = { name: name, program: program };
    localStorage.setItem('cvsu_student_db', JSON.stringify(studentDatabase));

    alert(`Successfully registered student: ${name} (${id})`);
    
    document.getElementById('newId').value = '';
    document.getElementById('newName').value = '';
    document.getElementById('newProgram').value = '';
});

function markAttendance(studentId) {
    let id = studentId.trim();
    if (!id) return;

    if (!id.startsWith("26101")) {
        alert(`Access Denied: "${id}" is not a valid CvSU Main Indang ID. Must start with 26101.`);
        return;
    }

    if (!studentDatabase[id]) {
        alert(`Access Denied: ID "${id}" is not registered in the system database. Please register this student first.`);
        return;
    }

    if (attendanceRecordsSet.has(id)) {
        alert(`Notice: Student ID ${id} is already checked in today!`);
        return;
    }

    let studentInfo = studentDatabase[id];
    attendanceRecordsSet.add(id);
    
    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();

    attendanceLogData.push({
        id: id,
        name: studentInfo.name,
        program: studentInfo.program,
        time: `${currentDate} ${currentTime}`
    });

    const tbody = document.getElementById('logTableBody');
    if (attendanceRecordsSet.size === 1) {
        tbody.innerHTML = '';
    }

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${id}</strong></td>
        <td>${studentInfo.name}</td>
        <td>${studentInfo.program}</td>
        <td>${currentTime}</td>
    `;
    tbody.prepend(row);
}

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
    link.download = `CvSU_Attendance_Report_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputField = document.getElementById('studentIdInput');
    markAttendance(inputField.value);
    inputField.value = '';
});

function onScanSuccess(decodedText, decodedResult) {
    markAttendance(decodedText);
}

function onScanFailure(error) {
}

let html5QrCode = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: 250 },
    false
);
html5QrCode.render(onScanSuccess, onScanFailure);
