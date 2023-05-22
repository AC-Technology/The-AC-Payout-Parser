function notification(type, message) {
    $(".notification-modal").removeClass("animate__fadeOutRight");
    $(".notification-modal").addClass("animate__fadeInRight")
    switch (type) {
        case "success":
            $(".notification-modal").removeClass("warning-modal");
            $(".notification-modal").removeClass("error-modal");
            $(".notification-modal").addClass("success-modal");
            $(".notification-modal-message").text(message);
            break;
        case "warning":
            $(".notification-modal").removeClass("success-modal");
            $(".notification-modal").removeClass("error-modal");
            $(".notification-modal").addClass("warning-modal");
            $(".notification-modal-message").text(message);
            break;
        case "error":
            $(".notification-modal").removeClass("warning-modal");
            $(".notification-modal").removeClass("success-modal");
            $(".notification-modal").addClass("error-modal");
            $(".notification-modal-message").text(message);
    }
    $(".notification-modal").show()
    setTimeout(function() {
        $(".notification-modal").addClass("animate__fadeOutRight");
    }, 2000);
    $(".notification-modal-close").click(function() {
        $(".notification-modal").fadeOut();
    });
}

function missingField(){
    if($("#insurance_carrier").val()=='None'){
        alert('Enter Insurance Carrier');
        return false;
    }

    else if($("#payout_type").val()=='None'){
        alert('Enter Payout Type');
        return false;
    }

    else{
        return true;
    }
}