// Functions

function changeDropText(event) {
    // prevent default action
    event.preventDefault();
    // change drop text when user is dragging file over the screen
    $(".header1").text("Drop Here");
}

function selectFile() {
    $("#fileInput").trigger("click");
}

// Process the file that was dropped 
function processDroppedFile(e) {
    console.log(e)
    e.preventDefault();
    let file = e.originalEvent.dataTransfer.files[0];
    let fileName = e.originalEvent.dataTransfer.files[0].name;
    $(".header1").text("File Uploaded");
    $(".button").text(file.name);
    console.log(file)
    if (!fileName.includes(".csv")) {
        notification('error', 'Please ensure the file is a CSV file')
        resetFields()
        return;
    }
    let fileType;
    return {
        fileName,
        file,
        fileType
    };
}

// Process the file that was selected through the browser
function processSelectedFile(e) {
    console.log(e)
    e.preventDefault();
    let fileName = e.target.files[0].name;
    let file = e.target.files[0];
    $(".header1").text("File Uploaded");
    $(".button").text(file.name);
    if (!fileName.includes(".csv")) {
        notification('error', 'Please ensure the file is a CSV file')
        resetFields()
        return;
    }
    let fileType;
    return {
        fileName,
        file,
        fileType
    };
}