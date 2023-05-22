$(document).ready(async function() {
    $(".results-modal").hide();
    $(".notification-modal").hide();
  
    ZOHO.embeddedApp.on("PageLoad", async function(data) {
       

    // Hide results modal

        // hide the pick lists
        $('.input-container-outer').hide();
        
        // hide the submit button
        $('.confirm-btn').hide();
        getCarriers();

        // declare variables
        let file;
        let fileName;
        let fileType;

        $(document).on('dragover', function(e) {
            changeDropText(e);
        });
        $(document).on('drop', function(e) {
            fileObj = processDroppedFile(e);
            fileName = fileObj.fileName;
            file = fileObj.file;
            fileType = fileObj.fileType;
            $('.confirm-btn').fadeIn();
            $('.input-container-outer').fadeIn();
        });

        $('.button').click(function() {
            selectFile();
            $('.input-container-outer').fadeIn();
        })

        $("#fileInput").change(async function(e) {
            fileObj = processSelectedFile(e);
            fileName = fileObj.fileName;
            file = fileObj.file;
            fileType = fileObj.fileType;
            $('.confirm-btn').fadeIn();
        });

        // Submit/Confirm button
        $(".confirm-btn").click(function() {
            let check = missingField();
            
            if (check == true){
                parseFile(file, fileName, fileType);
            }
        });

        // Close modal button
        $(".close-modal-btn").click(function() {
            resetFields();
        });

    })
    ZOHO.embeddedApp.init();
});