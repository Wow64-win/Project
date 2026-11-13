let students = JSON.parse(localStorage.getItem("registeredStudents")) || [];
let attendanceRecords = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

let lastRegisteredStudent = null;


function saveData() {
    localStorage.setItem("registeredStudents", JSON.stringify(students));
    localStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords));
}



document.getElementById("registrationForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const studentNumber = document.getElementById("studentNumber").value.trim();
    const email = document.getElementById("email").value.trim();
    const course = document.getElementById("course").value.trim();
    const yearLevel = document.getElementById("yearLevel").value;

    
    if (!name || !studentNumber || !email || !course || !yearLevel) {
        alert("Please complete all fields.");
        return;
    }

    
    const duplicateStudentNumber = students.some(student =>
        student.studentID.toLowerCase() === studentNumber.toLowerCase()
    );

    if (duplicateStudentNumber) {
        alert("This student number is already registered.");
        return;
    }

    
    const duplicateEmail = students.some(student =>
        student.email.toLowerCase() === email.toLowerCase()
    );

    if (duplicateEmail) {
        alert("This email address is already registered.");
        return;
    }

    
    const studentID = studentNumber;

    
    const newStudent = {
        studentID: studentID,
        name: name,
        email: email,
        course: course,
        yearLevel: yearLevel
    };

    
    students.push(newStudent);
    saveData();

    lastRegisteredStudent = newStudent;

    
    generateQRCode(newStudent);

    
    this.reset();

    updateDashboard();

    alert("Student successfully registered!");
});



function generateQRCode(student) {

    document.getElementById("qrSection").style.display = "block";

    document.getElementById("qrcode").innerHTML = "";

    const qrData = "STUDENT|" + student.studentID;

    new QRCode(document.getElementById("qrcode"), {
        text: qrData,
        width: 200,
        height: 200
    });

    document.getElementById("qrStudentInfo").innerHTML =
        "<strong>Name:</strong> " + student.name +
        "<br><strong>Student Number:</strong> " + student.studentID;
}



document.getElementById("downloadQR").addEventListener("click", function() {

    const qrCanvas = document.querySelector("#qrcode canvas");
    const qrImage = document.querySelector("#qrcode img");

    let imageURL;

    if (qrCanvas) {
        imageURL = qrCanvas.toDataURL("image/png");
    } else if (qrImage) {
        imageURL = qrImage.src;
    } else {
        alert("QR Code is not available.");
        return;
    }

    const downloadLink = document.createElement("a");

    downloadLink.href = imageURL;
    downloadLink.download = "Student_QR_Code.png";

    downloadLink.click();
});

















function onScanSuccess(decodedText) {

    const resultElement = document.getElementById("scanResult");

    if (!decodedText.startsWith("STUDENT|")) {
        resultElement.textContent = "Invalid QR Code.";
        return;
    }

    
    const studentID = decodedText.replace("STUDENT|", "").trim();

    
    const student = students.find(student =>
        student.studentID === studentID
    );

    if (!student) {
        resultElement.textContent = "Student is not registered.";
        return;
    }

    
    const now = new Date();

    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    
    const alreadyPresent = attendanceRecords.some(record =>
        record.studentID === studentID &&
        record.date === date
    );

    if (alreadyPresent) {
        resultElement.textContent =
            student.name + " is already marked present today.";
        return;
    }


    const attendance = {
        studentID: student.studentID,
        name: student.name,
        course: student.course,
        date: date,
        time: time,
        status: "Present"
    };

    attendanceRecords.push(attendance);

    saveData();

    resultElement.textContent =
        "Attendance recorded successfully for " + student.name + "!";

    updateDashboard();
}



const html5QrCode = new Html5Qrcode("reader");

Html5Qrcode.getCameras().then(cameras => {

    if (cameras && cameras.length) {

        html5QrCode.start(
            cameras[0].id,
            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            },
            onScanSuccess
        ).catch(error => {
            document.getElementById("scanResult").textContent =
                "Unable to start camera: " + error;
        });

    } else {
        document.getElementById("scanResult").textContent =
            "No camera found.";
    }

}).catch(error => {
    document.getElementById("scanResult").textContent =
        "Camera access error. Please allow camera permission.";
});



function updateDashboard() {

    const today = new Date().toLocaleDateString();

    
    document.getElementById("totalStudents").textContent =
        students.length;

    
    const presentToday = attendanceRecords.filter(record =>
        record.date === today
    ).length;

    document.getElementById("presentToday").textContent =
        presentToday;

    displayAttendance(attendanceRecords);
}



function displayAttendance(records) {

    const table = document.getElementById("attendanceTable");

    table.innerHTML = "";

    records.forEach(record => {

        const row = document.createElement("tr");

        const values = [
            record.studentID,
            record.name,
            record.course,
            record.date,
            record.time,
            record.status
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}



document.getElementById("searchInput").addEventListener("input", function() {

    const searchValue = this.value.toLowerCase();

    const filteredRecords = attendanceRecords.filter(record =>

        record.studentID.toLowerCase().includes(searchValue) ||
        record.name.toLowerCase().includes(searchValue) ||
        record.course.toLowerCase().includes(searchValue)

    );

    displayAttendance(filteredRecords);
});



updateDashboard();
