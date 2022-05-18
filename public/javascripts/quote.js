const errorMsg = $('.error-message');
const formDriverInfo = $('#quote-driver-info');
const formVehicleInfo = $('#quote-vehicle-info');
const formOptions = $('#quote-options');
const resultContainer = $('#result-container .container');
const carOnlyContent = $('.car-only');
const motorcycleOnlyContent = $('.motorcycle-only');

// *** TRANSITIONS BETWEEN FORMS
const forms = $('.quote-step');
const steps = $('ul.progressbar li');
let formIndex = 0;

function nextForm() {
    formIndex++;
    showForm();
}

function previousForm() {
    formIndex--;
    showForm();
}

function showForm() {
    $('html, body').animate({scrollTop: '0px'}, 0);
    for (let i = 0; i < formIndex; i++) {
        $(steps[i]).removeClass('active').addClass('completed');
    }
    for (let i = formIndex + 1; i < forms.length; i++) {
        $(steps[i]).removeClass('active').removeClass('completed');
    }
    $(steps[formIndex]).addClass('active');
    errorMsg.html('');
    forms.hide();
    $(forms[formIndex]).fadeIn('slow');
}

$('.prev-form').click(function () {
    previousForm();
})

$('.progressbar li').click(function () {
    formIndex = $(this).index();
    showForm();
})

let listModel, listIncident;
window.addEventListener('DOMContentLoaded', () => {
    showForm();
    $.ajax({
        type: 'GET',
        url: '/quote/driver',
        success: function (data) {
            listModel = data.listModel;
            listIncident = data.listIncident;
        },
        error: function (xhr) {
            let errors = JSON.parse(xhr.responseText).errors;
            errorMsg.html(errors.map(a => a.msg).join('<br>'));
            $('html, body').animate({scrollTop: '0px'}, 300);
        }
    });
});

// *** DRIVER INFO FORM
// Select city, district, ward
const selectCity = $('select[name="cityId"]');
const selectDistrict = $('select[name="districtId"]');
const selectWard = $('select[name="wardId"]');

selectCity.change(function () {
    $.ajax({
        type: 'GET',
        url: '/api/district/' + selectCity.val(),
        beforeSend: function () {
            selectDistrict.html('<option value hidden disabled selected></option>').prop('disabled', false);
        },
        success: function (data) {
            selectWard.html('').prop('disabled', true);
            data.forEach(item => selectDistrict.append(new Option(item.name, item._id)));
        },
        error: function (xhr) {
            let errors = JSON.parse(xhr.responseText).errors;
            errorMsg.html(errors.map(a => a.msg).join('<br>'));
            $('html, body').animate({scrollTop: '0px'}, 300);
        }
    });
})

selectDistrict.change(function () {
    $.ajax({
        type: 'GET',
        url: '/api/ward/' + selectDistrict.val(),
        beforeSend: function () {
            selectWard.html('<option value hidden disabled selected></option>').prop('disabled', false);
        },
        success: function (data) {
            data.forEach(item => selectWard.append(new Option(item.name, item._id)));
        },
        error: function (xhr) {
            let errors = JSON.parse(xhr.responseText).errors;
            errorMsg.html(errors.map(a => a.msg).join('<br>'));
            $('html, body').animate({scrollTop: '0px'}, 300);
        }
    });
})

// Edit driving records
const modalIncident = $('#incidentModal');
const formIncident = $('#incident-form');
const inputHasIncident = $('input[name="hasIncident"]');
const inputIncidentType = $('input[name="incidentType"]');
const selectIncidentId = $('select[name="incidentId"]');
const selectIncidentYear = $('[name="incidentYear"]');

inputHasIncident.change(function () {
    if (this.checked && this.value === '1') {
        modalIncident.modal();
    } else if (this.checked && this.value === '0') {
        drivingRecords = [];
        updateDrivingRecords();
    }
})

$('#add-incident').click(() => {
    modalIncident.modal();
})

inputIncidentType.change(function () {
    selectIncidentId.html('<option value hidden disabled selected></option>').prop('disabled', false);
    listIncident
        .filter(item => item.type === this.value)
        .forEach(item => selectIncidentId.append(new Option(item.name, item._id)));
})

formIncident.submit(function (event) {
    event.preventDefault();
    drivingRecords.push({
        incidentId: selectIncidentId.val(),
        incidentName: $('select[name="incidentId"] option:selected').text(),
        incidentType: $('input[name="incidentType"]:checked').val(),
        incidentYear: selectIncidentYear.val()
    })
    updateDrivingRecords();
    modalIncident.modal('hide');
    formIncident[0].reset();
})

function updateDrivingRecords() {
    if (drivingRecords.length) {
        let content = '';
        drivingRecords.forEach(item =>
            content += `<li>${item.incidentName}, ${item.incidentYear}
<a href="javascript:void(0)" class="float-right remove-incident mx-2">Remove</a>
<a href="javascript:void(0)" class="float-right edit-incident mx-2">Edit</a>
</li>`);
        $('.incident-list ul').html(content)
        $('.incident-list').show();
    } else {
        $('.incident-list').hide();
        $('input[name="hasIncident"][value="0"]').prop('checked', true);
    }
}

$('.incident-list').click((event) => {
    if ($(event.target).hasClass('remove-incident')) {
        drivingRecords.splice($(event.target).parent().index());
        updateDrivingRecords();
    } else if ($(event.target).hasClass('edit-incident')) {
        let record = drivingRecords[$(event.target).parent().index()];
        $(`input[name="incidentType"][value="${record.incidentType}"]`).prop('checked', true).change();
        $(`select[name="incidentId"] option[value="${record.incidentId}"]`).attr('selected', 'selected');
        $(`[name="incidentYear"] option[value="${record.incidentYear}"]`).attr('selected', 'selected');
        $('#incidentModal').modal();
    }
})

$('#incidentModal .close-btn').click(() => {
    if (!drivingRecords.length) {
        $(`input[name="hasIncident"][value="0"]`).prop('checked', true).change();
    }
})

// Submit form
formDriverInfo.submit(function (event) {
    event.preventDefault();
    let formData = new FormData(formDriverInfo[0]);
    formData.append('drivingRecords', JSON.stringify(drivingRecords));
    let jsonData = JSON.stringify(Object.fromEntries(formData));
    $.ajax({
        type: 'POST',
        url: '/quote/driver',
        contentType: 'application/json',
        data: jsonData,
        beforeSend: function () {
            spinnerToggle();
        },
        success: function () {
            spinnerToggle();
            nextForm();
        },
        error: function (xhr) {
            spinnerToggle();
            let errors = JSON.parse(xhr.responseText).errors;
            errorMsg.html(errors.map(a => a.msg).join('<br>'));
            $('html, body').animate({scrollTop: '0px'}, 300);
        }
    })
    return false;
})

// *** VEHICLE INFO FORM
const selectKind = $('select[name="kind"]');
const selectYear = $('select[name="year"]');
const selectMake = $('select[name="makeId"]');
const selectModel = $('select[name="modelId"]');

// Select vehicle model (Kind -> Year -> Make -> Model)
selectKind.change(function () {
    selectYear.html('<option value hidden disabled selected></option>').prop('disabled', false);
    selectMake.html('').prop('disabled', true);
    selectModel.html('').prop('disabled', true);
    let yearFiltered = listModel
        .filter(item => item.kind === selectKind.val())
        .map(a => a.year);
    uniqueArray(yearFiltered).sort().reverse().forEach(item => selectYear.append(new Option(item, item)));
    if (selectKind.val() === 'Car') {
        carOnlyContent.show();
        motorcycleOnlyContent.hide();
    } else {
        carOnlyContent.hide();
        motorcycleOnlyContent.show();
    }
    formOptions[0].reset();
})

selectYear.change(function () {
    selectMake.html('<option value hidden disabled selected></option>').prop('disabled', false);
    selectModel.html('').prop('disabled', true);
    let makeFiltered = listModel
        .filter((item) => item.kind === selectKind.val() && item.year === Number(selectYear.val()))
        .map(a => a.makeId);
    uniqueArray(makeFiltered).sort().forEach(item => selectMake.append(new Option(item.name, item._id)));
})

selectMake.change(function () {
    selectModel.html('<option value hidden disabled selected></option>').prop('disabled', false);
    let modelFiltered = listModel
        .filter((item) => item.kind === selectKind.val() && item.year === Number(selectYear.val()) && item.makeId._id === selectMake.val());
    uniqueArray(modelFiltered).sort().forEach(item => selectModel.append(new Option(item.name, item._id)));
})

// Submit form
formVehicleInfo.submit(function (event) {
    event.preventDefault();
    let formData = new FormData(formVehicleInfo[0]);
    let jsonData = JSON.stringify(Object.fromEntries(formData));
    $.ajax({
        type: 'POST',
        url: '/quote/vehicle',
        contentType: 'application/json',
        data: jsonData,
        beforeSend: function () {
            spinnerToggle();
        },
        success: function () {
            spinnerToggle();
            nextForm();
        },
        error: function (xhr) {
            spinnerToggle();
            let errors = JSON.parse(xhr.responseText).errors;
            errorMsg.html(errors.map(a => a.msg).join('<br>'));
            $('html, body').animate({scrollTop: '0px'}, 300);
        }
    })
    return false;
})

// *** OPTIONS FORM
// Show options
$('#find-all-insurers').click(() => {
    $('#multiple-insurers-options').show();
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#multiple-insurers-options").offset().top - 80
    }, 500);
});

// Submit form
$('.logo-list [data-insurer]').click(function () {
    let formData = {
        insurerId: $(this).attr('data-insurer')
    };
    submitOptions(JSON.stringify(formData));
})

formOptions.submit(function (event) {
    event.preventDefault();
    $('#quote-options').validate({
        rules: {
            priority: {
                required: true,
            },
        },
        messages: {
            priority: {
                required: 'Please select a priority',
            },
        },
        errorClass: 'errorMsg',
        errorPlacement: function (error, element) {
            error.appendTo(element.parents('.validate'));
        },
        submitHandler: function() {
            let formDataObject = Object.fromEntries(new FormData(formOptions[0]));
            formDataObject.insurerId = null;
            formDataObject.mainCoverages = [];
            formDataObject.carCoverages = [];
            $('input:checkbox[name="mainCoverages"]:checked').each(function () {
                formDataObject.mainCoverages.push($(this).val());
            });
            $('input:checkbox[name="carCoverages"]:checked').each(function () {
                formDataObject.carCoverages.push($(this).val());
            });
            submitOptions(JSON.stringify(formDataObject));
        }
    });
})

submitOptions = jsonData => {
    $.ajax({
        type: 'POST',
        url: '/quote/options',
        contentType: 'application/json',
        data: jsonData,
        beforeSend: function () {
            spinnerToggle();
        },
        success: function (data) {
            spinnerToggle();
            compileResult(data);
            nextForm();
        },
        error: function (xhr) {
            spinnerToggle();
            let errors = JSON.parse(xhr.responseText).errors;
            errorMsg.html(errors.map(a => a.msg).join('<br>'));
            $('html, body').animate({scrollTop: '0px'}, 300);
        }
    })
    return false;
}

compileResult = plans => {
    let listTab = '';
    let listContent = '';
    let firstName = $('input[name="firstName"]').val();
    plans.forEach((item, index) => {
        listTab += `<li class="nav-item col-4">
                       <a class="package-type nav-link ${index === 0 ? 'active' : ''}" data-toggle="tab"
                       href="#option${index}" data-option="${index}">
                            <div style="height: 40px" class="mb-2 mw-100 d-flex justify-content-center align-items-center">
                                <img src="${item.insurerId.logo}" class="img-fluid mh-100"><br>
                            </div>
                            <span class="badge p-2" style="background-color: ${item.color}">${item.name}</span>
                       </a>
                </li>`
        listContent += `<div id="option${index}" class="tab-pane py-4 ${index === 0 ? 'active' : ''}"><br>
                    <div class="d-flex row justify-content-between">
                        <div class="col-lg-7">
                        <h4>About ${item.insurerId.name} </h4>
                        <p>${item.insurerId.description.replace(/(<([^>]+)>)/gi, "")} <a href="/insurer/${item.insurerId.slug}" target="_blank">Read more.</a></p>
                        <h4>About ${item.name} Plan</h4>
                        <p>${item.description}</p>
                    </div>
                        <div class="col-lg-4">
                            <h4 class="mb-4">Estimated Cost</h4>
                            <div class="summary-coverages">
                                <div class="d-flex justify-content-between">
                                        <p>Compulsory third party's liability insurance</p>
                                        <p>${formatMoney(item.liabilityPrice)}</p>
                                    </div>
                                <div class="d-flex justify-content-between">
                                        <p>Personal accident insurance for driver and passengers</p>
                                        <p>${formatMoney(item.personalPrice)}</p>
                                    </div>
                                <div class="d-flex justify-content-between">
                                        <p>Vehicle physical damage insurance</p>
                                        <p>${formatMoney(item.vehiclePrice)}</p>
                                    </div>
                                    <hr>
                            </div>
                            <div class="d-flex justify-content-between">
                                    <p>Subtotal</p>
                                    <p>${formatMoney(item.planPrice)}</p>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <p>Shipping</p>
                                    <p>${formatMoney(0, 'number')}</p>
                                </div>
                                <div class="d-flex justify-content-between font-weight-bold">
                                    <p>Total</p>
                                    <p>${formatMoney(item.planPrice)}</p>
                                </div>
                            <div class="text-center">
                        <button type="button" data-toggle="modal" data-target="#shipping-address-modal" class="btn btn-primary px-4 py-3 mb-4 mt-2">Buy now
                            <i class="ml-2 fa fa-chevron-right" aria-hidden="true"></i>
                        </button>
                    </div>
                        </div>
                    </div>
                    <h4>Compulsory third party's liability insurance</h4>
                    <div class="container my-5">
                        <div class="option-container my-5">
                            <button type="button" class="btn btn-secondary px-4 py-3 mt-5">Details
                                <i class="ml-2 fa fa-chevron-right" aria-hidden="true"></i>
                            </button>
                            <div class="container-border row">
                                <div class="container col-lg-10 col-md-10 col-sm-12 ">
                                    <div class="my-5">
                                        <div class="quote-table table-responsive">
                                            <table style="width:100%">
                                                <tr>
                                                    <th>Types of coverages</th>
                                                    <th>Claim limit</th>
                                                    <th>Cost</th>
                                                </tr>
                                                <tr>
                                                    <td>Bodily Injury Liability<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>Body Injury Liability covers damages that result from
                                                                    the injury or death
                                                                    of others, including passengers, when you are at
                                                                    fault. <span><a target="_blank"
                                                                                    href="coverages-details.html">Learn more</a></span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.mainCoverages.liabilityBody.claimLimitValue)}</td>
                                                    <td>${formatMoney(item.mainCoverages.liabilityBody.price)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Property Damage Liability<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>Protects you if you are liable for damage to another
                                                                    person's vehicle or property. <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.mainCoverages.liabilityProperty.claimLimitValue)}</td>
                                                    <td>${formatMoney(item.mainCoverages.liabilityProperty.price)}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h4>Personal accident insurance for driver and passengers</h4>
                    <div class="container my-5">
                        <div class="option-container my-5">
                            <button type="button" class="btn btn-secondary  px-4 py-3 mt-5">Details
                                <i class="ml-2 fa fa-chevron-right" aria-hidden="true"></i>
                            </button>
                            <div class="container-border row">
                                <div class="container col-lg-10 col-md-10 col-sm-12 ">
                                    <div class="my-5">
                                        <div class="quote-table table-responsive">
                                            <table style="width:100%">
                                                <tr>
                                                    <th>Types of coverages</th>
                                                    <th>Claim limit</th>
                                                    <th>Cost</th>
                                                </tr>
                                                <tr>
                                                    <td>Medical Payments<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>Reasonable expenses incurred by an insured person for
                                                                    necessary medical treatment, medical
                                                                    services, or medical products provided to an insured
                                                                    person for bodily injury caused
                                                                    by a covered accident. This coverage is per person.
                                                                    <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.mainCoverages.personalMedical.claimLimitValue)}</td>
                                                    <td>${formatMoney(item.mainCoverages.personalMedical.price)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Uninsured Motorist Bodily Injury<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>Costs for certain damages which an insured person is
                                                                    legally entitled to recover from
                                                                    the owner or operator of an insured vehicle because
                                                                    of bodily injury sustained by an
                                                                    insured person in a covered loss. <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.mainCoverages.personalBody.claimLimitValue)}</td>
                                                    <td>${formatMoney(item.mainCoverages.personalBody.price)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Uninsured Motorist Property Damage<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>Costs resulting from property damage caused by
                                                                    another driver who can't pay because
                                                                    of lack of insurance. <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.mainCoverages.personalProperty.claimLimitValue)}</td>
                                                    <td>${formatMoney(item.mainCoverages.personalProperty.price)}</td>
                                                </tr>
                                                <tr class="${item.kind === 'Car' ? '' : 'd-none'}">
                                                    <td>Identity Theft<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>We will pay $15.000 to the beneficiaries if the
                                                                    covered person dies in a motorcycle accident and
                                                                    we will pay $100 per week if the covered person is
                                                                    disabled in a motorcycle accident. <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.carCoverages ? item.carCoverages.personalIdentityTheft.claimLimitValue : 0)}</td>
                                                    <td>${formatMoney(item.carCoverages ? item.carCoverages.personalIdentityTheft.price : 0)}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h4>Vehicle physical damage insurance</h4>
                    <div class="container my-5">
                        <div class="option-container my-5">
                            <button type="button" class="btn btn-secondary  px-4 py-3 mt-5">Details
                                <i class="ml-2 fa fa-chevron-right" aria-hidden="true"></i>
                            </button>
                            <div class="container-border row">
                                <div class="container col-lg-10 col-md-10 col-sm-12 ">
                                    <div class="my-5">
                                        <div class="quote-table table-responsive">
                                            <table style="width:100%">
                                                <tr>
                                                    <th>Types of coverages</th>
                                                    <th>Claim limit</th>
                                                    <th>Deductible</th>
                                                    <th>Cost</th>
                                                </tr>
                                                <tr>
                                                    <td>Collision<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>Damage caused by a collision with another object or
                                                                    from the vehicle rolling over. <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleCollision.claimLimitText)}</td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleCollision.deductible)}</td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleCollision.price)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Comprehensive<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>Damage to your vehicle from anything other than a
                                                                    collision. For example, a windstorm, fire,
                                                                    theft, hail, flood or vandalism. <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleComprehensive.claimLimitText)}</td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleComprehensive.deductible)}</td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleComprehensive.price)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Rental Reimbursement<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>The cost of renting a vehicle (excluding mileage)
                                                                    from a rental agency or garage. Daily
                                                                    reimbursement limits apply. To choose this option,
                                                                    either collision or comprehensive
                                                                    coverage is necessary. <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleRentalReimbursement.claimLimitValue)}</td>
                                                    <td></td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleRentalReimbursement.price)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Enhanced Towing Coverage<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>The cost of towing and labor for work done on your
                                                                    vehicle where it became disabled. <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleTowing.claimLimitValue)}</td>
                                                    <td></td>
                                                    <td>${formatMoney(item.mainCoverages.vehicleTowing.price)}</td>
                                                </tr>
                                                <tr class="${item.kind === 'Car' ? '' : 'd-none'}">
                                                    <td>Sound System<div class="drop-up">
                                                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                                                            <div class="drop-up-content">
                                                                <p>Coverage for equipment, devices, accessories,
                                                                    enhancements, and modifications other than
                                                                    those installed by the original manufacturer. $1.000
                                                                    worth of coverage is automatically included
                                                                    with the policy when Comprehensive Coverage is
                                                                    purchased. <span><a
                                                                                href="">Learn more</a></span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${formatMoney(item.carCoverages ? item.carCoverages.vehicleSoundSystem.claimLimitValue : 0)}</td>
                                                    <td></td>
                                                    <td>${formatMoney(item.carCoverages ? item.carCoverages.vehicleSoundSystem.price : 0)}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
    });
    let name = '';
    let liabilityBody = '';
    let liabilityProperty = '';
    let personalMedical = '';
    let personalBody = '';
    let personalProperty = '';
    let personalIdentityTheft = '';
    let vehicleCollision = '';
    let vehicleComprehensive = '';
    let vehicleRentalReimbursement = '';
    let vehicleTowing = '';
    let vehicleSoundSystem = '';

    plans.forEach((item, index) =>{
        name += ` <th width="15%" class="text-center"><div style="height: 30px" class="mb-2 mw-100 d-flex justify-content-center align-items-center">
                                <img src="${item.insurerId.logo}" class="img-fluid mh-100"><br>
                            </div>
                            <span class="badge p-2" style="background-color: ${item.color}">${item.name}</span></th>`
        liabilityBody +=`<td>${formatMoney(item.mainCoverages ? item.mainCoverages.liabilityBody.claimLimitValue : 0)}</td>`
        liabilityProperty +=`<td>${formatMoney(item.mainCoverages ? item.mainCoverages.liabilityProperty.claimLimitValue : 0)}</td>`
        personalMedical +=`<td>${formatMoney(item.mainCoverages ? item.mainCoverages.personalMedical.claimLimitValue : 0)}</td>`
        personalBody +=`<td>${formatMoney(item.mainCoverages ? item.mainCoverages.personalBody.claimLimitValue : 0)}</td>`
        personalProperty +=`<td>${formatMoney(item.mainCoverages ? item.mainCoverages.personalProperty.claimLimitValue : 0)}</td>`
        personalIdentityTheft +=`<td>${formatMoney(item.carCoverages ? item.carCoverages.personalIdentityTheft.claimLimitValue : 0)}</td>`
        vehicleCollision +=`<td>${formatMoney(item.mainCoverages ? item.mainCoverages.vehicleCollision.deductible : 0)}</td>`
        vehicleComprehensive +=`<td>${formatMoney(item.mainCoverages ? item.mainCoverages.vehicleComprehensive.deductible : 0)}</td>`
        vehicleRentalReimbursement +=`<td>${formatMoney(item.mainCoverages ? item.mainCoverages.vehicleRentalReimbursement.claimLimitValue : 0)}</td>`
        vehicleTowing +=`<td>${formatMoney(item.mainCoverages ? item.mainCoverages.vehicleTowing.claimLimitValue : 0)}</td>`
        vehicleSoundSystem +=`<td>${formatMoney(item.carCoverages ? item.carCoverages.vehicleSoundSystem.claimLimitValue : 0)}</td>`


    })
    resultContainer.html(`<div class="row">

<div class="col-lg-8">
<h3>Your quotes are here, ${firstName || 'Tester'}.</h3><div>Select a plan and get protected now.</div>
</div>
<div class="col-lg-4">
<button class="btn btn-primary px-4 py-3 mt-3 float-lg-right"  data-toggle="modal" data-target="#compare-modal">Compare options</button>

<!-- Modal -->
<!-- The Modal -->
<div class="modal fade" id="compare-modal">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">

      <!-- Modal Header -->
      <div class="modal-header">
        <h4 class="modal-title">Compare options</h4>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>

      <!-- Modal body -->
      <div class="modal-body">
       <table class="table table-responsive">
                        <thead>
                        <tr>
                            <td style="width: 25%;">&nbsp;</td>
                
                                ${name}
                        </tr>
                        </thead>
                        <tbody>
                        <tr class="divider">
                            <td colspan="4"><strong>Compulsory third party's liability insurance</strong></td>
                        </tr>
                        <tr>
                            <td>Bodily Injury Liability</td>
                            ${liabilityBody}
                        </tr>
                        <tr>
                            <td>Property Damage Liability</td>
                            ${liabilityProperty}
                        </tr>
                        <tr class="divider">
                            <td colspan="4"><strong>Personal accident insurance for driver and passengers</strong></td>
                        </tr>
                        <tr>
                            <td>Medical Payments</td>
                           ${personalMedical}
                        </tr>
                        <tr>
                            <td>Uninsured Motorist Bodily Injury</td>
                              ${personalBody}
                        </tr>
                        <tr>
                            <td>Uninsured Motorist Property Damage</td>
                             ${personalProperty}
                        </tr>
                        <tr class="${plans[0].kind === 'Car' ? '': 'd-none'}" >
                            <td>Identity Theft</td>
                             ${personalIdentityTheft}
                        </tr>
                        <tr class="divider">
                            <td colspan="4"><strong>Car physical damage insurance</strong></td>
                        </tr>
                        <tr>
                            <td>Collision</td>
                              ${vehicleCollision}
                        </tr>
                        <tr>
                            <td>Comprehensive</td>
                             ${vehicleComprehensive}
                        </tr>
                        <tr>
                            <td>Rental Reimbursement</td>
                             ${vehicleRentalReimbursement}
                        </tr>
                        <tr>
                            <td>Enhanced Towing Coverage</td>
                              ${vehicleTowing}
                        </tr>
                        <tr class="${plans[0].kind === 'Car' ? '': 'd-none'}">
                            <td>Sound System</td>
                              ${vehicleSoundSystem}
                        </tr>
                        </tbody>
                    </table>
      </div>

      <!-- Modal footer -->
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
      </div>

    </div>
  </div>
</div>

</div>
</div>
        <ul class="package-type-tab nav nav-tabs row mt-5" role="tablist">${listTab}</ul>
        <div class="tab-content">${listContent}</div>`);
}

// *** SHIPPING ADDRESS FORM
$("#shipping-address-modal").on('show.bs.modal', function () {
    $('[name="shippingName"]').val($('[name="firstName"]').val() + ' ' + $('[name="lastName"]').val());
    $('[name="shippingPhone"]').val($('[name="phone"]').val());
    $('#shipping-address-form [name="cityId"]').val($('#quote-driver-info [name="cityId"]').val());
    $('#shipping-address-form [name="districtId"]').val($('#quote-driver-info [name="districtId"]').val());
    $('#shipping-address-form [name="wardId"]').val($('#quote-driver-info [name="wardId"]').val());
    $('[name="shippingStreet"]').val($('[name="street"]').val());
});

const formShippingAddress = $('form#shipping-address-form');
formShippingAddress.submit(function (event) {
    event.preventDefault();
    let jsonData = JSON.stringify({
        shippingAddress: {
            name: $('[name="shippingName"]').val(),
            phone: $('[name="shippingPhone"]').val(),
            cityId: $('#shipping-address-form [name="cityId"]').val(),
            districtId: $('#shipping-address-form [name="districtId"]').val(),
            wardId: $('#shipping-address-form [name="wardId"]').val(),
            street: $('[name="shippingStreet"]').val()
        }
    });
    $.ajax({
        type: 'POST',
        url: '/quote/shipping',
        contentType: 'application/json',
        data: jsonData,
        success: function () {
            placeOrder();
        },
        error: function (xhr) {
            alert(JSON.parse(xhr.responseText).message);
        }
    })
    return false;
})

// *** PLACE ORDER
function placeOrder() {
    if (isSignedIn) {
        let option = $('.package-type.active').attr('data-option');
        location.replace(`/order/create/${option}`);
    } else {
        $('#sign-up-form [name="email"]').val($('#quote-driver-info [name="email"]').val());
        $('#sign-up-modal').modal();
        $('#shipping-address-modal').modal('hide');
    }
}

const formSignUp = $('form#sign-up-form');
formSignUp.submit(function (event) {
    event.preventDefault();
    let formData = new FormData(formSignUp[0]);
    let jsonData = JSON.stringify(Object.fromEntries(formData));
    $.ajax({
        type: 'POST',
        url: '/quote/sign-up',
        contentType: 'application/json',
        data: jsonData,
        success: function () {
            let option = $('.package-type.active').attr('data-option');
            location.replace(`/order/create/${option}`);
        },
        error: function (xhr) {
            alert(JSON.parse(xhr.responseText).message);
        }
    })
    return false;
})

// *** UTILITIES
formatMoney = (value, options) => (value || options === 'number') ? value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
}) : '<span class="text-secondary">None</span>';

spinnerToggle = () => $('.spinner, .submit-text').toggle();
uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));

if (drivingRecords.length) {
    updateDrivingRecords();
}