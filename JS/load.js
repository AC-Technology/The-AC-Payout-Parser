

// Pick list pulls carriers from AC Carrier Report
const getCarriers = async () => {
    let data = await ZOHO.CRM.META.getFields({ "Entity": "Carrier_Reports" });
    let carrierArray = [];
  
    let carrierObject = data.fields.find(field => field.api_name === "Carrier");
    let values = carrierObject.pick_list_values;
  
    // Get previous selected carrier value
    let previousCarrierValue = $("#insurance_carrier").val();
  
    // Clear existing options in the picklist
    const selectElement = document.getElementById("insurance_carrier");
    selectElement.innerHTML = "";
  
    // Add new options to the picklist
    for (let i = 0; i < values.length; i++) {
      carrierArray.push(values[i].display_value);
    }
  
    carrierArray.forEach(carrier => {
      const optionElement = document.createElement("option");
      optionElement.value = carrier;
      optionElement.textContent = carrier;
      selectElement.appendChild(optionElement);
    });
  
    // Set selected carrier value to previous selection (if it exists)
    if (previousCarrierValue) {
      $("#insurance_carrier").val(previousCarrierValue);
    }
  
    carrierName = $("#insurance_carrier").val();
  
    return carrierName;
  }
  


// Pick list pull from AC Carrier Report
const getPayoutType = async () => {

    let payoutType = $("#payout_type").val();

    console.log("Below is the Payout Type from load")
    console.log(carrierName)

    return payoutType;

}