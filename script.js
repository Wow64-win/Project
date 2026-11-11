
const attendanceRecords = new Set();


function markAttendance(studentId) {
    id = studentId.trim();
    if (!id) return;

    
    if (attendanceRecords.has(id)) {
        alert(`Student ID ${id} is already checked in!`);
        return;
    }

   
    attendanceRecords.add(id);

    
    const currentTime = new Date().toLocaleTimeString();

    const tbody = document.getElementById('logTableBody');

    
    if (attendanceRecords.size === 1) {
        tbody.innerHTML = '';
    }

    



    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${id}</strong></td>
        <td>${currentTime}</td>
        <td><span class="status-badge">Present</span></td>
    `;
    tbody.prepend(row); 
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
    /* verbose= */ false
);

html5QrCode.render(onScanSuccess, onScanFailure);