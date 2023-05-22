function resetFields(){
    $(".confirm-btn").hide()
    $(".results-modal").fadeOut();
    $(".button").text("Browse");
    $('.input-container-outer').hide();
    $('#insurance_carrier').val('-Select-');
    $('#payout_type').val('-Select-');
}