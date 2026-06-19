/**
 * Student Enrollment Form Controller
 * Integrates HTML form with JsonPowerDB (JPDB) CRUD operations and state-control workflow.
 */

// Global database defaults
const DEFAULT_BASE_URL = "http://api.login2explore.com:5577";
const DEFAULT_DB_NAME = "SCHOOL-DB";
const DEFAULT_REL_NAME = "STUDENT-TABLE";

// LocalStorage Keys
const TOKEN_KEY = "jpdb_connection_token";
const BASE_URL_KEY = "jpdb_base_url";
const DB_NAME_KEY = "jpdb_db_name";
const REL_NAME_KEY = "jpdb_relation_name";
const REC_NO_KEY = "student_rec_no";

$(document).ready(function () {
    // 1. Initialise Settings from LocalStorage or Defaults
    initializeSettings();

    // 2. Initialise Form State on Page Load
    resetForm();

    // 3. Register Event Listeners
    $("#rollNo").on("blur change", function () {
        checkRollNumber();
    });

    $("#dbSettingsForm").on("submit", function (e) {
        e.preventDefault();
        saveSettings();
    });

    $("#settingsToggleBtn").on("click", function () {
        toggleSettingsPanel();
    });

    // 4. Form Action Buttons
    $("#btnReset").on("click", function () {
        resetForm();
    });

    $("#btnSave").on("click", function () {
        saveStudent();
    });

    $("#btnUpdate").on("click", function () {
        updateStudent();
    });
});

/* =========================================================================
   SETTINGS MANAGEMENT
   ========================================================================= */

function initializeSettings() {
    // Read or set defaults in LocalStorage
    let token = localStorage.getItem(TOKEN_KEY) || "";
    

    
    let baseUrl = localStorage.getItem(BASE_URL_KEY) || DEFAULT_BASE_URL;
    let dbName = localStorage.getItem(DB_NAME_KEY) || DEFAULT_DB_NAME;
    let relName = localStorage.getItem(REL_NAME_KEY) || DEFAULT_REL_NAME;

    // Populate inputs in settings panel
    $("#setConnToken").val(token);
    $("#setBaseUrl").val(baseUrl);
    $("#setDbName").val(dbName);
    $("#setRelName").val(relName);

    // Show warning badge if token is empty
    updateTokenAlertBadge(token);
}

function saveSettings() {
    let token = $("#setConnToken").val().trim();
    let baseUrl = $("#setBaseUrl").val().trim();
    let dbName = $("#setDbName").val().trim();
    let relName = $("#setRelName").val().trim();

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(BASE_URL_KEY, baseUrl);
    localStorage.setItem(DB_NAME_KEY, dbName);
    localStorage.setItem(REL_NAME_KEY, relName);

    updateTokenAlertBadge(token);
    showToast("Database configurations saved successfully!", "success");

    // Collapse settings card
    $("#settingsCollapse").collapse("hide");
    $("#settingsToggleBtn").removeClass("active");
    $(".settings-card").removeClass("expanded");
}

function updateTokenAlertBadge(token) {
    if (!token) {
        $("#tokenAlert").removeClass("d-none");
    } else {
        $("#tokenAlert").addClass("d-none");
    }
}

function toggleSettingsPanel() {
    let btn = $("#settingsToggleBtn");
    let card = $(".settings-card");

    if (btn.hasClass("active")) {
        btn.removeClass("active");
        card.removeClass("expanded");
    } else {
        btn.addClass("active");
        card.addClass("expanded");
    }
}

function getDbConfig() {
    return {
        token: localStorage.getItem(TOKEN_KEY) || $("#setConnToken").val().trim(),
        baseUrl: localStorage.getItem(BASE_URL_KEY) || $("#setBaseUrl").val().trim(),
        dbName: localStorage.getItem(DB_NAME_KEY) || $("#setDbName").val().trim(),
        relName: localStorage.getItem(REL_NAME_KEY) || $("#setRelName").val().trim()
    };
}

/* =========================================================================
   FORM STATE CONTROL WORKFLOW
   ========================================================================= */

/**
 * State 1: Initial State (Page Load / Reset)
 * Clears all values, enables only primary key field, disables buttons (except Reset), focuses rollNo.
 */
function resetForm() {
    // Clear field values
    $("#rollNo").val("");
    $("#fullName").val("");
    $("#studentClass").val("");
    $("#birthDate").val("");
    $("#address").val("");
    $("#enrollmentDate").val("");

    // Enable rollNo
    $("#rollNo").prop("disabled", false);

    // Disable all other fields
    $("#fullName").prop("disabled", true);
    $("#studentClass").prop("disabled", true);
    $("#birthDate").prop("disabled", true);
    $("#address").prop("disabled", true);
    $("#enrollmentDate").prop("disabled", true);

    // Disable Save and Update buttons. Keep Reset enabled.
    $("#btnSave").prop("disabled", true);
    $("#btnUpdate").prop("disabled", true);
    $("#btnReset").prop("disabled", false);

    // Remove active record identifier from local storage
    localStorage.removeItem(REC_NO_KEY);

    // Automatically focus the primary key field
    $("#rollNo").focus();
}

/**
 * State 2: Roll No does NOT exist (Ready for Data Entry)
 * Enables all input fields for data entry, enables Save/Reset, disables Update, focuses fullName.
 */
function enableFormForNewRecord() {
    // Enable all input fields
    $("#fullName").prop("disabled", false);
    $("#studentClass").prop("disabled", false);
    $("#birthDate").prop("disabled", false);
    $("#address").prop("disabled", false);
    $("#enrollmentDate").prop("disabled", false);

    // Enable Save. Keep Update disabled.
    $("#btnSave").prop("disabled", false);
    $("#btnUpdate").prop("disabled", true);

    // Move cursor focus to Full Name field
    $("#fullName").focus();
}

/**
 * State 3: Roll No EXISTS (Ready for Editing)
 * Populates data, disables rollNo, enables all other fields, enables Update/Reset, disables Save, stores rec_no, focuses fullName.
 */
function enableFormForExistingRecord(record, recNo) {
    // Populate form fields with retrieved data
    $("#fullName").val(record.fullName || "");
    $("#studentClass").val(record.studentClass || "");
    $("#birthDate").val(record.birthDate || "");
    $("#address").val(record.address || "");
    $("#enrollmentDate").val(record.enrollmentDate || "");

    // Disable the Roll No primary key field
    $("#rollNo").prop("disabled", true);

    // Enable all other input fields for editing
    $("#fullName").prop("disabled", false);
    $("#studentClass").prop("disabled", false);
    $("#birthDate").prop("disabled", false);
    $("#address").prop("disabled", false);
    $("#enrollmentDate").prop("disabled", false);

    // Enable Update. Keep Save disabled.
    $("#btnSave").prop("disabled", true);
    $("#btnUpdate").prop("disabled", false);

    // Save record number in LocalStorage
    localStorage.setItem(REC_NO_KEY, recNo);

    // Move cursor focus to Full Name field
    $("#fullName").focus();
}

/* =========================================================================
   PRIMARY KEY LOOKUP & TRANSACTION CONTROL
   ========================================================================= */

function checkRollNumber() {
    let rollNoVal = $("#rollNo").val().trim();
    if (!rollNoVal) {
        return; // Empty input, do nothing
    }

    let config = getDbConfig();
    if (!config.token) {
        showToast("Please enter and save your JPDB Connection Token in the Settings panel above.", "error");
        // Open the settings panel automatically to guide the user
        $("#settingsCollapse").collapse("show");
        $("#settingsToggleBtn").addClass("active");
        $(".settings-card").addClass("expanded");
        return;
    }

    // Build retrieve query JSON object matching the key
    let keyObj = {
        rollNo: rollNoVal
    };

    // Construct JPDB GET_BY_KEY request
    let getRequest = createGET_BY_KEYRequest(
        config.token,
        config.dbName,
        config.relName,
        JSON.stringify(keyObj)
    );

    // Execute the request via IRL endpoint
    let response = executeCommandAtGivenBaseUrl(getRequest, config.baseUrl, "/api/irl");

    if (response && response.status === 400) {
        // Record does not exist -> state for creating a new student
        showToast("Roll Number not found. Ready to register new student.", "success");
        enableFormForNewRecord();
    } else if (response && response.status === 200) {
        // Record exists -> retrieve details and activate update mode
        try {
            let resData = response.data;
            let parsedData;

            // Safely handle string vs object responses
            if (typeof resData === "string") {
                parsedData = JSON.parse(resData);
            } else {
                parsedData = resData;
            }

            let record = parsedData.record || parsedData;
            let recNo = response.rec_no || parsedData.rec_no;

            if (record) {
                showToast("Record retrieved successfully! Editing mode enabled.", "success");
                enableFormForExistingRecord(record, recNo);
            } else {
                showToast("Database response parsed but record details are missing.", "error");
                enableFormForNewRecord();
            }
        } catch (e) {
            console.error("Error parsing JPDB record response:", e);
            showToast("Failed to parse record data. Setting form to new record state.", "error");
            enableFormForNewRecord();
        }
    } else {
        // Connection error or table doesn't exist yet
        showToast(response.message || "Failed to connect to JsonPowerDB server. Initializing fields.", "error");
        enableFormForNewRecord();
    }
}

/* =========================================================================
   DATA VALIDATION & SUBMISSION
   ========================================================================= */

function validateForm() {
    let rollNo = $("#rollNo").val().trim();
    let fullName = $("#fullName").val().trim();
    let studentClass = $("#studentClass").val().trim();
    let birthDate = $("#birthDate").val().trim();
    let address = $("#address").val().trim();
    let enrollmentDate = $("#enrollmentDate").val().trim();

    // Check rollNo
    if (!rollNo) {
        showToast("Roll Number is required.", "error");
        $("#rollNo").focus();
        return null;
    }
    // Check fullName
    if (!fullName) {
        showToast("Full Name is required.", "error");
        $("#fullName").focus();
        return null;
    }
    // Check studentClass
    if (!studentClass) {
        showToast("Class is required.", "error");
        $("#studentClass").focus();
        return null;
    }
    // Check birthDate
    if (!birthDate) {
        showToast("Birth Date is required.", "error");
        $("#birthDate").focus();
        return null;
    }
    // Check address
    if (!address) {
        showToast("Address is required.", "error");
        $("#address").focus();
        return null;
    }
    // Check enrollmentDate
    if (!enrollmentDate) {
        showToast("Enrollment Date is required.", "error");
        $("#enrollmentDate").focus();
        return null;
    }

    // Build the data object
    let studentDataObj = {
        rollNo: rollNo,
        fullName: fullName,
        studentClass: studentClass,
        birthDate: birthDate,
        address: address,
        enrollmentDate: enrollmentDate
    };

    return JSON.stringify(studentDataObj);
}

function saveStudent() {
    let jsonStr = validateForm();
    if (!jsonStr) {
        return; // Validation failed, alerts handled inside validateForm
    }

    let config = getDbConfig();
    if (!config.token) {
        showToast("Please enter and save your JPDB Connection Token in the settings card.", "error");
        return;
    }

    // Construct PUT request
    let putRequest = createPUTRequest(config.token, jsonStr, config.dbName, config.relName);

    // Send request via IML endpoint
    let response = executeCommandAtGivenBaseUrl(putRequest, config.baseUrl, "/api/iml");

    if (response && response.status === 200) {
        showToast("Student record registered successfully!", "success");
        resetForm();
    } else {
        showToast(response.message || "Failed to register record. Please check configurations.", "error");
    }
}

function updateStudent() {
    let jsonStr = validateForm();
    if (!jsonStr) {
        return; // Validation failed
    }

    let config = getDbConfig();
    let recNo = localStorage.getItem(REC_NO_KEY);

    if (!config.token) {
        showToast("Please configure your connection settings.", "error");
        return;
    }

    if (!recNo) {
        showToast("No active record number found in LocalStorage. Please search the roll number first.", "error");
        return;
    }

    // Construct UPDATE request
    let updateRequest = createUPDATERecordRequest(config.token, jsonStr, config.dbName, config.relName, recNo);

    // Send request via IML endpoint
    let response = executeCommandAtGivenBaseUrl(updateRequest, config.baseUrl, "/api/iml");

    if (response && response.status === 200) {
        showToast("Student record updated successfully!", "success");
        resetForm();
    } else {
        showToast(response.message || "Failed to update record. Please try again.", "error");
    }
}

/* =========================================================================
   JSONPOWERDB COMMON HELPERS (CLEAN NATIVE JS RE-IMPLEMENTATION)
   ========================================================================= */

function createPUTRequest(connToken, jsonObj, dbName, relName) {
    let putRequest = "{\n"
        + "\"token\" : \""
        + connToken
        + "\","
        + "\"dbName\": \""
        + dbName
        + "\",\n" + "\"cmd\" : \"PUT\",\n"
        + "\"rel\" : \""
        + relName + "\","
        + "\"jsonStr\": \n"
        + jsonObj
        + "\n"
        + "}";
    return putRequest;
}

function createGET_BY_KEYRequest(token, dbname, relationName, jsonObjStr, createTime = false, updateTime = false) {
    let getRequest = "{\n"
        + "\"token\" : \""
        + token
        + "\","
        + "\"dbName\": \""
        + dbname
        + "\",\n" + "\"cmd\" : \"GET_BY_KEY\",\n"
        + "\"rel\" : \""
        + relationName + "\","
        + "\"jsonStr\": \n"
        + jsonObjStr + ",\n"
        + "\"createTime\":" + createTime + ",\n"
        + "\"updateTime\":" + updateTime + "\n"
        + "}";
    return getRequest;
}

function createUPDATERecordRequest(token, jsonObj, dbName, relName, reqId) {
    let req = "{\n"
        + "\"token\" : \""
        + token
        + "\","
        + "\"dbName\": \""
        + dbName
        + "\",\n" + "\"cmd\" : \"UPDATE\",\n"
        + "\"rel\" : \""
        + relName + "\","
        + "\"jsonStr\": \n"
        + "{\n"
        + "\"" + reqId + "\" : " + jsonObj + "\n"
        + "}\n"
        + "}";
    return req;
}

function executeCommandAtGivenBaseUrl(reqString, dbBaseUrl, apiEndPointUrl) {
    let url = dbBaseUrl + apiEndPointUrl;
    let jsonObj = null;

    // Set jQuery AJAX to run synchronously
    $.ajaxSetup({ async: false });

    $.post(url, reqString, function (result) {
        if (typeof result === "string") {
            jsonObj = JSON.parse(result);
        } else {
            jsonObj = result;
        }
    }).fail(function (xhr) {
        try {
            let data = xhr.responseText;
            if (typeof data === "string") {
                jsonObj = JSON.parse(data);
            } else {
                jsonObj = data;
            }
        } catch (e) {
            jsonObj = {
                status: xhr.status,
                message: "API Request failed with error code: " + xhr.status
            };
        }
    });

    // Re-enable asynchronous AJAX calls
    $.ajaxSetup({ async: true });

    return jsonObj;
}

/* =========================================================================
   UI FEEDBACK: TOAST SYSTEM
   ========================================================================= */

function showToast(message, type = "success") {
    let toast = $("#glassToast");
    let icon = toast.find(".glass-toast-icon i");
    let text = toast.find(".glass-toast-content");

    // Configure styles
    toast.removeClass("success error");
    icon.removeClass("bi-check-circle-fill bi-exclamation-triangle-fill");

    if (type === "success") {
        toast.addClass("success");
        icon.addClass("bi-check-circle-fill");
    } else {
        toast.addClass("error");
        icon.addClass("bi-exclamation-triangle-fill");
    }

    text.text(message);

    // Triggers reveal transition
    toast.addClass("show");

    // Hide after 3.5 seconds
    setTimeout(function () {
        toast.removeClass("show");
    }, 3500);
}
