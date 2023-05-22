async function parseFile(file, fileName) {
    // Show the result modal
    $(".results-modal").fadeIn()
    $(".results-text").text('Your file is being uploaded!')
    $(".loading-gif").fadeIn()
    $(".close-modal-btn").hide()

    try {
        // Parse the csv file
        Papa.parse(file, {
            download: false,
            header: true,
            complete: async function (results) {
                let array = results['data']
                array = array.map(obj => {
                    // Remove extra spaces from object keys and values
                    Object.keys(obj).forEach(key => obj[key.trim()] = obj[key].trim());
                    return obj;
                });

                // Set up outer scope variables
                let total_amount = 0;
                let reportID,firstTotalReportID;
                let length = array.length;
                let recordCount;

                // Loop through array
                for (let i = 0; i < array.length - 1; i++) {
                    // Change loading text
                    $(".loading-text").text(`Uploading payout for`)

                    // Set up variables
                    let account_id, contact_id

                    // Fix the payout amount
                    let start_Amount = array[i]["Amount"].replace('$', '')
                    let Amount = Number(start_Amount.replace(/[^0-9.-]+/g, ""));

                    // Store Name 
                    let Name = array[i]["Nickname"];

                    // Change loading text
                    $(".loading-text").text(`Uploading payout for ${Name}...(${i + 1}/${length - 1})`)

                    // Store Bank Number 
                    let Bank_Number = array[i]["Account Number"];

                    // Store Carrier Name and type from memo
                    let CarrierMemo = array[i]["Memo"]

                    // Store AC_Account_Number 
                    let AC_Account_Number = array[i]["Unique Identifier"];
                    // Store Bank Type 
                    let Bank_Type = array[i]["Account Type"];

                    // Total up the amounts for the total payout report
                    total_amount += Amount

                    // Store & Fix the Date
                    let date = array[i]["Date"];
                    let yourDate = new Date(date);
                    let datePaid = yourDate.toISOString().split('T')[0];

                    // Gets the carrier name from picklist
                    let carrierName = await getCarriers();

                    // Gets the payout type from picklist
                    let payoutType = await getPayoutType();

                    // This name will be used at the report name
                    let report_name = Name + ' - ' + datePaid + ' - ' + carrierName + ' - ' + payoutType;

                    // On the first iteration, create the Total Payout Report
                    if (i == 0) {

                        // This the the total payout report's name
                        let totalPayoutName = 'Total Payout Report - ' + datePaid + ' - ' + carrierName + ' - ' + payoutType;

                        // Search for how many records there are with the same starting name 
                        const searchResponse = await ZOHO.CRM.API.searchRecord({
                            Entity: 'Total_Payout_Reports',
                            Type: "criteria",
                            Query: "Name:starts_with:" + totalPayoutName
                        });
                        
                        try {
                            // Store the number of same starting name records if there are any
                            recordCount = searchResponse.data.length;
                            firstTotalReportID = searchResponse.data[0].id;
                        } catch (error) {
                            // If there are not any records under that name then have count at 0
                            recordCount = 0;
                        }
                        
                        if (recordCount == 1) {
                            // If there is already one record under the Total Payout Reports, call the update first total payout report function
                            await updateReports(firstTotalReportID, totalPayoutName, recordCount, datePaid, carrierName, payoutType);
                            // update the total payout name with the count of total payout reports with this name (including this creation)
                            totalPayoutName = totalPayoutName + " " + (recordCount + 1);
                        }
                        else if (recordCount > 1){
                            // If there are more than 1 report under the Total Payout Reports.
                            // update the total payout name with the count of total payout reports with this name
                            totalPayoutName = totalPayoutName + " " + (recordCount + 1);
                        }
                         

                        // Create a Total Payout Report
                        reportID = await createTotalReport(totalPayoutName,datePaid,carrierName,payoutType);
                        await attachFileToRecord(reportID, file, fileName);
                    }

                    // Query search for the contact
                    contact_id = await searchContactRecord(Name);

                    // Query search for the account
                    account_id = await searchAccountRecord(AC_Account_Number);

                    // If Contact ID is undefined make it empty
                    if (typeof contact_id == 'undefined') {
                        contact_id = '';
                    }

                    // If Account ID is undefined make it empty
                    if (typeof account_id == 'undefined') {
                        account_id = '';
                    }

                    // If record count is 0 then keep the name the same and don't add the counter number
                    if (recordCount == 0){
                        report_name = report_name;
                    }
                    else{
                        // If the count is not 0 then add the counter to the report name + ' ' + (recordCount+1).toString();
                        report_name = report_name 
                    }

                    request_body = {
                        // Update the name to include the counter to the name
                        "Name": report_name,
                        "Amount": Amount,
                        "Total_Payout_Report_Name": reportID,
                        "Date_Paid": datePaid,
                        "Carrier": CarrierMemo,
                        "Bank_Number": Bank_Number,
                        "Bank_Type": Bank_Type,
                        "AC_Account_Number": AC_Account_Number,
                        "Contact": contact_id,
                        "Account": account_id,
                        "Payout_Type": payoutType,
                    }

                    await ZOHO.CRM.API.insertRecord({ Entity: "Payouts", APIData: request_body, Trigger: ["workflow"] });
                }
                // After the for loop is done, update the Total Payout Report
                total_amount = total_amount.toFixed(2);

                let updated_body = {
                    "id": reportID,
                    "Total_Amount": total_amount
                };

                try {
                    let updated_response = await ZOHO.CRM.API.updateRecord({ Entity: "Total_Payout_Reports", APIData: updated_body, Trigger: ["workflow"] });
                    $(".results-text").text("Thank you");
                    $(".loading-gif").fadeOut();
                    $(".loading-text").fadeIn();
                    $(".loading-text").text("Your file has been uploaded successfully.");
                    $(".close-modal-btn").fadeIn();

                } catch (error) {
                    console.log('There is a problem with the updated_response');
                    console.log(error);
                }
            }
        })

    } catch (error) {
        console.log("error in the payout submit");
        console.log("error");
    }
}

// This function creates a total payout report
async function createTotalReport(totalPayoutName,datePaid,CarrierMemo,payoutType){
    let request_body = {
        "Name": totalPayoutName,
        "Date_Paid": datePaid,
        "Carrier": CarrierMemo,
        "Payout_Type": payoutType,
    };

    // Insert the record
    let carrier_response = await ZOHO.CRM.API.insertRecord({ Entity: "Total_Payout_Reports", APIData: request_body, Trigger: ["workflow"] });

    // If the response returns success store the report id
    if (carrier_response.data[0].code == "SUCCESS") {
        // Store the Total Payout Report ID
        reportID = carrier_response['data'][0]['details']['id'];
    }

    return reportID
}
  

// This function updates the first total payout report and payout reports
async function updateReports(firstTotalReportID, totalPayoutName, recordCount, datePaid, carrierName, payoutType) {
    try {
      // Update the first total payout record's name
      let request_body = {
        "id": firstTotalReportID,
        "Name": totalPayoutName + " " + recordCount
      };
    
      // Send API request to Zoho to update the total payout report record
      await ZOHO.CRM.API.updateRecord({ Entity: "Total_Payout_Reports", APIData: request_body, Trigger: ["workflow"] });
    
    //   // Search for all the payout reports with the same date, carrier, and payoutType
    //   let response = await ZOHO.CRM.API.searchRecord({ Entity: "Payouts", Type: "word", Query: datePaid + ' - ' + carrierName + ' - ' + payoutType, delay: false });
      
    //   // loop through each report and grab only those records with the correct name
    //   for (let i = 0; i < response.data.length; i++) {
    //     let name = response.data[i]["Name"];
    //     let id = response.data[i]['id'];
        
    //     // Check if the name ends with an integer
    //     if (!/\d$/.test(name)) {
    //         // If it does then update the record to have a 1 at the end
    //         let request_body = {
    //             "Name": name + " 1",
    //             "id": id
    //         };
    //         // Send request to update
    //         await ZOHO.CRM.API.updateRecord({ Entity: "Payouts", APIData: request_body, Trigger: ["workflow"] });
    //     }
    //   }
    } catch (error) {
      console.error(error);
    }
}

// This function searches for the contact 
async function searchContactRecord(Name) {
    let contact_response = await ZOHO.CRM.API.searchRecord({ Entity: "Contacts", Type: "word", Query: Name, delay: false });
    let contact_records = contact_response['data'];
    let contact_id = '';
  
    if (typeof contact_records !== 'undefined') {
      for (let x = 0; x < contact_records.length; x++) {
        if (contact_records[x]["Full_Name"] == Name) {
          let correct_contact_record = contact_records[x];
          contact_id = correct_contact_record['id'];
          break;
        }
      }
    }
  
    return contact_id;
}

// This function searches for the account
async function searchAccountRecord(AC_Account_Number) {
    let account_id = '';
  
    // Search for the account record
    let account_response = await ZOHO.CRM.API.searchRecord({ Entity: "Accounts", Type: "word", Query: AC_Account_Number, delay: false });
    let account_records = account_response['data'];
  
    // If the account cannot be found then set the account id as empty
    if (typeof account_records == 'undefined') {
      account_id = '';
    } else {
      // For loop through account records. if(AC_Account_Number == AC_Account_Number), then you have found the correct account record
      for (let z = 0; z < account_records.length; z++) {
        if (account_records[z]["AC_Account_Number"] == AC_Account_Number) {
          correct_account_record = account_records[z];
  
          // Grab the Account ID
          account_id = (correct_account_record['id']);
        }
      }
    }
  
    return account_id;
}

// Attaches the file to the record using the recordID
async function attachFileToRecord(recordId, file, fileName) {

    console.log("This is the recordId: ",recordId)
    console.log("file: ", file)
    console.log("fileName", fileName)

    let attachResponse = await ZOHO.CRM.API.attachFile({
        Entity: "Total_Payout_Reports",
        RecordID: recordId,
        File: {
            Name: fileName,
            Content: file
        }
    });
    
    // Check if attachment was successful
    if (attachResponse.data[0].code == "SUCCESS") {
        console.log("File attached to record " + recordId);
    } else {
        console.error("Error attaching file to record " + recordId);
    }
}

  